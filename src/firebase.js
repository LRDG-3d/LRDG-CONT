import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configuración de tu proyecto de Firebase (lrdg-cont)
const firebaseConfig = {
  apiKey: "AIzaSyD9ToIdm8xFU2DUSbhnONSlrhWILSA7iIY",
  authDomain: "lrdg-cont-efc2d.firebaseapp.com",
  projectId: "lrdg-cont-efc2d",
  storageBucket: "lrdg-cont-efc2d.firebasestorage.app",
  messagingSenderId: "712241478945",
  appId: "1:712241478945:web:abb3abcea39edb12ef1260",
  measurementId: "G-LLQ1YQ4NFH"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
