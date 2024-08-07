// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBCBlyTau59QhQG-GueaZfgqqJmc8voVfo",
  authDomain: "shifteaze.firebaseapp.com",
  projectId: "shifteaze",
  storageBucket: "shifteaze.appspot.com",
  messagingSenderId: "742329931108",
  appId: "1:742329931108:web:2f51f8834ba81572331671",
  measurementId: "G-4HVH9PSMP1",
};

const firebaseApp = initializeApp(firebaseConfig);
export { firebaseApp };
