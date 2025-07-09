"use client"
import { useState, useEffect } from "react"
import useSWR from "swr"
import Link from "next/link"
import Image from "next/image"
import {
  Calendar,
  Clock,
  Star,
  Users,
  TrendingUp,
  BookOpen,
  Award,
  Target,
  DollarSign,
  MessageSquare,
  CheckCircle,
  XCircle,
  Check,
  AlertCircle,
  Sparkles,
  Zap,
  Trophy,
  Activity,
} from "lucide-react"
import ProtectedRoute from "../../components/ProtectedRoute"
import { userAPI, bookingsAPI } from "../../services/api"
import { useAuth } from "../../contexts/AuthContext"
import { FadeIn, AnimatedCounter } from "../../components/LightweightAnimations"

// Enhanced Stat Card Component with improved design
function StatCard({ icon: Icon, label, value, color, trend }) {
  const colorClasses = {
    gold: {
      text: "text-amber-400",
      bg: "from-amber-500/20 to-yellow-500/10",
      border: "border-amber-500/30",
      shadow: "shadow-amber-500/20",
      glow: "group-hover:shadow-amber-500/40",
    },
    purple: {
      text: "text-purple-400",
      bg: "from-purple-500/20 to-violet-500/10",
      border: "border-purple-500/30",
      shadow: "shadow-purple-500/20",
      glow: "group-hover:shadow-purple-500/40",
    },
    pink: {
      text: "text-pink-400",
      bg: "from-pink-500/20 to-rose-500/10",
      border: "border-pink-500/30",
      shadow: "shadow-pink-500/20",
      glow: "group-hover:shadow-pink-500/40",
    },
    slate: {
      text: "text-slate-400",
      bg: "from-slate-500/20 to-gray-500/10",
      border: "border-slate-500/30",
      shadow: "shadow-slate-500/20",
      glow: "group-hover:shadow-slate-500/40",
    },
    emerald: {
      text: "text-emerald-400",
      bg: "from-emerald-500/20 to-teal-500/10",
      border: "border-emerald-500/30",
      shadow: "shadow-emerald-500/20",
      glow: "group-hover:shadow-emerald-500/40",
    },
  }

  const currentColor = colorClasses[color] || colorClasses.slate

  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br ${currentColor.bg} backdrop-blur-xl rounded-3xl p-6 border ${currentColor.border} group hover:border-opacity-50 transition-all duration-500 hover:scale-105 hover:-translate-y-1 ${currentColor.shadow} hover:shadow-2xl ${currentColor.glow}`}
    >
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-radial from-white/5 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
      </div>

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div
            className={`p-3 rounded-2xl bg-gradient-to-br ${currentColor.bg} border ${currentColor.border} group-hover:scale-110 transition-transform duration-300`}
          >
            <Icon className={`w-6 h-6 ${currentColor.text}`} />
          </div>
          {trend && (
            <div className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/20 px-2 py-1 rounded-full">
              <TrendingUp className="w-3 h-3" />+{trend}%
            </div>
          )}
        </div>

        <div>
          <p className="text-slate-400 text-sm font-medium mb-1">{label}</p>
          <p
            className={`text-3xl font-bold ${currentColor.text} group-hover:scale-105 transition-transform duration-300`}
          >
            <AnimatedCounter end={value} />
          </p>
        </div>
      </div>
    </div>
  )
}

// Enhanced Booking Card Component
function BookingCard({ booking, isMentor }) {
  // Get the other party details (mentor or mentee)
  let otherParty = null
  let otherPartyName = "User"
  if (isMentor) {
    otherParty = booking.mentee_details || booking.mentee
  } else {
    otherParty = booking.mentor_details || booking.mentor
  }
  if (otherParty) {
    otherPartyName =
      (otherParty.user?.first_name && otherParty.user?.last_name
        ? `${otherParty.user.first_name} ${otherParty.user.last_name}`
        : otherParty.user?.first_name || otherParty.user?.last_name) ||
      otherParty.name ||
      otherParty.username ||
      otherParty.email ||
      "User"
  }

  // Combine session_date and session_time to get the full start datetime
  let sessionStart = null
  let sessionEnd = null
  let sessionTimeRange = ""
  if (booking.session_date && booking.session_time) {
    // booking.session_date is 'YYYY-MM-DD', booking.session_time is 'HH:MM:SS'
    const startString = `${booking.session_date}T${booking.session_time}`
    sessionStart = new Date(startString)
    sessionEnd = new Date(sessionStart.getTime() + (booking.duration_minutes || 60) * 60000)
    sessionTimeRange = `${sessionStart.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - ${sessionEnd.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
  }

  return (
    <div className="group relative overflow-hidden bg-gradient-to-r from-slate-800/60 via-slate-800/40 to-slate-800/60 backdrop-blur-xl rounded-2xl p-5 border border-slate-700/50 hover:border-purple-500/50 transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-500/20">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 via-transparent to-pink-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Image
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                otherPartyName,
              )}&background=f59e0b&color=fff&size=56`}
              alt={otherPartyName}
              width={56}
              height={56}
              className="w-14 h-14 rounded-2xl object-cover ring-2 ring-amber-500/30 group-hover:ring-amber-400/50 transition-all duration-300"
            />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-slate-800 flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="font-bold text-white text-lg group-hover:text-purple-200 transition-colors">
              Session with {otherPartyName}
            </p>
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <span className="flex items-center gap-2 bg-slate-700/50 px-3 py-1 rounded-full">
                <Calendar className="w-4 h-4 text-purple-400" />
                {sessionStart ? sessionStart.toLocaleDateString() : ""}
              </span>
              <span className="flex items-center gap-2 bg-slate-700/50 px-3 py-1 rounded-full">
                <Clock className="w-4 h-4 text-pink-400" />
                {sessionTimeRange}
              </span>
            </div>
            {booking.status && (
              <span
                className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border ${getStatusColor(booking.status)} transition-all duration-300 hover:scale-105`}
              >
                {getStatusIcon(booking.status)}
                {formatStatusText(booking.status)}
              </span>
            )}
          </div>
        </div>

        <Link
          href={`/bookings/${booking.id}`}
          className="relative overflow-hidden px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold text-sm hover:from-purple-500 hover:to-pink-500 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/30 group/btn"
        >
          <span className="relative z-10">Details</span>
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
        </Link>
      </div>
    </div>
  )
}

