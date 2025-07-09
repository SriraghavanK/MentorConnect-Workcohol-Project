"use client"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "../../contexts/AuthContext"
import { useRouter } from "next/navigation"
import { FadeIn, ScaleIn } from "../../components/LightweightAnimations"
import { Sparkles, UserPlus, Crown, GraduationCap } from "lucide-react"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    first_name: "",
    last_name: "",
    user_type: "mentee",
  })
  const [isLoading, setIsLoading] = useState(false)
  const { register, error, clearError } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match!")
      return
    }

    setIsLoading(true)
    clearError()

    try {
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
        user_type: formData.user_type,
      })

      router.push("/dashboard")
    } catch (error) {
      // Error is handled by the auth context
    } finally {
      setIsLoading(false)
    }
  }

  const handleButtonClick = () => {
    // Button click handler
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950/30 to-slate-950 overflow-hidden py-6 md:py-8">
      {/* Enhanced Background */}
      <div className="fixed inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950/30 to-slate-950"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,198,0.12),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,105,180,0.08),transparent_50%)]"></div>
      </div>

      {/* Floating Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-500/4 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Register Form */}
      <FadeIn className="relative z-10 w-full max-w-2xl mx-6">
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900/90 via-slate-800/70 to-slate-900/90 backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-2xl border border-purple-500/30 hover:border-purple-400/40 transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 via-transparent to-pink-600/5"></div>

          {/* Floating particles */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-6 right-6 w-2 h-2 bg-purple-400/30 rounded-full animate-pulse"></div>
            <div className="absolute bottom-8 left-8 w-1 h-1 bg-pink-400/40 rounded-full animate-ping delay-300"></div>
            <div className="absolute top-1/2 left-6 w-1.5 h-1.5 bg-amber-400/20 rounded-full animate-bounce delay-700"></div>
          </div>

          <div className="relative z-10">
            {/* Header */}
            <FadeIn className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="p-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-500/30 animate-pulse">
                  <UserPlus className="w-5 h-5 text-purple-400" />
                </div>
                <Sparkles className="w-5 h-5 text-amber-400 animate-bounce" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-3">
                Join MentorConnect
              </h1>
              <p className="text-base text-slate-400">Create your account and start your mentorship journey</p>
            </FadeIn>

            {/* Error Message */}
            {error && (
              <FadeIn className="relative overflow-hidden bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/40 text-red-300 px-4 py-3 rounded-xl mb-6 shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-pink-600/10"></div>
                <div className="relative z-10 flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                  {error}
                </div>
              </FadeIn>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* User Type Selection */}
              <FadeIn>
                <label className="block text-sm font-bold text-slate-200 mb-3">I want to join as:</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, user_type: "mentee" })}
                    className={`group relative overflow-hidden p-4 rounded-xl border transition-all duration-500 hover:scale-[1.02] ${
                      formData.user_type === "mentee"
                        ? "bg-gradient-to-br from-purple-500/20 to-violet-500/20 border-purple-400/60 shadow-lg shadow-purple-500/20"
                        : "bg-gradient-to-br from-slate-800/50 to-slate-700/30 border-slate-600/50 hover:border-purple-400/40"
                    }`}
                  >
                    <div className="text-center">
                      <GraduationCap className="w-6 h-6 text-purple-400 mx-auto mb-2 group-hover:animate-bounce" />
                      <div className="font-bold text-white text-base mb-1">Mentee</div>
                      <div className="text-xs text-slate-400">Find amazing mentors</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, user_type: "mentor" })}
                    className={`group relative overflow-hidden p-4 rounded-xl border transition-all duration-500 hover:scale-[1.02] ${
                      formData.user_type === "mentor"
                        ? "bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-amber-400/60 shadow-lg shadow-amber-500/20"
                        : "bg-gradient-to-br from-slate-800/50 to-slate-700/30 border-slate-600/50 hover:border-amber-400/40"
                    }`}
                  >
                    <div className="text-center">
                      <Crown className="w-6 h-6 text-amber-400 mx-auto mb-2 group-hover:animate-bounce" />
                      <div className="font-bold text-white text-base mb-1">Mentor</div>
                      <div className="text-xs text-slate-400">Share your knowledge</div>
                    </div>
                  </button>
                </div>
              </FadeIn>

              {/* Input Fields */}
              <FadeIn>
                <label htmlFor="username" className="block text-xs font-bold text-slate-300 mb-2">
                  Username
                </label>
                <div className="relative group">
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full px-3 py-3 bg-gradient-to-r from-slate-800/60 to-slate-700/40 backdrop-blur-sm border border-slate-600/50 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400/50 transition-all duration-300 hover:border-purple-500/30"
                    placeholder="Choose a unique username"
                    required
                  />
                </div>
              </FadeIn>

              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <FadeIn>
                  <label htmlFor="first_name" className="block text-xs font-bold text-slate-300 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    className="w-full px-3 py-3 bg-gradient-to-r from-slate-800/60 to-slate-700/40 backdrop-blur-sm border border-slate-600/50 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400/50 transition-all duration-300 hover:border-purple-500/30"
                    placeholder="First name"
                    required
                  />
                </FadeIn>

                <FadeIn>
                  <label htmlFor="last_name" className="block text-xs font-bold text-slate-300 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="last_name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    className="w-full px-3 py-3 bg-gradient-to-r from-slate-800/60 to-slate-700/40 backdrop-blur-sm border border-slate-600/50 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400/50 transition-all duration-300 hover:border-purple-500/30"
                    placeholder="Last name"
                    required
                  />
                </FadeIn>
              </div>

              <FadeIn>
                <label htmlFor="email" className="block text-xs font-bold text-slate-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-3 bg-gradient-to-r from-slate-800/60 to-slate-700/40 backdrop-blur-sm border border-slate-600/50 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400/50 transition-all duration-300 hover:border-purple-500/30"
                  placeholder="Enter your email address"
                  required
                />
              </FadeIn>

              {/* Password Fields */}
              <div className="grid grid-cols-2 gap-4">
                <FadeIn>
                  <label htmlFor="password" className="block text-xs font-bold text-slate-300 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-3 py-3 bg-gradient-to-r from-slate-800/60 to-slate-700/40 backdrop-blur-sm border border-slate-600/50 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400/50 transition-all duration-300 hover:border-purple-500/30"
                    placeholder="Create password"
                    required
                  />
                </FadeIn>

                <FadeIn>
                  <label htmlFor="confirmPassword" className="block text-xs font-bold text-slate-300 mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-3 py-3 bg-gradient-to-r from-slate-800/60 to-slate-700/40 backdrop-blur-sm border border-slate-600/50 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400/50 transition-all duration-300 hover:border-purple-500/30"
                    placeholder="Confirm password"
                    required
                  />
                </FadeIn>
              </div>

              {/* Terms */}
              <FadeIn className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="terms"
                  className="mt-1.5 w-4 h-4 rounded border-slate-600 bg-slate-800/50 text-purple-500 focus:ring-purple-500/50 focus:ring-2"
                  required
                />
                <label htmlFor="terms" className="text-xs text-slate-400 leading-relaxed">
                  I agree to the{" "}
                  <Link href="#" className="text-purple-400 hover:text-purple-300 transition-colors underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="#" className="text-purple-400 hover:text-purple-300 transition-colors underline">
                    Privacy Policy
                  </Link>
                </label>
              </FadeIn>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                onClick={handleButtonClick}
                className="group relative overflow-hidden w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 px-6 rounded-xl shadow-2xl hover:shadow-purple-500/50 transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-purple-500/50"
              >
                <span className="relative z-10 flex items-center justify-center gap-2 text-base">
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Creating account...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5 group-hover:animate-pulse" />
                      Create Account
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </button>
            </form>

            {/* Sign In Link */}
            <FadeIn className="text-center mt-6">
              <p className="text-slate-400 text-sm">
                Already have an account?{" "}
                <Link href="/login" className="text-purple-400 hover:text-purple-300 font-bold transition-colors">
                  Sign in
                </Link>
              </p>
            </FadeIn>
          </div>
        </div>
      </FadeIn>
    </div>
  )
}
