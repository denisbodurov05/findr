import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { router } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";

import { firebaseAuth } from "@/config/firebase";
import {
  authenticate,
  authenticateWithGoogleIdToken,
  mapFirebaseUser,
  register,
  signOut as signOutFromFirebase,
} from "@/services/authService";
import { getErrorMessage } from "@/utils/errors";
import { User } from "@/types/domain";
import { TranslationKey } from "@/i18n/translations";
import { useTranslation } from "@/providers/I18nProvider";

type AuthResult = void | { error: string };

function mapFirebaseAuthError(
  error: unknown,
  t: (key: TranslationKey) => string
): string | null {
  const code = (error as { code?: unknown } | null)?.code;

  if (typeof code !== "string" || !code.startsWith("auth/")) {
    return null;
  }

  switch (code) {
    case "auth/invalid-credential":
    case "auth/invalid-email":
    case "auth/user-not-found":
    case "auth/wrong-password":
      return t("auth.invalidCredentials");
    case "auth/too-many-requests":
      return t("auth.tooManyAttempts");
    case "auth/email-already-in-use":
      return t("auth.emailInUse");
    case "auth/weak-password":
      return t("auth.shortPassword");
    default:
      return null;
  }
}

interface AuthContextValue {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  signUp: (username: string, email: string, password: string) => Promise<AuthResult>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signInWithGoogle: (idToken: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (nextUser) => {
      if (!nextUser) {
        setUser(null);
        setAccessToken(null);
        setLoading(false);
        return;
      }

      setUser(mapFirebaseUser(nextUser));
      void nextUser.getIdToken().then(setAccessToken).finally(() => setLoading(false));
    });

    return unsubscribe;
  }, []);

  const applySession = useCallback((session: { user: User; accessToken: string }) => {
    setUser(session.user);
    setAccessToken(session.accessToken);
  }, []);

  const signIn = useCallback(
    async (email: string, password: string) => {
      try {
        const session = await authenticate(email, password);
        await applySession(session);
      } catch (error) {
        const authError = mapFirebaseAuthError(error, t);
        if (authError) {
          return { error: authError };
        }

        const message = getErrorMessage(error, t("common.unknownError"));
        return {
          error: message === "Invalid credentials" ? t("auth.invalidCredentials") : message,
        };
      }
    },
    [applySession, t]
  );

  const signUp = useCallback(
    async (username: string, email: string, password: string) => {
      try {
        const session = await register(username, email, password);
        await applySession(session);
      } catch (error) {
        const authError = mapFirebaseAuthError(error, t);
        if (authError) {
          return { error: authError };
        }

        return { error: getErrorMessage(error, t("common.unknownError")) };
      }
    },
    [applySession, t]
  );

  const signInWithGoogle = useCallback(
    async (idToken: string) => {
      try {
        const session = await authenticateWithGoogleIdToken(idToken);
        applySession(session);
      } catch (error) {
        return { error: getErrorMessage(error, t("common.unknownError")) };
      }
    },
    [applySession, t]
  );

  const signOut = useCallback(async () => {
    setUser(null);
    setAccessToken(null);
    await signOutFromFirebase();
    router.replace("/(auth)/sign-in");
  }, []);

  const getAccessToken = useCallback(async () => {
    const firebaseUser = firebaseAuth.currentUser;

    if (!firebaseUser) {
      return null;
    }

    const token = await firebaseUser.getIdToken();
    setAccessToken(token);
    return token;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      accessToken,
      loading,
      signUp,
      signIn,
      signInWithGoogle,
      signOut,
      getAccessToken,
    }),
    [accessToken, getAccessToken, loading, signIn, signInWithGoogle, signOut, signUp, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
