'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { ArrowRight, ArrowDown, Mic } from 'lucide-react';

const HeroScene = dynamic(() => import('./hero-scene'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_30%_45%_at_68%_40%,rgba(255,244,220,0.12),transparent_70%)]" />
  ),
});

const MOTIONS = [
  'social media does more harm than good.',
  'AI should be taught in every classroom.',
  'universities should abolish attendance.',
  'the pen is still mightier than the sword.',
  'every voice deserves the floor.',
];

// British Parliamentary speaking order
const SPEAKERS = [
  { role: 'Prime Minister', bench: 'gov' },
  { role: 'Leader of Opposition', bench: 'opp' },
  { role: 'Deputy Prime Minister', bench: 'gov' },
  { role: 'Deputy Leader of Opp.', bench: 'opp' },
  { role: 'Member of Government', bench: 'gov' },
  { role: 'Member of Opposition', bench: 'opp' },
  { role: 'Government Whip', bench: 'gov' },
  { role: 'Opposition Whip', bench: 'opp' },
] as const;

const SPEECH_SECONDS = 420;
const TICK = 10; // one real second = ten seconds of speech, so the demo cycles quickly

const ease = [0.16, 1, 0.3, 1] as const;

function MotionTicker() {
  const [i, setI] = React.useState(0);
  React.useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % MOTIONS.length), 3600);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex items-baseline gap-2 text-sm sm:text-base text-slate-300 min-h-[1.6em] overflow-hidden">
      <span className="shrink-0 font-semibold text-white">This House believes</span>
      <span className="relative flex-1 min-w-0">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={i}
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '-100%', opacity: 0 }}
            transition={{ duration: 0.45, ease }}
            className="block truncate text-amber-200"
          >
            {MOTIONS[i]}
          </motion.span>
        </AnimatePresence>
      </span>
    </div>
  );
}

