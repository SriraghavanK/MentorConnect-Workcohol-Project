"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Video,
  MapPin,
  DollarSign,
  User,
  Sparkles,
} from "lucide-react"
import ProtectedRoute from "../../components/ProtectedRoute"
import { bookingsAPI } from "../../services/api"
import { useAuth } from "../../contexts/AuthContext"
import { FadeIn, ScaleIn } from "../../components/LightweightAnimations"
import { ComponentLoading, PageLoading } from "../../components/LoadingSpinner"

// Enhanced BookingCard component with better responsive sizing
const BookingCard = ({ booking, isMentor, onAction, isProcessing }) => {
  const { user } = useAuth()

  const getStatusInfo = (status) => {
    switch (status) {
      case "pending":
        return { color: "text-amber-400", icon: AlertCircle, label: "Pending" }
      case "confirmed":
        return { color: "text-emerald-400", icon: CheckCircle, label: "Confirmed" }
      case "completed":
        return { color: "text-emerald-400", icon: CheckCircle, label: "Completed" }
      case "cancelled":
        return { color: "text-red-400", icon: XCircle, label: "Cancelled" }
      case "in_progress":
        return { color: "text-blue-400", icon: CheckCircle, label: "In Progress" }
      default:
        return { color: "text-slate-400", icon: AlertCircle, label: "Unknown" }
    }
  }

  const getSessionTypeIcon = (sessionType) => {
    switch (sessionType) {
      case "video_call":
        return Video
      case "onsite":
        return MapPin
      default:
        return Video
    }
  }

  const canPerformAction = (booking, action) => {
    if (action === "cancel" && ["pending", "confirmed"].includes(booking.status)) {
      return true
    }
    if (isMentor) {
      if (booking.mentor?.user?.id !== user?.id) return false
      switch (action) {
        case "accept":
        case "decline":
          return booking.status === "pending"
        case "complete":
          return booking.status === "confirmed"
        default:
          return false
      }
    } else {
      // For mentee, fallback to booking.user if booking.mentee is missing
      const menteeId = booking.mentee?.id ?? booking.user
      if (menteeId !== user?.id) return false
      return action === "cancel" && ["pending", "confirmed"].includes(booking.status)
    }
  }

  const StatusIcon = getStatusInfo(booking.status).icon
  const SessionTypeIcon = getSessionTypeIcon(booking.session_type)
  const otherParty = isMentor ? booking.mentee : booking.mentor

  return (
    <ScaleIn
      key={booking.id}
      className="group relative bg-gradient-to-br from-slate-900/80 via-slate-800/60 to-slate-900/80 backdrop-blur-xl rounded-2xl md:rounded-3xl p-5 md:p-6 lg:p-7 border border-slate-700/50 hover:border-purple-500/50 transition-all duration-500 hover:scale-[1.01] hover:-translate-y-1 shadow-lg hover:shadow-purple-500/20"
    >
      {/* Subtle animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 via-transparent to-pink-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl md:rounded-3xl" />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl md:rounded-3xl">
        <div className="absolute top-3 right-3 w-1.5 h-1.5 bg-purple-400/30 rounded-full animate-pulse"></div>
        <div className="absolute bottom-4 left-4 w-1 h-1 bg-pink-400/40 rounded-full animate-ping delay-300"></div>
      </div>

      <div className="relative z-10">
        {/* Header section */}
        <div className="flex items-start justify-between mb-4 md:mb-5">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center border border-purple-500/30">
              <User className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-base md:text-lg lg:text-xl leading-tight">
                {isMentor
                  ? `${otherParty?.user?.first_name || "Mentee"} ${otherParty?.user?.last_name || ""}`
                  : `${otherParty?.user?.first_name || "Mentor"} ${otherParty?.user?.last_name || ""}`}
              </h3>
              <p className="text-slate-400 text-sm md:text-base mt-0.5">{booking.topic}</p>
            </div>
          </div>
          <div
            className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-slate-800/50 ${getStatusInfo(booking.status).color} border border-slate-700/50`}
          >
            <StatusIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />
            <span className="text-xs md:text-sm font-medium">{getStatusInfo(booking.status).label}</span>
          </div>
        </div>

        {/* Details grid */}
        <div className="border-y border-slate-700/50 py-3 md:py-4 my-4 md:my-5 grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <div className="flex items-center gap-2 text-slate-400 text-sm md:text-base">
            <Calendar className="w-4 h-4 md:w-5 md:h-5 text-purple-400" />
            <span>{new Date(booking.session_date).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-sm md:text-base">
            <Clock className="w-4 h-4 md:w-5 md:h-5 text-pink-400" />
            <span>{booking.session_time}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-sm md:text-base">
            <SessionTypeIcon className="w-4 h-4 md:w-5 md:h-5 text-emerald-400" />
            <span>{booking.session_type.replace(/_/g, " ")}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-sm md:text-base font-medium">
            <DollarSign className="w-4 h-4 md:w-5 md:h-5 text-amber-400" />
            <span>${booking.total_amount}</span>
          </div>
        </div>

        {/* Description */}
        {booking.description && (
          <p className="text-slate-400 text-sm md:text-base mb-4 md:mb-5 italic bg-slate-800/30 p-3 md:p-4 rounded-lg border border-slate-700/30">
            &quot;{booking.description}&quot;
          </p>
        )}

        {/* Meeting link for video calls */}
        {booking.session_type === "video_call" && booking.meeting_link && (
          <div className="mb-4 md:mb-5 p-3 md:p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <div className="flex items-center gap-2 text-blue-300 mb-2">
              <Video className="w-4 h-4 md:w-5 md:h-5" />
              <span className="font-medium text-sm md:text-base">Google Meet Link:</span>
            </div>
            <a
              href={booking.meeting_link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 text-sm md:text-base break-all underline transition-colors"
            >
              {booking.meeting_link}
            </a>
            <div className="mt-2 p-2 md:p-3 bg-emerald-500/10 border border-emerald-500/30 rounded text-xs md:text-sm text-emerald-300">
              ✅ Click the link above to join your Google Meet session
            </div>
          </div>
        )}

        {/* Onsite address */}
        {booking.session_type === "onsite" && booking.onsite_address && (
          <div className="mb-4 md:mb-5 p-3 md:p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
            <div className="flex items-center gap-2 text-emerald-300 mb-2">
              <MapPin className="w-4 h-4 md:w-5 md:h-5" />
              <span className="font-medium text-sm md:text-base">Meeting Location:</span>
            </div>
            <p className="text-emerald-400 text-sm md:text-base">{booking.onsite_address}</p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2 md:gap-3 mt-4 md:mt-5">
          {canPerformAction(booking, "accept") && (
            <button
              onClick={() => onAction(booking.id, "accept")}
              disabled={isProcessing}
              className="flex-1 min-w-[100px] md:min-w-[120px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 px-3 md:px-4 py-2 md:py-2.5 rounded-lg font-medium text-sm md:text-base transition-all duration-300 disabled:opacity-50 hover:scale-[1.02]"
            >
              Accept
            </button>
          )}
          {canPerformAction(booking, "decline") && (
            <button
              onClick={() => onAction(booking.id, "decline")}
              disabled={isProcessing}
              className="flex-1 min-w-[100px] md:min-w-[120px] bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30 px-3 md:px-4 py-2 md:py-2.5 rounded-lg font-medium text-sm md:text-base transition-all duration-300 disabled:opacity-50 hover:scale-[1.02]"
            >
              Decline
            </button>
          )}
          {canPerformAction(booking, "complete") && (
            <button
              onClick={() => onAction(booking.id, "complete")}
              disabled={isProcessing}
              className="flex-1 min-w-[100px] md:min-w-[120px] bg-blue-500/20 text-blue-300 border border-blue-500/40 hover:bg-blue-500/30 px-3 md:px-4 py-2 md:py-2.5 rounded-lg font-medium text-sm md:text-base transition-all duration-300 disabled:opacity-50 hover:scale-[1.02]"
            >
              Complete
            </button>
          )}
          {canPerformAction(booking, "cancel") && (
            <button
              onClick={() => onAction(booking.id, "cancel")}
              disabled={isProcessing}
              className="flex-1 min-w-[100px] md:min-w-[120px] bg-slate-600/20 text-slate-300 border border-slate-600/40 hover:bg-slate-500/30 px-3 md:px-4 py-2 md:py-2.5 rounded-lg font-medium text-sm md:text-base transition-all duration-300 disabled:opacity-50 hover:scale-[1.02]"
            >
              Cancel
            </button>
          )}
          {/* Reschedule button for confirmed bookings */}
          {booking.status === "confirmed" && (
            <button
              onClick={() => alert("Reschedule functionality coming soon!")}
              className="flex-1 min-w-[100px] md:min-w-[120px] bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 px-3 md:px-4 py-2 md:py-2.5 rounded-lg font-medium text-sm md:text-base transition-all duration-300 hover:scale-[1.02]"
            >
              Reschedule
            </button>
          )}
        </div>
      </div>
    </ScaleIn>
  )
}

export default function BookingsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [upcomingBookings, setUpcomingBookings] = useState([])
  const [pastBookings, setPastBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("upcoming")
  const [processingAction, setProcessingAction] = useState(null)

  const isMentor = user?.user_type === "mentor"

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true)
        const [upcomingData, pastData] = await Promise.all([bookingsAPI.getUpcoming(), bookingsAPI.getPast()])

        setUpcomingBookings(
          (Array.isArray(upcomingData) ? upcomingData : upcomingData.results || []).filter((b) =>
            ["pending", "in_progress"].includes(b.status),
          ),
        )
        setPastBookings(Array.isArray(pastData) ? pastData : pastData.results || [])
      } catch (err) {
        setError("Failed to load your sessions. Please try again later.")
      } finally {
        setLoading(false)
      }
    }
    if (user) fetchBookings()
  }, [user])

  const handleBookingAction = async (bookingId, action) => {
    setProcessingAction(bookingId)
    try {
      const apiAction = bookingsAPI[action]
      if (typeof apiAction !== "function") throw new Error("Invalid action")

      const updatedBooking = await apiAction(bookingId)

      const updateState = (prev) => prev.map((b) => (b.id === bookingId ? updatedBooking : b)).filter(Boolean)
      setUpcomingBookings(updateState)
      setPastBookings(updateState)
    } catch (error) {
      alert(`Could not perform action. ${error.message}`)
    } finally {
      setProcessingAction(null)
    }
  }

  const renderLoading = () => <ComponentLoading message="Loading your sessions..." size="large" />

  const renderError = () => (
    <div className="flex flex-col items-center justify-center min-h-[40vh] text-center bg-gradient-to-br from-slate-900/80 to-slate-800/60 p-6 md:p-8 lg:p-10 rounded-2xl md:rounded-3xl border border-red-500/30 backdrop-blur-xl">
      <div className="text-6xl md:text-7xl lg:text-8xl mb-4 md:mb-6 animate-bounce">⚠️</div>
      <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 md:mb-4">Oops! Something went wrong</h2>
      <p className="text-slate-400 text-base md:text-lg mb-6 md:mb-8 max-w-md">{error}</p>
      <button
        onClick={() => window.location.reload()}
        className="bg-gradient-to-r from-red-600 to-pink-600 text-white px-6 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl font-semibold text-base md:text-lg hover:from-red-500 hover:to-pink-500 transition-all duration-300 hover:scale-105"
      >
        Try Again
      </button>
    </div>
  )

  const renderEmptyState = () => (
    <div className="text-center py-12 md:py-16 lg:py-20 bg-gradient-to-br from-slate-900/80 to-slate-800/60 p-6 md:p-8 lg:p-10 rounded-2xl md:rounded-3xl border border-slate-700/50 backdrop-blur-xl">
      <Calendar className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 text-slate-600 mx-auto mb-4 md:mb-6 animate-pulse" />
      <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 md:mb-4">
        No {activeTab} sessions found
      </h3>
      <p className="text-slate-400 text-base md:text-lg mb-6 md:mb-8 max-w-md mx-auto">
        {activeTab === "upcoming" && !isMentor
          ? "Ready to learn something new? Book a session with a mentor!"
          : "There is nothing to show here."}
      </p>
      {activeTab === "upcoming" && !isMentor && (
        <button
          onClick={() => router.push("/mentors")}
          className="relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl font-semibold text-base md:text-lg hover:from-purple-500 hover:to-pink-500 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-purple-500/30 group"
        >
          <span className="relative z-10 flex items-center gap-2">
            <Sparkles className="w-5 h-5 md:w-6 md:h-6" />
            Find a Mentor
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </button>
      )}
    </div>
  )

  const currentBookings = activeTab === "upcoming" ? upcomingBookings : pastBookings

  if (loading) {
    return <PageLoading message="Loading your bookings..." />
  }

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/30 to-slate-950">
        {/* Background */}
        <div className="fixed inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950/30 to-slate-950"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,198,0.08),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,105,180,0.06),transparent_50%)]"></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12">
          {/* Header */}
          <FadeIn className="mb-8 md:mb-10 lg:mb-12">
            <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
              <div className="p-2 md:p-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-500/30">
                <Calendar className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 text-purple-400" />
              </div>
              <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-amber-400 animate-pulse" />
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2 md:mb-3">
              <span className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                {isMentor ? "My Sessions" : "My Bookings"}
              </span>
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-slate-400">
              {isMentor
                ? "Manage your mentoring sessions and requests."
                : "Track your mentorship journey, one session at a time."}
            </p>
          </FadeIn>

          {/* Tab Navigation */}
          <FadeIn className="mb-8 md:mb-10">
            <div className="flex gap-1 p-1 bg-slate-900/80 rounded-xl max-w-sm md:max-w-md backdrop-blur-xl border border-slate-700/50">
              <button
                onClick={() => setActiveTab("upcoming")}
                className={`flex-1 text-center px-4 md:px-6 py-2.5 md:py-3 rounded-lg font-medium text-sm md:text-base transition-all duration-300 ${
                  activeTab === "upcoming"
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                }`}
              >
                Upcoming ({upcomingBookings.length})
              </button>
              <button
                onClick={() => setActiveTab("past")}
                className={`flex-1 text-center px-4 md:px-6 py-2.5 md:py-3 rounded-lg font-medium text-sm md:text-base transition-all duration-300 ${
                  activeTab === "past"
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                }`}
              >
                Past ({pastBookings.length})
              </button>
            </div>
          </FadeIn>

          {/* Content */}
          {loading ? (
            renderLoading()
          ) : error ? (
            renderError()
          ) : (
            <div className="space-y-4 md:space-y-6">
              {currentBookings.length > 0
                ? currentBookings.map((booking) => (
                    <BookingCard
                      key={booking.id}
                      booking={booking}
                      isMentor={isMentor}
                      onAction={handleBookingAction}
                      isProcessing={processingAction === booking.id}
                    />
                  ))
                : renderEmptyState()}
            </div>
          )}
        </div>
      </main>
    </ProtectedRoute>
  )
}
