'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth, type SignInError } from '@/lib/hooks/useAuth'
import { Eye, EyeOff, LogIn, Package, AlertTriangle, Bug, FlaskConical } from 'lucide-react'

const isDev = process.env.NODE_ENV === 'development'

function LoginPageContent() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [devError, setDevError] = useState<SignInError | null>(null)
  const [testResult, setTestResult] = useState<string | null>(null)
  const [testLoading, setTestLoading] = useState(false)

  const { signIn, testSupabaseAuth } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const hasConfigError = searchParams.get('config_error') === '1'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setDevError(null)
    setTestResult(null)

    if (!username.trim()) {
      setError('Kullanıcı adı boş bırakılamaz')
      return
    }
    if (!password) {
      setError('Şifre boş bırakılamaz')
      return
    }

    setLoading(true)
    try {
      await signIn(username, password)
      router.push('/dashboard')
      router.refresh()
    } catch (err: unknown) {
      // Structured error from useAuth
      if (err && typeof err === 'object' && 'message' in err) {
        const signInErr = err as SignInError
        setError(signInErr.message)
        setDevError(signInErr)
      } else {
        setError('Giriş yapılırken bir hata oluştu')
      }
    } finally {
      setLoading(false)
    }
  }

  // Debug: Doğrudan Supabase Auth testi
  const handleTestAuth = async () => {
    if (!password) {
      setTestResult('❌ Şifre alanını doldurun')
      return
    }

    const email = username.trim().toLowerCase()
      ? `${username.trim().toLowerCase()}@app.local`
      : 'admin3@app.local'

    setTestLoading(true)
    setTestResult(null)
    setError(null)
    setDevError(null)

    try {
      const result = await testSupabaseAuth(email, password)
      if (result.success) {
        setTestResult(
          `✅ Auth BAŞARILI!\n` +
          `  email: ${result.userEmail}\n` +
          `  userId: ${result.userId}`
        )
      } else {
        setTestResult(
          `❌ Auth BAŞARISIZ!\n` +
          `  email gönderilen: ${email}\n` +
          `  password uzunluğu: ${password.length}\n` +
          `  hata mesajı: ${result.errorMessage}\n` +
          `  hata kodu: ${result.errorCode ?? 'N/A'}\n` +
          `  HTTP status: ${result.errorStatus ?? 'N/A'}\n` +
          `  raw: ${result.rawError}`
        )
      }
    } catch (err: unknown) {
      setTestResult(`❌ Test exception: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setTestLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Başlık */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl shadow-lg mb-4">
            <Package className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Ürün Kataloğu</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Profesyonel B2B Satış Platformu
          </p>
        </div>

        {/* Yapılandırma Hatası Banner */}
        {hasConfigError && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 animate-fade-in">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-800 mb-1">
                  Supabase yapılandırması eksik
                </p>
                <p className="text-xs text-amber-700 leading-relaxed">
                  <code className="font-mono bg-amber-100 px-1 rounded">.env.local</code> dosyasında{' '}
                  <code className="font-mono bg-amber-100 px-1 rounded">NEXT_PUBLIC_SUPABASE_URL</code> ve{' '}
                  <code className="font-mono bg-amber-100 px-1 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>{' '}
                  değerlerini Supabase Dashboard&#39;dan alıp ekleyin, ardından sunucuyu yeniden başlatın.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Login Kartı */}
        <div className="bg-white rounded-2xl shadow-xl border border-border p-8">
          <h2 className="text-lg font-semibold text-foreground mb-6">Giriş Yap</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Kullanıcı Adı */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                Kullanıcı Adı
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                autoFocus
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value)
                  setError(null)
                  setDevError(null)
                  setTestResult(null)
                }}
                placeholder="kullanici_adi"
                className="form-input"
                disabled={loading}
              />
              {/* Üretilecek email önizlemesi — her zaman göster */}
              {username.trim() && (
                <p className="text-xs text-muted-foreground mt-1 font-mono">
                  → {username.trim().toLowerCase()}@app.local
                </p>
              )}
            </div>

            {/* Şifre */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                Şifre
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setError(null)
                    setDevError(null)
                    setTestResult(null)
                  }}
                  placeholder="••••••••"
                  className="form-input pr-10"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Hata Mesajı */}
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 animate-fade-in">
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            {/* Detaylı hata bilgisi — her zaman göster (debug için) */}
            {devError && (
              <div className="rounded-lg bg-slate-900 border border-slate-700 px-4 py-3 animate-fade-in">
                <div className="flex items-center gap-1.5 mb-2">
                  <Bug className="w-3.5 h-3.5 text-yellow-400" />
                  <span className="text-xs font-semibold text-yellow-400 uppercase tracking-wide">
                    Debug Bilgisi
                  </span>
                </div>
                <div className="space-y-1 font-mono text-xs">
                  <p className="text-slate-400">
                    <span className="text-slate-500">email sent     :</span>{' '}
                    <span className="text-green-400">{devError.generatedEmail}</span>
                  </p>
                  <p className="text-slate-400">
                    <span className="text-slate-500">password length:</span>{' '}
                    <span className="text-blue-400">{devError.passwordLength ?? '?'}</span>
                  </p>
                  <p className="text-slate-400">
                    <span className="text-slate-500">error type     :</span>{' '}
                    <span className="text-orange-400">{devError.errorType ?? 'unknown'}</span>
                  </p>
                  <p className="text-slate-400">
                    <span className="text-slate-500">error code     :</span>{' '}
                    <span className="text-red-400">{devError.code ?? 'N/A'}</span>
                  </p>
                  <p className="text-slate-400">
                    <span className="text-slate-500">HTTP status    :</span>{' '}
                    <span className="text-red-400">{devError.status ?? 'N/A'}</span>
                  </p>
                  <p className="text-slate-400">
                    <span className="text-slate-500">error detail   :</span>{' '}
                    <span className="text-red-300">{devError.devDetail}</span>
                  </p>
                </div>
              </div>
            )}

            {/* Submit Butonu */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2 gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Giriş yapılıyor...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Giriş Yap
                </>
              )}
            </button>
          </form>

          {/* Test Supabase Auth butonu */}
          <div className="mt-4 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={handleTestAuth}
              disabled={testLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors disabled:opacity-50"
            >
              {testLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-amber-400/30 border-t-amber-600 rounded-full animate-spin" />
                  Test ediliyor...
                </>
              ) : (
                <>
                  <FlaskConical className="w-4 h-4" />
                  Test Supabase Auth
                </>
              )}
            </button>
            <p className="text-xs text-muted-foreground mt-1.5 text-center">
              Yukarıdaki kullanıcı adı ve şifreyle doğrudan Supabase Auth&apos;u test eder
            </p>
          </div>

          {/* Test sonucu */}
          {testResult && (
            <div className={`mt-4 rounded-lg px-4 py-3 font-mono text-xs whitespace-pre-wrap ${
              testResult.startsWith('✅')
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              {testResult}
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          Bu sistem yetkili kullanıcılara özeldir.
          {isDev && (
            <span className="block mt-1 text-amber-600 font-medium">
              ⚙️ Development modu aktif
            </span>
          )}
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-muted-foreground">Yükleniyor...</div>}>
      <LoginPageContent />
    </Suspense>
  )
}