"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock, MapPin, User, MessageSquare, Phone, Mail, ArrowLeft, Star, DollarSign, CheckCircle, XCircle, Check, AlertCircle } from "lucide-react";
import ProtectedRoute from "../../../components/ProtectedRoute";
import { bookingsAPI } from "../../../services/api";
import { useAuth } from "../../../contexts/AuthContext";
import { FadeIn, ScaleIn } from "../../../components/LightweightAnimations";
import { PageLoading } from '../../../components/LoadingSpinner';

export default function BookingDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        setLoading(true);
        const response = await bookingsAPI.getById(id);
        setBooking(response);
      } catch (err) {
        setError('Failed to load booking details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBookingDetails();
    }
  }, [id]);

  const isMentor = user?.user_type === 'mentor';
  let otherParty = null;
  let otherPartyName = "User";
  let otherPartyExpertise = "";
  let otherPartyBio = "";
  let otherPartyEmail = "";
  let otherPartyPhone = "";
  let otherPartyUserId = null;

  if (booking) {
    if (isMentor) {
      otherParty = booking.mentee_details || booking.mentee;
    } else {
      otherParty = booking.mentor_details || booking.mentor;
    }
    if (otherParty) {
      const userObj = otherParty.user || {};
      otherPartyName = `${userObj.first_name || otherParty.first_name || otherParty.name || ''} ${userObj.last_name || otherParty.last_name || ''}`.trim() || userObj.username || otherParty.username || 'User';
      otherPartyExpertise = otherParty.expertise || '';
      otherPartyBio = otherParty.bio || '';
      otherPartyEmail = userObj.email || otherParty.email || '';
      otherPartyPhone = userObj.phone || otherParty.phone || '';
      otherPartyUserId = userObj.id || otherParty.id || null;
    }
  }

  let sessionDate = null;
  if (booking) {
    if (booking.session_date && booking.session_time) {
      sessionDate = new Date(`${booking.session_date}T${booking.session_time}`);
    } else if (booking.session_date) {
      sessionDate = new Date(booking.session_date);
    }
  }

  let sessionTimeRange = '';
  if (sessionDate && booking?.duration_minutes) {
    const endDate = new Date(sessionDate.getTime() + (booking.duration_minutes * 60000));
    sessionTimeRange = `${sessionDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} to ${endDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
  } else if (sessionDate) {
    sessionTimeRange = sessionDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  // --- Session rate fallback logic ---
  const sessionRate = booking?.hourly_rate ?? booking?.mentor?.hourly_rate ?? 0;

  if (loading) {
    return (
      <ProtectedRoute>
        <PageLoading message="Loading booking details..." />
      </ProtectedRoute>
    );
  }

  if (error || !booking) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-center">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-2">Booking Not Found</h2>
          <p className="text-slate-400 mb-4">
            {error || "The booking you're looking for doesn't exist or you don't have permission to view it."}
          </p>
          <div className="space-x-4">
            <button
              onClick={() => router.back()}
              className="bg-slate-700 text-white px-6 py-2 rounded-lg font-bold hover:bg-slate-600 transition-colors"
            >
              Go Back
            </button>
            <Link
              href="/dashboard"
              className="bg-gold text-primary px-6 py-2 rounded-lg font-bold hover:bg-amber-400 transition-colors"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'text-green-400 bg-green-600/80 border-green-400/60';
      case 'pending':
        return 'text-yellow-400 bg-yellow-500/80 border-yellow-400/60';
      case 'cancelled':
        return 'text-red-400 bg-red-600/80 border-red-400/60';
      case 'completed':
        return 'text-blue-400 bg-blue-600/80 border-blue-400/60';
      case 'in_progress':
        return 'text-purple-200 bg-purple-700/80 border-purple-400/60';
      default:
        return 'text-slate-400 bg-slate-700/80 border-slate-400/60';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 mr-1" />;
      case 'pending':
        return <Clock className="w-4 h-4 mr-1" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 mr-1" />;
      case 'completed':
        return <Check className="w-4 h-4 mr-1" />;
      case 'in_progress':
        return <CheckCircle className="w-4 h-4 mr-1" />;
      default:
        return <AlertCircle className="w-4 h-4 mr-1" />;
    }
  };

  const formatStatusText = (status) => {
    if (!status) return '';
    return status
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950">
        <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <FadeIn className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => router.back()}
                className="p-2 rounded-lg bg-slate-800/70 border border-slate-700 hover:bg-slate-700 hover:border-gold/80 hover:shadow-lg transition-colors duration-200"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                Session Details
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(booking.status)} transition-colors duration-200`}>
                {getStatusIcon(booking.status)}
                {formatStatusText(booking.status) || 'Unknown'}
              </span>
              <span className="text-slate-400">
                Booking #{booking.id}
              </span>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <FadeIn className="lg:col-span-2 space-y-6">
              {/* Session Information */}
              <div className="bg-slate-900/50 backdrop-blur-2xl rounded-2xl p-6 border border-purple-500/20">
                <h2 className="text-2xl font-bold text-white mb-6">Session Information</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-purple-400" />
                    <div>
                      <p className="text-slate-400 text-sm">Date</p>
                      <p className="text-white font-semibold">
                        {sessionDate?.toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-purple-400" />
                    <div>
                      <p className="text-slate-400 text-sm">Time</p>
                      <p className="text-white font-semibold">
                        {sessionTimeRange}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-purple-400" />
                    <div>
                      <p className="text-slate-400 text-sm">Duration</p>
                      <p className="text-white font-semibold">
                        {booking.duration_minutes || 60} minutes
                      </p>
                    </div>
                  </div>

                  {booking.location && (
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-purple-400" />
                      <div>
                        <p className="text-slate-400 text-sm">Location</p>
                        <p className="text-white font-semibold">
                          {typeof booking.location === 'string'
                            ? booking.location
                            : booking.location.name || '[Unknown Location]'}
                        </p>
                      </div>
                    </div>
                  )}

                  {booking.notes && (
                    <div>
                      <p className="text-slate-400 text-sm mb-2">Notes</p>
                      <p className="text-white bg-slate-800/50 p-4 rounded-lg">
                        {typeof booking.notes === 'string'
                          ? booking.notes
                          : booking.notes.description || '[No Notes]'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Pricing Information */}
              <div className="bg-slate-900/50 backdrop-blur-2xl rounded-2xl p-6 border border-purple-500/20">
                <h2 className="text-2xl font-bold text-white mb-6">Pricing</h2>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Session Rate</span>
                    <span className="text-white font-semibold">
                      ${sessionRate}/hour
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Duration</span>
                    <span className="text-white font-semibold">
                      {booking.duration_minutes || 60} minutes
                    </span>
                  </div>
                  
                  <div className="border-t border-slate-700 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-bold text-lg">Total</span>
                      <span className="text-gold font-bold text-lg">
                        ${((sessionRate) * (booking.duration_minutes || 60) / 60).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* Sidebar */}
            <FadeIn className="space-y-6">
              {/* Other Party Information */}
              <div className="bg-slate-900/50 backdrop-blur-2xl rounded-2xl p-6 border border-purple-500/20">
                <h2 className="text-2xl font-bold text-white mb-6">
                  {isMentor ? "Mentee" : "Mentor"}
                </h2>
                
                <div className="text-center mb-6">
                  <Image
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                      otherPartyName || 'User'
                    )}&background=f59e0b&color=fff&size=120`}
                    alt={otherPartyName || 'User'}
                    width={120}
                    height={120}
                    className="w-30 h-30 rounded-full object-cover mx-auto mb-4"
                  />
                  <h3 className="text-xl font-bold text-white">
                    {typeof otherPartyName === 'string'
                      ? otherPartyName
                      : otherPartyName?.name || '[Unknown Name]'}
                  </h3>
                  {otherPartyExpertise && (
                    <p className="text-slate-400">
                      {typeof otherPartyExpertise === 'string'
                        ? otherPartyExpertise
                        : otherPartyExpertise?.name || '[Unknown Expertise]'}
                    </p>
                  )}
                </div>

                {otherPartyBio && (
                  <div className="mb-6">
                    <p className="text-slate-300 text-sm leading-relaxed">
                      {typeof otherPartyBio === 'string'
                        ? otherPartyBio
                        : otherPartyBio?.description || '[No Bio]'}
                    </p>
                  </div>
                )}

                <div className="space-y-3">
                  {otherPartyEmail && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50">
                      <Mail className="w-4 h-4 text-purple-400" />
                      <span className="text-white text-sm">{otherPartyEmail}</span>
                    </div>
                  )}
                  
                  {otherPartyPhone && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50">
                      <Phone className="w-4 h-4 text-purple-400" />
                      <span className="text-white text-sm">{otherPartyPhone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="bg-slate-900/50 backdrop-blur-2xl rounded-2xl p-6 border border-purple-500/20">
                <h2 className="text-2xl font-bold text-white mb-6">Actions</h2>
                
                <div className="space-y-3">
                  <Link
                    href={`/messages?user=${otherPartyUserId}`}
                    className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50 hover:bg-slate-800/70 transition-colors"
                  >
                    <span className="font-semibold text-white">Send Message</span>
                    <MessageSquare className="w-5 h-5 text-purple-400" />
                  </Link>
                  
                  {booking.status === 'confirmed' && (
                    <button className="w-full flex items-center justify-between p-4 rounded-xl bg-green-600/20 hover:bg-green-600/30 transition-colors border border-green-500/30">
                      <span className="font-semibold text-green-400">Join Session</span>
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    </button>
                  )}
                  
                  {booking.status === 'pending' && (
                    <div className="space-y-2">
                      <button className="w-full flex items-center justify-between p-4 rounded-xl bg-green-600/20 hover:bg-green-600/30 transition-colors border border-green-500/30">
                        <span className="font-semibold text-green-400">Confirm</span>
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      </button>
                      <button className="w-full flex items-center justify-between p-4 rounded-xl bg-red-600/20 hover:bg-red-600/30 transition-colors border border-red-500/30">
                        <span className="font-semibold text-red-400">Decline</span>
                        <XCircle className="w-5 h-5 text-red-400" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 