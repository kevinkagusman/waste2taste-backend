import React from "react";
import type { Session, User } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabase";

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
};

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = React.useState<Session | null>(null);
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // Cek apakah user sudah login (saat app pertama buka)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Subscribe perubahan auth state (login, logout, refresh token)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Register user baru
  const signUp = React.useCallback(
    async (email: string, password: string, fullName: string) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        return { error: error.message };
      }

      // Setelah signUp Supabase Auth berhasil, buat row di tabel users
      if (data.user) {
        const { error: profileError } = await supabase.from("users").insert({
          user_id: data.user.id,
          email: email,
          full_name: fullName,
          role_id: 1, // 1 = user biasa (sesuai seed data kita)
        });

        if (profileError) {
          return { error: `Akun dibuat tapi profil gagal: ${profileError.message}` };
        }
      }

      return { error: null };
    },
    []
  );

  // Login
  const signIn = React.useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return { error: error.message };
    }
    return { error: null };
  }, []);

  // Logout
  const signOut = React.useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const value = React.useMemo(
    () => ({ session, user, loading, signUp, signIn, signOut }),
    [session, user, loading, signUp, signIn, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = React.useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return value;
}
