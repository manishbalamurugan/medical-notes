// AuthContext.js

import { createContext, useContext, useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithEmailAndPassword, 
  signOut,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup
} from "firebase/auth";

import auth from "../firebase";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("")

  async function register(email, password) {
    return createUserWithEmailAndPassword(auth, email, password).then((result) => {
      if (result.user) {
        setCurrentUser({
          ...currentUser,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
        });
      }
    });
  }

  async function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password).then((result) => {
      if (result.user) {
        setCurrentUser({
          ...currentUser,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
        });
      }
    });
  }

  async function loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider).then((result) => {
      if (result.user) {
        setCurrentUser({
          ...currentUser,
          displayName: result.user.displayName,
          photo: result.user.photoURL,
        });
      }
    });
  }

  async function loginWithGithub() {
    const provider = new GithubAuthProvider();
    return signInWithPopup(auth, provider).then((result) => {
      if (result.user) {
        setCurrentUser({
          ...currentUser,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
        });
      }
    });
  }

  function updateUserProfile(user, profile) {
    return updateProfile(user, profile);
}

  function logout() {
    return signOut(auth);
}

  async function deleteUser() {
    const user = auth.currentUser;
    return user.delete().then(() => {
      console.log("Deleted User")
      setCurrentUser(null);
    }).catch((error) => {
      setError(error.message);
    });
  }

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    login,
    register,
    logout,
    error,
    setError,
    updateUserProfile,
    loginWithGoogle,
    loginWithGithub,
    deleteUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}