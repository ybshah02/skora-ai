import { createContext, useState, useContext } from 'react';
import { auth } from "../services/firebaseConfig";
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
  } from 'firebase/auth';
import BackendService from '../services/BackendService';

const UserContext = createContext(null);

export const AuthContextProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    const signInWithEmailPassword = async (email, password) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            await new Promise(resolve => setTimeout(resolve, 100));
            console.log(userCredential.user);
          } catch (error) {
            console.error("Authentication failed:", error);
            throw error;
          }
    }

    const signUpWithEmailPassword = async (name, email, password) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await BackendService.registerUser(name, email);
            console.log(userCredential.user);
          } catch (error) {
            console.error("Sign Up failed: :", error);
            throw error;
          }
    }

    return (
        <UserContext.Provider value={[signInWithEmailAndPassword, signUpWithEmailPassword]}>
            {children}
        </UserContext.Provider>
    )
}

export const UserAuth = () => {
    const user = useContext(UserContext);
    return user;
}