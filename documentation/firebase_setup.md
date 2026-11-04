# 🔥 Guia de Configuração e Liberação do Firebase Firestore

## 1. Contexto das Credenciais
O projeto Firebase já está configurado com as chaves fornecidas no arquivo `.env`:
* **Project ID:** `antigravitycollections`
* **Auth Domain:** `antigravitycollections.firebaseapp.com`
* **Storage Bucket:** `antigravitycollections.firebasestorage.app`

## 2. Regras de Segurança do Firestore (`firestore.rules`)
O Firebase por padrão inicia bancos de dados no "Modo de Produção" bloqueado (`allow read, write: if false;`).
Para permitir que o app web realize leituras e gravações em tempo real na coleção `comics`:

1. Acesse o [Firebase Console](https://console.firebase.google.com/).
2. Selecione o projeto **antigravitycollections**.
3. No menu lateral esquerdo, clique em **Criação** > **Firestore Database**.
4. Clique na aba **Regras** (Rules).
5. Cole as regras abaixo:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /comics/{comicId} {
      allow read, write: if true;
    }
  }
}
```
6. Clique em **Publicar** (Publish).

## 3. Resiliência e Modo Offline-First
A aplicação conta com arquitetura de alta resiliência:
* Enquanto as regras não forem liberadas na nuvem, o aplicativo opera **100% de forma autônoma e instantânea** utilizando `LocalStorage`.
* Nenhuma ação ou clique do usuário é perdido.
* Assim que as regras forem publicadas no console, o listener em tempo real reconecta automaticamente e sincroniza todas as edições pendentes com a nuvem.

