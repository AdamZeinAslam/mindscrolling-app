"use client";

import { useTheme } from "next-themes";
import { Moon, Sun, Monitor, X, PlayCircle, Wifi, Bell, Shield, ChevronRight, Activity } from "lucide-react";
import { useEffect, useState } from "react";
import { useTimer } from "@/context/TimerContext";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { theme, setTheme } = useTheme();
  const { pauseInterval, setPauseInterval, pauseDuration, setPauseDuration, quizInterval, setQuizInterval } = useTimer();
  const [mounted, setMounted] = useState(false);
  const [pendingTheme, setPendingTheme] = useState<string | undefined>(theme);
  const [pendingPauseInterval, setPendingPauseInterval] = useState(pauseInterval);
  const [pendingPauseDuration, setPendingPauseDuration] = useState(pauseDuration);
  const [pendingQuizInterval, setPendingQuizInterval] = useState(quizInterval);
  const [autoplay, setAutoplay] = useState(true);
  const [dataSaver, setDataSaver] = useState(false);
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setPendingTheme(theme);
      setPendingPauseInterval(pauseInterval);
      setPendingPauseDuration(pauseDuration);
      setPendingQuizInterval(quizInterval);
    }
  }, [isOpen, theme, pauseInterval, pauseDuration, quizInterval]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-sm transition-opacity">
      <div 
        className="w-full sm:max-w-md bg-white dark:bg-slate-900 border-t sm:border border-slate-200 dark:border-slate-800 sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-10 fade-in duration-300"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Settings</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-2 overflow-y-auto no-scrollbar">
          
          {/* Display & Appearance */}
          <div className="p-3">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-2">Display</h3>
            <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800/50 overflow-hidden">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-500/10 rounded-xl text-indigo-600 dark:text-indigo-400">
                    {theme === 'dark' ? <Moon className="w-5 h-5" /> : theme === 'light' ? <Sun className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-200">Theme</p>
                    <p className="text-xs text-slate-500">Light or dark screen</p>
                  </div>
                </div>
                {mounted && (
                  <div className="flex bg-slate-200 dark:bg-slate-800 rounded-lg p-1 gap-1">
                    <button 
                      onClick={() => setPendingTheme('light')}
                      className={`p-1.5 rounded-md transition-colors ${pendingTheme === 'light' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}
                    >
                      <Sun className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setPendingTheme('dark')}
                      className={`p-1.5 rounded-md transition-colors ${pendingTheme === 'dark' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}
                    >
                      <Moon className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Playback & Content */}
          <div className="p-3">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-2">Playback & Cellular</h3>
            <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800/50 overflow-hidden flex flex-col divide-y divide-slate-100 dark:divide-slate-800/50">
              
              {/* Autoplay */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-teal-100 dark:bg-teal-500/10 rounded-xl text-teal-600 dark:text-teal-400">
                    <PlayCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-200">Autoplay Next Video</p>
                    <p className="text-xs text-slate-500">Play continuously</p>
                  </div>
                </div>
                <button 
                  onClick={() => setAutoplay(!autoplay)}
                  className={`w-11 h-6 rounded-full transition-colors relative flex items-center ${autoplay ? 'bg-teal-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                >
                  <span className={`w-4 h-4 rounded-full bg-white absolute transition-transform ${autoplay ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              {/* Data Saver */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-500/10 rounded-xl text-blue-600 dark:text-blue-400">
                    <Wifi className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-200">Data Saver</p>
                    <p className="text-xs text-slate-500">Lower video resolution</p>
                  </div>
                </div>
                <button 
                  onClick={() => setDataSaver(!dataSaver)}
                  className={`w-11 h-6 rounded-full transition-colors relative flex items-center ${dataSaver ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                >
                  <span className={`w-4 h-4 rounded-full bg-white absolute transition-transform ${dataSaver ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Well-being */}
          <div className="p-3">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-2">Well-being</h3>
            <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800/50 overflow-hidden">
              <div className="p-4 flex flex-col gap-3">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-rose-100 dark:bg-rose-500/10 rounded-xl text-rose-600 dark:text-rose-400">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-200">Active Pause Interval</p>
                    <p className="text-xs text-slate-500">Remind me to stretch every</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[5, 10, 15, 20, 25, 30].map((mins) => (
                    <button
                      key={mins}
                      onClick={() => setPendingPauseInterval(mins)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        pendingPauseInterval === mins 
                          ? 'bg-indigo-600 text-white shadow-sm' 
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>

                <hr className="my-2 border-slate-100 dark:border-slate-800" />

                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-teal-100 dark:bg-teal-500/10 rounded-xl text-teal-600 dark:text-teal-400">
                    <PlayCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-200">Break Duration</p>
                    <p className="text-xs text-slate-500">How long you stretch</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[60, 180, 300, 600, 900].map((secs) => (
                    <button
                      key={secs}
                      onClick={() => setPendingPauseDuration(secs)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        pendingPauseDuration === secs 
                          ? 'bg-teal-600 text-white shadow-sm' 
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
                      }`}
                    >
                      {secs / 60}m
                    </button>
                  ))}
                </div>

                <hr className="my-2 border-slate-100 dark:border-slate-800" />

                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-500/10 rounded-xl text-indigo-600 dark:text-indigo-400">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-200">Comprehension Check</p>
                    <p className="text-xs text-slate-500">Quiz after every X videos</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[5, 10, 15, 20].map((vids) => (
                    <button
                      key={vids}
                      onClick={() => setPendingQuizInterval(vids)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        pendingQuizInterval === vids 
                          ? 'bg-indigo-600 text-white shadow-sm' 
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
                      }`}
                    >
                      {vids} video
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Account */}
          <div className="p-3">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-2">Account & Privacy</h3>
            <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800/50 overflow-hidden flex flex-col divide-y divide-slate-100 dark:divide-slate-800/50">
              
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-rose-100 dark:bg-rose-500/10 rounded-xl text-rose-600 dark:text-rose-400">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-200">Push Notifications</p>
                    <p className="text-xs text-slate-500">Daily learning reminders</p>
                  </div>
                </div>
                <button 
                  onClick={() => setNotifications(!notifications)}
                  className={`w-11 h-6 rounded-full transition-colors relative flex items-center ${notifications ? 'bg-rose-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                >
                  <span className={`w-4 h-4 rounded-full bg-white absolute transition-transform ${notifications ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              <button 
                onClick={() => alert("Demo Kebijakan Privasi:\n\nNalar dirancang untuk kesejahteraan mental Anda. Kami berjanji tidak mengumpulkan data untuk keperluan iklan yang memicu doomscrolling.")}
                className="p-4 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-900/50 transition-colors w-full text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 dark:bg-amber-500/10 rounded-xl text-amber-600 dark:text-amber-400">
                    <Shield className="w-5 h-5" />
                  </div>
                  <p className="font-medium text-slate-900 dark:text-slate-200">Privacy Policy</p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 mt-auto">
          <button 
            onClick={() => {
              if (pendingTheme) setTheme(pendingTheme);
              setPauseInterval(pendingPauseInterval);
              setPauseDuration(pendingPauseDuration);
              setQuizInterval(pendingQuizInterval);
              onClose();
            }}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all active:scale-95"
          >
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  );
}
