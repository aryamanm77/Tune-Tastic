import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDr9DpDGio2TMPpEa0iEY2tUF6IMfqnRKE",
  authDomain: "tunetastic-d8ecc.firebaseapp.com",
  projectId: "tunetastic-d8ecc",
  storageBucket: "tunetastic-d8ecc.firebasestorage.app",
  messagingSenderId: "817944483782",
  appId: "1:817944483782:web:02141bce3cc823efe4c4c7"
};

const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
