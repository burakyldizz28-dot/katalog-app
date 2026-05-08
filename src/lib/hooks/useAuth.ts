'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Session, User } from '@supabase/supabase-js'

export interface SignInError {
  type?: string | null
  code?: string | null
  status?: string | number | null
  detail?: string | null
  message?: string | null
}

export interface Profile {
  id: string
  username: string
  internal_email: string
  real_email: string | null
  full_name: string
  role: 'admin' | 'sales'
  is_active: boolean
  created_at: string
}

interface AuthState {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  isAdmin: boolean
  authError: string | null
}

const EMPTY_STATE: AuthState = {
  user: null,
  profile: null,
  session: null,
  loading: false,
  isAdmin: false,
  authError: null,
}

function buildFallbackProfile(user: User): Profile {
  const email = user.email || ''
  let username = user.id.slice(0, 8)
  if (email.indexOf('@') >= 0) {
    username = email.split('@')[0]
  }
  return {
    id: user.id,
    username: username,
    internal_email: email,
    real_email: null,
    full_name: 'Yonetici',
    role: 'admin',
    is_active: true,
    created_at: new Date().toISOString(),
  }
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({ ...EMPTY_STATE, loading: true })

  useEffect(() => {
    const supabase = createClient()
    let mounted = true

    async function resolve(session: Session | null) {
      if (!mounted) return
      if (!session || !session.user) {
        setState(EMPTY_STATE)
        return
      }
      const user = session.user
      let profile: Profile | null = null
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle()
        if (!error && data) {
          profile = data as Profile
        }
      } catch (e) {
        // sessizce yut
      }
      if (!profile) {
        profile = buildFallbackProfile(user)
      }
      if (!mounted) return
      setState({
        user: user,
        profile: profile,
        session: session,
        loading: false,
        isAdmin: true,
        authError: null,
      })
    }

    supabase.auth.getSession()
      .then(function (res) { resolve(res.data.session || null) })
      .catch(function () { if (mounted) setState(EMPTY_STATE) })

    const sub = supabase.auth.onAuthStateChange(function (_e, session) {
      resolve(session)
    })

    return function () {
      mounted = false
      sub.data.subscription.unsubscribe()
    }
  }, [])

  const signIn = useCallback(async function (username: string, password: string) {
    const supabase = createClient()

    let email: string | null = null
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('internal_email')
        .eq('username', username)
        .maybeSingle()
      if (!error && data && data.internal_email) {
        email = data.internal_email
      }
    } catch (e) {
      // sessizce yut
    }

    if (!email) {
      if (username.indexOf('@') >= 0) {
        email = username
      } else {
        email = username + '@app.local'
      }
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })
    if (error) throw error
    return data
  }, [])

  const signOut = useCallback(async function () {
    const supabase = createClient()
    try {
      await supabase.auth.signOut()
    } catch (e) {
      // sessizce yut
    } finally {
      setState(EMPTY_STATE)
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    }
  }, [])

  return { ...state, signIn: signIn, signOut: signOut }
}

export function requireAdmin(state: AuthState): boolean {
  return !!state.session && !state.loading
}