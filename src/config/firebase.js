import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Credenciales públicas para la Web SDK de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCNtCtfIIhhwsEQLGtPKj2RW1qkzN3NqsA",
  authDomain: "quiniela-mlb-2026.firebaseapp.com",
  projectId: "quiniela-mlb-2026",
  storageBucket: "quiniela-mlb-2026.appspot.com",
  messagingSenderId: "105479218898655239343",
  appId: "1:1061925192246:web:074e57ee8ff132feae4e97"
};

// Inicializar Firebase sin duplicar la instancia si ya existe
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Exportar la instancia de Firestore para usarla en la aplicación
export const db = getFirestore(app);