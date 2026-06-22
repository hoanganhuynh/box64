'use client'

import Image from 'next/image'
import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase/client'

function GoogleLoginButton() {
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/'

  async function handleGoogleLogin() {
    setLoading(true)
    const supabase = createSupabaseClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    })
  }

  return (
    <button
      onClick={handleGoogleLogin}
      disabled={loading}
      className="w-full flex items-center justify-center gap-3 h-12 px-6 rounded-sm bg-white text-[#1F1F1F] font-semibold text-sm hover:bg-white/90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
    >
      <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
        <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
        <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
        <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
        <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 6.293C4.672 4.166 6.656 3.58 9 3.58z" fill="#EA4335"/>
      </svg>
      {loading ? 'Redirecting…' : 'Continue with Google'}
    </button>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#07070C] flex items-center justify-center px-4">

      {/* Ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0"
        style={{
          background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(245,158,11,0.07) 0%, transparent 70%)',
        }}
      />

      <div className="relative w-full max-w-sm">

        {/* Logo */}
        <div className="flex justify-center mb-10">
          <Image src="/logo.svg" alt="figbox.store" width={44} height={48} priority />
        </div>

        {/* Card */}
        <div className="bg-surface border border-border rounded-xl px-8 py-10 flex flex-col items-center gap-6">

          <div className="text-center">
            <p className="text-gold text-[10px] font-bold tracking-[0.22em] uppercase mb-2">
              <span className="opacity-40 mr-1.5">//</span>Member access
            </p>
            <h1 className="font-display font-extrabold text-white text-2xl uppercase leading-tight">
              Sign in to<br />figbox.store
            </h1>
          </div>

          <p className="text-white/40 text-sm text-center leading-relaxed">
            Access your orders, track deliveries,<br />and manage custom box requests.
          </p>

          <Suspense fallback={
            <div className="w-full h-12 rounded-sm bg-white/10 animate-pulse" />
          }>
            <GoogleLoginButton />
          </Suspense>

          <p className="text-white/25 text-xs text-center leading-relaxed">
            By signing in you agree to our terms of service.<br />
            We only use Google to verify your identity.
          </p>
        </div>

        {/* Back link */}
        <p className="text-center mt-6">
          <a href="/" className="text-white/30 hover:text-white/60 text-xs transition-colors">
            ← Back to shop
          </a>
        </p>
      </div>
    </div>
  )
}
