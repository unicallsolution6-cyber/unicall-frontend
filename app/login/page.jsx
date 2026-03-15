"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import { Label } from "../components/ui/Label"
import { User, Key, Eye, EyeOff } from "lucide-react"
import Image from "next/image"
import { useAuth } from "@/contexts/AuthContext"

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const result = await login(username, password)
      
      if (result.success) {
        // Redirect based on user role
        if (result.user.role === 'admin') {
          router.push('/admin/dashboard')
        } else {
          router.push('/dashboard')
        }
      } else {
        setError(result.message || 'Login failed')
      }
    } catch (error) {
      setError('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
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
            <h1 className="text-3xl font-bold text-white">Welcome Back!</h1>
            <p className="text-gray-400 text-sm">welcome back we missed you</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

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
        </div>
      </div>

      {/* gradient */}
      <div className="absolute bottom-[-75%] left-[-75%] w-[1600px] h-[1200px] rounded-full opacity-60" style={{ background: "radial-gradient(50% 50% at 50% 50%, #C45647 0%, rgba(210, 90, 99, 0.00) 100%)" }}></div>
      <div className="absolute bottom-[-70%] right-[-70%] w-[1250px] h-[1000px] rounded-full opacity-50" style={{ background: "radial-gradient(50% 50% at 50% 50%, #B379DF 0%, rgba(54, 0, 96, 0.00) 100%)" }}></div>
    </div>
  )
}
