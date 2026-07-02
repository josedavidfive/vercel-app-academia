import { signInWithEmailAndPassword, signOut } from "firebase/auth";

import { auth } from "../config/firebase";

export function login(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function logout() {
  return signOut(auth);
}
