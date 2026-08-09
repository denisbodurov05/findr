import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as signOutFromFirebase,
  updateProfile,
  User as FirebaseUser,
} from "firebase/auth";

import { firebaseAuth } from "@/config/firebase";
import { AuthSession, User } from "@findr/types";

function toUser(user: FirebaseUser): User {
  return {
    id: user.uid,
    username: user.displayName || user.email?.split("@")[0] || "Findr user",
    email: user.email || "",
  };
}

async function toSession(user: FirebaseUser): Promise<AuthSession> {
  return {
    accessToken: await user.getIdToken(),
    user: toUser(user),
  };
}

export function mapFirebaseUser(user: FirebaseUser): User {
  return toUser(user);
}

export async function register(username: string, email: string, password: string) {
  const { user } = await createUserWithEmailAndPassword(firebaseAuth, email, password);
  await updateProfile(user, { displayName: username });
  await user.reload();
  return toSession(firebaseAuth.currentUser || user);
}

export async function authenticate(email: string, password: string) {
  const { user } = await signInWithEmailAndPassword(firebaseAuth, email, password);
  return toSession(user);
}

export async function signOut() {
  await signOutFromFirebase(firebaseAuth);
}
