
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

import {getAuth} from "firebase/auth";
import {getFirestore} from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "chatapp-d256f.firebaseapp.com",
  projectId: "chatapp-d256f",
  storageBucket: "chatapp-d256f.firebasestorage.app",
  messagingSenderId: "687677821017",
  appId: "1:687677821017:web:63dee4ee412082da6d6148",
  measurementId: "G-FYSEHP98X8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);


export const auth=getAuth()
export const db=getFirestore()