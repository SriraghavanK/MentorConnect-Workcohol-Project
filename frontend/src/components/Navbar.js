"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "../contexts/AuthContext"
import Image from "next/image"

// Enhanced Progress bar with gradient animation
function ProgressBar({ loading }) {
  return (
    <div className="fixed top-0 left-0 w-full h-1 z-[100] pointer-events-none">
      <div
        className={`h-full bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 transition-all duration-500 ${
          loading ? "w-full opacity-100" : "w-0 opacity-0"
        }`}
        style={{
          transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: loading ? "0 0 20px rgba(168, 85, 247, 0.5)" : "none",
        }}
        aria-hidden="true"
      />
    </div>
  )
}

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [loading, setLoading] = useState(false)
  const [avatarOpen, setAvatarOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  // Enhanced scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Progress bar on route change
  useEffect(() => {
    const handleStart = () => setLoading(true)
    const handleComplete = () => setLoading(false)
    router.events?.on?.("routeChangeStart", handleStart)
    router.events?.on?.("routeChangeComplete", handleComplete)
    router.events?.on?.("routeChangeError", handleComplete)
    return () => {
      router.events?.off?.("routeChangeStart", handleStart)
      router.events?.off?.("routeChangeComplete", handleComplete)
      router.events?.off?.("routeChangeError", handleComplete)
    }
  }, [router])

  const handleLogout = () => {
    logout()
    setOpen(false)
    setAvatarOpen(false)
  }

  const isMentor = user?.user_type === "mentor"

  const navLinks = [
    { href: "/", label: "Home" },
    ...(isAuthenticated
      ? isMentor
        ? [
            { href: "/dashboard", label: "Dashboard" },
            { href: "/bookings", label: "My Sessions" },
            { href: "/profile", label: "Profile" },
          ]
        : [
            { href: "/mentors", label: "Find Mentors" },
            { href: "/dashboard", label: "Dashboard" },
            { href: "/bookings", label: "My Bookings" },
            { href: "/profile", label: "Profile" },
          ]
      : [
          { href: "/mentors", label: "Find Mentors" },
          { href: "/login", label: "Login" },
          { href: "/register", label: "Get Started", cta: true },
        ]),
  ]

  return (
    <>
      <ProgressBar loading={loading} />
      <nav
        className={`sticky top-0 z-50 w-full transition-all duration-500 ${
          scrolled
            ? "bg-slate-950/95 backdrop-blur-xl border-b border-purple-500/20 shadow-2xl shadow-purple-500/10"
            : "bg-slate-950/80 backdrop-blur-sm"
        }`}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/5 via-transparent to-pink-900/5 opacity-50" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          {/* Enhanced Logo */}
          <Link href="/" className="flex items-center gap-3 group focus:outline-none" tabIndex={0}>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300" />
              <div className="relative w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
            </div>
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400 bg-clip-text text-transparent font-bold text-2xl tracking-tight group-hover:scale-105 transition-transform duration-300">
              MentorConnect
            </span>
          </Link>

          {/* Enhanced Desktop Navigation */}
          <div className="hidden md:flex gap-8 items-center relative">
            {navLinks.map((link, index) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-4 py-2 font-medium transition-all duration-300 focus:outline-none group ${
                  link.cta
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-full px-6 py-2.5 shadow-lg hover:shadow-xl hover:shadow-purple-500/25 transform hover:scale-105 hover:-translate-y-0.5"
                    : pathname === link.href
                      ? "text-purple-400"
                      : "text-slate-300 hover:text-white"
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
                aria-current={pathname === link.href ? "page" : undefined}
                tabIndex={0}
              >
                {link.label}
                {/* Enhanced active indicator */}
                {pathname === link.href && !link.cta && (
                  <span className="absolute left-0 -bottom-1 w-full h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse" />
                )}
                {/* Hover effect */}
                {!link.cta && (
                  <span className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
                )}
              </Link>
            ))}

            {/* Enhanced User Section */}
            {isAuthenticated && (
              <div className="flex items-center gap-4 ml-4 pl-4 border-l border-slate-700">
                <button
                  onClick={handleLogout}
                  className="relative px-4 py-2 font-medium text-slate-300 hover:text-red-400 transition-all duration-300 focus:outline-none group"
                  tabIndex={0}
                >
                  <span className="relative z-10">Logout</span>
                  <span className="absolute inset-0 bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>

                <Link
                  href="/profile"
                  className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-800/50 transition-all duration-300 focus:outline-none group"
                >
                  <div className="relative">
                    {user.profile_picture ? (
                      <Image
                        src={
                          user.profile_picture.startsWith("http")
                            ? user.profile_picture
                            : `http://localhost:8000${user.profile_picture}`
                        }
                        alt="Profile picture"
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full object-cover border-2 border-purple-500/30 group-hover:border-purple-400/60 transition-colors duration-300"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm border-2 border-purple-500/30 group-hover:border-purple-400/60 transition-colors duration-300">
                        {user.user?.username?.[0]?.toUpperCase() || "?"}
                      </div>
                    )}
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-950" />
                  </div>
                  <span className="text-slate-300 font-medium group-hover:text-white transition-colors duration-300">
                    {user.user?.username}
                  </span>
                </Link>
              </div>
            )}
          </div>

          {/* Enhanced Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setOpen(!open)}
              className="relative p-2 text-purple-400 focus:outline-none rounded-lg hover:bg-slate-800/50 transition-all duration-300 group"
              aria-label={open ? "Close menu" : "Open menu"}
              tabIndex={0}
            >
              <div className="w-6 h-6 relative">
                <span
                  className={`absolute block w-full h-0.5 bg-current transform transition-all duration-300 ${open ? "rotate-45 top-3" : "top-1"}`}
                />
                <span
                  className={`absolute block w-full h-0.5 bg-current transform transition-all duration-300 top-3 ${open ? "opacity-0" : "opacity-100"}`}
                />
                <span
                  className={`absolute block w-full h-0.5 bg-current transform transition-all duration-300 ${open ? "-rotate-45 top-3" : "top-5"}`}
                />
              </div>
            </button>
          </div>
        </div>

        {/* Enhanced Mobile Menu */}
        <div
          className={`md:hidden bg-slate-900/98 backdrop-blur-xl border-t border-purple-500/20 transition-all duration-500 ease-out overflow-hidden ${
            open ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="px-4 py-6 space-y-4">
            {navLinks.map((link, index) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block py-3 px-4 font-medium rounded-xl transition-all duration-300 focus:outline-none transform hover:scale-[1.02] ${
                  link.cta
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                    : pathname === link.href
                      ? "bg-purple-500/20 text-purple-400 border-l-4 border-purple-500"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/50"
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => setOpen(false)}
                aria-current={pathname === link.href ? "page" : undefined}
                tabIndex={0}
              >
                {link.label}
              </Link>
            ))}

            {/* Mobile User Section */}
            {isAuthenticated && (
              <div className="border-t border-slate-800 pt-4 mt-4 space-y-4">
                <div className="flex items-center gap-3 px-4 py-3 bg-slate-800/30 rounded-xl">
                  <div className="relative">
                    {user.profile_picture ? (
                      <Image
                        src={
                          user.profile_picture.startsWith("http")
                            ? user.profile_picture
                            : `http://localhost:8000${user.profile_picture}`
                        }
                        alt="Profile picture"
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full object-cover border-2 border-purple-500/30"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                        {user.user?.username?.[0]?.toUpperCase() || "?"}
                      </div>
                    )}
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-950" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{user.user?.username}</p>
                    <p className="text-slate-400 text-sm">{isMentor ? "Mentor" : "Student"}</p>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full py-3 px-4 font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all duration-300 focus:outline-none text-left"
                  tabIndex={0}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  )
}
