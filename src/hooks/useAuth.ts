import { useCallback, useEffect, useRef, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export type AuthUser = {
  id: string;
  email: string;
  fullName: string | null;
};

type SessionState = {
  user: AuthUser | null;
  loading: boolean;
};

export function useAuth() {
  const [state, setState] = useState<SessionState>({ user: null, loading: true });
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // Get current session + profile on mount
  useEffect(() => {
    let cancelled = false;

    async function init() {
      if (!supabase) {
        // No Supabase configured — should not happen since env is set, but guard anyway
        if (!cancelled && mountedRef.current) setState({ user: null, loading: false });
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (cancelled || !mountedRef.current) return;

      if (!session) {
        setState({ user: null, loading: false });
        return;
      }

      const user = await buildAuthUser(session.user);
      if (!cancelled && mountedRef.current) {
        setState({ user, loading: false });
      }
    }

    init();

    return () => { cancelled = true; };
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    if (!supabase) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        if (!session) {
          if (mountedRef.current) setState({ user: null, loading: false });
          return;
        }
        const user = await buildAuthUser(session.user);
        if (mountedRef.current) setState({ user, loading: false });
      })();
    });

    return () => { subscription.unsubscribe(); };
  }, []);

  const signUp = useCallback(async (fullName: string, email: string, password: string) => {
    if (!supabase) throw new Error('Authentication is not available.');
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) throw error;

    // Insert profile row if user was created
    if (data.user) {
      const { error: profileErr } = await supabase
        .from('profiles')
        .insert({ id: data.user.id, full_name: fullName });
      // Ignore duplicate-key errors (user may already have a profile)
      if (profileErr && profileErr.code !== '23505') throw profileErr;
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) throw new Error('Authentication is not available.');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    if (mountedRef.current) setState({ user: null, loading: false });
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    if (!supabase) throw new Error('Authentication is not available.');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/`,
    });
    if (error) throw error;
  }, []);

  return { user: state.user, loading: state.loading, signUp, signIn, signOut, resetPassword };
}

/** Build an AuthUser from a Supabase user, fetching the profile name. */
async function buildAuthUser(supabaseUser: User): Promise<AuthUser> {
  let fullName: string | null = supabaseUser.user_metadata?.full_name ?? null;

  // Try to fetch from profiles table (more reliable than metadata)
  if (supabase) {
    const { data } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', supabaseUser.id)
      .maybeSingle();
    if (data?.full_name) fullName = data.full_name;
  }

  return {
    id: supabaseUser.id,
    email: supabaseUser.email ?? '',
    fullName,
  };
}
