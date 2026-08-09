export const API_BASE_URL = process.env.EXPO_PUBLIC_HOST;

export const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

export function getApiBaseUrl() {
  if (!API_BASE_URL) {
    throw new Error("EXPO_PUBLIC_HOST is not configured");
  }

  return `${API_BASE_URL}/api/v1`;
}

export function getFirebaseConfig() {
  const missingKeys = Object.entries(firebaseConfig)
    .filter(([key, value]) => key !== "measurementId" && !value)
    .map(([key]) => key);

  if (missingKeys.length > 0) {
    throw new Error(`Firebase config is missing: ${missingKeys.join(", ")}`);
  }

  return firebaseConfig as Record<keyof typeof firebaseConfig, string>;
}
