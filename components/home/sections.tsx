'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useInView, useScroll, useTransform, useMotionValue, useSpring, MotionValue } from 'motion/react';
import {
  ArrowRight,
  ArrowUpRight,
  Mic,
  BookOpen,
  Newspaper,
  Users,
  BadgeCheck,
  Landmark,
  MapPin,
  CalendarPlus,
} from 'lucide-react';

const ease = [0.16, 1, 0.3, 1] as const;

/* ------------------------------------------------------------------ */
/* Marquee                                                             */
/* ------------------------------------------------------------------ */

const KEYWORDS = ['Parliamentary Debate', 'Public Speaking', 'Critical Thinking', 'Adjudication', 'Leadership', 'Research', 'Rhetoric', 'Workshops'];

export function KeywordMarquee() {
  return (
    <div className="relative bg-[#01030c] text-white py-6 sm:py-8 border-y border-white/10 overflow-hidden marquee-group">
      <div className="animate-marquee">
        {[...KEYWORDS, ...KEYWORDS].map((k, i) => (
          <span key={i} className="flex items-center gap-8 px-8 text-2xl sm:text-4xl font-black uppercase tracking-tight whitespace-nowrap">
            <span className={i % 2 ? 'hero-outline-sm' : ''}>{k}</span>
            <span className="inline-block h-3 w-3 sm:h-4 sm:w-4 rounded-full bg-gradient-to-br from-sky-300 to-amber-300" />
          </span>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Manifesto — words light up as you scroll                            */
/* ------------------------------------------------------------------ */

const MANIFESTO =
  'We are more than a club. We are a training ground for minds that question, voices that persuade, and leaders who listen — where every argument is a step toward understanding.';

function Word({ children, progress, range }: { children: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.12, 1]);
  return (
    <motion.span style={{ opacity }} className="mr-[0.25em] inline-block">
      {children}
    </motion.span>
  );
}

export function Manifesto() {
  const ref = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.45'] });
  const words = MANIFESTO.split(' ');

  return (
    <section className="bg-[#01030c] text-white py-28 sm:py-40">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-3">
          <span className="section-tag">(01) — Manifesto</span>
        </div>
        <div ref={ref} className="lg:col-span-9">
          <p className="font-[family-name:var(--font-montserrat)] text-3xl sm:text-5xl lg:text-6xl font-bold leading-[1.08] tracking-[-0.03em]">
            {words.map((w, i) => (
              <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]}>
                {w}
              </Word>
            ))}
          </p>
          <Link href="/about/history" className="mt-12 inline-flex items-center gap-3 text-sm font-semibold text-sky-300 group">
            <span className="h-px w-10 bg-sky-300 transition-all group-hover:w-16" />
            Read our history
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Stats                                                               */
/* ------------------------------------------------------------------ */

function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const [n, setN] = React.useState(0);
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  React.useEffect(() => {
    if (!inView) return;
    let start: number | null = null;
    let raf = 0;
    const step = (ts: number) => {
      if (start === null) start = ts;
      const p = Math.min((ts - start) / 2000, 1);
      setN(Math.floor((p === 1 ? 1 : 1 - Math.pow(2, -10 * p)) * to));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, to]);

  return (
    <span ref={ref}>
      {n.toLocaleString()}
      {suffix}
    </span>
  );
}

const STATS = [
  { label: 'Active members', value: 250, suffix: '+' },
  { label: 'Years of discourse', value: 30, suffix: '' },
  { label: 'Alumni network', value: 3000, suffix: '+' },
  { label: 'Practice debates', value: 10000, suffix: '+' },
];

export function Stats() {
  return (
    <section className="container mx-auto max-w-7xl px-4 sm:px-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px overflow-hidden rounded-[28px] border border-black/10 dark:border-white/10 bg-black/10 dark:bg-white/10">
        {STATS.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.8, delay: i * 0.08, ease }}
            className="bg-bg-light dark:bg-background p-6 sm:p-10"
          >
            <div className="font-numbers font-bold tracking-tight text-5xl sm:text-6xl xl:text-7xl">
              <Counter to={s.value} suffix={s.suffix} />
            </div>
            <div className="mt-3 text-xs sm:text-sm uppercase tracking-[0.2em] text-secondary-light dark:text-secondary">{s.label}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Bento pillars                                                       */
/* ------------------------------------------------------------------ */

function TiltCard({ className = '', children }: { className?: string; children: React.ReactNode }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const rx = useSpring(useMotionValue(0), { stiffness: 200, damping: 20 });
  const ry = useSpring(useMotionValue(0), { stiffness: 200, damping: 20 });

  function onMove(e: React.PointerEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    ry.set((px - 0.5) * 8);
    rx.set(-(py - 0.5) * 8);
    el.style.setProperty('--mx', `${px * 100}%`);
    el.style.setProperty('--my', `${py * 100}%`);
  }

  function onLeave() {
    rx.set(0);
    ry.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 1000 }}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.9, ease }}
      className={`spotlight-card group relative overflow-hidden rounded-[28px] border border-black/10 dark:border-white/10 bg-white dark:bg-white/[0.03] ${className}`}
    >
      {children}
    </motion.div>
  );
}

const PILLARS = [
  { href: '/events/archive', icon: Mic, title: 'Parliamentary Debate', desc: 'Weekly practice rounds, intra-varsity tournaments and national circuits in BP & Asian formats.', span: 'sm:col-span-2 lg:col-span-4 lg:row-span-2', feature: true },
  { href: '/content/resources', icon: BookOpen, title: 'Resources', desc: 'Motions banks, adjudication guides and training material.', span: 'lg:col-span-2' },
  { href: '/content/magazine', icon: Newspaper, title: 'Magazine', desc: 'Essays and ideas from our members.', span: 'lg:col-span-2' },
  { href: '/about/leadership', icon: Users, title: 'Leadership', desc: 'Executive, advisory, taskforce and alumni.', span: 'lg:col-span-2' },
  { href: '/verification/certificate', icon: BadgeCheck, title: 'Verification', desc: 'Validate certificates and memberships instantly.', span: 'lg:col-span-2' },
  { href: '/about/constitution', icon: Landmark, title: 'Constitution', desc: 'The principles that govern the house.', span: 'lg:col-span-2' },
];

export function Pillars() {
  return (
    <section className="container mx-auto max-w-7xl px-4 sm:px-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <span className="section-tag">(02) — What we do</span>
          <h2 className="mt-4 text-4xl sm:text-6xl font-black tracking-[-0.04em] leading-[0.95] max-w-2xl">
            Every skill a great <span className="italic font-light text-info-light dark:text-info">speaker</span> needs.
          </h2>
        </div>
        <p className="max-w-sm text-primary-light/60 dark:text-primary/60">
          From your first point of information to the grand final — structured training, real stages and a community that pushes you further.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-8 lg:auto-rows-[220px]" style={{ perspective: 1200 }}>
        {PILLARS.map((p) => (
          <TiltCard key={p.title} className={`${p.span} ${p.feature ? 'min-h-[360px] !bg-[#01030c] text-white !border-white/10' : 'min-h-[200px]'}`}>
            <Link href={p.href} className="relative z-10 flex h-full flex-col justify-between p-7">
              {p.feature && (
                <>
                  <Image
                    src="https://ia601508.us.archive.org/4/items/hero_20260913/facebook_1789317118244_7504939946319898352.jpg"
                    alt="Debating Society of HSTU members in session"
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="-z-10 object-cover opacity-50 transition-transform duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#01030c] via-[#01030c]/60 to-transparent" />
                </>
              )}
              <div className="flex items-start justify-between">
                <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${p.feature ? 'bg-white/10 backdrop-blur-md' : 'bg-info-light/10 text-info-light dark:bg-info/10 dark:text-info'}`}>
                  <p.icon className="h-5 w-5" />
                </span>
                <span className={`flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-300 group-hover:rotate-45 ${p.feature ? 'border-white/20 group-hover:bg-white group-hover:text-slate-950' : 'border-black/10 dark:border-white/15 group-hover:bg-info-light group-hover:text-white group-hover:border-transparent'}`}>
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </div>
              <div>
                <h3 className={`font-bold tracking-tight ${p.feature ? 'text-4xl sm:text-5xl' : 'text-xl'}`}>{p.title}</h3>
                <p className={`mt-2 text-sm leading-relaxed ${p.feature ? 'text-slate-300 max-w-md' : 'text-primary-light/60 dark:text-primary/60'}`}>{p.desc}</p>
              </div>
            </Link>
          </TiltCard>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Stories + Upcoming                                                  */
/* ------------------------------------------------------------------ */

export function StoriesAndEvents({ blogs, events }: { blogs: any[]; events: any[] }) {
  return (
    <section className="container mx-auto max-w-7xl px-4 sm:px-6">
      <div className="grid lg:grid-cols-12 gap-14">
        <div className="lg:col-span-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="section-tag">(03) — Journal</span>
              <h2 className="mt-4 text-4xl sm:text-5xl font-black tracking-[-0.04em]">Latest stories</h2>
            </div>
            <Link href="/content/blog" className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold group">
              View all
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 dark:border-white/15 transition-all group-hover:bg-info-light group-hover:text-white group-hover:border-transparent">
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          </div>

          <div className="flex flex-col">
            {blogs.map((item, idx) => (
              <motion.div
                key={item.id || idx}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: idx * 0.08, ease }}
              >
                <Link
                  href={`/content/blog/${item.slug || item.id}`}
                  className="group grid grid-cols-[96px_1fr] sm:grid-cols-[160px_1fr_auto] gap-5 sm:gap-8 items-center py-6 border-t border-black/10 dark:border-white/10 last:border-b"
                >
                  <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                    <Image
                      src={item.coverImageUrl || item.imageUrl || `https://picsum.photos/seed/blog${idx}/600/400`}
                      alt={item.title || 'Blog cover'}
                      fill
                      sizes="160px"
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] font-numbers uppercase tracking-[0.2em] text-info-light dark:text-info mb-2">
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
                        : 'Recent post'}
                    </div>
                    <h3 className="text-lg sm:text-2xl font-bold tracking-tight line-clamp-2 transition-colors group-hover:text-info-light dark:group-hover:text-info">
                      {item.title}
                    </h3>
                    <p className="hidden sm:block mt-2 text-sm text-primary-light/60 dark:text-primary/60 line-clamp-2">
                      {item.excerpt || (item.contentMarkdown ? item.contentMarkdown.replace(/<[^>]+>/g, '').substring(0, 150) : '')}
                    </p>
                    <div className="mt-3 flex items-center gap-2 min-w-0">
                      {item.authorImageUrl ? (
                        <Image
                          src={item.authorImageUrl}
                          alt={item.authorName || item.author || 'Author'}
                          width={24}
                          height={24}
                          className="w-6 h-6 rounded-full object-cover shrink-0"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span className="w-6 h-6 rounded-full bg-info-light/10 text-info-light dark:bg-info/10 dark:text-info flex items-center justify-center font-bold text-[9px] shrink-0">
                          {(item.authorName || item.author || 'DS').slice(0, 2).toUpperCase()}
                        </span>
                      )}
                      <span className="text-xs font-semibold truncate">{item.authorName || item.author || 'Debating Society of HSTU'}</span>
                      {item.authorRole && (
                        <span className="text-xs text-primary-light/50 dark:text-primary/50 truncate">· {item.authorRole}</span>
                      )}
                    </div>
                  </div>
                  <span className="hidden sm:flex h-12 w-12 items-center justify-center rounded-full border border-black/10 dark:border-white/15 transition-all duration-300 group-hover:rotate-45 group-hover:bg-info-light group-hover:text-white group-hover:border-transparent">
                    <ArrowUpRight className="h-5 w-5" />
                  </span>
                </Link>
              </motion.div>
            ))}
            {blogs.length === 0 && (
              <div className="py-12 border-y border-black/10 dark:border-white/10 text-center text-primary-light/50 dark:text-primary/50">
                No stories published yet.
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="section-tag">(04) — Agenda</span>
              <h2 className="mt-4 text-4xl sm:text-5xl font-black tracking-[-0.04em]">Upcoming</h2>
            </div>
            <Link href="/events/upcoming" className="text-sm font-semibold hover:text-info-light">
              More →
            </Link>
          </div>

          <div className="rounded-[28px] bg-[#01030c] text-white p-2 border border-white/10 shadow-2xl">
            {events.length === 0 && <div className="p-10 text-center text-slate-400">No upcoming events scheduled.</div>}
            {events.map((item, idx) => {
              const eventDate = item.eventDate ? new Date(item.eventDate) : new Date();
              const month = eventDate.toLocaleString('default', { month: 'short' });
              const day = eventDate.getDate().toString();
              const startStr = item.eventDate
                ? item.eventDate.replace(/-/g, '') + 'T' + (item.time ? item.time.replace(':', '') + '00Z' : '090000Z')
                : '20261114T090000Z';
              const endStr = item.eventDate ? item.eventDate.replace(/-/g, '') + 'T' + '235900Z' : '20261114T170000Z';

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-center gap-4 p-4 rounded-[22px] hover:bg-white/5 transition-colors group"
                >
                  <div className="w-16 h-16 shrink-0 rounded-2xl bg-gradient-to-br from-sky-400/20 to-indigo-500/10 border border-white/10 flex flex-col items-center justify-center">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-sky-300">{month}</span>
                    <span className="text-2xl font-numbers font-bold leading-none">{day}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold line-clamp-1 group-hover:text-sky-300 transition-colors">{item.title}</h4>
                    <p className="text-sm text-slate-400 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" /> {item.location || 'TBA'}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(item.title)}&dates=${startStr}/${endStr}&details=Join+us+for+${encodeURIComponent(item.title)}&location=${encodeURIComponent(item.location || 'TBA')}`;
                      window.open(url, '_blank', 'noopener,noreferrer');
                    }}
                    title="Add to Google Calendar"
                    aria-label="Add to Google Calendar"
                    className="shrink-0 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-sky-300 hover:bg-sky-400 hover:text-slate-950 transition-colors"
                  >
                    <CalendarPlus className="w-4 h-4" />
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Closing CTA                                                         */
/* ------------------------------------------------------------------ */

export function ClosingCta() {
  const ref = React.useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end end'] });
  const x1 = useTransform(scrollYProgress, [0, 1], ['-12%', '0%']);
  const x2 = useTransform(scrollYProgress, [0, 1], ['12%', '0%']);
  const orbScale = useTransform(scrollYProgress, [0, 1], [0.6, 1.1]);

  return (
    <section ref={ref} className="container mx-auto max-w-7xl px-4 sm:px-6">
      <div className="relative overflow-hidden rounded-[36px] bg-[#01030c] text-white px-6 sm:px-12 py-20 sm:py-28 isolate">
        <motion.div
          style={{ scale: orbScale }}
          className="absolute -right-24 -top-24 -z-10 h-[520px] w-[520px] rounded-full bg-[conic-gradient(from_120deg,#3b82f6,#a78bfa,#f59e0b,#38bdf8,#3b82f6)] blur-[90px] opacity-50"
        />
        <div className="absolute inset-0 -z-10 opacity-[0.07] hero-grid" />
        <span className="section-tag !text-slate-400">(05) — Join the house</span>
        <h2 className="mt-6 font-black uppercase tracking-[-0.05em] leading-[0.85] text-[16vw] lg:text-[180px]">
          <motion.span style={{ x: x1 }} className="block whitespace-nowrap">Take the</motion.span>
          <motion.span style={{ x: x2 }} className="block whitespace-nowrap text-right text-transparent [-webkit-text-stroke:2px_rgba(255,255,255,0.85)]">floor.</motion.span>
        </h2>
        <div className="mt-10 flex flex-col sm:flex-row sm:items-center justify-between gap-8">
          <p className="max-w-md text-slate-300">
            Whether it&apos;s your first speech or your fiftieth, there&apos;s a seat on the bench for you. Reach out and we&apos;ll get you on the next round.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="group inline-flex items-center gap-2 rounded-full bg-white text-slate-950 pl-6 pr-2 h-14 font-semibold transition-transform hover:scale-[1.03]"
            >
              Get in touch
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-950 text-white transition-transform group-hover:rotate-[-45deg]">
                <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
            <Link href="/contact/faq" className="inline-flex items-center rounded-full border border-white/20 px-6 h-14 font-semibold hover:bg-white/10 transition-colors">
              Read FAQ
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
