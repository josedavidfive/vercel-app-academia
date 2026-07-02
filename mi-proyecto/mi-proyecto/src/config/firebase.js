import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyCOw4xNaNqNFTtuzePh8ZF9Q6WuZS3d8yA",
  authDomain: "proyecto-final-41431.firebaseapp.com",
  projectId: "proyecto-final-41431",
  storageBucket: "proyecto-final-41431.firebasestorage.app",
  messagingSenderId: "796425908777",
  appId: "1:796425908777:web:10452c70754715624ba238",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
