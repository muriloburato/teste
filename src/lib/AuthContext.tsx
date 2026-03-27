import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';
import { User } from '@supabase/supabase-js';

interface Profile {
  id: string;
  full_name: string;
  username: string;
  role: 'auxiliar' | 'assistente' | 'analista' | 'gestor' | 'admin';
  status: 'active' | 'blocked';
  operacao?: 'importacao' | 'exportacao' | 'ambos';
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signInMaster: (user: any, profile: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const masterSession = localStorage.getItem('indaia_master_admin_session');
    
    const handleInitialSession = async () => {
      try {
        if (masterSession) {
          try {
            const { user: cachedUser, profile: cachedProfile } = JSON.parse(masterSession);
            setUser(cachedUser as User);
            
            const { data, error } = await supabase.from('profiles').select('*').eq('username', 'admin').single();
            if (!error && data) {
              setProfile(data);
            } else {
              // Tenta singular se plural falhar
              const { data: retryData } = await supabase.from('profile').select('*').eq('username', 'admin').single();
              if (retryData) {
                setProfile(retryData);
              } else {
                setProfile(cachedProfile);
              }
            }
            setLoading(false);
            return;
          } catch (e) {
            localStorage.removeItem('indaia_master_admin_session');
          }
        }

        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setLoading(false);
      }
    };

    handleInitialSession();

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      // Only update if we are NOT in a master session bypass
      if (!localStorage.getItem('indaia_master_admin_session')) {
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchProfile(session.user.id);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId: string) {
    try {
      // Tenta primeiro 'profiles' (plural)
      let { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // Tenta 'profile' (singular)
        const { data: retryData, error: retryError } = await supabase
          .from('profile')
          .select('*')
          .eq('id', userId)
          .single();
        
        if (!retryError) {
          data = retryData;
          error = null;
        }
      }

      if (error) {
        console.error('Error fetching profile:', error);
      } else {
        setProfile(data);
      }
    } finally {
      setLoading(false);
    }
  }

  const signOut = async () => {
    localStorage.removeItem('indaia_master_admin_session');
    setUser(null);
    setProfile(null);
    await supabase.auth.signOut();
  };

  const signInMaster = (userData: any, profileData: any) => {
    localStorage.setItem('indaia_master_admin_session', JSON.stringify({ user: userData, profile: profileData }));
    setUser(userData);
    setProfile(profileData);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut, signInMaster }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
