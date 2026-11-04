import { initializeApp, getApps } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot 
} from 'firebase/firestore';

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
let isFirebaseInitialized = false;

try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  db = getFirestore(app);
  isFirebaseInitialized = true;
} catch (error) {
  console.warn('⚠️ Falha ao inicializar o Firebase SDK:', error.message);
}

const LOCAL_STORAGE_KEY = 'hq_tracker_collections_v1';

/**
 * Carrega coleções do armazenamento local
 */
export function loadFromLocalStorage() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Erro ao ler do LocalStorage:', e);
    return [];
  }
}

/**
 * Salva coleções no armazenamento local
 */
export function saveToLocalStorage(data) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Erro ao salvar no LocalStorage:', e);
  }
}

/**
 * Assina atualizações em tempo real do Firestore com fallback transparente para LocalStorage
 */
export function subscribeComics(onUpdate, onStatusChange) {
  if (!db || !isFirebaseInitialized) {
    onStatusChange?.({ status: 'local', message: 'Armazenamento Local Ativo (Firebase Desconectado)' });
    onUpdate(loadFromLocalStorage());
    return () => {};
  }

  const colRef = collection(db, 'comics');

  try {
    const unsubscribe = onSnapshot(colRef, (snapshot) => {
      const remoteComics = [];
      snapshot.forEach(docSnap => {
        remoteComics.push({ id: docSnap.id, ...docSnap.data() });
      });

      // Se o Firebase retornou dados, sincroniza localmente
      if (remoteComics.length > 0) {
        saveToLocalStorage(remoteComics);
        onUpdate(remoteComics);
        onStatusChange?.({ status: 'connected', message: 'Nuvem Conectada (Firestore Sincronizado)' });
      } else {
        // Se a coleção na nuvem estiver vazia, verifica se há dados locais para sincronizar
        const local = loadFromLocalStorage();
        if (local.length > 0) {
          local.forEach(item => saveComic(item));
          onUpdate(local);
        } else {
          onUpdate([]);
        }
        onStatusChange?.({ status: 'connected', message: 'Nuvem Conectada (Pronto)' });
      }
    }, (error) => {
      console.warn('⚠️ Firestore listener error:', error.message);
      onStatusChange?.({ 
        status: 'local-fallback', 
        message: 'Modo Offline/Local (Regras do Firestore pendentes de liberação)' 
      });
      // Fallback para LocalStorage
      onUpdate(loadFromLocalStorage());
    });

    return unsubscribe;
  } catch (err) {
    console.warn('⚠️ Exceção ao conectar no Firestore:', err);
    onStatusChange?.({ status: 'local', message: 'Armazenamento Local Ativo' });
    onUpdate(loadFromLocalStorage());
    return () => {};
  }
}

/**
 * Salva ou atualiza uma HQ tanto no Firestore quanto no LocalStorage
 */
export async function saveComic(comic) {
  // Salva no LocalStorage imediatamente
  const current = loadFromLocalStorage();
  const index = current.findIndex(c => c.id === comic.id);
  let updated;
  if (index >= 0) {
    updated = [...current];
    updated[index] = comic;
  } else {
    updated = [...current, comic];
  }
  saveToLocalStorage(updated);

  // Tenta salvar no Firestore se disponível
  if (db && isFirebaseInitialized) {
    try {
      const docRef = doc(db, 'comics', comic.id);
      await setDoc(docRef, {
        name: comic.name,
        ownedNumbers: comic.ownedNumbers || [],
        isCompleted: Boolean(comic.isCompleted),
        completedUntil: comic.completedUntil || null,
        highestOpenedChunk: comic.highestOpenedChunk || 10,
        expandedChunks: comic.expandedChunks || [],
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (e) {
      console.warn('⚠️ Não foi possível sincronizar com o Firestore (mantido localmente):', e.message);
    }
  }

  return updated;
}

/**
 * Exclui uma HQ do Firestore e do LocalStorage
 */
export async function deleteComic(comicId) {
  // Remove do LocalStorage
  const current = loadFromLocalStorage();
  const updated = current.filter(c => c.id !== comicId);
  saveToLocalStorage(updated);

  // Remove do Firestore se disponível
  if (db && isFirebaseInitialized) {
    try {
      const docRef = doc(db, 'comics', comicId);
      await deleteDoc(docRef);
    } catch (e) {
      console.warn('⚠️ Não foi possível remover do Firestore (removido localmente):', e.message);
    }
  }

  return updated;
}

export { db };

