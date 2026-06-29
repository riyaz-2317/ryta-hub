import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD6GyqOBJ-2CNXVHfZ_Ch-NgC8v5HdZMSo",
  authDomain: "ryta-hub.firebaseapp.com",
  projectId: "ryta-hub",
  storageBucket: "ryta-hub.firebasestorage.app",
  messagingSenderId: "703040027406",
  appId: "1:703040027406:web:06ea34b4388a930f1f755f"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope("https://www.googleapis.com/auth/drive.file");
googleProvider.addScope("email");
googleProvider.addScope("profile");
