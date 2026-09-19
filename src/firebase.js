import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyClpc5dBi_QQclvlCA9KjRYy0lSJgTjDFc",
  authDomain: "lrdg-cont.firebaseapp.com",
  databaseURL: "https://lrdg-cont-default-rtdb.firebaseio.com",
  projectId: "lrdg-cont",
  storageBucket: "lrdg-cont.firebasestorage.app",
  messagingSenderId: "37780270749",
  appId: "1:37780270749:web:fe96932d269c0abbb7ae74"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
