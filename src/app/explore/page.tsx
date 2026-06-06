"use client";

import { Search, Rocket, Cpu, TrendingUp, Brain, BookOpen, Palette } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

const categories = [
  {
    id: "science",
    title: "Science & Space",
    query: "science facts space exploration",
    icon: Rocket,
    color: "from-blue-500 to-cyan-400",
  },
  {
    id: "tech",
    title: "Tech & Innovation",
    query: "coding tips future tech",
    icon: Cpu,
    color: "from-indigo-500 to-purple-500",
  },
  {
    id: "finance",
    title: "Personal Finance & Productivity",
    query: "money habits productivity hacks",
    icon: TrendingUp,
    color: "from-emerald-500 to-teal-400",
  },
  {
    id: "neuroscience",
    title: "Neuroscience & Mental Health",
    query: "how the brain works",
    icon: Brain,
    color: "from-rose-500 to-pink-500",
  },
  {
    id: "history",
    title: "History & Philosophy",
    query: "stoicism history facts",
    icon: BookOpen,
    color: "from-amber-500 to-orange-400",
  },
  {
    id: "art",
    title: "Art, Culture & Design",
    query: "art history architecture design",
    icon: Palette,
    color: "from-fuchsia-500 to-violet-500",
  },
];

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCategories = categories.filter(category => 
    category.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    category.query.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-full bg-slate-50 dark:bg-slate-950 p-6 pb-24 md:p-10 md:pb-10 text-slate-900 dark:text-slate-50 transition-colors duration-300">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header & Search */}
        <section className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Explore</h1>
            <p className="text-slate-500 dark:text-slate-400">Discover new topics to learn today.</p>
          </div>

          <div className="relative max-w-2xl">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-500" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-11 pr-4 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-sm"
              placeholder="Search categories..."
            />
          </div>
        </section>

        {/* Categories Grid */}
        <section className="space-y-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-200">Educational Categories</h2>
          {filteredCategories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCategories.map((category) => {
              const Icon = category.icon;
              return (
                <Link
                  href={`/?q=${encodeURIComponent(category.query)}`}
                  key={category.id}
                  className="group relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50"
                >
                  <div className={`absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity bg-gradient-to-br ${category.color} blur-2xl rounded-full translate-x-1/3 -translate-y-1/3`} />
                  
                  <div className="relative z-10 space-y-4">
                    <div className={`inline-flex p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 shadow-inner border border-slate-100 dark:border-slate-800/50`}>
                      <Icon className="w-6 h-6 text-slate-500 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-white transition-colors">
                        {category.title}
                      </h3>
                      <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                        Topics like {category.query.split(" ").join(", ")}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-500 dark:text-slate-400">No categories found matching "{searchQuery}"</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
