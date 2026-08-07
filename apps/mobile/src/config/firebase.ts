import AsyncStorage from "@react-native-async-storage/async-storage";
import { getReactNativePersistence } from "@firebase/auth";
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, initializeAuth } from "firebase/auth";

import { getFirebaseConfig } from "@/config/env";

const app = getApps().length > 0 ? getApp() : initializeApp(getFirebaseConfig());
const persistence = getReactNativePersistence(AsyncStorage);

function initializeFirebaseAuth() {
  try {
    return initializeAuth(app, { persistence });
  } catch {
    return getAuth(app);
  }
}

export const firebaseAuth = initializeFirebaseAuth();
