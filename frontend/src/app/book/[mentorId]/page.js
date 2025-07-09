"use client"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Calendar, Clock, Video, MapPin, CreditCard, Sparkles, Crown, Zap, Shield, Target } from "lucide-react"
import { mentorsAPI, bookingsAPI } from "../../../services/api"
import { useAuth } from "../../../contexts/AuthContext"
import ProtectedRoute from "../../../components/ProtectedRoute"
import { FadeIn } from "../../../components/LightweightAnimations"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js"
// Remove these lines:
// import { Calendar as CalendarComponent } from "@/components/ui/calendar"
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

// Enhanced Stripe Payment Form Component
function StripePaymentForm({ paymentData, onSuccess, onError, isSubmitting, setIsSubmitting }) {
  const stripe = useStripe()
  const elements = useElements()

  const handlePayment = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    if (!stripe || !elements) {
      onError("Stripe has not loaded yet.")
      setIsSubmitting(false)
      return
    }

    const cardElement = elements.getElement(CardElement)

    const { error, paymentIntent } = await stripe.confirmCardPayment(paymentData.client_secret, {
      payment_method: {
        card: cardElement,
      },
    })

    if (error) {
      console.error("Stripe error:", error)
      onError(error.message)
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      console.log("Stripe paymentIntent succeeded:", paymentIntent)
      try {
        const data = await bookingsAPI.confirmPayment(paymentData.payment_intent_id)
        console.log("Backend booking confirmation response:", data)
        onSuccess(data)
      } catch (err) {
        console.error("Backend booking confirmation error:", err)
        onError(err.message || "Failed to confirm booking")
      }
    } else {
      console.warn("Stripe paymentIntent result:", paymentIntent)
    }
    setIsSubmitting(false)
  }

  return (
    <div className="space-y-6">
      {/* Payment Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-800/60 to-slate-700/40 rounded-2xl p-6 border border-purple-500/30 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 via-transparent to-pink-600/5"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-500/30">
              <CreditCard className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Complete Payment
            </h3>
            <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
          </div>

          <div className="space-y-4">
            <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/30 rounded-xl p-4 border border-slate-600/40">
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-300 font-medium">Total Amount:</span>
                <span className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                  ${paymentData.amount.toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-slate-400">Secure payment processed by Stripe</p>
            </div>

            <div className="bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/30 rounded-xl p-4">
              <p className="text-emerald-300 text-sm mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <strong>🔒 Secure Payment:</strong> Your payment information is encrypted and secure.
              </p>
              <p className="text-emerald-300 text-xs">
                Booking will be created only after successful payment confirmation.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Card Element */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-800/60 to-slate-700/40 rounded-2xl p-6 border border-purple-500/30">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 via-transparent to-pink-600/5"></div>
        <div className="relative z-10">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "16px",
                  color: "#fff",
                  "::placeholder": {
                    color: "#94a3b8",
                  },
                },
              },
              hidePostalCode: true,
            }}
          />
        </div>
      </div>

      {/* Submit Button */}
      <form onSubmit={handlePayment}>
        <button
          type="submit"
          disabled={isSubmitting}
          className="group relative overflow-hidden w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 px-6 rounded-2xl shadow-2xl hover:shadow-purple-500/50 transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-purple-500/50"
        >
          <span className="relative z-10 flex items-center justify-center gap-2 text-lg">
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Processing Payment...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5 group-hover:animate-pulse" />
                Pay ${paymentData.amount.toFixed(2)}
              </>
            )}
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        </button>
      </form>

      <div className="text-center">
        <p className="text-xs text-slate-400">
          By completing this payment, you agree to the booking terms and conditions.
        </p>
      </div>
    </div>
  )
}

