import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from "./firebaseConfig";
import BackendService from './BackendService';


class LoginService {

  isLoggedIn = false;

  async signInWithEmailPassword(email: string, password: string): Promise<void> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await new Promise(resolve => setTimeout(resolve, 100));

      console.log(userCredential.user);
      this.isLoggedIn = true;
    } catch (error) {
      console.error("Authentication failed:", error);
      throw error;
    }
  }

  async signUpWithEmailPassword(name: string, email: string, password: string): Promise<void> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log("name: ", name)
      console.log("email: ", email)
      await BackendService.registerUser(name, email);
      console.log(userCredential.user);
      this.isLoggedIn = true;
    } catch (error) {
      console.error("Sign Up failed: :", error);
      throw error;
    }
  }

  signOut(): void {
    signOut(auth).then(() => {
      console.log("Logged out successfully");
      this.isLoggedIn = false;
    }).catch((error) => {
      console.error("Logout failed:", error);
    });
  }

  // async getUserToken(): Promise<string | null> {
  //   const user = auth.currentUser;
  //   console.log(await user?.getIdToken())
  //   if (user) return await user.getIdToken();
  //   else return null;
  // }

  async getUserToken(): Promise<string | null> {
    if (auth.currentUser) {
      return await auth.currentUser.getIdToken();
    }
    return null;
  }


}

export default new LoginService();