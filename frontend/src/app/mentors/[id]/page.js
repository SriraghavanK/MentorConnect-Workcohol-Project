"use client";
import { useParams } from "next/navigation";
import useSWR from "swr";
import Link from "next/link";
import Image from "next/image";
import { Star, Users, Clock, MapPin } from "lucide-react";

const fetchMentor = async (id) => {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
  const res = await fetch(`${API_BASE_URL}/mentors/${id}/`);
  if (!res.ok) throw new Error("Failed to fetch mentor");
  return res.json();
};

export default function MentorProfilePage() {
  const { id } = useParams();
  const { data: mentor, error, isLoading } = useSWR(id ? id : null, fetchMentor);

  if (isLoading) return <div className="text-center py-12 text-slate-400">Loading...</div>;
  if (error) return (
    <div className="text-center py-12 text-red-400">
      Failed to load mentor profile.<br />
      <Link href="/mentors" className="text-purple-400 hover:underline">Back to Mentors List</Link>
    </div>
  );
  if (!mentor) return (
    <div className="text-center py-12 text-slate-400">
      No mentor found.<br />
      <Link href="/mentors" className="text-purple-400 hover:underline">Back to Mentors List</Link>
    </div>
  );

  const mentorName = mentor.user ? `${mentor.user.first_name} ${mentor.user.last_name}` : "Unknown Mentor";
  const mentorBio = mentor.bio || "No bio available";
  const mentorExpertise = mentor.expertise || [];
  const mentorPrice = mentor.hourly_rate || 0;
  const mentorRating = mentor.rating || 0;
  const mentorReviews = mentor.review_count || 0;
  const mentorLocation = mentor.location || "Remote";
  const mentorAvailability = mentor.availability || "Flexible";
  const mentorSessions = mentor.sessions_completed || 0;
  const profilePic = mentor.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(mentorName)}&background=f59e0b&color=fff&size=128`;

  return (
    <div className="max-w-2xl mx-auto p-8 bg-slate-900 rounded-2xl mt-12 shadow-lg border border-purple-500/20">
      <div className="flex flex-col items-center mb-6">
        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-purple-400 mb-4 bg-slate-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={profilePic} alt={mentorName} className="w-full h-full object-cover" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-1">{mentorName}</h1>
        <span className="text-purple-300 text-sm font-semibold bg-purple-500/10 px-3 py-1 rounded-full">
          Mentor Profile
        </span>
      </div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white mb-2">Bio</h2>
        <p className="text-slate-300">{mentorBio}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-800 rounded-xl p-4 flex items-center gap-3">
          <Users className="w-6 h-6 text-purple-400" />
          <div>
            <div className="text-slate-400 text-xs">Sessions</div>
            <div className="text-white font-semibold">{mentorSessions}</div>
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 flex items-center gap-3">
          <Clock className="w-6 h-6 text-pink-400" />
          <div>
            <div className="text-slate-400 text-xs">Availability</div>
            <div className="text-white font-semibold">{mentorAvailability}</div>
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 flex items-center gap-3">
          <Star className="w-6 h-6 text-gold" />
          <div>
<div className="text-white font-semibold">
  {typeof mentorRating === "number" && !isNaN(mentorRating)
    ? mentorRating.toFixed(1)
    : "0.0"}{" "}
  <span className="text-xs text-slate-400">({mentorReviews} reviews)</span>
</div>
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 flex items-center gap-3">
          <MapPin className="w-6 h-6 text-blue-400" />
          <div>
            <div className="text-slate-400 text-xs">Location</div>
            <div className="text-white font-semibold">{mentorLocation}</div>
          </div>
        </div>
      </div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white mb-2">Expertise</h2>
        <div className="flex flex-wrap gap-2">
          {mentorExpertise.length > 0 ? mentorExpertise.map(exp => (
            <span key={exp.id} className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full font-medium">
              {exp.name}
            </span>
          )) : <span className="text-slate-400">No expertise listed</span>}
        </div>
      </div>
      <div className="flex justify-between items-center mt-8">
        <Link href="/mentors" className="text-purple-400 hover:underline">← Back to Mentors List</Link>
        <Link
          href={`/book/${mentor.id}`}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 px-6 rounded-xl font-bold shadow-lg hover:shadow-purple-500/50 transition-all"
        >
          Book Session
        </Link>
      </div>
    </div>
  );
}