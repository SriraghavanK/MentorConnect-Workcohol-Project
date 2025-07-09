"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Github, Linkedin, Twitter, ArrowUp, Mail, CheckCircle, Heart, Sparkles } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"

// Enhanced Back to Top Button
function BackToTop() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.pageYOffset > 300)
    }

    window.addEventListener("scroll", toggleVisibility)
    return () => window.removeEventListener("scroll", toggleVisibility)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-8 right-8 z-50 group transition-all duration-500 transform ${
        isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-10 scale-75 pointer-events-none"
      }`}
      aria-label="Back to top"
    >
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-lg opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
        <div className="relative p-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform group-hover:scale-110 group-hover:-translate-y-1">
          <ArrowUp size={24} className="transition-transform duration-300 group-hover:scale-110" />
        </div>
      </div>
    </button>
  )
}

// Enhanced Newsletter Form
function NewsletterForm() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState("idle")
  const [message, setMessage] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !email.includes("@")) {
      setStatus("error")
      setMessage("Please enter a valid email address")
      return
    }

    setStatus("loading")

    setTimeout(() => {
      setStatus("success")
      setMessage("Welcome to our community! 🎉")
      setEmail("")
      setTimeout(() => {
        setStatus("idle")
        setMessage("")
      }, 4000)
    }, 1500)
  }

  return (
    <div className="w-full max-w-sm">
      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="relative group">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full bg-slate-800/50 text-slate-200 rounded-lg px-3 py-2 text-sm border border-slate-700/50 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 placeholder-slate-400"
            aria-label="Email for newsletter"
            disabled={status === "loading"}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </div>

        <button
          type="submit"
          disabled={status === "loading" || status === "success"}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-purple-500/50 transform hover:scale-[1.02] shadow-lg hover:shadow-xl hover:shadow-purple-500/25"
        >
          <div className="flex items-center justify-center gap-2">
            {status === "loading" ? (
              <>
                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Subscribing...</span>
              </>
            ) : status === "success" ? (
              <>
                <CheckCircle size={14} />
                <span>Subscribed!</span>
              </>
            ) : (
              <>
                <Mail size={14} />
                <span>Subscribe</span>
              </>
            )}
          </div>
        </button>
      </form>

      {message && (
        <div
          className={`mt-2 p-2 rounded-lg text-xs transition-all duration-300 ${
            status === "success"
              ? "bg-green-500/20 text-green-400 border border-green-500/30"
              : "bg-red-500/20 text-red-400 border border-red-500/30"
          }`}
        >
          {message}
        </div>
      )}
    </div>
  )
}

// Enhanced Social Icon
function SocialIcon({ href, icon: Icon, label, delay = 0, color = "purple" }) {
  const colorClasses = {
    purple: "hover:bg-purple-500/20 hover:text-purple-400 hover:border-purple-500/50",
    blue: "hover:bg-blue-500/20 hover:text-blue-400 hover:border-blue-500/50",
    gray: "hover:bg-slate-500/20 hover:text-slate-400 hover:border-slate-500/50",
  }

  return (
    <a
      href={href}
      className={`group relative p-2 bg-slate-800/30 border border-slate-700/50 rounded-lg text-slate-400 transition-all duration-300 transform hover:scale-110 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-purple-500/50 ${colorClasses[color]}`}
      aria-label={label}
      style={{ animationDelay: `${delay}ms` }}
    >
      <Icon size={18} className="transition-all duration-300 group-hover:scale-110" />
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </a>
  )
}

export default function Footer() {
  const { user } = useAuth()

  const loggedInLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/bookings", label: "Bookings" },
    { href: "/profile", label: "Profile" },
  ]

  const guestLinks = [
    { href: "/", label: "Home" },
    { href: "/mentors", label: "Find Mentors" },
    { href: "/login", label: "Login" },
    { href: "/register", label: "Register" },
  ]

  const availableRoutes = ["/", "/mentors", "/dashboard", "/bookings", "/profile", "/login", "/register"]

  const quickLinks = user ? loggedInLinks : guestLinks

  return (
    <>
      <footer className="relative w-full bg-slate-950 text-slate-300 mt-12">
        {/* Animated top border */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/70 to-transparent" />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-pink-500/50 to-transparent animate-pulse" />

        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-950/95 to-slate-950" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(168,85,247,0.05),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(236,72,153,0.05),transparent_50%)]" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Enhanced Logo and Description */}
            <div className="lg:col-span-2 flex flex-col items-center md:items-start">
              <div className="flex items-center gap-3 mb-4 group">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300" />
                  <div className="relative w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">M</span>
                  </div>
                </div>
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400 bg-clip-text text-transparent font-bold text-2xl tracking-tight group-hover:scale-105 transition-transform duration-300">
                  MentorConnect
                </span>
              </div>

              <p className="text-slate-400 max-w-md text-center md:text-left leading-relaxed mb-4 text-sm">
                Empowering the next generation of professionals through meaningful mentorship connections. Join
                thousands of mentors and mentees building successful careers together.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 w-full max-w-md">
                <div className="text-center">
                  <div className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    1K+
                  </div>
                  <div className="text-xs text-slate-500">Mentors</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    5K+
                  </div>
                  <div className="text-xs text-slate-500">Students</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    10K+
                  </div>
                  <div className="text-xs text-slate-500">Sessions</div>
                </div>
              </div>
            </div>

            {/* Enhanced Quick Links */}
            <div className="flex flex-col items-center md:items-start">
              <h3 className="font-bold text-lg mb-4 text-white flex items-center gap-2">
                <Sparkles size={16} className="text-purple-400" />
                Quick Links
              </h3>
              <div className="space-y-2 w-full">
                {quickLinks.map((link, index) =>
                  availableRoutes.includes(link.href) ? (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="block text-slate-400 hover:text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50 rounded px-2 py-1 hover:bg-slate-800/30 transform hover:translate-x-1 text-sm"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      {link.label}
                    </Link>
                  ) : null,
                )}
              </div>
            </div>

            {/* Enhanced Social and Newsletter */}
            <div className="flex flex-col items-center md:items-start">
              <h3 className="font-bold text-lg mb-4 text-white flex items-center gap-2">
                <Heart size={16} className="text-pink-400" />
                Stay Connected
              </h3>

              <div className="flex gap-3 mb-4">
                <SocialIcon href="#" icon={Twitter} label="Twitter" delay={0} color="blue" />
                <SocialIcon href="#" icon={Github} label="GitHub" delay={100} color="gray" />
                <SocialIcon href="#" icon={Linkedin} label="LinkedIn" delay={200} color="blue" />
              </div>

              <div className="w-full">
                <h4 className="text-sm font-semibold text-white mb-2">Newsletter</h4>
                <p className="text-slate-400 text-xs mb-3">Get updates and mentorship tips.</p>
                <NewsletterForm />
              </div>
            </div>
          </div>

          {/* Enhanced Copyright */}
          <div className="border-t border-slate-800/50 mt-8 pt-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="text-center md:text-left">
                <p className="text-slate-500 text-sm">
                  © {new Date().getFullYear()} MentorConnect. All rights reserved.
                </p>
                <p className="text-slate-600 text-xs mt-1 flex items-center justify-center md:justify-start gap-1">
                  Built with <Heart size={10} className="text-red-400 animate-pulse" /> for the future of mentorship
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-500">
                <Link href="#" className="hover:text-slate-300 transition-colors duration-300">
                  Privacy Policy
                </Link>
                <Link href="#" className="hover:text-slate-300 transition-colors duration-300">
                  Terms of Service
                </Link>
                <Link href="#" className="hover:text-slate-300 transition-colors duration-300">
                  Support
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
      <BackToTop />
    </>
  )
}
