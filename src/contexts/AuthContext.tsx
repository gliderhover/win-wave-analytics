import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => void;
  resetPassword: (email: string) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = "betiq_auth_user";
const ACCOUNTS_KEY = "betiq_accounts";

// TODO: Replace localStorage mock with Supabase Auth
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch {}
    }
    setLoading(false);
  }, []);

  const getAccounts = (): Record<string, { password: string; user: User }> => {
    try { return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || "{}"); } catch { return {}; }
  };

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    const accounts = getAccounts();
    const account = accounts[email.toLowerCase()];
    if (!account || account.password !== password) {
      setLoading(false);
      throw new Error("Invalid email or password");
    }
    setUser(account.user);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(account.user));
    setLoading(false);
  }, []);

  const signup = useCallback(async (email: string, password: string, displayName: string) => {
    setError(null);
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    const accounts = getAccounts();
    if (accounts[email.toLowerCase()]) {
      setLoading(false);
      throw new Error("An account with this email already exists");
    }
    const newUser: User = {
      id: crypto.randomUUID(),
      email: email.toLowerCase(),
      displayName,
      createdAt: new Date().toISOString(),
    };
    accounts[email.toLowerCase()] = { password, user: newUser };
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
    setUser(newUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    setLoading(false);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const resetPassword = useCallback(async (_email: string) => {
    await new Promise(r => setTimeout(r, 600));
    // Mock: always succeeds
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider value={{ user, loading, error, login, signup, logout, resetPassword, clearError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
