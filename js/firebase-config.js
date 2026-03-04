// Configuración de Firebase - REEMPLAZA CON TUS DATOS
const firebaseConfig = {
  apiKey: "AIzaSyDQrtoM5JYduUAyIx8Q8GhkAO9VIZYRDJA",
  authDomain: "nazarick---integrador.firebaseapp.com",
  projectId: "nazarick---integrador",
  storageBucket: "nazarick---integrador.firebasestorage.app",
  messagingSenderId: "255268945439",
  appId: "1:255268945439:web:506ae582192e3e835a5f2a",
  measurementId: "G-1RX35H3XBL"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Inicializar servicios
const auth = firebase.auth();
const db = firebase.firestore();

// Hacer disponibles globalmente
window.auth = auth;
window.db = db;

console.log('Firebase configurado correctamente');