import { initializeApp, getApps } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  updatePassword
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCY008uHUTVm1sGxqkb44Uw6LErsdZ1_0I",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "antigravitycollections.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "antigravitycollections",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "antigravitycollections.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "669444085449",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:669444085449:web:cc6c2bc90d87e7e99cdf18"
};

let app = null;
let db = null;
let auth = null;
let isFirebaseInitialized = false;

try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  db = getFirestore(app);
  auth = getAuth(app);
  isFirebaseInitialized = true;
} catch (error) {
  console.warn('⚠️ Falha ao inicializar o Firebase SDK:', error.message);
}

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

/**
 * Serviços de Autenticação Firebase
 */
export async function loginWithEmail(email, password) {
  if (!auth) throw new Error("Firebase Auth não inicializado");
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function registerWithEmail(email, password, displayName) {
  if (!auth) throw new Error("Firebase Auth não inicializado");
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName && cred.user) {
    await updateProfile(cred.user, { displayName });
  }
  return cred.user;
}

export async function loginWithGoogle() {
  if (!auth) throw new Error("Firebase Auth não inicializado");
  const cred = await signInWithPopup(auth, googleProvider);
  return cred.user;
}

export async function logoutUser() {
  if (!auth) return;
  await signOut(auth);
}

export async function resetPassword(email) {
  if (!auth) throw new Error("Firebase Auth não inicializado");
  await sendPasswordResetEmail(auth, email);
}

export async function updateUserProfile(displayName, photoURL) {
  if (!auth?.currentUser) throw new Error("Nenhum usuário conectado");
  const data = {};
  if (displayName !== undefined) data.displayName = displayName;
  if (photoURL !== undefined) data.photoURL = photoURL;
  await updateProfile(auth.currentUser, data);
  return auth.currentUser;
}

export async function changeUserPassword(newPassword) {
  if (!auth?.currentUser) throw new Error("Nenhum usuário conectado");
  await updatePassword(auth.currentUser, newPassword);
}

