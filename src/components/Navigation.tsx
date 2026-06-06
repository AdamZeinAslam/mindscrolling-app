"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Home, Compass, User, LogIn } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

function NavigationContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasQuery = searchParams.has('q');
  const { isAuthenticated } = useAuth();
  
  // Need this to avoid hydration mismatch on initial render
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  const navItems = [
    { 
      name: "Home", 
      href: "/", 
      icon: Home,
      isActive: pathname === '/' && !hasQuery
    },
    { 
      name: "Explore", 
      href: "/explore", 
      icon: Compass,
      isActive: pathname === '/explore' || (pathname === '/' && hasQuery)
    },
    { 
      name: "Profile", 
      href: "/profile", 
      icon: User,
      isActive: pathname === '/profile'
    },
    // Temporarily adding Login to easily access it during dev
    { 
      name: "Login", 
      href: "/login", 
      icon: LogIn,
      isActive: pathname === '/login'
    },
  ].filter(item => {
    if (item.name === "Login") {
      return !isAuthenticated || !isMounted;
    }
    return true;
  });

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full h-16 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex justify-around items-center z-50">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                item.isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <Icon size={24} strokeWidth={item.isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Desktop Sidebar Navigation */}
      <nav className="hidden md:flex fixed left-0 top-0 h-screen w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex-col py-8 z-50">
        <div className="px-8 mb-10">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
            Nalar
          </h1>
        </div>

        <ul className="flex-1 px-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center space-x-4 px-4 py-3 rounded-xl transition-all duration-200 ${
                    item.isActive
                      ? "bg-indigo-50 dark:bg-slate-800/50 text-indigo-600 dark:text-indigo-400 shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/30 dark:hover:text-slate-200"
                  }`}
                >
                  <Icon size={24} strokeWidth={item.isActive ? 2.5 : 2} />
                  <span className="font-medium text-base">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}

export function Navigation() {
  return (
    <Suspense fallback={null}>
      <NavigationContent />
    </Suspense>
  );
}