export default function BookingPage() {
  const { mentorId } = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [mentor, setMentor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [bookingData, setBookingData] = useState({
    session_type: "video_call",
    session_date: "",
    session_time: "",
    duration_minutes: 60,
    topic: "",
    description: "",
    onsite_address: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [touched, setTouched] = useState({
    session_type: false,
    session_date: false,
    session_time: false,
    topic: false,
  })
  const [showPayment, setShowPayment] = useState(false)
  const [paymentData, setPaymentData] = useState(null)
  const [paymentError, setPaymentError] = useState(null)
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  // Add this state after the existing useState declarations:

  useEffect(() => {
    const fetchMentor = async () => {
      try {
        setLoading(true)
        const mentorData = await mentorsAPI.getById(mentorId)
        setMentor(mentorData)
      } catch (err) {
        setError("Failed to load mentor details. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    if (mentorId) {
      fetchMentor()
    }
  }, [mentorId])

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()

    if (!bookingData.session_date || !bookingData.session_time || !bookingData.topic) {
      alert("Please fill in all required fields")
      return
    }
    if (bookingData.session_type === "onsite" && !bookingData.onsite_address) {
      alert("Please provide the onsite address.")
      return
    }

    // Strict DD-MM-YYYY validation
    let session_date = bookingData.session_date
    let validDate = false
    if (/^\d{2}-\d{2}-\d{4}$/.test(session_date)) {
      const [dd, mm, yyyy] = session_date.split("-")
      const day = Number.parseInt(dd, 10)
      const month = Number.parseInt(mm, 10)
      const year = Number.parseInt(yyyy, 10)
      if (day >= 1 && month >= 1 && month <= 12 && yyyy.length === 4) {
        // Check if the day is valid for the month and year
        const dateObj = new Date(`${yyyy}-${mm}-${dd}`)
        if (
          dateObj &&
          dateObj.getFullYear() === year &&
          dateObj.getMonth() + 1 === month &&
          dateObj.getDate() === day
        ) {
          session_date = `${yyyy}-${mm}-${dd}`
          validDate = true
        }
      }
    }
    if (!validDate) {
      alert("Please enter a valid date in DD-MM-YYYY format. Month must be 01-12 and day must be valid.")
      return
    }

    setIsSubmitting(true)
    setPaymentError(null)

    try {
      const data = await bookingsAPI.createWithPayment({
        ...bookingData,
        session_date,
        mentor: Number.parseInt(mentorId),
      })

      setPaymentData(data)
      setShowPayment(true)
    } catch (error) {
      setPaymentError(error.message || "Failed to create payment intent. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePaymentSuccess = (result) => {
    setBookingSuccess(true)
    setTimeout(() => {
      router.push("/dashboard?booking=success")
    }, 3000)
  }

  const handlePaymentError = (error) => {
    setPaymentError(error)
  }

  const handleChange = (e) => {
    setBookingData({
      ...bookingData,
      [e.target.name]: e.target.value,
    })
  }

  const handleBlur = (e) => {
    setTouched({
      ...touched,
      [e.target.name]: true,
    })
  }

  const handleDateSelect = (day, month, year) => {
    const formattedDate = `${String(day).padStart(2, "0")}-${String(month).padStart(2, "0")}-${year}`
    setBookingData({ ...bookingData, session_date: formattedDate })
    setShowCalendar(false)
  }

  const generateCalendar = () => {
    const today = new Date()
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
    const firstDay = new Date(currentYear, currentMonth, 1).getDay()

    const days = []

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="w-8 h-8"></div>)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = day === today.getDate()
      const isPast = day < today.getDate()

      days.push(
        <button
          key={day}
          type="button"
          onClick={() => handleDateSelect(day, currentMonth + 1, currentYear)}
          disabled={isPast}
          className={`w-8 h-8 text-sm rounded-lg transition-all duration-200 ${
            isToday
              ? "bg-purple-500 text-white font-bold"
              : isPast
                ? "text-slate-600 cursor-not-allowed"
                : "text-slate-300 hover:bg-purple-500/20 hover:text-white"
          }`}
        >
          {day}
        </button>,
      )
    }

    return days
  }

  const sessionTypes = [
    {
      value: "video_call",
      label: "Video Call",
      icon: Video,
      description: "Face-to-face video meeting",
      color: "purple",
    },
    {
      value: "onsite",
      label: "Onsite",
      icon: MapPin,
      description: "Physical meeting at mentor location",
      color: "pink",
    },
  ]

  const durationOptions = [
    { value: 30, label: "30 minutes" },
    { value: 60, label: "1 hour" },
    { value: 90, label: "1.5 hours" },
    { value: 120, label: "2 hours" },
  ]

  // Loading State
  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/30 to-slate-950 flex items-center justify-center">
          <div className="fixed inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950/30 to-slate-950"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,198,0.12),transparent_50%)]"></div>
          </div>

          <div className="relative z-10 text-center">
            <div className="relative mb-6">
              <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-400 rounded-full animate-spin mx-auto"></div>
              <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl"></div>
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-2">
              Loading mentor details...
            </h2>
            <p className="text-slate-400">Please wait while we fetch the information</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  // Error State
  if (error || !mentor) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/30 to-slate-950 flex items-center justify-center">
          <div className="fixed inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950/30 to-slate-950"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(239,68,68,0.1),transparent_50%)]"></div>
          </div>

          <div className="relative z-10 text-center max-w-md mx-auto p-6">
            <div className="relative mb-6">
              <div className="text-6xl mb-4 animate-bounce">⚠️</div>
              <div className="absolute inset-0 bg-red-500/20 rounded-full blur-2xl"></div>
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent mb-3">
              Oops! Something went wrong
            </h2>
            <p className="text-slate-400 mb-6 text-lg">{error || "Mentor not found"}</p>
            <button
              onClick={() => router.push("/mentors")}
              className="group relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:from-purple-500 hover:to-pink-500 transition-all duration-300 hover:scale-105 shadow-2xl hover:shadow-purple-500/30"
            >
              <span className="relative z-10 flex items-center gap-2">
                <Target className="w-5 h-5" />
                Back to Mentors
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  // Calculate total amount
  const durationHours = bookingData.duration_minutes / 60
  const totalAmount = mentor.hourly_rate * durationHours

  // Success State
  if (bookingSuccess) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/30 to-slate-950 flex items-center justify-center">
          <div className="fixed inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950/30 to-slate-950"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(34,197,94,0.1),transparent_50%)]"></div>
          </div>

          <div className="relative z-10 text-center max-w-lg mx-auto p-6">
            <div className="relative mb-6">
              <div className="text-6xl mb-4 animate-bounce">✅</div>
              <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl"></div>
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-3">
              Booking Confirmed!
            </h2>
            <p className="text-slate-400 mb-4 text-lg">
              Your payment was successful and your booking has been created.
            </p>
            <p className="text-slate-300 text-sm bg-slate-800/50 px-4 py-2 rounded-full inline-block">
              Redirecting to dashboard...
            </p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/30 to-slate-950">
        {/* Enhanced Background */}
        <div className="fixed inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950/30 to-slate-950"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,198,0.12),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,105,180,0.08),transparent_50%)]"></div>
        </div>

        {/* Floating Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-500/4 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          {/* Enhanced Header */}
          <FadeIn className="text-center mb-6 md:mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="p-1.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-500/30 animate-pulse">
                {showPayment ? (
                  <CreditCard className="w-5 h-5 text-purple-400" />
                ) : (
                  <Calendar className="w-5 h-5 text-purple-400" />
                )}
              </div>
              <Sparkles className="w-4 h-4 text-amber-400 animate-bounce" />
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2">
              <span className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                {showPayment ? "Complete Payment" : "Book a Session"}
              </span>
            </h1>
            <p className="text-base md:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
              {showPayment
                ? "Secure payment to confirm your booking"
                : `Schedule your mentorship session with ${mentor.user?.first_name} ${mentor.user?.last_name}`}
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Enhanced Mentor Info Card */}
            <FadeIn className="lg:col-span-1">
              <div className="sticky top-8 relative overflow-hidden bg-gradient-to-br from-slate-900/90 via-slate-800/70 to-slate-900/90 backdrop-blur-xl rounded-2xl md:rounded-2xl p-4 md:p-6 border border-purple-500/30 shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 via-transparent to-pink-600/5"></div>

                {/* Floating particles */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute top-4 right-4 w-2 h-2 bg-purple-400/30 rounded-full animate-pulse"></div>
                  <div className="absolute bottom-6 left-6 w-1 h-1 bg-pink-400/40 rounded-full animate-ping delay-300"></div>
                </div>

                <div className="relative z-10">
                  <div className="text-center mb-4">
                    <div className="relative group mb-2">
                      <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mx-auto flex items-center justify-center text-xl md:text-2xl font-bold text-white shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                        {mentor.user?.first_name?.[0]}
                        {mentor.user?.last_name?.[0]}
                      </div>
                      {mentor.rating >= 4.5 && (
                        <div className="absolute -top-2 -right-2 p-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full animate-bounce">
                          <Crown className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>

                    <h3 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-1">
                      {mentor.user?.first_name} {mentor.user?.last_name}
                    </h3>
                    <p className="text-slate-400 mb-2 leading-relaxed text-sm">{mentor.bio || "Experienced mentor"}</p>

                    <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-2 animate-pulse">
                      ${mentor.hourly_rate}/hr
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-slate-400 bg-slate-800/50 p-3 rounded-xl">
                      <MapPin className="w-5 h-5 text-purple-400" />
                      <span className="font-medium">{mentor.location || "Remote"}</span>
                    </div>

                    {mentor.expertise && mentor.expertise.length > 0 && (
                      <div>
                        <p className="text-sm font-bold text-slate-300 mb-3">Expertise:</p>
                        <div className="flex flex-wrap gap-2">
                          {mentor.expertise.slice(0, 4).map((exp) => (
                            <span
                              key={exp.id}
                              className="px-3 py-1.5 bg-gradient-to-r from-purple-500/20 to-violet-500/20 text-purple-300 text-sm rounded-full font-semibold border border-purple-500/30"
                            >
                              {exp.name}
                            </span>
                          ))}
                          {mentor.expertise.length > 4 && (
                            <span className="px-3 py-1.5 bg-gradient-to-r from-slate-700/50 to-slate-600/50 text-slate-300 text-sm rounded-full font-semibold border border-slate-600/50">
                              +{mentor.expertise.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* Enhanced Booking Form or Payment Form */}
            <FadeIn className="lg:col-span-2">
              <div className="relative overflow-hidden bg-gradient-to-br from-slate-900/90 via-slate-800/70 to-slate-900/90 backdrop-blur-xl rounded-2xl md:rounded-2xl p-4 md:p-6 border border-purple-500/30 shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 via-transparent to-pink-600/5"></div>

                <div className="relative z-10">
                  {showPayment ? (
                    <Elements stripe={stripePromise}>
                      <StripePaymentForm
                        paymentData={paymentData}
                        onSuccess={handlePaymentSuccess}
                        onError={handlePaymentError}
                        isSubmitting={isSubmitting}
                        setIsSubmitting={setIsSubmitting}
                      />
                    </Elements>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
                      {/* Session Type */}
                      <div>
                        <label className="block text-lg font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-4">
                          Session Type <span className="text-red-400 ml-1">*</span>
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {sessionTypes.map((type) => {
                            const Icon = type.icon
                            const isSelected = bookingData.session_type === type.value
                            return (
                              <button
                                key={type.value}
                                type="button"
                                onClick={() => setBookingData({ ...bookingData, session_type: type.value })}
                                onBlur={handleBlur}
                                className={`group relative overflow-hidden p-6 rounded-2xl border transition-all duration-500 text-left hover:scale-[1.02] ${
                                  isSelected
                                    ? "bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-400/60 shadow-lg shadow-purple-500/20"
                                    : "bg-gradient-to-br from-slate-800/50 to-slate-700/30 border-slate-600/50 hover:border-purple-400/40"
                                }`}
                              >
                                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                <div className="relative z-10">
                                  <Icon
                                    className={`w-8 h-8 mb-3 ${isSelected ? "text-purple-400 animate-pulse" : "text-slate-400 group-hover:text-purple-400"} transition-colors duration-300`}
                                  />
                                  <div
                                    className={`font-bold text-lg mb-2 ${isSelected ? "text-white" : "text-slate-300"}`}
                                  >
                                    {type.label}
                                  </div>
                                  <div className={`text-sm ${isSelected ? "text-purple-200" : "text-slate-400"}`}>
                                    {type.description}
                                  </div>
                                </div>
                              </button>
                            )
                          })}
                        </div>
                        {touched.session_type && bookingData.session_type === "" && (
                          <p className="text-xs text-red-400 mt-2 flex items-center gap-1">
                            <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                            Session type is required
                          </p>
                        )}
                      </div>

                      {/* Date and Time */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label
                            htmlFor="session_date"
                            className="block text-lg font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-3"
                          >
                            Date <span className="text-red-400 ml-1">*</span>
                          </label>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
                            <input
                              type="text"
                              id="session_date"
                              name="session_date"
                              value={bookingData.session_date}
                              onChange={(e) => {
                                let v = e.target.value.replace(/[^0-9-]/g, "")
                                if (v.length > 10) v = v.slice(0, 10)
                                // Only allow DD up to 31
                                if (v.length >= 2) {
                                  const dd = v.slice(0, 2)
                                  if (Number.parseInt(dd, 10) > 31) {
                                    v = "31" + v.slice(2)
                                  }
                                }
                                if (v.length > 2 && v[2] !== "-") v = v.slice(0, 2) + "-" + v.slice(2)
                                if (v.length > 5 && v[5] !== "-") v = v.slice(0, 5) + "-" + v.slice(5)
                                // Only allow MM up to 12
                                if (v.length >= 5) {
                                  const mm = v.slice(3, 5)
                                  if (Number.parseInt(mm, 10) > 12) {
                                    v = v.slice(0, 3) + "12" + v.slice(5)
                                  }
                                }
                                // Only allow YYYY to be 4 digits and between 2020 and 2100
                                if (v.length > 7) {
                                  let year = v.slice(6, 10)
                                  if (year.length > 4) year = year.slice(0, 4)
                                  if (year.length === 4) {
                                    const yearNum = Number.parseInt(year, 10)
                                    if (yearNum < 2020) year = "2020"
                                    if (yearNum > 2100) year = "2100"
                                  }
                                  v = v.slice(0, 6) + year
                                }
                                handleChange({ target: { name: "session_date", value: v } })
                              }}
                              onBlur={(e) => {
                                const value = e.target.value
                                if (!/^\d{2}-\d{2}-\d{4}$/.test(value)) {
                                  alert("Please enter a valid date in DD-MM-YYYY format.")
                                  handleChange({ target: { name: "session_date", value: "" } })
                                } else {
                                  handleBlur(e)
                                }
                              }}
                              maxLength={10}
                              placeholder="DD-MM-YYYY"
                              className="w-full pl-12 pr-12 py-4 bg-gradient-to-r from-slate-800/60 to-slate-700/40 border border-slate-600/50 rounded-xl text-white text-base placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400/50 transition-all duration-300 hover:border-purple-500/30"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowCalendar(!showCalendar)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1"
                            >
                              <Calendar className="w-5 h-5 text-black" />
                            </button>

                            {/* Simple Calendar Dropdown */}
                            {showCalendar && (
                              <div className="absolute top-full left-0 mt-2 bg-slate-800 border border-slate-600 rounded-xl p-4 shadow-2xl z-50 min-w-[280px]">
                                <div className="text-center mb-4">
                                  <h3 className="text-white font-bold">
                                    {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                                  </h3>
                                </div>
                                <div className="grid grid-cols-7 gap-1 mb-2">
                                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                                    <div key={day} className="text-xs text-slate-400 text-center p-1 font-medium">
                                      {day}
                                    </div>
                                  ))}
                                </div>
                                <div className="grid grid-cols-7 gap-1">{generateCalendar()}</div>
                                <button
                                  type="button"
                                  onClick={() => setShowCalendar(false)}
                                  className="w-full mt-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors duration-200"
                                >
                                  Close
                                </button>
                              </div>
                            )}
                          </div>
                          {touched.session_date && bookingData.session_date === "" && (
                            <p className="text-xs text-red-400 mt-2 flex items-center gap-1">
                              <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                              Date is required
                            </p>
                          )}
                        </div>

                        <div>
                          <label
                            htmlFor="session_time"
                            className="block text-lg font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-3"
                          >
                            Time <span className="text-red-400 ml-1">*</span>
                          </label>
                          <div className="relative">
                            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
                            <input
                              type="time"
                              id="session_time"
                              name="session_time"
                              value={bookingData.session_time}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              className="w-full pl-12 pr-4 py-4 bg-gradient-to-r from-slate-800/60 to-slate-700/40 border border-slate-600/50 rounded-xl text-white text-base focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400/50 transition-all duration-300 hover:border-purple-500/30"
                              required
                            />
                          </div>
                          {touched.session_time && bookingData.session_time === "" && (
                            <p className="text-xs text-red-400 mt-2 flex items-center gap-1">
                              <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                              Time is required
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Duration */}
                      <div>
                        <label
                          htmlFor="duration_minutes"
                          className="block text-lg font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-3"
                        >
                          Duration
                        </label>
                        <select
                          id="duration_minutes"
                          name="duration_minutes"
                          value={bookingData.duration_minutes}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className="w-full px-4 py-4 bg-gradient-to-r from-slate-800/60 to-slate-700/40 border border-slate-600/50 rounded-xl text-white text-base focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400/50 transition-all duration-300 hover:border-purple-500/30 appearance-none"
                        >
                          {durationOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Topic */}
                      <div>
                        <label
                          htmlFor="topic"
                          className="block text-lg font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-3"
                        >
                          What would you like to discuss? <span className="text-red-400 ml-1">*</span>
                        </label>
                        <input
                          type="text"
                          id="topic"
                          name="topic"
                          value={bookingData.topic}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          placeholder="e.g., Career advice, Technical interview prep, Project guidance"
                          className="w-full px-4 py-4 bg-gradient-to-r from-slate-800/60 to-slate-700/40 border border-slate-600/50 rounded-xl text-white text-base placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400/50 transition-all duration-300 hover:border-purple-500/30"
                          required
                        />
                        {touched.topic && bookingData.topic === "" && (
                          <p className="text-xs text-red-400 mt-2 flex items-center gap-1">
                            <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                            Topic is required
                          </p>
                        )}
                      </div>

                      {/* Description */}
                      <div>
                        <label
                          htmlFor="description"
                          className="block text-lg font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-3"
                        >
                          Additional Details (Optional)
                        </label>
                        <textarea
                          id="description"
                          name="description"
                          value={bookingData.description}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          placeholder="Provide more context about what you'd like to cover in this session..."
                          rows={4}
                          className="w-full px-4 py-4 bg-gradient-to-r from-slate-800/60 to-slate-700/40 border border-slate-600/50 rounded-xl text-white text-base placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400/50 transition-all duration-300 hover:border-purple-500/30 resize-none"
                        />
                      </div>

                      {/* Onsite Address */}
                      {bookingData.session_type === "onsite" && (
                        <div>
                          <label
                            htmlFor="onsite_address"
                            className="block text-lg font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-3"
                          >
                            Onsite Address <span className="text-red-400 ml-1">*</span>
                          </label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
                            <input
                              type="text"
                              id="onsite_address"
                              name="onsite_address"
                              value={bookingData.onsite_address || ""}
                              onChange={handleChange}
                              placeholder="Enter the address for the onsite session"
                              className="w-full pl-12 pr-4 py-4 bg-gradient-to-r from-slate-800/60 to-slate-700/40 border border-slate-600/50 rounded-xl text-white text-base placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400/50 transition-all duration-300 hover:border-purple-500/30"
                              required={bookingData.session_type === "onsite"}
                            />
                          </div>
                        </div>
                      )}

                      {/* Total Amount */}
                      <div className="relative overflow-hidden bg-gradient-to-br from-slate-800/60 to-slate-700/40 rounded-2xl p-6 border border-purple-500/30">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 via-transparent to-pink-600/5"></div>
                        <div className="relative z-10">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-slate-300 font-bold text-lg">Total Amount:</span>
                            <span className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent animate-pulse">
                              ${totalAmount.toFixed(2)}
                            </span>
                          </div>
                          <p className="text-sm text-slate-400">
                            {bookingData.duration_minutes} minutes × ${mentor.hourly_rate}/hour
                          </p>
                        </div>
                      </div>

                      {/* Error Message */}
                      {paymentError && (
                        <div className="relative overflow-hidden bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/40 rounded-2xl p-4">
                          <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-pink-600/10"></div>
                          <div className="relative z-10 flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                            <p className="text-red-300 text-sm">{paymentError}</p>
                          </div>
                        </div>
                      )}

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="group relative overflow-hidden w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 px-6 rounded-2xl shadow-2xl hover:shadow-purple-500/50 transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-purple-500/50"
                      >
                        <span className="relative z-10 flex items-center justify-center gap-2 text-lg">
                          {isSubmitting ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              Creating Payment...
                            </>
                          ) : (
                            <>
                              <Zap className="w-5 h-5 group-hover:animate-pulse" />
                              Proceed to Payment
                            </>
                          )}
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
