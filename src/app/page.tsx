"use client";

import React, { useEffect, useState, useRef, Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, X, Loader2, RefreshCcw, Sparkles, ChevronUp, ChevronDown, Accessibility, Volume2, VolumeX } from 'lucide-react';
import YouTube, { YouTubeEvent } from 'react-youtube';
import { useTimer } from '@/context/TimerContext';
import { QuizModal } from '@/components/QuizModal';

type Video = {
  video_id: string;
  title: string;
  reason: string;
  topic: string;
};

type CurationResponse = {
  processed_count: number;
  approved_count: number;
  next_page_token?: string;
  videos: Video[];
};

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 dark:bg-slate-900 w-full flex items-center justify-center"><Loader2 className="w-12 h-12 animate-spin text-teal-500 dark:text-teal-400" /></div>}>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const [isMounted, setIsMounted] = useState(false);
  const searchParams = useSearchParams();
  const queryParam = searchParams.get('q');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  // Initialize videos and loading after mount to avoid hydration mismatch
  useEffect(() => {
    setVideos([]);
    setLoading(true);
  }, [queryParam]);

  const [error, setError] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [expandedDesc, setExpandedDesc] = useState(false);
  const [maxIndexReached, setMaxIndexReached] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const { quizInterval } = useTimer();

  // Infinite Scroll State
  const [nextPageToken, setNextPageToken] = useState<string | undefined>(undefined);
  const [isFetchingMore, setIsFetchingMore] = useState(true); // Start true since we fetch on mount

  // Active Pause State
  const [showPause, setShowPause] = useState(false);
  const [pauseTimer, setPauseTimer] = useState(60);
  const [timeSpent, setTimeSpent] = useState(0);

  const [isMuted, setIsMuted] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const playerRefs = useRef<{ [key: number]: any }>({});

  const onPlayerReady = (event: YouTubeEvent, index: number) => {
    playerRefs.current[index] = event.target;
    try {
      // Apply current global mute state
      if (isMuted) event.target.mute();
      else event.target.unMute();

      if (index === currentIndex && !showPause && !showQuiz) {
        event.target.playVideo();
      } else {
        event.target.pauseVideo();
      }
    } catch (err) {
      console.warn('YouTube player not ready:', err);
    }
  };

  useEffect(() => {
    Object.keys(playerRefs.current).forEach((key) => {
      const i = parseInt(key);
      const player = playerRefs.current[i];
      if (player && typeof player.playVideo === 'function') {
        try {
          if (i === currentIndex && !showPause && !showQuiz) {
            player.playVideo();
          } else {
            player.pauseVideo();
          }
        } catch (err) {
          console.warn('YouTube player not ready:', err);
        }
      }
    });
  }, [currentIndex, showPause, showQuiz]);

  const togglePlayPause = (index: number) => {
    const player = playerRefs.current[index];
    if (player && typeof player.getPlayerState === 'function') {
      try {
        const state = player.getPlayerState();
        if (state === 1) { // playing
          player.pauseVideo();
        } else {
          player.playVideo();
        }
      } catch (err) {
        console.warn('YouTube player not ready:', err);
      }
    }
  };

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    Object.values(playerRefs.current).forEach((player: any) => {
      if (player && typeof player.mute === 'function') {
        if (newMuted) player.mute();
        else player.unMute();
      }
    });
  };

  const fetchVideos = async (token?: string) => {
    setIsFetchingMore(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://vtuber-258546516052.us-central1.run.app/curate-youtube-shorts';
      const res = await fetch(backendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: queryParam ? queryParam + ' shorts' : '#edukasi',
          max_results: token ? 5 : 2,
          page_token: token || null,
        }),
      });

      if (!res.ok) throw new Error('Failed to fetch videos from backend');
      const data: CurationResponse = await res.json();
      
      setVideos((prev) => {
        const existingIds = new Set(prev.map(v => v.video_id));
        const newVideos = data.videos.filter(v => !existingIds.has(v.video_id));
        return [...prev, ...newVideos];
      });
      setNextPageToken(data.next_page_token);
      
      if (!token && data.videos.length > 0) {
          // first topic load logic here if needed
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
      setIsFetchingMore(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  // Auto-fetch more if the list is too short to allow scrolling
  useEffect(() => {
    if (videos.length > 0 && videos.length <= 2 && !loading && !isFetchingMore && nextPageToken) {
      fetchVideos(nextPageToken);
    }
  }, [videos.length, loading, isFetchingMore, nextPageToken]);

  // Screen time tracking (Active Pause)
  useEffect(() => {
    if (showPause || showQuiz) return;
    const interval = setInterval(() => {
      setTimeSpent((prev) => {
        const newTime = prev + 1;
        // Trigger pause every 5 minutes (300 seconds)
        if (newTime >= 300) {
          setShowPause(true);
          return 0;
        }
        return newTime;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [showPause]);

  // Pause Timer Countdown
  useEffect(() => {
    if (showPause) {
      if (pauseTimer > 0) {
        const timer = setTimeout(() => setPauseTimer(pauseTimer - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        setShowPause(false);
        setPauseTimer(60);
      }
    }
  }, [showPause, pauseTimer]);

  const scrollToNext = () => {
    if (containerRef.current && currentIndex < videos.length - 1) {
      containerRef.current.scrollTo({
        top: (currentIndex + 1) * window.innerHeight,
        behavior: 'smooth'
      });
    }
  };

  const scrollToPrev = () => {
    if (containerRef.current && currentIndex > 0) {
      containerRef.current.scrollTo({
        top: (currentIndex - 1) * window.innerHeight,
        behavior: 'smooth'
      });
    }
  };

  const handleScroll = () => {
    if (showPause && containerRef.current) {
      containerRef.current.scrollTop = currentIndex * window.innerHeight;
      return;
    }

    if (containerRef.current) {
      const index = Math.round(containerRef.current.scrollTop / window.innerHeight);
      if (index !== currentIndex) {
        setCurrentIndex(index);
        setExpandedDesc(false);

        if (index > maxIndexReached) {
          setMaxIndexReached(index);
          if (index > 0 && index % quizInterval === 0) {
            setShowQuiz(true);
          }
        }

        // Infinite Scroll trigger: pre-fetch deeply
        if (index >= videos.length - 5 && !isFetchingMore && nextPageToken) {
          fetchVideos(nextPageToken);
        }
      }
    }
  };

  if (loading && !isFetchingMore && videos.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900 w-full">
        <div className="flex flex-col items-center gap-6">
          <Loader2 className="w-12 h-12 animate-spin text-teal-400" />
          <p className="text-lg font-medium text-slate-300 animate-pulse tracking-wide">Curating knowledge...</p>
        </div>
      </div>
    );
  }

  if (error && videos.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900 w-full">
        <div className="bg-slate-800/80 p-8 rounded-3xl text-center max-w-sm mx-4 border border-slate-700">
          <h2 className="text-xl font-semibold text-rose-400 mb-3">Connection Error</h2>
          <p className="text-slate-400 text-sm mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="flex items-center justify-center gap-2 w-full py-3 bg-teal-500/10 text-teal-400 hover:bg-teal-500/20 rounded-xl transition-colors font-medium"
          >
            <RefreshCcw className="w-4 h-4" /> Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[100dvh] bg-slate-50 dark:bg-slate-950 w-full overflow-hidden transition-colors duration-300">
      <div className="relative h-[100dvh] w-full max-w-[400px]">
        {/* External Navigation Buttons */}
        {isMounted && !showPause && (
          <div className="absolute left-[calc(100%+1.5rem)] top-1/2 -translate-y-1/2 z-40 hidden sm:flex flex-col gap-4">
            <button 
              onClick={scrollToPrev}
              disabled={currentIndex === 0}
              className={`p-4 rounded-full transition-all shadow-xl border border-slate-200 dark:border-slate-700/50 ${currentIndex === 0 ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed' : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-teal-600 dark:text-teal-400 hover:scale-105 active:scale-95'}`}
              aria-label="Previous Video"
            >
              <ChevronUp className="w-7 h-7" />
            </button>
            
            <button 
              onClick={scrollToNext}
              disabled={currentIndex === videos.length - 1 && !isFetchingMore}
              className={`p-4 rounded-full transition-all shadow-xl border border-slate-200 dark:border-slate-700/50 ${currentIndex === videos.length - 1 && !isFetchingMore ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed' : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-teal-600 dark:text-teal-400 hover:scale-105 active:scale-95'}`}
              aria-label="Next Video"
            >
              <ChevronDown className="w-7 h-7" />
            </button>
          </div>
        )}

        {/* Mobile Constraint Container */}
        <main className="relative bg-black h-full w-full overflow-hidden text-slate-50 shadow-[0_0_50px_rgba(0,0,0,0.5)] sm:border-x sm:border-slate-800">
        
        <div className="absolute top-6 left-6 z-40 flex gap-4">
          <button 
            onClick={toggleMute}
            className={`p-3 rounded-full backdrop-blur-xl border shadow-lg transition-all active:scale-95 flex items-center justify-center ${isMuted ? 'bg-rose-500/80 border-rose-400/50 text-white' : 'bg-black/40 border-white/20 text-white/90 hover:bg-black/60'}`}
            aria-label="Toggle Mute"
          >
            {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
          </button>
        </div>

        {/* Active Pause Overlay */}
        <AnimatePresence>
          {showPause && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/95 backdrop-blur-xl p-8 text-center"
            >
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-8 relative flex flex-col items-center justify-center"
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    y: [0, -10, 0]
                  }}
                  transition={{ 
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="relative flex items-center justify-center w-32 h-32"
                >
                   {/* Background aura */}
                   <div className="absolute inset-0 bg-teal-500/20 rounded-full animate-pulse blur-xl" />
                   <Accessibility className="w-20 h-20 text-teal-400 relative z-10 drop-shadow-[0_0_15px_rgba(45,212,191,0.5)]" />
                </motion.div>
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-5xl font-light text-slate-50">{pauseTimer}</span>
                  <span className="text-xl text-teal-500/70 font-medium tracking-wider">SEC</span>
                </div>
              </motion.div>
              <motion.h2 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-medium mb-4 text-slate-100 tracking-wide"
              >
                Stretching Time!
              </motion.h2>
              <motion.p 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-base text-slate-400 max-w-xs leading-relaxed"
              >
                Stand up, stretch your arms, and rest your eyes. Learning is a marathon, not a sprint.
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quiz Comprehension Check Overlay */}
        <QuizModal 
          isOpen={showQuiz} 
          onSuccess={() => setShowQuiz(false)} 
          topic={videos[currentIndex]?.topic}
        />

        {/* Video Feed */}
        <div 
          ref={containerRef}
          onScroll={handleScroll}
          className={`h-[100dvh] w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth no-scrollbar relative ${(showPause || showQuiz) ? 'overflow-hidden' : ''}`}
        >
          {videos.map((video, index) => (
            <div 
              key={`${video.video_id}-${index}`} 
              className="h-[100dvh] w-full snap-start snap-always relative flex flex-col justify-center bg-black"
            >
              <MemoizedVideoPlayer 
                video={video} 
                index={index} 
                onPlayerReady={onPlayerReady} 
                togglePlayPause={togglePlayPause} 
              />

              {/* Educational Overlay with Framer Motion */}
              <div className="absolute bottom-0 left-0 right-0 z-10 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent pb-24 sm:pb-8 pt-32 pointer-events-none flex flex-col justify-end">
                <AnimatePresence>
                  {index === currentIndex && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="pointer-events-auto w-[85%]"
                    >
                      <div 
                        className="cursor-pointer group" 
                        onClick={() => setExpandedDesc(!expandedDesc)}
                      >
                        <h2 className={`text-[15px] font-bold text-white mb-1.5 leading-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] ${expandedDesc ? '' : 'line-clamp-2'}`}>
                          {video.title}
                        </h2>
                        <p className={`text-[13px] text-slate-100 font-medium leading-snug drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] ${expandedDesc ? '' : 'line-clamp-2'}`}>
                          {video.reason}
                        </p>
                        <p className="text-[13px] font-bold text-white mt-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] opacity-80 group-hover:opacity-100 transition-opacity">
                          {expandedDesc ? 'See less' : '...more'}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              {index === videos.length - 1 && isFetchingMore && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 bg-slate-900/80 backdrop-blur p-3 rounded-full border border-slate-700">
                   <Loader2 className="w-5 h-5 animate-spin text-teal-400" />
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
      </div>
    </div>
  );
}

const MemoizedVideoPlayer = React.memo(({ video, index, onPlayerReady, togglePlayPause }: any) => {
  const opts = useMemo(() => ({
    width: '100%',
    height: '100%',
    playerVars: {
      autoplay: 0,
      controls: 0,
      modestbranding: 1,
      rel: 0,
      playsinline: 1,
      loop: 1,
      playlist: video.video_id,
      cc_load_policy: 0,
    },
  }), [video.video_id]);

  return (
    <>
      <div className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden pointer-events-none">
        <YouTube
          videoId={video.video_id}
          opts={opts}
          onReady={(e) => onPlayerReady(e, index)}
          className="w-[300%] h-[100dvh] sm:w-[150%] md:w-full object-cover scale-[1.05] pointer-events-none"
          iframeClassName="w-full h-full object-cover pointer-events-none"
        />
      </div>
      <div 
        className="absolute inset-0 z-[5] cursor-pointer" 
        onClick={() => togglePlayPause(index)}
      />
    </>
  );
});