const fetchProfile = async () => {
  const profileData = await userAPI.getProfile()
  return profileData.results?.[0] || profileData
}
const fetchBookings = async () => {
  const bookingsData = await bookingsAPI.getUserBookings()
  return bookingsData.results || bookingsData
}
const fetchStats = async () => {
  return await userAPI.getStats()
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/30 to-slate-950">
      <div className="fixed inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950/30 to-slate-950"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-8">
          {/* Header skeleton */}
          <div className="space-y-4">
            <div className="h-12 bg-gradient-to-r from-slate-800/50 to-slate-700/50 rounded-2xl w-2/3"></div>
            <div className="h-6 bg-slate-800/50 rounded-xl w-1/2"></div>
          </div>

          {/* Stats grid skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-32 bg-gradient-to-br from-slate-800/50 to-slate-700/30 rounded-3xl border border-slate-700/50"
              ></div>
            ))}
          </div>

          {/* Content skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-8 bg-slate-800/50 rounded-xl w-1/3"></div>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-20 bg-gradient-to-r from-slate-800/50 to-slate-700/30 rounded-2xl"></div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-8 bg-slate-800/50 rounded-xl w-1/2"></div>
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-gradient-to-r from-slate-800/50 to-slate-700/30 rounded-xl"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Enhanced status styling
const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case "confirmed":
      return "text-emerald-300 bg-emerald-600/20 border-emerald-400/40 shadow-emerald-500/20"
    case "pending":
      return "text-amber-300 bg-amber-500/20 border-amber-400/40 shadow-amber-500/20"
    case "cancelled":
      return "text-red-300 bg-red-600/20 border-red-400/40 shadow-red-500/20"
    case "completed":
      return "text-blue-300 bg-blue-600/20 border-blue-400/40 shadow-blue-500/20"
    case "in_progress":
      return "text-purple-300 bg-purple-700/20 border-purple-400/40 shadow-purple-500/20"
    default:
      return "text-slate-300 bg-slate-700/20 border-slate-400/40 shadow-slate-500/20"
  }
}

const getStatusIcon = (status) => {
  switch (status?.toLowerCase()) {
    case "confirmed":
      return <CheckCircle className="w-4 h-4 mr-1.5" />
    case "pending":
      return <Clock className="w-4 h-4 mr-1.5" />
    case "cancelled":
      return <XCircle className="w-4 h-4 mr-1.5" />
    case "completed":
      return <Check className="w-4 h-4 mr-1.5" />
    case "in_progress":
      return <Activity className="w-4 h-4 mr-1.5" />
    default:
      return <AlertCircle className="w-4 h-4 mr-1.5" />
  }
}

const formatStatusText = (status) => {
  if (!status) return ""
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

export default function DashboardPage() {
  const { user } = useAuth()
  const isMentor = user?.user_type === "mentor"
  const [showBookingSuccess, setShowBookingSuccess] = useState(false)

  // Check for booking success message in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get("booking") === "success") {
      setShowBookingSuccess(true)
      // Remove the parameter from URL
      window.history.replaceState({}, document.title, window.location.pathname)
      // Auto-hide after 5 seconds
      setTimeout(() => setShowBookingSuccess(false), 5000)
    }
  }, [])

  // Use SWR for all data fetching
  const { data: userProfile, error: profileError, isLoading: loadingProfile } = useSWR("profile", fetchProfile)
  const { data: bookings, error: bookingsError, isLoading: loadingBookings } = useSWR("bookings", fetchBookings)
  const { data: stats, error: statsError, isLoading: loadingStats } = useSWR("stats", fetchStats)
  const {
    data: upcomingBookings,
    error: upcomingError,
    isLoading: loadingUpcoming,
  } = useSWR("upcomingBookings", bookingsAPI.getUpcoming)

  const loading = loadingProfile || loadingBookings || loadingStats || loadingUpcoming
  const error = profileError || bookingsError || statsError || upcomingError

  // Ensure bookings is always an array
  const bookingsArray = bookings || []
  const upcomingArray = Array.isArray(upcomingBookings) ? upcomingBookings : upcomingBookings?.results || []

  if (loading) {
    return <DashboardSkeleton />
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950/30 to-slate-950">
        <div className="fixed inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950/30 to-slate-950"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(239,68,68,0.1),transparent_50%)]"></div>
        </div>

        <div className="relative z-10 text-center max-w-md mx-auto p-8">
          <div className="relative mb-8">
            <div className="text-8xl mb-4 animate-bounce">⚠️</div>
            <div className="absolute inset-0 bg-red-500/20 rounded-full blur-3xl"></div>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent mb-4">
            Oops! Something went wrong
          </h2>
          <p className="text-slate-400 mb-8 leading-relaxed">
            We couldn&apos;t load your dashboard data. Don&apos;t worry, this happens sometimes. Let&apos;s try again!
          </p>
          <button
            onClick={() => window.location.reload()}
            className="relative overflow-hidden bg-gradient-to-r from-red-600 to-pink-600 text-white px-8 py-4 rounded-2xl font-bold hover:from-red-500 hover:to-pink-500 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-red-500/30 group"
          >
            <span className="relative z-10 flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Try Again
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/30 to-slate-950">
        {/* Enhanced background with multiple layers */}
        <div className="fixed inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950/30 to-slate-950"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,198,0.12),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,105,180,0.08),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_40%,rgba(59,130,246,0.06),transparent_50%)]"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Enhanced Booking Success Message */}
          {showBookingSuccess && (
            <FadeIn className="mb-8">
              <div className="relative overflow-hidden bg-gradient-to-r from-emerald-500/20 via-green-500/15 to-emerald-500/20 backdrop-blur-xl border border-emerald-500/30 rounded-3xl p-6 text-center shadow-2xl shadow-emerald-500/20">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/10 to-green-600/10"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <div className="p-2 bg-emerald-500/20 rounded-full">
                      <CheckCircle className="w-6 h-6 text-emerald-400" />
                    </div>
                    <span className="font-bold text-xl text-emerald-300">Booking Successful!</span>
                    <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
                  </div>
                  <p className="text-emerald-200 mb-2 text-lg">
                    Your session has been booked and payment processed. Check your email for meeting details.
                  </p>
                  <p className="text-emerald-100/80 text-sm bg-emerald-500/10 px-4 py-2 rounded-full inline-block">
                    Development mode: Test payment processed successfully
                  </p>
                </div>
              </div>
            </FadeIn>
          )}

          {/* Enhanced Header */}
          <FadeIn className="mb-12">
            <div className="text-center lg:text-left">
              <div className="flex items-center gap-4 justify-center lg:justify-start mb-6">
                <div className="relative">
                  <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                    Welcome back,
                  </h1>
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 to-pink-600/20 blur-3xl -z-10"></div>
                </div>
              </div>

              <div className="flex items-center gap-4 justify-center lg:justify-start mb-6">
                <h2 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                  {userProfile?.user?.first_name || "User"}!
                </h2>
                <div className="text-4xl md:text-5xl animate-bounce">👋</div>
              </div>

              <p className="text-xl md:text-2xl text-slate-300 mb-6 max-w-3xl">
                {isMentor
                  ? "Here's your mentoring dashboard and upcoming sessions"
                  : "Here's what's happening with your mentorship journey"}
              </p>

              <div className="flex items-center gap-4 justify-center lg:justify-start">
                <span
                  className={`inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold border-2 transition-all duration-300 hover:scale-105 ${
                    isMentor
                      ? "bg-gradient-to-r from-purple-500/20 to-violet-500/20 text-purple-300 border-purple-400/40 shadow-purple-500/20"
                      : "bg-gradient-to-r from-pink-500/20 to-rose-500/20 text-pink-300 border-pink-400/40 shadow-pink-500/20"
                  }`}
                >
                  {isMentor ? <Award className="w-5 h-5" /> : <Trophy className="w-5 h-5" />}
                  {isMentor ? "Mentor" : "Mentee"}
                </span>

                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  Online
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Enhanced Stats Grid */}
          <FadeIn className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {isMentor ? (
              // Mentor Stats
              <>
                <StatCard icon={BookOpen} label="Total Sessions" value={bookingsArray.length} color="gold" trend={12} />
                <StatCard icon={Calendar} label="Upcoming" value={upcomingArray.length} color="purple" trend={8} />
                <StatCard
                  icon={DollarSign}
                  label="Earnings ($)"
                  value={stats.total_earnings || 0}
                  color="emerald"
                  trend={15}
                />
              </>
            ) : (
              // Mentee Stats
              <>
                <StatCard icon={BookOpen} label="Total Sessions" value={bookingsArray.length} color="gold" trend={20} />
                <StatCard icon={Calendar} label="Upcoming" value={upcomingArray.length} color="purple" trend={10} />
                <StatCard icon={Clock} label="Hours Learned" value={stats.total_hours || 0} color="pink" trend={25} />
                <StatCard icon={Users} label="Mentors" value={stats.unique_mentors || 0} color="emerald" trend={7} />
              </>
            )}
          </FadeIn>

          {/* Enhanced Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Enhanced Upcoming Sessions */}
            <FadeIn className="lg:col-span-2">
              <div className="relative overflow-hidden bg-gradient-to-br from-slate-900/60 via-slate-800/40 to-slate-900/60 backdrop-blur-2xl rounded-3xl p-8 border border-purple-500/30 shadow-2xl shadow-purple-500/10">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 via-transparent to-pink-600/5"></div>

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl border border-purple-500/30">
                        <Calendar className="w-6 h-6 text-purple-400" />
                      </div>
                      <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                        {isMentor ? "Upcoming Sessions" : "My Upcoming Sessions"}
                      </h2>
                    </div>
                    <Link
                      href="/bookings"
                      className="relative overflow-hidden px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-500 hover:to-pink-500 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/30 group"
                    >
                      <span className="relative z-10">View All</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </Link>
                  </div>

                  {upcomingArray.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="relative mb-8">
                        <Calendar className="w-20 h-20 text-slate-600 mx-auto" />
                        <div className="absolute inset-0 bg-slate-600/20 rounded-full blur-2xl"></div>
                      </div>
                      <h3 className="text-2xl font-bold text-slate-300 mb-4">
                        {isMentor ? "No upcoming sessions scheduled" : "No upcoming sessions"}
                      </h3>
                      <p className="text-slate-400 mb-8 text-lg">
                        {isMentor
                          ? "Your calendar is clear. Time to attract more mentees!"
                          : "Ready to accelerate your growth? Find an amazing mentor!"}
                      </p>
                      {!isMentor && (
                        <Link
                          href="/mentors"
                          className="relative overflow-hidden inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 px-8 rounded-2xl shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105 group"
                        >
                          <Sparkles className="w-5 h-5" />
                          <span className="relative z-10">Find a Mentor</span>
                          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </Link>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {upcomingArray.map((booking) => (
                        <BookingCard key={booking.id} booking={booking} isMentor={isMentor} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </FadeIn>

            {/* Enhanced Quick Actions */}
            <FadeIn>
              <div className="relative overflow-hidden bg-gradient-to-br from-slate-900/60 via-slate-800/40 to-slate-900/60 backdrop-blur-2xl rounded-3xl p-8 border border-purple-500/30 shadow-2xl shadow-purple-500/10">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 via-transparent to-pink-600/5"></div>

                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl border border-purple-500/30">
                      <Zap className="w-6 h-6 text-purple-400" />
                    </div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                      Quick Actions
                    </h2>
                  </div>

                  <div className="space-y-4">
                    <Link
                      href="/profile"
                      className="group relative overflow-hidden flex items-center justify-between p-5 rounded-2xl bg-gradient-to-r from-slate-800/60 to-slate-700/40 border border-slate-700/50 hover:border-purple-500/50 transition-all duration-300 hover:scale-105 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-500/20"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-pink-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative z-10 flex items-center gap-4">
                        <div className="p-2 bg-purple-500/20 rounded-xl">
                          <Award className="w-5 h-5 text-purple-400" />
                        </div>
                        <span className="font-semibold text-white text-lg">Edit Your Profile</span>
                      </div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full group-hover:scale-150 transition-transform duration-300"></div>
                    </Link>

                    <Link
                      href={isMentor ? "/availability" : "/mentors"}
                      className="group relative overflow-hidden flex items-center justify-between p-5 rounded-2xl bg-gradient-to-r from-slate-800/60 to-slate-700/40 border border-slate-700/50 hover:border-pink-500/50 transition-all duration-300 hover:scale-105 hover:-translate-y-1 hover:shadow-xl hover:shadow-pink-500/20"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-pink-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative z-10 flex items-center gap-4">
                        <div className="p-2 bg-pink-500/20 rounded-xl">
                          <Target className="w-5 h-5 text-pink-400" />
                        </div>
                        <span className="font-semibold text-white text-lg">
                          {isMentor ? "Update Availability" : "Find New Mentors"}
                        </span>
                      </div>
                      <div className="w-2 h-2 bg-pink-400 rounded-full group-hover:scale-150 transition-transform duration-300"></div>
                    </Link>

                    <Link
                      href="/messages"
                      className="group relative overflow-hidden flex items-center justify-between p-5 rounded-2xl bg-gradient-to-r from-slate-800/60 to-slate-700/40 border border-slate-700/50 hover:border-emerald-500/50 transition-all duration-300 hover:scale-105 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/20"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/5 to-teal-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative z-10 flex items-center gap-4">
                        <div className="p-2 bg-emerald-500/20 rounded-xl">
                          <MessageSquare className="w-5 h-5 text-emerald-400" />
                        </div>
                        <span className="font-semibold text-white text-lg">View Messages</span>
                      </div>
                      <div className="w-2 h-2 bg-emerald-400 rounded-full group-hover:scale-150 transition-transform duration-300"></div>
                    </Link>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
