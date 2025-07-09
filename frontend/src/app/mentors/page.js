"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { FadeIn } from "../../components/LightweightAnimations"
import { Star, MapPin, Users, Clock, Crown, Zap, Target, Search, Filter, Sparkles, TrendingUp } from "lucide-react"

function MentorCard({ mentor, index }) {
  const mentorName = mentor.user ? `${mentor.user.first_name} ${mentor.user.last_name}` : "Unknown Mentor"
  const mentorBio = mentor.bio || "No bio available"
  const mentorExpertise = mentor.expertise || []
  const mentorPrice = mentor.hourly_rate || 0
  const mentorRating = mentor.rating || 0
  const mentorReviews = mentor.review_count || 0
  const mentorLocation = mentor.location || "Remote"
  const mentorAvailability = mentor.availability || "Flexible"
  const mentorSessions = mentor.sessions_completed || 0

  return (
    <FadeIn
      delay={index * 0.1}
      className="group relative overflow-hidden bg-gradient-to-br from-slate-900/80 via-slate-800/60 to-slate-900/80 backdrop-blur-xl rounded-2xl md:rounded-3xl p-1 shadow-2xl border border-purple-500/30 hover:border-purple-400/60 transition-all duration-700 hover:scale-[1.03] hover:-translate-y-2 h-full"
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl md:rounded-3xl">
        <div className="absolute top-4 right-4 w-2 h-2 bg-purple-400/30 rounded-full animate-pulse"></div>
        <div className="absolute bottom-6 left-6 w-1 h-1 bg-pink-400/40 rounded-full animate-ping delay-300"></div>
        <div className="absolute top-1/2 left-4 w-1.5 h-1.5 bg-amber-400/20 rounded-full animate-bounce delay-700"></div>
      </div>

      <div className="relative z-10 bg-gradient-to-br from-slate-900/95 to-slate-800/80 rounded-2xl md:rounded-3xl p-5 md:p-6 h-full backdrop-blur-xl flex flex-col">
        {/* Header section */}
        <div className="flex items-start gap-4 mb-4">
          <div className="relative group/avatar">
            <Image
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                mentorName,
              )}&background=8b5cf6&color=fff&size=80`}
              alt={mentorName}
              width={80}
              height={80}
              className="w-16 h-16 md:w-18 md:h-18 rounded-2xl object-cover ring-4 ring-purple-500/30 group-hover:ring-purple-400/50 transition-all duration-500 shadow-xl group-hover/avatar:scale-110 group-hover/avatar:rotate-3"
            />
            <div className="absolute -bottom-2 -right-2 w-5 h-5 bg-emerald-500 rounded-full border-4 border-slate-900 flex items-center justify-center animate-pulse">
              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
            </div>
            {mentorRating >= 4.5 && (
              <div className="absolute -top-2 -left-2 p-1.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full animate-bounce">
                <Crown className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg md:text-xl text-white mb-1 group-hover:text-purple-200 transition-colors duration-300">
              {mentorName}
            </h3>
            <p className="text-slate-400 text-sm md:text-base mb-2 font-medium">
              {mentorExpertise.length > 0 ? mentorExpertise[0].name : "Expert"}
            </p>
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-3 h-3 md:w-4 md:h-4 text-purple-400 animate-pulse" />
              <p className="text-purple-400 font-semibold text-xs md:text-sm">{mentorLocation}</p>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="flex items-center gap-1 mb-1 justify-end">
              <Star className="w-4 h-4 text-amber-400 fill-current animate-pulse" />
              <span className="font-bold text-sm md:text-base text-white">
                {typeof mentorRating === "number" ? mentorRating.toFixed(1) : "0.0"}
              </span>
              <span className="text-slate-400 text-xs">({mentorReviews})</span>
            </div>
            <div className="flex items-center gap-1 justify-end">
              <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent animate-pulse">
                ${mentorPrice}
              </span>
              <span className="text-slate-400 text-xs">/hr</span>
            </div>
          </div>
        </div>

        {/* Bio section - flexible height */}
        <div className="flex-1 mb-4">
          <p className="text-slate-400 text-sm md:text-base leading-relaxed line-clamp-3">{mentorBio}</p>
        </div>

        {/* Expertise tags - fixed height */}
        <div className="mb-4 min-h-[40px] flex items-start">
          <div className="flex flex-wrap gap-2">
            {mentorExpertise.slice(0, 3).map((exp, idx) => (
              <span
                key={exp.id}
                className="px-2 md:px-3 py-1 bg-gradient-to-r from-purple-500/20 to-violet-500/20 text-purple-300 text-xs md:text-sm rounded-full font-semibold border border-purple-500/30 hover:scale-105 transition-transform duration-300"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                {exp.name}
              </span>
            ))}
            {mentorExpertise.length > 3 && (
              <span className="px-2 md:px-3 py-1 bg-gradient-to-r from-slate-700/50 to-slate-600/50 text-slate-300 text-xs md:text-sm rounded-full font-semibold border border-slate-600/50 hover:scale-105 transition-transform duration-300">
                +{mentorExpertise.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Stats section - fixed height */}
        <div className="flex items-center justify-between text-xs md:text-sm text-slate-400 mb-5 border-t border-slate-700/50 pt-3 min-h-[40px]">
          <div className="flex items-center gap-1 group/stat hover:text-purple-400 transition-colors duration-300">
            <Users className="w-3 h-3 md:w-4 md:h-4 text-purple-400 group-hover/stat:animate-bounce" />
            <span className="font-medium">{mentorSessions} sessions</span>
          </div>
          <div className="flex items-center gap-1 group/stat hover:text-emerald-400 transition-colors duration-300">
            <Clock className="w-3 h-3 md:w-4 md:h-4 text-emerald-400 group-hover/stat:animate-spin" />
            <span className="font-medium">{mentorAvailability}</span>
          </div>
        </div>

        {/* Buttons section - always at bottom */}
        <div className="flex gap-3 mt-auto">
          <Link
            href={`/book/${mentor.id}`}
            className="group/btn relative overflow-hidden flex-1 text-center bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2.5 md:py-3 px-4 rounded-xl font-bold text-sm md:text-base shadow-2xl hover:shadow-purple-500/50 transition-all duration-500 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-500/50"
          >
            <span className="relative z-10 flex items-center justify-center gap-1.5">
              <Zap className="w-4 h-4 group-hover/btn:animate-pulse" />
              Book Session
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
          </Link>
          <Link
            href={`/mentors/${mentor.id}`}
            className="group/btn relative overflow-hidden flex-1 text-center py-2.5 md:py-3 px-4 border-2 border-slate-600/50 text-slate-300 rounded-xl font-bold text-sm md:text-base hover:border-purple-400/50 hover:bg-purple-500/10 transition-all duration-500 transform hover:scale-105 backdrop-blur-xl"
          >
            <span className="relative z-10 flex items-center justify-center gap-1.5">
              <Target className="w-4 h-4 group-hover/btn:animate-pulse" />
              View Profile
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500"></div>
          </Link>
        </div>
      </div>
    </FadeIn>
  )
}

export default function MentorsClient({ mentors: initialMentors = [], expertiseList: initialExpertiseList = [] }) {
  const [mentors, setMentors] = useState(initialMentors);
  const [expertiseList, setExpertiseList] = useState(initialExpertiseList);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedExpertise, setSelectedExpertise] = useState("");
  const [sortBy, setSortBy] = useState("rating");

  useEffect(() => {
    async function fetchMentors() {
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
        const res = await fetch(`${API_BASE_URL}/mentors/`);
        if (res.ok) {
          const data = await res.json();
          setMentors(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        setMentors([]);
      }
    }
    async function fetchExpertise() {
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
        const res = await fetch(`${API_BASE_URL}/expertise/`);
        if (res.ok) {
          const data = await res.json();
          setExpertiseList(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        setExpertiseList([]);
      }
    }
    fetchMentors();
    fetchExpertise();
  }, []);

  // Filter and sort mentors
  const filteredMentors = (Array.isArray(mentors) ? mentors : []).filter((mentor) => {
    const mentorName = mentor.user ? `${mentor.user.first_name} ${mentor.user.last_name}` : ""
    const mentorBio = mentor.bio || ""
    const mentorExpertise = mentor.expertise || []
    const matchesSearch =
      mentorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentorBio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentorExpertise.some((exp) => exp.name?.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesExpertise =
      !selectedExpertise || mentorExpertise.some((exp) => exp.id === Number.parseInt(selectedExpertise))
    return matchesSearch && matchesExpertise
  })

  const sortedMentors = [...filteredMentors].sort((a, b) => {
    switch (sortBy) {
      case "rating":
        return (b.rating || 0) - (a.rating || 0)
      case "price-low":
        return (a.hourly_rate || 0) - (b.hourly_rate || 0)
      case "price-high":
        return (b.hourly_rate || 0) - (a.hourly_rate || 0)
      case "reviews":
        return (b.review_count || 0) - (a.review_count || 0)
      default:
        return 0
    }
  })

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/30 to-slate-950 py-8 md:py-10">
      {/* Enhanced Background */}
      <div className="fixed inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950/30 to-slate-950"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,198,0.12),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,105,180,0.08),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_40%,rgba(59,130,246,0.06),transparent_50%)]"></div>
      </div>

      {/* Floating animated elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-500/4 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-3/4 left-3/4 w-64 h-64 bg-blue-500/3 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Enhanced Header */}
        <FadeIn className="text-center mb-10 md:mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl border border-purple-500/30 animate-pulse">
              <Search className="w-6 h-6 text-purple-400" />
            </div>
            <Sparkles className="w-5 h-5 text-amber-400 animate-bounce" />
            <TrendingUp className="w-5 h-5 text-emerald-400 animate-pulse" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-4 animate-fade-in">
            Find Your Perfect Mentor
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-4xl mx-auto leading-relaxed">
            Connect with experienced professionals who can guide you on your career journey and unlock your potential
          </p>
        </FadeIn>

        {/* Enhanced Search and Filters */}
        <FadeIn className="relative overflow-hidden bg-gradient-to-br from-slate-900/90 via-slate-800/70 to-slate-900/90 backdrop-blur-2xl rounded-2xl md:rounded-3xl p-6 md:p-8 mb-8 md:mb-10 border border-purple-500/30 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 via-transparent to-pink-600/5"></div>

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
            {/* Enhanced Search */}
            <div className="group">
              <label className="block text-sm font-bold text-slate-200 mb-2">Search Mentors</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-400 group-focus-within:animate-pulse" />
                <input
                  type="text"
                  placeholder="Search by name, expertise..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 bg-gradient-to-r from-slate-800/60 to-slate-700/40 border border-slate-600/50 rounded-xl text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400/50 transition-all duration-300 hover:border-purple-500/30"
                />
              </div>
            </div>

            {/* Enhanced Expertise Filter */}
            <div className="group">
              <label className="block text-sm font-bold text-slate-200 mb-2">Expertise Area</label>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-400 group-focus-within:animate-pulse" />
                <select
                  value={selectedExpertise}
                  onChange={(e) => setSelectedExpertise(e.target.value)}
                  className="w-full pl-10 pr-8 py-3 bg-gradient-to-r from-slate-800/60 to-slate-700/40 border border-slate-600/50 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400/50 transition-all duration-300 appearance-none hover:border-purple-500/30"
                >
                  <option value="">All Expertise Areas</option>
                  {(Array.isArray(expertiseList) ? expertiseList : []).map((expertise) => (
                    <option key={expertise.id} value={expertise.id}>
                      {expertise.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Enhanced Sort By */}
            <div className="group">
              <label className="block text-sm font-bold text-slate-200 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-3 bg-gradient-to-r from-slate-800/60 to-slate-700/40 border border-slate-600/50 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400/50 transition-all duration-300 appearance-none hover:border-purple-500/30"
              >
                <option value="rating">⭐ Highest Rated</option>
                <option value="price-low">💰 Price: Low to High</option>
                <option value="price-high">💎 Price: High to Low</option>
                <option value="reviews">📈 Most Reviews</option>
              </select>
            </div>

            {/* Enhanced Results Count */}
            <div className="flex items-end">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 bg-clip-text text-transparent mb-2 animate-pulse">
                  {sortedMentors.length}
                </div>
                <div className="text-slate-300 font-semibold text-sm">
                  {sortedMentors.length === 1 ? "Mentor Found" : "Mentors Found"}
                </div>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Enhanced Mentors Grid */}
        {sortedMentors.length === 0 ? (
          <FadeIn className="text-center py-16 md:py-20">
            <div className="relative mb-6">
              <div className="text-6xl md:text-7xl mb-4 animate-bounce">🔍</div>
              <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-3xl"></div>
            </div>
            <h3 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-3">
              No mentors found
            </h3>
            <p className="text-lg md:text-xl text-slate-400 mb-8 max-w-2xl mx-auto leading-relaxed">
              We couldn&quot;t find any mentors matching your criteria. Try adjusting your search or browse all available
              mentors.
            </p>
            <button
              onClick={() => {
                setSearchTerm("")
                setSelectedExpertise("")
              }}
              className="group relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-bold text-base hover:from-purple-500 hover:to-pink-500 transition-all duration-500 hover:scale-105 shadow-2xl hover:shadow-purple-500/50"
            >
              <span className="relative z-10 flex items-center gap-2">
                <Sparkles className="w-5 h-5 group-hover:animate-spin" />
                Clear All Filters
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </button>
          </FadeIn>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {sortedMentors.map((mentor, index) => (
              <MentorCard key={mentor.id} mentor={mentor} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
