import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// -----------------------------------------------------------------------
// Reemplaza estos valores con los de TU proyecto de Firebase:
// Firebase console -> ⚙️ Configuración del proyecto -> "Tus apps" ->
// selecciona la app web (o crea una) -> "SDK setup and configuration".
// Estas claves NO son secretas (van en el cliente); lo que protege tus
// datos son las reglas de Firestore/Auth (ver README).
// -----------------------------------------------------------------------
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_PROYECTO.firebaseapp.com",
  projectId: "TU_PROYECTO",
  storageBucket: "TU_PROYECTO.appspot.com",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
