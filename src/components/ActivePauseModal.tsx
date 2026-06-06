"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import stretchAnimation from "../../public/stretch.json";

// Dynamically import Lottie to avoid SSR issues
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

interface ActivePauseModalProps {
  isOpen: boolean;
  onClose: () => void;
  duration?: number;
}

export function ActivePauseModal({ isOpen, onClose, duration = 60 }: ActivePauseModalProps) {
  const [countdown, setCountdown] = useState(duration);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen) {
      setCountdown(duration); // Reset to duration only when opened
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            onClose();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]); // Only re-run when isOpen changes, to avoid resetting timer when parent re-renders

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md transition-opacity">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800 text-center relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-teal-500/20 blur-3xl rounded-full" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-500/20 blur-3xl rounded-full" />

        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-2 text-slate-900 dark:text-white">Active Pause</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">Take a moment to stretch and rest your eyes.</p>
          
          <div className="w-64 h-64 mx-auto bg-slate-50 dark:bg-slate-800/50 rounded-2xl mb-6 flex items-center justify-center">
            <Lottie animationData={stretchAnimation} loop={true} className="w-full h-full" />
          </div>

          <div className="text-4xl font-mono font-light text-teal-600 dark:text-teal-400 mb-8">
            {Math.floor(countdown / 60).toString().padStart(2, "0")}:{ (countdown % 60).toString().padStart(2, "0")}
          </div>
        </div>
      </div>
    </div>
  );
}
