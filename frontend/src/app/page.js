"use client"

import { useRef } from "react"
import Link from "next/link"
import { FadeIn, ScaleIn, HoverCard, AnimatedCounter } from "../components/LightweightAnimations"
import { Sparkles, Zap, Target, Shield, Globe, Crown, ArrowRight, Star, Users, TrendingUp } from "lucide-react"

// Enhanced Animated Background Component
function AnimatedBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Enhanced Gradient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/8 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-500/6 rounded-full blur-3xl animate-pulse delay-1000" />
      <div className="absolute top-3/4 left-3/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-2000" />

      {/* Enhanced SVG */}
      <svg
        className="absolute inset-0 w-full h-full opacity-10"
        viewBox="0 0 1000 1000"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="grad1" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#ec4899" stopOpacity="0.1" />
          </radialGradient>
          <radialGradient id="grad2" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.05" />
          </radialGradient>
        </defs>
        <circle cx="200" cy="200" r="120" fill="url(#grad1)">
          <animate attributeName="r" values="120;150;120" dur="8s" repeatCount="indefinite" />
        </circle>
        <circle cx="800" cy="300" r="100" fill="url(#grad2)">
          <animate attributeName="r" values="100;130;100" dur="10s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, description, delay = 0, color = "purple" }) {
  const colorClasses = {
    purple: "from-purple-500/12 to-violet-500/8 border-purple-500/30 hover:border-purple-400/50",
    pink: "from-pink-500/12 to-rose-500/8 border-pink-500/30 hover:border-pink-400/50",
    blue: "from-blue-500/12 to-cyan-500/8 border-blue-500/30 hover:border-blue-400/50",
    amber: "from-amber-500/12 to-yellow-500/8 border-amber-500/30 hover:border-amber-400/50",
    emerald: "from-emerald-500/12 to-teal-500/8 border-emerald-500/30 hover:border-emerald-400/50",
  }

  return (
    <FadeIn delay={delay}>
      <HoverCard
        className={`group relative overflow-hidden bg-gradient-to-br ${colorClasses[color]} backdrop-blur-xl rounded-2xl p-6 md:p-7 border transition-all duration-700 hover:scale-[1.03] hover:-translate-y-2 shadow-xl hover:shadow-purple-500/20`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-4 right-4 w-2 h-2 bg-white/20 rounded-full animate-pulse"></div>
          <div className="absolute bottom-6 left-6 w-1 h-1 bg-white/30 rounded-full animate-ping delay-300"></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-center w-13 h-13 md:w-14 md:h-14 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl mb-5 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
            <Icon className="w-6 h-6 md:w-7 md:h-7 text-purple-400 group-hover:animate-pulse" />
          </div>
          <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            {title}
          </h3>
          <p className="text-slate-400 leading-relaxed text-sm md:text-base">{description}</p>
        </div>
      </HoverCard>
    </FadeIn>
  )
}

function StatsCard({ number, label, delay = 0, icon: Icon }) {
  return (
    <FadeIn delay={delay}>
      <div className="group text-center p-4 md:p-5 rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-900/30 backdrop-blur-xl border border-slate-700/50 hover:border-purple-500/40 transition-all duration-500 hover:scale-[1.03] hover:-translate-y-1">
        <ScaleIn delay={delay + 0.2}>
          <div className="flex items-center justify-center mb-3 md:mb-4">
            <Icon className="w-5 h-5 md:w-6 md:h-6 text-purple-400 mr-2 group-hover:animate-pulse" />
            <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-500">
              <AnimatedCounter end={number} suffix={label.includes("%") ? "%" : label.includes("+") ? "+" : ""} />
            </div>
          </div>
        </ScaleIn>
        <div className="text-slate-400 text-sm md:text-base font-semibold">{label.replace(/[0-9+%]/g, "")}</div>
      </div>
    </FadeIn>
  )
}

// Enhanced CTA Button Component
function CTAButton({ href, children, variant = "primary", className = "", icon: Icon }) {
  return (
    <HoverCard>
      <Link
        href={href}
        className={`group relative inline-flex items-center justify-center px-8 py-4 text-base md:text-lg font-bold rounded-xl shadow-2xl overflow-hidden transition-all duration-500 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-500/50 ${className} ${
          variant === "primary"
            ? "text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-purple-500/50"
            : "text-purple-300 border-2 border-purple-500/50 hover:border-purple-400 hover:bg-purple-500/10 backdrop-blur-xl"
        }`}
      >
        <span className="relative z-10 flex items-center gap-2">
          {Icon && <Icon className="w-5 h-5 group-hover:animate-pulse" />}
          {children}
          <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
        </span>
        {variant === "primary" && (
          <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        )}
      </Link>
    </HoverCard>
  )
}

