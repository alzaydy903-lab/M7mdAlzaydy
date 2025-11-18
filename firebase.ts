import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDV3KMpN3mziDHLvjTeLdPCdbfd9EUA8KM",
  authDomain: "first-project-a5cbe.firebaseapp.com",
  projectId: "first-project-a5cbe",
  storageBucket: "first-project-a5cbe.firebasestorage.app",
  messagingSenderId: "266806745674",
  appId: "1:266806745674:web:ffec4c55168cb36701a4b3",
  measurementId: "G-8QFS3VQWHJ"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
