"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import { Label } from "../components/ui/Label"
import { User, Key, Eye, EyeOff, ShieldCheck, ArrowLeft, CheckCircle2, XCircle, X } from "lucide-react"
import Image from "next/image"
import { useAuth } from "@/contexts/AuthContext"

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // OTP (two-step) state
  const [step, setStep] = useState("credentials") // 'credentials' | 'otp'
  const [otp, setOtp] = useState("")
  const [otpEmail, setOtpEmail] = useState("")
  const [centralized, setCentralized] = useState(false)
  const [info, setInfo] = useState("")
  const [resending, setResending] = useState(false)

  // Toast notification
  const [toast, setToast] = useState(null) // { type: 'success' | 'error', text }
  const toastTimer = useRef(null)
  const showToast = (type, text) => {
    if (!text) return
    setToast({ type, text })
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 4000)
  }

  const { login, verifyOtp, resendOtp } = useAuth()
  const router = useRouter()

  const redirectByRole = (user) => {
    if (user?.role === 'admin') {
      router.push('/admin/dashboard')
    } else {
      router.push('/dashboard')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setInfo("")
    setLoading(true)

    try {
      const result = await login(username, password)
      console.log("result", result)

      if (result.success) {
        if (result.otpRequired) {
          // Agent: move to the OTP verification step
          setOtpEmail(result.email)
          setCentralized(!!result.centralized)
          setStep("otp")
          const msg = result.message || "We've sent a 6-digit verification code."
          setInfo(msg)
          showToast('success', msg)
        } else {
          redirectByRole(result.user)
        }
      } else {
        setError(result.message || 'Login failed')
        showToast('error', result.message || 'Login failed')
      }
    } catch (error) {
      setError('Login failed. Please try again.')
      showToast('error', 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setError("")
    setInfo("")
    setLoading(true)

    try {
      const result = await verifyOtp(otpEmail, otp.trim())

      if (result.success) {
        showToast('success', 'Verified! Signing you in...')
        redirectByRole(result.user)
      } else {
        setError(result.message || 'Verification failed')
        showToast('error', result.message || 'Verification failed')
      }
    } catch (error) {
      setError('Verification failed. Please try again.')
      showToast('error', 'Verification failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    setError("")
    setInfo("")
    setResending(true)

    try {
      const result = await resendOtp(otpEmail)
      if (result.success) {
        const msg = result.message || 'A new verification code has been sent.'
        setInfo(msg)
        showToast('success', msg)
      } else {
        setError(result.message || 'Could not resend the code.')
        showToast('error', result.message || 'Could not resend the code.')
      }
    } catch (error) {
      setError('Could not resend the code. Please try again.')
      showToast('error', 'Could not resend the code. Please try again.')
    } finally {
      setResending(false)
    }
  }

  const backToLogin = () => {
    setStep("credentials")
    setOtp("")
    setError("")
    setInfo("")
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
      {/* Toast notification */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 animate-[slideIn_0.2s_ease-out]">
          <div
            className={`flex items-start gap-3 max-w-sm px-4 py-3 rounded-xl shadow-2xl border backdrop-blur-md ${
              toast.type === 'success'
                ? 'bg-green-500/15 border-green-500/30 text-green-200'
                : 'bg-red-500/15 border-red-500/30 text-red-200'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0 text-green-400" />
            ) : (
              <XCircle className="w-5 h-5 mt-0.5 shrink-0 text-red-400" />
            )}
            <p className="text-sm leading-snug flex-1">{toast.text}</p>
            <button
              onClick={() => setToast(null)}
              className="text-white/50 hover:text-white shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Geometric Background Pattern */}
      {/* <div className="absolute inset-0">
        <svg className="w-full h-full" viewBox="0 0 1920 1080" fill="none">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          <g stroke="rgba(255,255,255,0.05)" strokeWidth="1" fill="none">
            <line x1="0" y1="200" x2="400" y2="0" />
            <line x1="200" y1="400" x2="600" y2="100" />
            <line x1="800" y1="300" x2="1200" y2="50" />
            <line x1="1400" y1="250" x2="1800" y2="100" />
            <line x1="100" y1="600" x2="500" y2="400" />
            <line x1="700" y1="700" x2="1100" y2="500" />
            <line x1="1300" y1="600" x2="1700" y2="400" />
            <line x1="0" y1="800" x2="300" y2="600" />
            <line x1="500" y1="900" x2="900" y2="700" />
            <line x1="1100" y1="800" x2="1500" y2="600" />
            <line x1="1600" y1="900" x2="1920" y2="750" />
          </g>
        </svg>
      </div> */}

      <div className="relative z-10 w-full max-w-lg px-6">
        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
            <Image
                src="/logo.svg"
                alt="Logo"
                width={80}
                height={80}
                className="w-[170px] h-[170px]"
            />
        </div>

        {/* Login Form */}
        <div className="bg-gray-900/30 backdrop-blur-md rounded-2xl p-8 px-10 border border-white/10 shadow-2xl mb-14">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white">
              {step === 'otp' ? 'Verify it’s you' : 'Welcome Back!'}
            </h1>
            <p className="text-gray-400 text-sm">
              {step === 'otp'
                ? 'Enter the code we sent to your email'
                : 'welcome back we missed you'}
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {info && (
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 mb-4">
              <p className="text-purple-300 text-sm">{info}</p>
            </div>
          )}

          {step === 'otp' ? (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div>
                <Label htmlFor="otp" className="text-gray-300 text-sm mb-2 block">
                  Verification Code
                </Label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="Enter 6-digit code"
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
                    }
                    className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 pl-12 h-11 rounded-lg tracking-[0.4em] text-center focus:border-purple-500 focus:ring-purple-500"
                    autoFocus
                    required
                  />
                </div>
                <p className="text-gray-500 text-xs mt-2">
                  {centralized
                    ? 'Your administrator will share the code with you.'
                    : otpEmail
                    ? `Code sent to ${otpEmail}`
                    : ''}
                </p>
              </div>

              <Button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full h-11 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : 'Verify & Sign in'}
              </Button>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={backToLogin}
                  className="flex items-center gap-1 text-gray-400 text-xs hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to login
                </button>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resending}
                  className="text-gray-400 text-xs hover:text-purple-400 transition-colors disabled:opacity-50"
                >
                  {resending ? 'Resending...' : 'Resend code'}
                </button>
              </div>
            </form>
          ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="username" className="text-gray-300 text-sm mb-2 block">
                Email
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  id="username"
                  type="email"
                  placeholder="Email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 pl-12 h-11 rounded-lg focus:border-purple-500 focus:ring-purple-500"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="text-gray-300 text-sm mb-2 block">
                Password
              </Label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 pl-12 pr-12 h-11 rounded-lg focus:border-purple-500 focus:ring-purple-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="text-right mt-[-14]">
              <a href="#" className="text-gray-400 text-xs hover:text-purple-400 transition-colors">
                Forgot Password?
              </a>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
          )}
        </div>
      </div>

      {/* gradient */}
      <div className="absolute bottom-[-75%] left-[-75%] w-[1600px] h-[1200px] rounded-full opacity-60" style={{ background: "radial-gradient(50% 50% at 50% 50%, #C45647 0%, rgba(210, 90, 99, 0.00) 100%)" }}></div>
      <div className="absolute bottom-[-70%] right-[-70%] w-[1250px] h-[1000px] rounded-full opacity-50" style={{ background: "radial-gradient(50% 50% at 50% 50%, #B379DF 0%, rgba(54, 0, 96, 0.00) 100%)" }}></div>
    </div>
  )
}
