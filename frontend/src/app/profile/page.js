"use client"
import { useState, useEffect, useRef } from "react"
import Head from "next/head"
import { User, Sparkles } from 'lucide-react'
import ProtectedRoute from "../../components/ProtectedRoute"
import { userAPI } from "../../services/api"
import { FadeIn } from "../../components/LightweightAnimations"
import { PageLoading } from "../../components/LoadingSpinner"
import { useAuth } from "../../contexts/AuthContext"

export default function ProfilePage() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [profilePic, setProfilePic] = useState(null)
  const [profilePicFile, setProfilePicFile] = useState(null)
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    location: "",
    bio: "",
    linkedin: "",
    github: "",
    username: "",
  })
  const [formErrors, setFormErrors] = useState({})
  const successRef = useRef(null)
  const errorRef = useRef(null)
  const { setUser } = useAuth()

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        const profileData = await userAPI.getProfile()
        const userProfile = profileData.results?.[0] || profileData
        setProfile(userProfile)
        setFormData({
          first_name: userProfile?.user?.first_name || "",
          last_name: userProfile?.user?.last_name || "",
          email: userProfile?.user?.email || "",
          phone_number: userProfile?.phone_number || "",
          location: userProfile?.location || "",
          bio: userProfile?.bio || "",
          linkedin: userProfile?.linkedin || "",
          github: userProfile?.github || "",
          username: userProfile?.user?.username || "",
        })
        setProfilePic(userProfile?.profile_picture ? userProfile.profile_picture + "?t=" + new Date().getTime() : null)
      } catch (err) {
        setError("Failed to load profile. Please try again later.")
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  useEffect(() => {
    if (success && successRef.current) {
      successRef.current.focus()
    }
    if (error && errorRef.current) {
      errorRef.current.focus()
    }
  }, [success, error])

  useEffect(() => {
    if (isEditing) {
      setFormErrors(validateForm())
    }
    // eslint-disable-next-line
  }, [formData, profilePicFile, isEditing])

  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(null)
        setError(null)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [success, error])

  const validateForm = () => {
    const errors = {}
    if (!formData.first_name.trim()) {
      errors.first_name = "First name is required."
    } else if (!/^[a-zA-Z\s]{2,30}$/.test(formData.first_name.trim())) {
      errors.first_name = "First name must be 2-30 letters."
    }
    if (!formData.last_name.trim()) {
      errors.last_name = "Last name is required."
    } else if (!/^[a-zA-Z\s]{1,30}$/.test(formData.last_name.trim())) {
      errors.last_name = "Last name must be 1-30 letters."
    }
    if (!formData.username.trim()) {
      errors.username = "Username is required."
    } else if (!/^[a-zA-Z0-9_]{3,30}$/.test(formData.username.trim())) {
      errors.username = "Username must be 3-30 letters, numbers, or underscores."
    }
    if (!formData.email.trim()) {
      errors.email = "Email is required."
    } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formData.email.trim())) {
      errors.email = "Enter a valid email address."
    }
    if (formData.phone_number && !/^\+?[0-9\-\s]{7,20}$/.test(formData.phone_number.trim())) {
      errors.phone_number = "Enter a valid phone number."
    }
    if (formData.location && formData.location.length > 100) {
      errors.location = "Location must be under 100 characters."
    }
    if (formData.bio && formData.bio.length > 500) {
      errors.bio = "Bio must be under 500 characters."
    }
    if (formData.linkedin && !/^https?:\/\/.+\..+/.test(formData.linkedin.trim())) {
      errors.linkedin = "Enter a valid LinkedIn URL (must start with http:// or https://)."
    }
    if (formData.github && !/^https?:\/\/.+\..+/.test(formData.github.trim())) {
      errors.github = "Enter a valid GitHub URL (must start with http:// or https://)."
    }
    return errors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)
    const errors = validateForm()
    setFormErrors(errors)
    if (Object.keys(errors).length > 0) {
      setSaving(false)
      const firstErrorField = Object.keys(errors)[0]
      const el = document.getElementById(firstErrorField)
      if (el) el.focus()
      return
    }
    try {
      const profile_picture = profilePicFile ? profilePicFile : profilePic
      const response = await userAPI.updateProfile({ ...formData, profile_picture })
      console.log("Profile update response:", response)
      setSuccess("Profile updated successfully!")
      setError(null)
      setIsEditing(false)
      setProfilePicFile(null)
      const profileData = await userAPI.getProfile()
      const userProfile = profileData.results?.[0] || profileData
      setProfile(userProfile)
      setProfilePic(userProfile?.profile_picture ? userProfile.profile_picture + "?t=" + new Date().getTime() : null)
      if (typeof setUser === "function") {
        setUser({ isAuthenticated: true, ...userProfile })
      }
    } catch (err) {
      console.error("Profile update error:", err)
      setError("Failed to update profile. Please try again.")
      setSuccess(null)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      first_name: profile?.user?.first_name || "",
      last_name: profile?.user?.last_name || "",
      email: profile?.user?.email || "",
      phone_number: profile?.phone_number || "",
      location: profile?.location || "",
      bio: profile?.bio || "",
      linkedin: profile?.linkedin || "",
      github: profile?.github || "",
      username: profile?.user?.username || "",
    })
    setProfilePic(profile?.profile_picture || null)
    setProfilePicFile(null)
    setIsEditing(false)
    setError(null)
  }

  const handlePicChange = (e) => {
    setError(null)
    setSuccess(null)
    const file = e.target.files[0]
    if (file) {
      setProfilePicFile(file)
      setProfilePic(URL.createObjectURL(file))
    }
  }

  const handlePicRemove = () => {
    setProfilePic(null)
    setProfilePicFile(null)
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <PageLoading message="Loading your profile..." />
      </ProtectedRoute>
    )
  }

  if (error && !profile) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950/30 to-slate-950">
          <div className="relative text-center max-w-md mx-auto p-6 md:p-8 lg:p-10">
            <div className="text-6xl md:text-7xl lg:text-8xl mb-4 md:mb-6">⚠️</div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent mb-3 md:mb-4">
              Something went wrong
            </h2>
            <p className="text-slate-400 mb-6 md:mb-8 text-base md:text-lg">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-red-600 to-pink-600 text-white px-6 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl font-semibold text-base md:text-lg hover:from-red-500 hover:to-pink-500 transition-all duration-300 hover:scale-[1.02]"
            >
              Try Again
            </button>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <Head>
        <title>Profile | MentorConnect</title>
        <meta
          name="description"
          content="View and edit your MentorConnect profile. Update your info, bio, and social links."
        />
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/30 to-slate-950 py-6 md:py-8 lg:py-10">
        {/* Background */}
        <div className="fixed inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950/30 to-slate-950"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,198,0.08),transparent_40%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,105,180,0.06),transparent_40%)]"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <FadeIn className="text-center mb-8 md:mb-10 lg:mb-12">
            <div className="flex items-center justify-center gap-2 md:gap-3 mb-3 md:mb-4">
              <div className="p-2 md:p-3 bg-gradient-to-r from-purple-500/15 to-pink-500/15 rounded-xl border border-purple-500/20">
                <User className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-purple-400" />
              </div>
              <Sparkles className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-amber-400 animate-pulse" />
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-2 md:mb-3">
              Your Profile
            </h1>
            <p className="text-slate-400 text-base md:text-lg lg:text-xl">Manage your personal information and preferences</p>
          </FadeIn>

          {/* Success/Error Messages */}
          {success && !error && (
            <FadeIn>
              <div
                ref={successRef}
                tabIndex={-1}
                aria-live="polite"
                className="relative overflow-hidden bg-gradient-to-r from-emerald-500/15 to-green-500/15 border border-emerald-500/30 text-emerald-300 px-4 md:px-6 py-2.5 md:py-3 lg:py-4 rounded-xl md:rounded-2xl mb-6 md:mb-8 shadow-sm focus:outline-none"
              >
                <div className="relative z-10 flex items-center gap-2 md:gap-3 text-sm md:text-base">
                  <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  {success}
                </div>
              </div>
            </FadeIn>
          )}
          {error && !success && (
            <FadeIn>
              <div
                ref={errorRef}
                tabIndex={-1}
                aria-live="assertive"
                className="relative overflow-hidden bg-gradient-to-r from-red-500/15 to-pink-500/15 border border-red-500/30 text-red-300 px-4 md:px-6 py-2.5 md:py-3 lg:py-4 rounded-xl md:rounded-2xl mb-6 md:mb-8 shadow-sm focus:outline-none"
              >
                <div className="relative z-10 flex items-center gap-2 md:gap-3 text-sm md:text-base">
                  <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-red-400 rounded-full animate-pulse"></div>
                  {error}
                </div>
              </div>
            </FadeIn>
          )}

          {/* Profile Form */}
          <FadeIn className="relative overflow-hidden bg-gradient-to-br from-slate-900/80 via-slate-800/60 to-slate-900/80 backdrop-blur-xl rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-10 shadow-xl border border-purple-500/20">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/3 via-transparent to-pink-600/3"></div>

            <div className="relative z-10">
              {/* Profile Picture Section */}
              <div className="flex flex-col items-center mb-8 md:mb-10 lg:mb-12">
                <div className="relative group">
                  {profilePic &&
                  typeof profilePic === "string" &&
                  profilePic.trim() !== "" &&
                  profilePic !== "null" &&
                  profilePic !== "undefined" ? (
                    <div className="relative">
                      <img
                        src={
                          profilePic.startsWith("http") || profilePic.startsWith("blob:")
                            ? profilePic
                            : `http://localhost:8000${profilePic}`
                        }
                        alt="Profile picture"
                        width={120}
                        height={120}
                        className="object-cover border-2 border-purple-500/30 shadow-lg hover:border-purple-400/50 transition-all duration-300 rounded-full w-24 h-24 md:w-28 md:h-28 lg:w-32 lg:h-32"
                        onError={(e) => {
                          e.target.onerror = null
                          setProfilePic(null)
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-24 h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 border-2 border-purple-500/30 flex items-center justify-center text-purple-400 text-2xl md:text-3xl lg:text-4xl font-bold shadow-lg hover:border-purple-400/50 transition-all duration-300">
                      {formData.username?.[0]?.toUpperCase() || "?"}
                    </div>
                  )}
                  {isEditing && profilePic && (
                    <button
                      type="button"
                      onClick={handlePicRemove}
                      className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full p-1.5 md:p-2 shadow-sm hover:from-red-600 hover:to-pink-600 transition-all duration-300 hover:scale-110"
                      title="Remove picture"
                    >
                      <svg className="w-3 h-3 md:w-4 md:h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  )}
                </div>
                {isEditing && (
                  <div className="mt-4 md:mt-5 flex flex-col items-center gap-2 md:gap-3">
                    <label
                      htmlFor="profilePicUpload"
                      className="group relative overflow-hidden flex items-center gap-2 md:gap-3 cursor-pointer bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl font-semibold text-sm md:text-base shadow-sm transition-all duration-300 hover:scale-[1.02]"
                    >
                      <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>Upload Photo</span>
                      <input
                        id="profilePicUpload"
                        type="file"
                        accept="image/*"
                        onChange={handlePicChange}
                        className="hidden"
                      />
                    </label>
                    {profilePicFile && (
                      <span className="text-xs md:text-sm text-slate-400 bg-slate-800/50 px-2 md:px-3 py-1 md:py-1.5 rounded-full">
                        {profilePicFile.name}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between mb-6 md:mb-8">
                <h2 className="text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent flex items-center gap-2 md:gap-3">
                  <User className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-purple-400" />
                  Personal Information
                </h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="group relative overflow-hidden flex items-center space-x-2 md:space-x-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl font-semibold text-sm md:text-base hover:from-purple-500 hover:to-pink-500 transition-all duration-300 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-purple-500/50 shadow-sm"
                  >
                    <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    <span>Edit</span>
                  </button>
                ) : (
                  <div className="flex space-x-2 md:space-x-3">
                    <button
                      onClick={handleSubmit}
                      disabled={saving}
                      className="group relative overflow-hidden flex items-center space-x-2 md:space-x-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl font-semibold text-sm md:text-base hover:from-emerald-500 hover:to-green-500 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 shadow-sm"
                    >
                      <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>{saving ? "Saving..." : "Save"}</span>
                    </button>
                    <button
                      onClick={handleCancel}
                      className="group relative overflow-hidden flex items-center space-x-2 md:space-x-3 bg-gradient-to-r from-red-600 to-pink-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl font-semibold text-sm md:text-base hover:from-red-500 hover:to-pink-500 transition-all duration-300 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-red-500/50 shadow-sm"
                    >
                      <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>Cancel</span>
                    </button>
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
                {/* Personal Info */}
                <div className="relative overflow-hidden bg-gradient-to-br from-slate-800/50 to-slate-700/30 rounded-xl md:rounded-2xl p-4 md:p-6 lg:p-7 border border-slate-600/40 hover:border-purple-500/30 transition-all duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div>
                      <label htmlFor="first_name" className="block text-xs md:text-sm font-semibold text-slate-300 mb-1.5 md:mb-2">
                        First Name
                      </label>
                      <input
                        id="first_name"
                        type="text"
                        value={formData.first_name}
                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                        disabled={!isEditing}
                        className={`w-full px-3 md:px-4 py-2 md:py-3 bg-gradient-to-r from-slate-800/50 to-slate-700/30 border rounded-lg md:rounded-xl text-white text-sm md:text-base placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-500/50 focus:border-purple-400/50 transition-all duration-300 disabled:opacity-50 ${formErrors.first_name ? "border-red-500/70" : "border-slate-600/40"}`}
                        placeholder="First name"
                      />
                      {formErrors.first_name && <p className="text-red-400 text-xs md:text-sm mt-1">{formErrors.first_name}</p>}
                    </div>
                    <div>
                      <label htmlFor="last_name" className="block text-xs md:text-sm font-semibold text-slate-300 mb-1.5 md:mb-2">
                        Last Name
                      </label>
                      <input
                        id="last_name"
                        type="text"
                        value={formData.last_name}
                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                        disabled={!isEditing}
                        className={`w-full px-3 md:px-4 py-2 md:py-3 bg-gradient-to-r from-slate-800/50 to-slate-700/30 border rounded-lg md:rounded-xl text-white text-sm md:text-base placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-500/50 focus:border-purple-400/50 transition-all duration-300 disabled:opacity-50 ${formErrors.last_name ? "border-red-500/70" : "border-slate-600/40"}`}
                        placeholder="Last name"
                      />
                      {formErrors.last_name && <p className="text-red-400 text-xs md:text-sm mt-1">{formErrors.last_name}</p>}
                    </div>
                  </div>
                  <div className="mt-4 md:mt-6">
                    <label htmlFor="username" className="block text-xs md:text-sm font-semibold text-slate-300 mb-1.5 md:mb-2">
                      Username
                    </label>
                    <input
                      id="username"
                      type="text"
                      value={formData.username || ""}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      disabled={!isEditing}
                      className={`w-full px-3 md:px-4 py-2 md:py-3 bg-gradient-to-r from-slate-800/50 to-slate-700/30 border rounded-lg md:rounded-xl text-white text-sm md:text-base placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-500/50 focus:border-purple-400/50 transition-all duration-300 disabled:opacity-50 ${formErrors.username ? "border-red-500/70" : "border-slate-600/40"}`}
                      placeholder="Username"
                    />
                    {formErrors.username && <p className="text-red-400 text-xs md:text-sm mt-1">{formErrors.username}</p>}
                  </div>
                  <div className="mt-4 md:mt-6">
                    <label htmlFor="email" className="block text-xs md:text-sm font-semibold text-slate-300 mb-1.5 md:mb-2">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={!isEditing}
                      className={`w-full px-3 md:px-4 py-2 md:py-3 bg-gradient-to-r from-slate-800/50 to-slate-700/30 border rounded-lg md:rounded-xl text-white text-sm md:text-base placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-500/50 focus:border-purple-400/50 transition-all duration-300 disabled:opacity-50 ${formErrors.email ? "border-red-500/70" : "border-slate-600/40"}`}
                      placeholder="Email address"
                    />
                    {formErrors.email && <p className="text-red-400 text-xs md:text-sm mt-1">{formErrors.email}</p>}
                  </div>
                </div>

                {/* Contact & Location */}
                <div className="relative overflow-hidden bg-gradient-to-br from-slate-800/50 to-slate-700/30 rounded-xl md:rounded-2xl p-4 md:p-6 lg:p-7 border border-slate-600/40 hover:border-purple-500/30 transition-all duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div>
                      <label htmlFor="phone_number" className="block text-xs md:text-sm font-semibold text-slate-300 mb-1.5 md:mb-2">
                        Phone
                      </label>
                      <input
                        id="phone_number"
                        type="tel"
                        value={formData.phone_number}
                        onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                        disabled={!isEditing}
                        className={`w-full px-3 md:px-4 py-2 md:py-3 bg-gradient-to-r from-slate-800/50 to-slate-700/30 border rounded-lg md:rounded-xl text-white text-sm md:text-base placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-500/50 focus:border-purple-400/50 transition-all duration-300 disabled:opacity-50 ${formErrors.phone_number ? "border-red-500/70" : "border-slate-600/40"}`}
                        placeholder="Phone number"
                      />
                      {formErrors.phone_number && (
                        <p className="text-red-400 text-xs md:text-sm mt-1">{formErrors.phone_number}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="location" className="block text-xs md:text-sm font-semibold text-slate-300 mb-1.5 md:mb-2">
                        Location
                      </label>
                      <input
                        id="location"
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        disabled={!isEditing}
                        className={`w-full px-3 md:px-4 py-2 md:py-3 bg-gradient-to-r from-slate-800/50 to-slate-700/30 border rounded-lg md:rounded-xl text-white text-sm md:text-base placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-500/50 focus:border-purple-400/50 transition-all duration-300 disabled:opacity-50 ${formErrors.location ? "border-red-500/70" : "border-slate-600/40"}`}
                        placeholder="Location"
                      />
                      {formErrors.location && <p className="text-red-400 text-xs md:text-sm mt-1">{formErrors.location}</p>}
                    </div>
                  </div>
                </div>

                {/* Bio & Social */}
                <div className="relative overflow-hidden bg-gradient-to-br from-slate-800/50 to-slate-700/30 rounded-xl md:rounded-2xl p-4 md:p-6 lg:p-7 border border-slate-600/40 hover:border-purple-500/30 transition-all duration-300">
                  <div className="mb-4 md:mb-6">
                    <label htmlFor="bio" className="block text-xs md:text-sm font-semibold text-slate-300 mb-1.5 md:mb-2">
                      Bio
                    </label>
                    <textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      disabled={!isEditing}
                      className={`w-full px-3 md:px-4 py-2 md:py-3 bg-gradient-to-r from-slate-800/50 to-slate-700/30 border rounded-lg md:rounded-xl text-white text-sm md:text-base placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-500/50 focus:border-purple-400/50 transition-all duration-300 disabled:opacity-50 resize-none ${formErrors.bio ? "border-red-500/70" : "border-slate-600/40"}`}
                      placeholder="Tell us about yourself"
                      rows={3}
                    />
                    {formErrors.bio && <p className="text-red-400 text-xs md:text-sm mt-1">{formErrors.bio}</p>}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div>
                      <label htmlFor="linkedin" className="block text-xs md:text-sm font-semibold text-slate-300 mb-1.5 md:mb-2">
                        LinkedIn
                      </label>
                      <input
                        id="linkedin"
                        type="url"
                        value={formData.linkedin}
                        onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                        disabled={!isEditing}
                        className={`w-full px-3 md:px-4 py-2 md:py-3 bg-gradient-to-r from-slate-800/50 to-slate-700/30 border rounded-lg md:rounded-xl text-white text-sm md:text-base placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-500/50 focus:border-purple-400/50 transition-all duration-300 disabled:opacity-50 ${formErrors.linkedin ? "border-red-500/70" : "border-slate-600/40"}`}
                        placeholder="LinkedIn URL"
                      />
                      {formErrors.linkedin && <p className="text-red-400 text-xs md:text-sm mt-1">{formErrors.linkedin}</p>}
                    </div>
                    <div>
                      <label htmlFor="github" className="block text-xs md:text-sm font-semibold text-slate-300 mb-1.5 md:mb-2">
                        GitHub
                      </label>
                      <input
                        id="github"
                        type="url"
                        value={formData.github}
                        onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                        disabled={!isEditing}
                        className={`w-full px-3 md:px-4 py-2 md:py-3 bg-gradient-to-r from-slate-800/50 to-slate-700/30 border rounded-lg md:rounded-xl text-white text-sm md:text-base placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-500/50 focus:border-purple-400/50 transition-all duration-300 disabled:opacity-50 ${formErrors.github ? "border-red-500/70" : "border-slate-600/40"}`}
                        placeholder="GitHub URL"
                      />
                      {formErrors.github && <p className="text-red-400 text-xs md:text-sm mt-1">{formErrors.github}</p>}
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </FadeIn>
        </div>
      </div>
    </ProtectedRoute>
  )
}
