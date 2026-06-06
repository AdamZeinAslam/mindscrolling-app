"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BrainCircuit, XCircle, CheckCircle2 } from "lucide-react";
import { useTimer } from "@/context/TimerContext";

interface QuizModalProps {
  isOpen: boolean;
  onSuccess: () => void;
  topic?: string;
}

type Question = {
  q: string;
  options: string[];
  answer: number; // index of correct option
};

// Pustaka pertanyaan mock yang lebih banyak dan bervariasi
const questionBank: Record<string, Question[]> = {
  "Sains": [
    { q: "Apa nama planet terdekat dari Matahari?", options: ["Venus", "Merkurius", "Bumi"], answer: 1 },
    { q: "Gas apa yang paling banyak terdapat di atmosfer Bumi?", options: ["Oksigen", "Karbon Dioksida", "Nitrogen"], answer: 2 },
    { q: "Hewan apa yang bernapas menggunakan insang saat masih muda dan paru-paru saat dewasa?", options: ["Katak", "Ikan Pari", "Penyu"], answer: 0 },
    { q: "Proses tumbuhan membuat makanan sendiri disebut?", options: ["Respirasi", "Fotosintesis", "Transpirasi"], answer: 1 },
    { q: "Bagian sel yang berfungsi sebagai pusat kendali adalah?", options: ["Mitokondria", "Membran", "Nukleus"], answer: 2 },
  ],
  "Teknologi": [
    { q: "Apa kepanjangan dari CPU?", options: ["Central Processing Unit", "Computer Personal Unit", "Central Program Utility"], answer: 0 },
    { q: "Bahasa pemrograman apa yang dijuluki 'bahasa web'?", options: ["Python", "JavaScript", "C++"], answer: 1 },
    { q: "Siapa penemu World Wide Web (WWW)?", options: ["Bill Gates", "Tim Berners-Lee", "Steve Jobs"], answer: 1 },
    { q: "Sistem operasi yang menggunakan logo penguin adalah?", options: ["Windows", "MacOS", "Linux"], answer: 2 },
    { q: "Komponen komputer yang menyimpan data sementara adalah?", options: ["Hardisk", "RAM", "VGA"], answer: 1 },
  ],
  "Sejarah": [
    { q: "Siapa Presiden pertama Indonesia?", options: ["B.J. Habibie", "Soeharto", "Soekarno"], answer: 2 },
    { q: "Tahun berapa Perang Dunia II berakhir?", options: ["1940", "1945", "1950"], answer: 1 },
    { q: "Kerajaan Hindu-Buddha terbesar di Indonesia adalah?", options: ["Majapahit", "Sriwijaya", "Tarumanegara"], answer: 0 },
    { q: "Siapa penemu benua Amerika?", options: ["Vasco da Gama", "Christopher Columbus", "Ferdinand Magellan"], answer: 1 },
    { q: "Peradaban kuno yang membangun piramida adalah?", options: ["Mesopotamia", "Mesir Kuno", "Yunani Kuno"], answer: 1 },
  ],
  "Edukasi Umum": [
    { q: "Apa ibukota negara Jepang?", options: ["Seoul", "Beijing", "Tokyo"], answer: 2 },
    { q: "Berapa hasil dari 8 x 7?", options: ["54", "56", "64"], answer: 1 },
    { q: "Benua apa yang terbesar di dunia?", options: ["Afrika", "Asia", "Eropa"], answer: 1 },
    { q: "Hewan tercepat di darat adalah?", options: ["Cheetah", "Singa", "Kuda"], answer: 0 },
    { q: "Gunung tertinggi di dunia adalah?", options: ["Kilimanjaro", "Everest", "Jayawijaya"], answer: 1 },
    { q: "Alat pernapasan pada serangga adalah?", options: ["Insang", "Paru-paru", "Trakea"], answer: 2 },
    { q: "Mata uang negara Thailand adalah?", options: ["Yen", "Baht", "Won"], answer: 1 },
    { q: "Lagu kebangsaan Indonesia Raya diciptakan oleh?", options: ["W.R. Supratman", "Ibu Sud", "Ismail Marzuki"], answer: 0 },
  ]
};

