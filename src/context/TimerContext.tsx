"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { ActivePauseModal } from "@/components/ActivePauseModal";

export interface TimerContextType {
  seconds: number;
  formattedTime: string;
  isActive: boolean;
  dailyUsage: Record<string, number>;
  pauseInterval: number;
  setPauseInterval: (interval: number) => void;
  pauseDuration: number;
  setPauseDuration: (duration: number) => void;
  streak: number;
  quizInterval: number;
  setQuizInterval: (interval: number) => void;
  quizzesPassed: number;
  incrementQuizzesPassed: () => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [dailyUsage, setDailyUsage] = useState<Record<string, number>>({});
  const [isActivePauseOpen, setIsActivePauseOpen] = useState(false);
  const [pauseInterval, setPauseInterval] = useState(30);
  const [pauseDuration, setPauseDuration] = useState(60); // in seconds
  const [streak, setStreak] = useState(0);
  const [quizInterval, setQuizInterval] = useState(5); // Show quiz every 5 videos
  const [quizzesPassed, setQuizzesPassed] = useState(0);

  // Load pause interval and duration from localStorage on mount
  useEffect(() => {
    const storedInterval = localStorage.getItem("nalar_pause_interval");
    if (storedInterval) {
      setPauseInterval(parseInt(storedInterval, 10));
    }
    const storedDuration = localStorage.getItem("nalar_pause_duration");
    if (storedDuration) {
      setPauseDuration(parseInt(storedDuration, 10));
    }
    const storedQuiz = localStorage.getItem("nalar_quiz_interval");
    if (storedQuiz) {
      setQuizInterval(parseInt(storedQuiz, 10));
    }
    const storedQuizzesPassed = localStorage.getItem("nalar_quizzes_passed");
    if (storedQuizzesPassed) {
      setQuizzesPassed(parseInt(storedQuizzesPassed, 10));
    }
  }, []);

  // Update localStorage when pauseInterval or pauseDuration changes
  useEffect(() => {
    localStorage.setItem("nalar_pause_interval", pauseInterval.toString());
  }, [pauseInterval]);

  useEffect(() => {
    localStorage.setItem("nalar_pause_duration", pauseDuration.toString());
  }, [pauseDuration]);

  useEffect(() => {
    localStorage.setItem("nalar_quiz_interval", quizInterval.toString());
  }, [quizInterval]);

  const incrementQuizzesPassed = () => {
    setQuizzesPassed((prev) => {
      const newVal = prev + 1;
      localStorage.setItem("nalar_quizzes_passed", newVal.toString());
      return newVal;
    });
  };

  // Trigger active pause based on chosen interval (in minutes)
  useEffect(() => {
    const targetSeconds = pauseInterval * 60;
    if (seconds > 0 && targetSeconds > 0 && seconds % targetSeconds === 0) {
      setIsActivePauseOpen(true);
    }
  }, [seconds, pauseInterval]);

  // Load daily usage from localStorage or generate mock data
  useEffect(() => {
    const stored = localStorage.getItem("nalar_daily_usage");
    if (stored) {
      setDailyUsage(JSON.parse(stored));
    } else {
      const mockData: Record<string, number> = {};
      const today = new Date();
      for (let i = 6; i >= 1; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        mockData[dateStr] = Math.floor(Math.random() * 1800) + 600; // 10 to 40 mins
      }
      setDailyUsage(mockData);
    }
  }, []);

  // Calculate streak based on dailyUsage
  useEffect(() => {
    const dates = Object.keys(dailyUsage).filter(d => dailyUsage[d] > 0).sort().reverse();
    if (dates.length === 0) {
      setStreak(0);
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (dates[0] !== todayStr && dates[0] !== yesterdayStr) {
      setStreak(0);
      return;
    }

    let currentStreak = 0;
    const checkDate = new Date(dates[0]); // UTC midnight
    
    for (const dateStr of dates) {
      const expectedStr = checkDate.toISOString().split('T')[0];
      if (dateStr === expectedStr) {
        currentStreak++;
        checkDate.setUTCDate(checkDate.getUTCDate() - 1);
      } else {
        break;
      }
    }
    setStreak(currentStreak);
  }, [dailyUsage]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
        
        // Update daily usage
        const todayStr = new Date().toISOString().split('T')[0];
        setDailyUsage((prev) => {
          const updated = {
            ...prev,
            [todayStr]: (prev[todayStr] || 0) + 1
          };
          localStorage.setItem("nalar_daily_usage", JSON.stringify(updated));
          return updated;
        });
      }, 1000);
    } else if (!isActive && interval) {
      clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins} mins ${secs} secs`;
  };

  const value = {
    seconds,
    formattedTime: formatTime(seconds),
    isActive,
    dailyUsage,
    pauseInterval,
    setPauseInterval,
    pauseDuration,
    setPauseDuration,
    streak,
    quizInterval,
    setQuizInterval,
    quizzesPassed,
    incrementQuizzesPassed,
  };

  return (
    <TimerContext.Provider value={value}>
      {children}
      <ActivePauseModal 
        isOpen={isActivePauseOpen} 
        onClose={() => setIsActivePauseOpen(false)} 
        duration={pauseDuration}
      />
    </TimerContext.Provider>
  );
}

export function useTimer() {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error("useTimer must be used within a TimerProvider");
  }
  return context;
}
