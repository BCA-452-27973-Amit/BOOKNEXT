import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: any | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async (uid?: string | null) => {
      if (!uid) {
        setProfile(null);
        return;
      }
      try {
        const { data, error } = await supabase.from("profiles").select("*").eq("id", uid).single();
        if (error) {
          console.error("Failed to load profile:", error.message);
          setProfile(null);
        } else {
          setProfile(data);
        }
      } catch (err) {
        console.error("Unexpected profile load error:", err);
        setProfile(null);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      void fetchProfile(session?.user?.id ?? null);
      setLoading(false);
    });

    const loadSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Failed to restore Supabase session:", error.message);
        }
        setSession(data.session);
        setUser(data.session?.user ?? null);
        void fetchProfile(data.session?.user?.id ?? null);
      } catch (error) {
        console.error("Unexpected session restore error:", error);
      } finally {
        setLoading(false);
      }
    };

    void loadSession();

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (error) {
        console.error("Supabase sign up failed:", error.message);
      }
      return { error: error?.message ?? null };
    } catch (error) {
      console.error("Unexpected sign up error:", error);
      return { error: "Unable to sign up right now. Please try again." };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        console.error("Supabase sign in failed:", error.message);
      }
      return { error: error?.message ?? null };
    } catch (error) {
      console.error("Unexpected sign in error:", error);
      return { error: "Unable to sign in right now. Please try again." };
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Supabase sign out failed:", error.message);
    }
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
