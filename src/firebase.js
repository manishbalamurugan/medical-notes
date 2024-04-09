// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCNLTy2YKBPBjsaqBYnTcCPWHxj2yHlZbg",
  authDomain: "mcwpeds-ec89e.firebaseapp.com",
  projectId: "mcwpeds-ec89e",
  storageBucket: "mcwpeds-ec89e.appspot.com",
  messagingSenderId: "278483599192",
  appId: "1:278483599192:web:5c3c896236d66102912f2d",
  measurementId: "G-S4GBJL34MN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);

export default auth; 