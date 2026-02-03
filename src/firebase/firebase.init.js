// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: "AIzaSyB9ypReezysO0GwYsQgDLWG2bj1hLNE2C0",
//   authDomain: "city-fix-assignment-11.firebaseapp.com",
//   projectId: "city-fix-assignment-11",
//   storageBucket: "city-fix-assignment-11.firebasestorage.app",
//   messagingSenderId: "170114108156",
//   appId: "1:170114108156:web:a5c93e561171050992a579",
//   measurementId: "G-KXQP7EYRZY"
// };  

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey:  import.meta.env.VITE_apiKey,
  authDomain:  import.meta.env.VITE_authDomain,
  projectId:  import.meta.env.VITE_projectId,
  storageBucket:  import.meta.env.VITE_storageBucket,
  messagingSenderId:  import.meta.env.VITE_messagingSenderId,
  appId:  import.meta.env.VITE_appId,
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);