export default function Home() {
  const containerRef = useRef(null)

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-purple-950/30 to-slate-950"
    >
      {/* Enhanced Background */}
      <div className="fixed inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950/30 to-slate-950"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,198,0.12),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,105,180,0.08),transparent_50%)]"></div>
      </div>

      <AnimatedBackground />

      {/* Enhanced Hero Section */}
      <section className="relative z-10 min-h-screen flex items-center justify-center px-6 py-16">
        <div className="max-w-7xl mx-auto text-center">
          <FadeIn delay={0}>
            <div className="mb-6 md:mb-8">
              <span className="inline-flex items-center gap-2 px-4 py-2 md:px-5 md:py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full text-purple-300 text-sm md:text-base font-bold border border-purple-500/40 backdrop-blur-xl shadow-lg animate-pulse">
                <Sparkles className="w-4 h-4 md:w-5 md:h-5 animate-bounce" />
                Transform Your Career Today
                <Zap className="w-4 h-4 md:w-5 md:h-5 text-amber-400 animate-pulse" />
              </span>
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 md:mb-8 leading-tight">
              <span className="bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
                Unlock Your
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 bg-clip-text text-transparent animate-pulse">
                Potential
              </span>
            </h1>
          </FadeIn>

          <FadeIn delay={0.4}>
            <p className="text-lg md:text-xl lg:text-2xl text-slate-300 mb-10 md:mb-12 max-w-4xl mx-auto leading-relaxed">
              Connect with world-class mentors and accelerate your growth. Get personalized guidance from industry
              experts who&apos;ve been where you want to go.
            </p>
          </FadeIn>

          <FadeIn delay={0.6}>
            <div className="flex flex-col sm:flex-row gap-4 md:gap-5 justify-center items-center mb-12 md:mb-16">
              <CTAButton href="/mentors" variant="primary" icon={Target}>
                Find Your Mentor
              </CTAButton>
              <CTAButton href="/how-it-works" variant="secondary" icon={Shield}>
                How It Works
              </CTAButton>
            </div>
          </FadeIn>

          {/* Enhanced Stats */}
          <FadeIn delay={0.8}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto">
              <StatsCard number={10000} label="Active Mentors+" delay={0} icon={Users} />
              <StatsCard number={50000} label="Success Stories+" delay={0.1} icon={Star} />
              <StatsCard number={95} label="Satisfaction Rate%" delay={0.2} icon={TrendingUp} />
              <StatsCard number={24} label="7 Support" delay={0.3} icon={Shield} />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="relative z-10 py-16 md:py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <div className="text-center mb-12 md:mb-16">
              <div className="flex items-center justify-center gap-2 md:gap-3 mb-4 md:mb-6">
                <Crown className="w-6 h-6 md:w-7 md:h-7 text-amber-400 animate-bounce" />
                <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-purple-400 animate-pulse" />
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">
                <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                  Why Choose
                </span>
                <br />
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  MentorConnect?
                </span>
              </h2>
              <p className="text-lg md:text-xl text-slate-400 max-w-4xl mx-auto leading-relaxed">
                We&apos;ve built the most comprehensive mentorship platform to help you achieve your goals faster.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <FeatureCard
              icon={Target}
              title="Personalized Matching"
              description="Our AI-powered algorithm connects you with mentors who perfectly align with your goals and learning style."
              delay={0}
              color="purple"
            />
            <FeatureCard
              icon={Zap}
              title="Instant Booking"
              description="Schedule sessions in seconds with our streamlined booking system. No back-and-forth emails."
              delay={0.1}
              color="pink"
            />
            <FeatureCard
              icon={Crown}
              title="Proven Results"
              description="Join thousands of professionals who've accelerated their careers with expert guidance."
              delay={0.2}
              color="amber"
            />
            <FeatureCard
              icon={Sparkles}
              title="Premium Experience"
              description="Enjoy crystal-clear video calls, session recordings, and progress tracking."
              delay={0.3}
              color="blue"
            />
            <FeatureCard
              icon={Globe}
              title="Global Network"
              description="Access mentors from top companies worldwide - Google, Apple, Microsoft, and more."
              delay={0.4}
              color="emerald"
            />
            <FeatureCard
              icon={Shield}
              title="Secure & Private"
              description="Your conversations are protected with enterprise-grade security."
              delay={0.5}
              color="purple"
            />
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="relative z-10 py-16 md:py-20 px-6">
        <ScaleIn>
          <div className="max-w-5xl mx-auto text-center relative overflow-hidden bg-gradient-to-br from-slate-900/90 via-slate-800/70 to-slate-900/90 backdrop-blur-xl rounded-2xl p-8 md:p-12 border border-purple-500/30 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-transparent to-pink-600/10"></div>

            {/* Floating particles */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-6 right-6 w-2 h-2 bg-purple-400/30 rounded-full animate-pulse"></div>
              <div className="absolute bottom-8 left-8 w-1.5 h-1.5 bg-pink-400/40 rounded-full animate-ping delay-500"></div>
              <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-amber-400/20 rounded-full animate-bounce delay-1000"></div>
            </div>

            <div className="relative z-10">
              <div className="flex items-center justify-center gap-3 mb-6 md:mb-8">
                <Sparkles className="w-6 h-6 md:w-7 md:h-7 text-amber-400 animate-bounce" />
                <Crown className="w-6 h-6 md:w-7 md:h-7 text-purple-400 animate-pulse" />
              </div>

              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                Ready to Transform Your Career?
              </h2>
              <p className="text-lg md:text-xl text-slate-400 mb-8 md:mb-10 max-w-3xl mx-auto leading-relaxed">
                Join thousands of ambitious professionals who are already accelerating their growth with world-class
                mentorship.
              </p>
              <CTAButton href="/register" variant="primary" className="text-lg px-10 py-5" icon={Zap}>
                Get Started Today
              </CTAButton>
            </div>
          </div>
        </ScaleIn>
      </section>
    </div>
  )
}
