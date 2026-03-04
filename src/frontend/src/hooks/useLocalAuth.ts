import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { UserRole } from "../backend.d";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

const SESSION_TOKEN_KEY = "tefa_session_token";
const SESSION_USERNAME_KEY = "tefa_session_username";
const SESSION_ROLE_KEY = "tefa_session_role";

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export interface LocalAuthState {
  token: string | null;
  username: string | null;
  role: UserRole | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export const LocalAuthContext = createContext<LocalAuthState>({
  token: null,
  username: null,
  role: null,
  isLoggedIn: false,
  isLoading: true,
  login: async () => false,
  logout: () => {},
});

export function useLocalAuth(): LocalAuthState {
  return useContext(LocalAuthContext);
}

// Internal hook to build LocalAuthState — used by LocalAuthProvider
export function useLocalAuthValue(): LocalAuthState {
  const { actor, isFetching } = useActor();
  const { clear: clearII } = useInternetIdentity();

  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(SESSION_TOKEN_KEY),
  );
  const [username, setUsername] = useState<string | null>(() =>
    localStorage.getItem(SESSION_USERNAME_KEY),
  );
  const [role, setRole] = useState<UserRole | null>(
    () => localStorage.getItem(SESSION_ROLE_KEY) as UserRole | null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [validated, setValidated] = useState(false);

  // Validate existing token once actor is ready
  useEffect(() => {
    if (isFetching || !actor || validated) return;

    const storedToken = localStorage.getItem(SESSION_TOKEN_KEY);
    if (!storedToken) {
      setIsLoading(false);
      setValidated(true);
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const validUsername = await actor.validateSessionToken(storedToken);
        if (cancelled) return;

        if (validUsername) {
          // Token valid — also refresh the role
          const sessionRole = await actor.getSessionRole(storedToken);
          if (cancelled) return;
          setToken(storedToken);
          setUsername(validUsername);
          setRole(sessionRole);
          localStorage.setItem(SESSION_USERNAME_KEY, validUsername);
          if (sessionRole) {
            localStorage.setItem(SESSION_ROLE_KEY, String(sessionRole));
          }
        } else {
          // Token expired/invalid — clear everything
          localStorage.removeItem(SESSION_TOKEN_KEY);
          localStorage.removeItem(SESSION_USERNAME_KEY);
          localStorage.removeItem(SESSION_ROLE_KEY);
          setToken(null);
          setUsername(null);
          setRole(null);
        }
      } catch {
        // On error, keep the stored data so UI doesn't flicker
      } finally {
        if (!cancelled) {
          setIsLoading(false);
          setValidated(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [actor, isFetching, validated]);

  const login = useCallback(
    async (user: string, password: string): Promise<boolean> => {
      if (!actor) return false;
      const hash = await hashPassword(password);
      const newToken = await actor.loginLocal(user, hash);
      if (!newToken) return false;

      const sessionRole = await actor.getSessionRole(newToken);

      localStorage.setItem(SESSION_TOKEN_KEY, newToken);
      localStorage.setItem(SESSION_USERNAME_KEY, user);
      if (sessionRole) {
        localStorage.setItem(SESSION_ROLE_KEY, String(sessionRole));
      }

      setToken(newToken);
      setUsername(user);
      setRole(sessionRole);
      return true;
    },
    [actor],
  );

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_TOKEN_KEY);
    localStorage.removeItem(SESSION_USERNAME_KEY);
    localStorage.removeItem(SESSION_ROLE_KEY);
    setToken(null);
    setUsername(null);
    setRole(null);
    // Also clear II identity
    clearII();
  }, [clearII]);

  return {
    token,
    username,
    role,
    isLoggedIn: !!token && !!username,
    isLoading,
    login,
    logout,
  };
}