export function QuizModal({ isOpen, onSuccess, topic = "Edukasi Umum" }: QuizModalProps) {
  const [currentQ, setCurrentQ] = useState<Question | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isWrong, setIsWrong] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { incrementQuizzesPassed } = useTimer();

  // Generate new question when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsWrong(false);
      setIsSuccess(false);
      setIsProcessing(false);
      setSelectedIdx(null);
      
      // Pilih kategori yang mendekati atau gunakan Edukasi Umum
      let category = "Edukasi Umum";
      if (topic.toLowerCase().includes("sains")) category = "Sains";
      else if (topic.toLowerCase().includes("teknologi") || topic.toLowerCase().includes("tech")) category = "Teknologi";
      else if (topic.toLowerCase().includes("sejarah")) category = "Sejarah";
      
      const questions = questionBank[category];
      const randomQ = questions[Math.floor(Math.random() * questions.length)];
      setCurrentQ(randomQ);
    }
  }, [isOpen, topic]);

  if (!isOpen || !currentQ) return null;

  const handleSelect = (idx: number) => {
    if (isSuccess || isProcessing) return; // Prevent multiple clicks
    
    setIsProcessing(true);
    setSelectedIdx(idx);
    
    if (idx === currentQ.answer) {
      setIsWrong(false);
      setIsSuccess(true);
      incrementQuizzesPassed();
      setTimeout(() => {
        onSuccess();
        setIsProcessing(false);
      }, 1500); // Wait 1.5s to show success animation before closing
    } else {
      setIsWrong(true);
      setTimeout(() => {
        setIsWrong(false);
        setSelectedIdx(null); // Reset selection so they can try again
        setIsProcessing(false);
      }, 800); // Shake animation duration
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ 
            scale: 1, 
            opacity: 1,
            x: isWrong ? [-10, 10, -10, 10, 0] : 0 // Shake animation on wrong
          }}
          transition={{ duration: isWrong ? 0.4 : 0.3 }}
          className={`w-full max-w-sm rounded-3xl p-6 sm:p-8 shadow-2xl border-2 overflow-hidden relative ${
            isSuccess 
              ? 'bg-teal-950/50 border-teal-500/50' 
              : isWrong 
                ? 'bg-rose-950/50 border-rose-500/50' 
                : 'bg-slate-900 border-slate-700'
          }`}
        >
          {/* Background Glow */}
          <div className={`absolute -top-24 -right-24 w-48 h-48 blur-3xl rounded-full opacity-20 pointer-events-none ${
            isSuccess ? 'bg-teal-500' : isWrong ? 'bg-rose-500' : 'bg-indigo-500'
          }`} />

          <div className="relative z-10 flex flex-col items-center text-center">
            <div className={`p-4 rounded-full mb-6 ${
              isSuccess ? 'bg-teal-500/20 text-teal-400' : isWrong ? 'bg-rose-500/20 text-rose-400' : 'bg-indigo-500/20 text-indigo-400'
            }`}>
              {isSuccess ? <CheckCircle2 className="w-8 h-8" /> : isWrong ? <XCircle className="w-8 h-8" /> : <BrainCircuit className="w-8 h-8" />}
            </div>
            
            <h2 className="text-xl font-bold text-white mb-2">
              {isSuccess ? 'Tepat Sekali!' : isWrong ? 'Coba Lagi!' : 'Kuis Pengetahuan Umum'}
            </h2>
            <p className="text-slate-300 mb-8 text-sm leading-relaxed">
              {isSuccess 
                ? 'Luar biasa! Otakmu bekerja dengan baik.' 
                : isWrong
                  ? 'Fokus kembali, ingat-ingat apa yang kamu pelajari.'
                  : currentQ.q}
            </p>

            {!isSuccess && (
              <div className="w-full space-y-3">
                {currentQ.options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelect(idx)}
                    disabled={isWrong && selectedIdx === idx}
                    className={`w-full p-4 rounded-2xl text-left font-medium transition-all duration-200 border ${
                      selectedIdx === idx
                        ? isWrong
                          ? 'bg-rose-500/20 border-rose-500/50 text-rose-200'
                          : 'bg-indigo-500 border-indigo-400 text-white' // default active
                        : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <span className="inline-block w-6 text-slate-500 font-bold mr-2">
                      {String.fromCharCode(65 + idx)}.
                    </span>
                    {opt}
                  </button>
                ))}
              </div>
            )}
            
            {/* Success Animation Details */}
            {isSuccess && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-teal-300 text-sm font-medium mt-4 animate-pulse"
              >
                Melanjutkan video...
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