export function onAuthChange(callback) {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

export function getCurrentUser() {
  return auth?.currentUser || null;
}

/**
 * Utilitários de Chave de Armazenamento por Usuário
 */
function getUserStorageKey(userId) {
  return userId ? `hq_tracker_collections_${userId}` : 'hq_tracker_collections_v1';
}

/**
 * Carrega coleções do armazenamento local (com suporte a escopo por usuário)
 */
export function loadFromLocalStorage(userId = null) {
  try {
    const raw = localStorage.getItem(getUserStorageKey(userId));
    if (raw) return JSON.parse(raw);
    
    // Migração transparente: se a conta do usuário estiver vazia, importa a coleção legado do browser
    if (userId) {
      const legacy = localStorage.getItem('hq_tracker_collections_v1');
      if (legacy) {
        const parsed = JSON.parse(legacy);
        if (Array.isArray(parsed) && parsed.length > 0) {
          saveToLocalStorage(parsed, userId);
          return parsed;
        }
      }
    }
    return [];
  } catch (e) {
    console.error('Erro ao ler do LocalStorage:', e);
    return [];
  }
}

/**
 * Salva coleções no armazenamento local
 */
export function saveToLocalStorage(data, userId = null) {
  try {
    localStorage.setItem(getUserStorageKey(userId), JSON.stringify(data));
  } catch (e) {
    console.error('Erro ao salvar no LocalStorage:', e);
  }
}

/**
 * Assina atualizações em tempo real do Firestore isoladas por usuário
 * Suporta assinatura: subscribeComics(userId, onUpdate, onStatusChange) ou subscribeComics(onUpdate, onStatusChange)
 */
export function subscribeComics(arg1, arg2, arg3) {
  let userId = null;
  let onUpdate = null;
  let onStatusChange = null;

  if (typeof arg1 === 'function') {
    userId = auth?.currentUser?.uid || null;
    onUpdate = arg1;
    onStatusChange = arg2;
  } else {
    userId = arg1;
    onUpdate = arg2;
    onStatusChange = arg3;
  }

  // Se não estiver inicializado ou sem usuário autenticado, opera no cache local
  if (!db || !isFirebaseInitialized || !userId) {
    onStatusChange?.({ status: 'local', message: 'Armazenamento Local Ativo' });
    onUpdate?.(loadFromLocalStorage(userId));
    return () => {};
  }

  // Coleção isolada na subcoleção do usuário: /users/{userId}/comics
  const colRef = collection(db, 'users', userId, 'comics');

  try {
    const unsubscribe = onSnapshot(colRef, (snapshot) => {
      const remoteComics = [];
      snapshot.forEach(docSnap => {
        remoteComics.push({ id: docSnap.id, ...docSnap.data() });
      });

      // Se o Firebase retornou dados remotos, sincroniza localmente
      if (remoteComics.length > 0) {
        saveToLocalStorage(remoteComics, userId);
        onUpdate?.(remoteComics);
        onStatusChange?.({ status: 'connected', message: 'Nuvem Conectada (Firestore Sincronizado)' });
      } else {
        // Se a subcoleção do usuário na nuvem estiver vazia, verifica se há dados locais para migrar
        const local = loadFromLocalStorage(userId);
        if (local.length > 0) {
          local.forEach(item => saveComic(userId, item));
          onUpdate?.(local);
        } else {
          onUpdate?.([]);
        }
        onStatusChange?.({ status: 'connected', message: 'Nuvem Conectada (Pronto)' });
      }
    }, (error) => {
      console.warn('⚠️ Firestore listener error:', error.message);
      onStatusChange?.({ 
        status: 'local-fallback', 
        message: 'Modo Offline/Local' 
      });
      onUpdate?.(loadFromLocalStorage(userId));
    });

    return unsubscribe;
  } catch (err) {
    console.warn('⚠️ Exceção ao conectar no Firestore:', err);
    onStatusChange?.({ status: 'local', message: 'Armazenamento Local Ativo' });
    onUpdate?.(loadFromLocalStorage(userId));
    return () => {};
  }
}

/**
 * Salva ou atualiza uma HQ tanto no Firestore quanto no LocalStorage do usuário
 * Suporta saveComic(userId, comic) ou saveComic(comic)
 */
export async function saveComic(arg1, arg2) {
  let userId = null;
  let comic = null;

  if (arg2 === undefined) {
    userId = auth?.currentUser?.uid || null;
    comic = arg1;
  } else {
    userId = arg1;
    comic = arg2;
  }

  if (!comic) return [];

  // 1. Salva no LocalStorage imediatamente
  const current = loadFromLocalStorage(userId);
  const index = current.findIndex(c => c.id === comic.id);
  let updated;
  if (index >= 0) {
    updated = [...current];
    updated[index] = comic;
  } else {
    updated = [...current, comic];
  }
  saveToLocalStorage(updated, userId);

  // 2. Sincroniza com a subcoleção do usuário no Firestore se disponível
  if (db && isFirebaseInitialized && userId) {
    try {
      const docRef = doc(db, 'users', userId, 'comics', comic.id);
      await setDoc(docRef, {
        name: comic.name,
        type: comic.type || 'Mensal',
        publisher: comic.publisher || 'Marvel',
        startFrom: typeof comic.startFrom === 'number' ? comic.startFrom : 1,
        showHiddenChunks: Boolean(comic.showHiddenChunks),
        ownedNumbers: comic.ownedNumbers || [],
        issueStates: comic.issueStates || {},
        issueCovers: comic.issueCovers || {},
        pendingCovers: comic.pendingCovers || {},
        rejectedCovers: comic.rejectedCovers || {},
        searchedIssues: comic.searchedIssues || {},
        issueTitles: comic.issueTitles || {},
        position: typeof comic.position === 'number' ? comic.position : 0,
        isCompleted: Boolean(comic.isCompleted),
        completedUntil: comic.completedUntil || null,
        highestOpenedChunk: comic.highestOpenedChunk || 10,
        expandedChunks: comic.expandedChunks || [],
        startYear: comic.startYear || '',
        brazilPublisher: comic.brazilPublisher || '',
        mainHero: comic.mainHero || '',
        preferredSeries: comic.preferredSeries || null,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (e) {
      console.warn('⚠️ Falha ao sincronizar com o Firestore:', e.message);
    }
  }

  return updated;
}

/**
 * Exclui uma HQ do Firestore e do LocalStorage
 * Suporta deleteComic(userId, comicId) ou deleteComic(comicId)
 */
export async function deleteComic(arg1, arg2) {
  let userId = null;
  let comicId = null;

  if (arg2 === undefined) {
    userId = auth?.currentUser?.uid || null;
    comicId = arg1;
  } else {
    userId = arg1;
    comicId = arg2;
  }

  const current = loadFromLocalStorage(userId);
  const updated = current.filter(c => c.id !== comicId);
  saveToLocalStorage(updated, userId);

  if (db && isFirebaseInitialized && userId && comicId) {
    try {
      const docRef = doc(db, 'users', userId, 'comics', comicId);
      await deleteDoc(docRef);
    } catch (e) {
      console.warn('⚠️ Falha ao remover do Firestore:', e.message);
    }
  }

  return updated;
}

/**
 * Salva a ordenação personalizada de todas as HQs do usuário
 * Suporta saveAllComicsOrder(userId, comicsList) ou saveAllComicsOrder(comicsList)
 */
export async function saveAllComicsOrder(arg1, arg2) {
  let userId = null;
  let comicsList = null;

  if (arg2 === undefined) {
    userId = auth?.currentUser?.uid || null;
    comicsList = arg1;
  } else {
    userId = arg1;
    comicsList = arg2;
  }

  if (!comicsList) return [];

  saveToLocalStorage(comicsList, userId);

  if (db && isFirebaseInitialized && userId) {
    try {
      const promises = comicsList.map((comic, idx) => {
        const docRef = doc(db, 'users', userId, 'comics', comic.id);
        return setDoc(docRef, { position: idx }, { merge: true });
      });
      await Promise.all(promises);
    } catch (e) {
      console.warn('⚠️ Falha ao salvar ordem no Firestore:', e.message);
    }
  }

  return comicsList;
}

/**
 * Salva múltiplas HQs de uma vez no LocalStorage e no Firestore
 * Suporta saveComicsBatch(userId, comicsToUpdate) ou saveComicsBatch(comicsToUpdate)
 */
export async function saveComicsBatch(arg1, arg2) {
  let userId = null;
  let comicsToUpdate = null;

  if (arg2 === undefined) {
    userId = auth?.currentUser?.uid || null;
    comicsToUpdate = arg1;
  } else {
    userId = arg1;
    comicsToUpdate = arg2;
  }

  if (!comicsToUpdate || !comicsToUpdate.length) return [];

  const current = loadFromLocalStorage(userId);
  const currentMap = new Map(current.map(c => [c.id, c]));

  comicsToUpdate.forEach(comic => {
    currentMap.set(comic.id, comic);
  });

  const updated = Array.from(currentMap.values());
  saveToLocalStorage(updated, userId);

  if (db && isFirebaseInitialized && userId) {
    try {
      const promises = comicsToUpdate.map(comic => {
        const docRef = doc(db, 'users', userId, 'comics', comic.id);
        return setDoc(docRef, {
          name: comic.name,
          type: comic.type || 'Mensal',
          publisher: comic.publisher || 'Marvel',
          startFrom: typeof comic.startFrom === 'number' ? comic.startFrom : 1,
          showHiddenChunks: Boolean(comic.showHiddenChunks),
          ownedNumbers: comic.ownedNumbers || [],
          issueStates: comic.issueStates || {},
          issueCovers: comic.issueCovers || {},
          pendingCovers: comic.pendingCovers || {},
          rejectedCovers: comic.rejectedCovers || {},
          searchedIssues: comic.searchedIssues || {},
          issueTitles: comic.issueTitles || {},
          position: typeof comic.position === 'number' ? comic.position : 0,
          isCompleted: Boolean(comic.isCompleted),
          completedUntil: comic.completedUntil || null,
          highestOpenedChunk: comic.highestOpenedChunk || 10,
          expandedChunks: comic.expandedChunks || [],
          startYear: comic.startYear || '',
          brazilPublisher: comic.brazilPublisher || '',
          mainHero: comic.mainHero || '',
          preferredSeries: comic.preferredSeries || null,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      });
      await Promise.all(promises);
    } catch (e) {
      console.warn('⚠️ Falha ao salvar lote no Firestore:', e.message);
    }
  }

  return updated;
}

/**
 * Zera permanentemente a coleção do usuário autenticado (Firestore e LocalStorage)
 */
export async function clearUserCollection(arg1) {
  const userId = arg1 || auth?.currentUser?.uid || null;
  saveToLocalStorage([], userId);

  if (db && isFirebaseInitialized && userId) {
    try {
      const colRef = collection(db, 'users', userId, 'comics');
      const snap = await getDocs(colRef);
      if (!snap.empty) {
        const batch = writeBatch(db);
        snap.forEach(docSnap => {
          batch.delete(docSnap.ref);
        });
        await batch.commit();
      }
    } catch (e) {
      console.warn('⚠️ Falha ao zerar coleção no Firestore:', e.message);
    }
  }

  return [];
}

/**
 * Salva e carrega configurações personalizadas do usuário (Cores de Fundo, Temas, etc.)
 */
export function loadUserSettings(userId = null) {
  try {
    const raw = localStorage.getItem(`hq_tracker_settings_${userId || 'default'}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function saveUserSettings(userId, settings) {
  try {
    localStorage.setItem(`hq_tracker_settings_${userId || 'default'}`, JSON.stringify(settings));
    if (db && isFirebaseInitialized && userId) {
      const docRef = doc(db, 'users', userId, 'settings', 'preferences');
      await setDoc(docRef, {
        ...settings,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    }
  } catch (e) {
    console.warn('⚠️ Falha ao salvar configurações do usuário:', e.message);
  }
}

export { db, auth };