/** A BP-style speech clock: 7 minutes, protected time in the first and last minute. */
function SpeechTimer() {
  const [t, setT] = React.useState(0);
  React.useEffect(() => {
    const id = setInterval(() => setT((v) => v + TICK), 1000);
    return () => clearInterval(id);
  }, []);

  const speaker = SPEAKERS[Math.floor(t / SPEECH_SECONDS) % SPEAKERS.length];
  const elapsed = t % SPEECH_SECONDS;
  const remaining = SPEECH_SECONDS - elapsed;
  const poiOpen = elapsed >= 60 && elapsed < SPEECH_SECONDS - 60;
  const gov = speaker.bench === 'gov';
  const mm = Math.floor(remaining / 60);
  const ss = (remaining % 60).toString().padStart(2, '0');

  return (
    <div className="w-full max-w-[300px] rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl p-4 shadow-2xl">
      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em]">
        <span className={`flex items-center gap-1.5 font-semibold ${gov ? 'text-sky-300' : 'text-amber-300'}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${gov ? 'bg-sky-400' : 'bg-amber-400'}`} />
          {gov ? 'Government' : 'Opposition'}
        </span>
        <span className={poiOpen ? 'text-emerald-300' : 'text-slate-500'}>{poiOpen ? 'POIs open' : 'Protected time'}</span>
      </div>
      <div className="mt-3 flex items-end justify-between gap-3">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={speaker.role}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="text-sm font-semibold text-white leading-tight"
          >
            {speaker.role}
          </motion.span>
        </AnimatePresence>
        <span className="font-numbers text-3xl font-bold tabular-nums text-white leading-none">
          {mm}:{ss}
        </span>
      </div>
      <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full transition-[width] duration-1000 ease-linear ${gov ? 'bg-sky-400' : 'bg-amber-400'}`}
          style={{ width: `${(elapsed / SPEECH_SECONDS) * 100}%` }}
        />
      </div>
    </div>
  );
}

function SplitWord({ word, delay }: { word: string; delay: number }) {
  return (
    <span className="inline-block overflow-hidden align-bottom pb-[0.06em] pr-[0.08em]">
      <motion.span
        className="inline-block"
        initial={{ y: '110%', rotate: 6 }}
        animate={{ y: 0, rotate: 0 }}
        transition={{ duration: 1.1, delay, ease }}
      >
        {word}
      </motion.span>
    </span>
  );
}

export function Hero() {
  const ref = React.useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const sceneScale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);
  const sceneOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '-25%']);

  return (
    <section
      ref={ref}
      className="relative -mt-[100px] h-[100svh] min-h-[680px] w-full overflow-hidden bg-[#01030c] text-white isolate"
    >
      {/* WebGL stage */}
      <motion.div style={{ scale: sceneScale, opacity: sceneOpacity }} className="absolute inset-0 -z-10">
        <HeroScene />
      </motion.div>

      {/* Legibility: darken behind the copy (left on desktop, bottom on mobile) */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-t from-[#01030c] via-[#01030c]/70 to-transparent lg:bg-gradient-to-r lg:via-[#01030c]/40" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 -z-10 bg-gradient-to-b from-transparent to-[#01030c]" />

      <motion.div
        style={{ y: contentY }}
        className="relative h-full container mx-auto max-w-7xl px-4 sm:px-6 flex flex-col justify-between pt-[120px] pb-8 sm:pb-10 pointer-events-none"
      >
        {/* Top meta row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="flex items-center justify-between text-[10px] sm:text-xs uppercase tracking-[0.25em] text-slate-400 font-numbers"
        >
          <span className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75 animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
            </span>
            The house is in session
          </span>
          <span className="hidden md:flex items-center gap-3">
            <span className="text-sky-300">Government</span>
            <span className="text-slate-600">vs</span>
            <span className="text-amber-300">Opposition</span>
          </span>
          <span className="flex items-center gap-2">
            Scroll
            <motion.span animate={{ y: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 1.8 }}>
              <ArrowDown className="w-3.5 h-3.5" />
            </motion.span>
          </span>
        </motion.div>

        {/* Copy */}
        <div className="flex flex-col gap-7 max-w-xl lg:max-w-[46%] pointer-events-auto">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex items-center gap-2 text-xs sm:text-sm uppercase tracking-[0.3em] text-amber-200/90 font-semibold"
          >
            <Mic className="h-4 w-4" />
            Debating Society of HSTU
          </motion.p>
          <h1 className="font-black uppercase leading-[0.86] tracking-[-0.04em] text-[15vw] sm:text-[12vw] lg:text-[7.4vw] xl:text-[112px]">
            <SplitWord word="The" delay={0.35} />{' '}
            <SplitWord word="floor" delay={0.42} />
            <br />
            <SplitWord word="is" delay={0.5} />{' '}
            <span className="font-light italic normal-case tracking-[-0.03em] text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-indigo-200 to-amber-200">
              <SplitWord word="yours." delay={0.58} />
            </span>
          </h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.9, ease }}
            className="flex flex-col gap-5"
          >
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-md">
              Parliamentary debate, public speaking and critical thinking — training the sharpest voices at Hajee
              Mohammad Danesh Science and Technology University.
            </p>
            <MotionTicker />
            <div className="flex flex-wrap gap-3">
              <Link
                href="/events/upcoming"
                className="group inline-flex items-center gap-2 rounded-full bg-white text-slate-950 pl-6 pr-2 h-12 font-semibold text-sm transition-transform hover:scale-[1.03]"
              >
                Join the next round
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-950 text-white transition-transform group-hover:rotate-[-45deg]">
                  <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
              <Link
                href="/events/archive"
                className="inline-flex items-center rounded-full border border-white/20 bg-white/5 backdrop-blur-md px-6 h-12 text-sm font-semibold hover:bg-white/10 transition-colors"
              >
                Past tournaments
              </Link>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Speech clock, bottom-right on desktop */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 1.2, ease }}
        className="hidden lg:block absolute right-6 xl:right-[max(1.5rem,calc((100vw-80rem)/2+1.5rem))] bottom-10"
      >
        <SpeechTimer />
      </motion.div>
    </section>
  );
}
