"use client";

import { useTimer } from "@/context/TimerContext";
import { Clock, Flame, Trophy, Settings, LogOut, Activity, ShieldCheck } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from "react";
import { SettingsModal } from "@/components/SettingsModal";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { formattedTime, dailyUsage, streak, quizzesPassed } = useTimer();
  const { user: authUser, logout } = useAuth();
  const router = useRouter();
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  // Transform daily usage into an array and format for the chart
  const chartData = Object.entries(dailyUsage || {})
    .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
    .map(([date, seconds]) => {
      const d = new Date(date);
      return {
        date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        minutes: Math.round(seconds / 60),
      };
    });

  // Calculate Doomscrolling Prevented (Total Lifetime Minutes)
  const totalSecondsSaved = Object.values(dailyUsage || {}).reduce((acc, curr) => acc + curr, 0);
  const totalMinutesSaved = Math.round(totalSecondsSaved / 60);

  // State for user display
  const [user, setUser] = useState({
    name: "Alex Scholar",
    handle: "@alex_learns",
    joined: "March 2024",
    avatarInitials: "AS",
  });

  // Sync authUser to local user state
  useEffect(() => {
    if (authUser) {
      setUser({
        name: authUser.name,
        handle: authUser.handle,
        joined: authUser.joined,
        avatarInitials: authUser.avatarInitials,
      });
      setEditForm({
        name: authUser.name,
        handle: authUser.handle,
      });
    }
  }, [authUser]);

  const [editForm, setEditForm] = useState({
    name: user.name,
    handle: user.handle,
  });

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUser({
      ...user,
      name: editForm.name,
      handle: editForm.handle,
      avatarInitials: editForm.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() || "U",
    });
    setIsEditProfileOpen(false);
  };

  const stats = [
    { 
      label: "Doomscrolling Prevented", 
      value: `${totalMinutesSaved}m`, 
      icon: ShieldCheck, 
      color: "text-indigo-400",
      subtext: `Kamu telah menyelamatkan ${totalMinutesSaved} menit hidupmu dari doomscrolling sia-sia.`
    },
    { 
      label: "Quizzes Passed", 
      value: quizzesPassed.toString(), 
      icon: Trophy, 
      color: "text-amber-400",
      subtext: "Kuis pengetahuan yang berhasil dijawab dengan tepat."
    },
  ];

  return (
    <div className="min-h-full bg-slate-50 dark:bg-slate-950 p-6 pb-24 md:p-10 md:pb-10 text-slate-900 dark:text-slate-50 transition-colors duration-300">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Section */}
        <header className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors bg-white dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm"
          >
            <Settings className="w-5 h-5" />
          </button>
        </header>

        {/* User Card */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6 shadow-sm relative overflow-hidden">
          {/* Background glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/20 blur-3xl rounded-full" />
          
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-1 shrink-0 relative z-10">
            <div className="w-full h-full bg-slate-50 dark:bg-slate-950 rounded-full flex items-center justify-center border-4 border-white dark:border-slate-900">
              <span className="text-2xl font-bold">{user.avatarInitials}</span>
            </div>
          </div>
          
          <div className="flex-1 text-center md:text-left relative z-10">
            <h2 className="text-2xl font-bold">{user.name}</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium">{user.handle}</p>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-2">Joined {user.joined}</p>
          </div>

          <div className="flex flex-col gap-4 justify-center items-center md:items-end relative z-10 mt-4 md:mt-0">
            <button
              onClick={() => {
                setEditForm({ name: user.name, handle: user.handle });
                setIsEditProfileOpen(true);
              }}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-xl font-medium transition-colors text-sm w-full md:w-auto"
            >
              Edit Profile
            </button>
            <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 px-4 py-2 rounded-2xl flex items-center gap-2 font-semibold">
              <Flame className="w-5 h-5 fill-amber-400" />
              {streak} Day Streak
            </div>
          </div>
        </section>

        {/* Grid Layout for Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Live Usage Dashboard (Spans 2 columns on desktop) */}
          <section className="md:col-span-2 bg-gradient-to-br from-white dark:from-slate-900 to-slate-50 dark:to-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm relative overflow-hidden group">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] z-0" />
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-teal-50 dark:bg-teal-500/10 rounded-2xl">
                  <Clock className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-200">Live Usage</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Current mindful session</p>
                </div>
              </div>
              
              <div className="mt-4">
                <p className="text-5xl md:text-6xl font-light tracking-tight text-slate-900 dark:text-white drop-shadow-sm font-mono">
                  {formattedTime}
                </p>
                <div className="mt-6 flex items-center gap-2 text-sm text-teal-400/80 font-medium">
                  <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                  Actively tracking your focused learning
                </div>
              </div>
            </div>
          </section>

          {/* Additional Stats */}
          <section className="space-y-6">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex items-start gap-4 shadow-sm">
                  <div className={`p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 ${stat.color} shrink-0`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                    <p className="text-sm text-slate-700 dark:text-slate-300 font-bold mb-1">{stat.label}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pr-2">
                      {stat.subtext}
                    </p>
                  </div>
                </div>
              );
            })}
          </section>
        </div>

        {/* Daily Usage Chart */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl">
              <Activity className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-200">Daily Focus Time</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Total active minutes spent learning per day</p>
            </div>
          </div>
          
          <div className="h-72 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis 
                  dataKey="date" 
                  stroke="#475569" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  dy={10} 
                />
                <YAxis 
                  stroke="#475569" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(val) => `${val}m`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    borderColor: '#1e293b', 
                    borderRadius: '1rem', 
                    color: '#f8fafc',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                  }}
                  itemStyle={{ color: '#818cf8', fontWeight: 600 }}
                  labelStyle={{ color: '#94a3b8', marginBottom: '0.25rem' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="minutes" 
                  name="Minutes"
                  stroke="#818cf8" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorMinutes)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="pt-6">
          <button 
            onClick={() => {
              logout();
              router.push("/login");
            }}
            className="flex items-center gap-2 text-rose-500 dark:text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 font-medium px-4 py-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </section>
      </div>
      
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      {/* Edit Profile Modal */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm transition-opacity">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 w-full max-w-md shadow-xl border border-slate-200 dark:border-slate-800">
            <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">Edit Profile</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-900 dark:text-white transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Handle</label>
                <input
                  type="text"
                  value={editForm.handle}
                  onChange={(e) => setEditForm({ ...editForm, handle: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-900 dark:text-white transition-all"
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-medium transition-colors shadow-sm shadow-indigo-500/20"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
