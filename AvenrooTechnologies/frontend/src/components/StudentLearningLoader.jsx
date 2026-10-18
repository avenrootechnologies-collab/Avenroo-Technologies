import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { BookOpen, Check, Code2, GraduationCap, Lightbulb, Sparkles } from "lucide-react";

const stages = [
  { word: "Imagine", icon: Lightbulb, line: "Dream up your next big idea." },
  { word: "Code", icon: Code2, line: "Bring your ideas to life with code." },
  { word: "Create", icon: Sparkles, line: "Build something you can be proud of." },
];

export default function StudentLearningLoader() {
  const [activeStage, setActiveStage] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const timers = stages.slice(1).map((_, index) =>
      window.setTimeout(() => setActiveStage(index + 1), (index + 1) * 350),
    );
    return () => timers.forEach(window.clearTimeout);
  }, []);

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#fffaf2] px-4 py-8 text-[#102433] sm:px-7">
      <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-[#72e5d7]/30 blur-[90px]" />
      <div className="pointer-events-none absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-[#ffb197]/30 blur-[100px]" />

      <motion.section
        initial={reduceMotion ? false : { opacity: 0, y: 18, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative flex w-full max-w-3xl flex-col items-center px-4 py-2 text-center"
        role="status"
        aria-live="polite"
        aria-label={`Student programs loading. ${stages[activeStage].word}.`}
      >
        <div className="relative flex h-[210px] w-full items-center justify-center overflow-hidden p-2 sm:h-[240px]">
          <div className="absolute inset-0 opacity-35" style={{ backgroundImage: "radial-gradient(rgba(24,183,161,.45) 1px, transparent 1px)", backgroundSize: "23px 23px", maskImage: "radial-gradient(ellipse at center, black, transparent 70%)" }} />
          <div className="absolute left-[15%] top-[12%] h-48 w-48 rounded-full bg-mint-400/20 blur-[75px]" />
          <div className="absolute bottom-[5%] right-[14%] h-48 w-48 rounded-full bg-coral-500/15 blur-[75px]" />

          <motion.div
            animate={reduceMotion ? undefined : { rotate: 360 }}
            transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
            className="absolute h-[230px] w-[230px] rounded-full border border-dashed border-[#102433]/15 sm:h-[280px] sm:w-[280px]"
          />
          <div className="relative z-10 flex h-[210px] w-full max-w-[330px] items-center justify-center sm:h-[240px]">
            <div className="absolute left-[8%] top-[22%] hidden h-1 w-12 rounded-full bg-mint-500/45 sm:block" />
            <div className="absolute right-[6%] top-[33%] h-1 w-8 rounded-full bg-coral-500/55" />
            <div className="absolute left-[12%] top-[45%] h-1 w-5 rounded-full bg-[#102433]/20" />
            <div className="absolute right-[15%] top-[19%] hidden h-1 w-9 rounded-full bg-[#102433]/20 sm:block" />

            <motion.div
              animate={reduceMotion ? undefined : { y: [0, -5, 0] }}
              transition={{ duration: 0.78, repeat: Infinity, ease: "easeInOut" }}
              className="relative flex h-full w-full items-center justify-center"
            >
              <svg viewBox="0 0 280 230" role="img" aria-label="A student ninja mascot running toward new ideas" className="relative z-10 h-full w-full overflow-visible drop-shadow-[0_18px_24px_rgba(0,0,0,0.25)]">
                <defs>
                  <linearGradient id="runner-shirt" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stopColor="#72e5d7" /><stop offset="1" stopColor="#18b7a1" /></linearGradient>
                  <linearGradient id="runner-scarf" x1="0" x2="1"><stop offset="0" stopColor="#ff9a78" /><stop offset="1" stopColor="#ff6d57" /></linearGradient>
                </defs>
                <ellipse cx="143" cy="204" rx="76" ry="12" fill="#01090e" opacity=".38" />
                <ellipse cx="143" cy="204" rx="55" ry="5" fill="#72e5d7" opacity=".2" />

                <motion.g
                  animate={reduceMotion ? undefined : { rotate: [-24, 23, -24] }}
                  transition={{ duration: 0.82, repeat: Infinity, ease: "easeInOut" }}
                  style={{ transformOrigin: "124px 146px" }}
                >
                  <path d="M126 139 105 166 91 180" fill="none" stroke="#173747" strokeWidth="17" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="m93 179-12 4 3 8 20 1 7-7" fill="#ff9a78" />
                  <path d="m113 163 9 7" stroke="#456276" strokeWidth="13" strokeLinecap="round" />
                </motion.g>
                <motion.g
                  animate={reduceMotion ? undefined : { rotate: [22, -25, 22] }}
                  transition={{ duration: 0.82, repeat: Infinity, ease: "easeInOut" }}
                  style={{ transformOrigin: "157px 146px" }}
                >
                  <path d="m155 139 23 22 16 3" fill="none" stroke="#244a5a" strokeWidth="17" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="m192 160 12-5 5 8-12 12-12-2" fill="#ff9a78" />
                  <path d="m178 160-8 8" stroke="#456276" strokeWidth="13" strokeLinecap="round" />
                </motion.g>

                <path d="m119 91-15 9-12 27 15 10 19-20" fill="#173747" stroke="#456276" strokeWidth="3" strokeLinejoin="round" />
                <path d="m118 86 45 1 18 47-14 18-44 4-24-21 7-34q3-11 12-15Z" fill="url(#runner-shirt)" stroke="#b4fff2" strokeOpacity=".5" strokeWidth="3" />
                <path d="m135 96 11 7 11-7-3 23-9 8-9-8Z" fill="#eafffb" opacity=".88" />
                <path d="m137 117-8 24 15 8 15-8-9-24" fill="#117e78" opacity=".75" />
                <circle cx="145" cy="128" r="3" fill="#fffaf2" />

                <motion.g
                  animate={reduceMotion ? undefined : { rotate: [25, -21, 25] }}
                  transition={{ duration: 0.82, repeat: Infinity, ease: "easeInOut" }}
                  style={{ transformOrigin: "119px 96px" }}
                >
                  <path d="m120 95-18 15-4 23" fill="none" stroke="#18b7a1" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="m98 132-8 7 9 8 9-6-1-8" fill="#f3c79c" />
                </motion.g>
                <motion.g
                  animate={reduceMotion ? undefined : { rotate: [-22, 24, -22] }}
                  transition={{ duration: 0.82, repeat: Infinity, ease: "easeInOut" }}
                  style={{ transformOrigin: "164px 96px" }}
                >
                  <path d="m164 95 20 13-8 21" fill="none" stroke="#18b7a1" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="m176 127-4 10 11 4 8-9-7-7" fill="#f3c79c" />
                </motion.g>

                <path d="M112 59q1-39 34-40 32 0 39 35l-6 29q-36-13-72 3Z" fill="#102433" stroke="#72e5d7" strokeWidth="3" />
                <path d="M119 54q4-20 26-22 24 2 31 23l-5 23q-25 12-48-1Z" fill="#efc49a" />
                <path d="m118 59 61 3-4 14q-29 12-53-1Z" fill="#163b4b" />
                <path d="M130 65h9m14 0h9" stroke="#fffaf2" strokeWidth="4" strokeLinecap="round" />
                <path d="m116 48-20-8 7 16-17 4 26 5" fill="url(#runner-scarf)" stroke="#ffb197" strokeWidth="2" strokeLinejoin="round" />
                <path d="m141 22 6-13 8 13" fill="#18b7a1" />
                <path d="m133 153 14 2-5 10-13-2" fill="#ff9a78" />
                <path d="m172 152 13 4-4 10-13-5" fill="#ff9a78" />
              </svg>
            </motion.div>

            <motion.div animate={reduceMotion ? undefined : { y: [0, -8, 0], rotate: [4, -3, 4] }} transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }} className="absolute left-[7%] top-[20%] flex h-10 w-10 items-center justify-center rounded-2xl border border-white/15 bg-[#102b38]/90 text-mint-400 shadow-xl"><BookOpen size={19} /></motion.div>
            <motion.div animate={reduceMotion ? undefined : { y: [0, 7, 0], rotate: [-4, 3, -4] }} transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }} className="absolute bottom-[18%] right-[7%] flex h-10 w-10 items-center justify-center rounded-2xl border border-white/15 bg-[#102b38]/90 text-amber-300 shadow-xl"><Sparkles size={19} /></motion.div>
            <div className="absolute bottom-0 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-[#102433]/10 bg-white/75 px-3 py-1.5 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-[#456276]">
              <GraduationCap size={14} className="text-mint-500" /> always learning
            </div>
          </div>
        </div>

        <div className="flex w-full max-w-xl flex-col items-center justify-center pb-2 pt-0">
          <p className="inline-flex items-center gap-2 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-teal-700">
            <GraduationCap size={15} /> student programs
          </p>
          <h1 className="display-font mt-3 text-4xl leading-[1.02] text-[#102433] sm:text-5xl">
            Imagine<span className="text-mint-500">.</span> Code<span className="text-mint-500">.</span> Create<span className="text-coral-500">.</span>
          </h1>
          <motion.p key={activeStage} initial={reduceMotion ? false : { opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: "easeOut" }} className="mt-3 min-h-7 text-base text-[#456276] sm:text-lg">
            {stages[activeStage].line}
          </motion.p>

          <div className="mt-6 flex w-full max-w-md items-center justify-between gap-3" aria-hidden="true">
            {stages.map(({ word, icon: Icon }, index) => {
              const complete = index < activeStage;
              const active = index === activeStage;
              return (
                <div key={word} className={`flex flex-1 items-center justify-center gap-2 transition-all duration-300 ${active ? "scale-105 text-[#102433]" : "text-[#456276]/55"}`}>
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${active || complete ? "bg-mint-500 text-white" : "bg-[#102433]/[0.05]"}`}>
                    {complete ? <Check size={16} /> : <Icon size={16} />}
                  </div>
                  <p className="text-xs font-bold sm:text-sm">{word}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-7 h-1.5 overflow-hidden rounded-full bg-[#102433]/[0.07]" aria-hidden="true">
            <motion.div className="h-full rounded-full bg-gradient-to-r from-mint-500 via-teal-400 to-coral-500" animate={{ width: `${((activeStage + 1) / stages.length) * 100}%` }} transition={{ duration: 0.8, ease: "easeInOut" }} />
          </div>
          <p className="mt-3 text-xs font-medium text-[#456276]/70">Getting your student journey ready...</p>
        </div>
      </motion.section>
    </main>
  );
}
