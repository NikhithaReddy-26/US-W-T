
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Heart, CheckCircle2, X, ExternalLink, Volume2, VolumeX, Sparkles } from 'lucide-react';
import emailjs from '@emailjs/browser';
import backgroundAudioUrl from './assets/audio/Thousand-Years.mp3?url';

/** Bundled via Vite `?url` so the file resolves on any `base` (GitHub Pages, etc.). */
const BACKGROUND_AUDIO_SRC = backgroundAudioUrl;
/** Ending clip served from `public/videos/`. */
const CLOSING_VIDEO_SRC = `${import.meta.env.BASE_URL}videos/8b76b10d-9ae3-44cb-ace2-976bc58da0fe.mp4`;

const VENUE_MAPS_EMBED =
  'https://maps.google.com/maps?q=Malhar+Heritage+Garden+and+Resort+New+RTO+Road+Palda+Indore+452020&z=14&output=embed';
const VENUE_MAPS_LINK =
  'https://www.google.com/maps/search/?api=1&query=Malhar+Heritage+Garden+and+Resort+Palda+Indore';
/** Loop window: 1:02 → 1:30 (~28s), then restart at 1:02. */
const BG_MUSIC_LOOP_START_SEC = 62;
const BG_MUSIC_LOOP_END_SEC = 90;

function startBackgroundAudio(audio) {
  const tryPlay = () => {
    const p = audio.play();
    if (p === undefined) return;
    p.catch(() => {
      const onCanPlay = () => {
        audio.removeEventListener('canplay', onCanPlay);
        void audio.play().catch(() => {});
      };
      audio.addEventListener('canplay', onCanPlay, { once: true });
    });
  };
  tryPlay();
}

const CONFETTI_GOLD_SILVER = ['#E8C547', '#FFD700', '#FFF8DC', '#D4AF37', '#F5E6B4', '#C0C0C0', '#D8D8D8', '#ECECEC', '#A8A8A8'];

function EntryConfettiBurst({ burstId, visible }) {
  const particles = useMemo(() => {
    if (!visible) return [];
    return Array.from({ length: 96 }, (_, i) => {
      const angle = (Math.PI * 2 * i) / 24 + Math.random() * 0.5;
      const speed = 320 + Math.random() * 420;
      const dx = Math.cos(angle) * speed * (0.4 + Math.random() * 0.6);
      const dy = Math.sin(angle) * speed * (0.4 + Math.random() * 0.6) - 180 - Math.random() * 200;
      const rot = (Math.random() - 0.5) * 1080;
      return {
        id: `${burstId}-${i}`,
        color: CONFETTI_GOLD_SILVER[i % CONFETTI_GOLD_SILVER.length],
        delay: Math.random() * 0.12,
        duration: 1.55 + Math.random() * 0.55,
        dx,
        dy,
        rot,
        w: 4 + Math.random() * 7,
        h: 5 + Math.random() * 9,
        square: Math.random() > 0.45,
        leftPct: 48 + (Math.random() - 0.5) * 8,
        topPct: 52 + (Math.random() - 0.5) * 6,
      };
    });
  }, [burstId, visible]);

  if (!visible || particles.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[100] overflow-hidden"
      aria-hidden="true"
    >
      <style>{`
        @keyframes entry-confetti-fly {
          from {
            transform: translate3d(0, 0, 0) rotate(0deg);
            opacity: 1;
          }
          to {
            transform: translate3d(var(--tx), var(--ty), 0) rotate(var(--rot));
            opacity: 0;
          }
        }
      `}</style>
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute shadow-sm"
          style={{
            left: `${p.leftPct}%`,
            top: `${p.topPct}%`,
            width: `${p.w}px`,
            height: `${p.h}px`,
            borderRadius: p.square ? '2px' : '50%',
            backgroundColor: p.color,
            boxShadow: '0 0 4px rgba(255, 215, 0, 0.35)',
            ['--tx']: `${p.dx}px`,
            ['--ty']: `${p.dy}px`,
            ['--rot']: `${p.rot}deg`,
            opacity: 0.95,
            animation: `entry-confetti-fly ${p.duration}s cubic-bezier(0.22, 0.61, 0.36, 1) ${p.delay}s forwards`,
          }}
        />
      ))}
    </div>
  );
}

const INVITE_DECO_VARIANTS = [
  {
    orbs: [
      'top-0 right-0 h-[min(280px,55vw)] w-[min(280px,55vw)] translate-x-1/3 -translate-y-1/4 bg-rose-200/35',
      'bottom-0 left-0 h-56 w-56 -translate-x-1/4 translate-y-1/3 bg-violet-200/25',
    ],
  },
  {
    orbs: [
      'top-8 left-0 h-52 w-52 -translate-x-1/3 bg-violet-200/30',
      'bottom-12 right-0 h-64 w-64 translate-x-1/4 bg-amber-100/40',
    ],
  },
  {
    orbs: [
      'top-1/4 right-4 h-48 w-48 bg-amber-100/35',
      'bottom-0 left-1/4 h-72 w-72 -translate-x-1/2 translate-y-1/4 bg-rose-100/30',
    ],
  },
  {
    orbs: [
      'top-0 left-1/2 h-60 w-60 -translate-x-1/2 -translate-y-1/2 bg-violet-100/25',
      'bottom-8 right-8 h-52 w-52 bg-emerald-100/25',
    ],
  },
];

function InviteSectionDecor({ variant = 0 }) {
  const v = INVITE_DECO_VARIANTS[variant % INVITE_DECO_VARIANTS.length];
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      {v.orbs.map((cls, i) => (
        <div key={i} className={`absolute rounded-full blur-3xl ${cls}`} />
      ))}
      <div
        className="absolute inset-0 opacity-[0.55]"
        style={{
          backgroundImage:
            'radial-gradient(circle at center, rgba(74, 53, 104, 0.055) 1.2px, transparent 1.2px)',
          backgroundSize: '22px 22px',
        }}
      />
      <svg
        className="invite-deco-drift absolute left-3 top-10 h-16 w-16 text-rose-300/35 sm:left-6"
        viewBox="0 0 64 64"
        fill="none"
      >
        <path
          d="M10 48 Q10 14 48 10"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
        <path d="M44 14 l4 4" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      </svg>
      <svg
        className="invite-deco-drift-slow absolute bottom-16 right-4 h-14 w-14 -scale-x-100 text-violet-300/30 sm:right-8"
        viewBox="0 0 64 64"
        fill="none"
      >
        <path
          d="M10 48 Q10 14 48 10"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      </svg>
      <Heart
        strokeWidth={1}
        className="invite-deco-drift-slow absolute right-[10%] top-[18%] h-7 w-7 text-rose-300/30 sm:right-[14%]"
      />
      <Heart
        strokeWidth={1}
        className="invite-deco-drift absolute bottom-[22%] left-[6%] h-5 w-5 text-violet-300/25 sm:left-[10%]"
      />
      <Sparkles
        className="invite-deco-sparkle absolute bottom-[28%] right-[15%] h-5 w-5 text-amber-400/40"
      />
      <Sparkles
        className="invite-deco-sparkle absolute left-[14%] top-[32%] h-4 w-4 text-amber-400/30"
        style={{ animationDelay: '0.9s' }}
      />
      <div className="invite-deco-sparkle absolute right-[24%] top-[40%] h-1.5 w-1.5 rounded-full bg-amber-400/50" />
      <div
        className="invite-deco-sparkle absolute bottom-[40%] left-[22%] h-1 w-1 rounded-full bg-violet-400/40"
        style={{ animationDelay: '0.5s' }}
      />
    </div>
  );
}

const App = () => {
 // Target date for the wedding: June
 const targetDate = new Date('2026-06-21T12:00:00');

 const calculateTimeLeft = () => {
   const now = new Date();
   const difference = targetDate - now;

   let timeLeft = {
     days: 0,
     hours: 0,
     minutes: 0,
     seconds: 0
   };

   if (difference > 0) {
     timeLeft = {
       days: Math.floor(difference / (1000 * 60 * 60 * 24)),
       hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
       minutes: Math.floor((difference / 1000 / 60) % 60),
       seconds: Math.floor((difference / 1000) % 60),
     };
   }

   return timeLeft;
 };

 const [formData, setFormData] = useState({
   name: '',
   attendance: '',
   drinks: []
 });
 const [showModal, setShowModal] = useState(false);
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [errors, setErrors] = useState({});
 const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
 const [envelopeOpened, setEnvelopeOpened] = useState(false);
 const audioRef = useRef(null);
 const closingVideoRef = useRef(null);
 const [bgMusicMuted, setBgMusicMuted] = useState(false);
 const [celebrationBurstId, setCelebrationBurstId] = useState(0);
 const [showCelebrationConfetti, setShowCelebrationConfetti] = useState(false);

 const toggleBgMusicMute = useCallback(() => {
   setBgMusicMuted((m) => {
     const next = !m;
     if (audioRef.current) audioRef.current.muted = next;
     return next;
   });
 }, []);

 const handleOpenEnvelope = useCallback((scrollTargetId) => {
   const audio = audioRef.current;
   if (audio) {
     audio.currentTime = BG_MUSIC_LOOP_START_SEC;
     audio.muted = bgMusicMuted;
     startBackgroundAudio(audio);
   }
   setEnvelopeOpened(true);
   if (scrollTargetId) {
     window.setTimeout(() => {
       document.getElementById(scrollTargetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
     }, 200);
   }
 }, [bgMusicMuted]);

 const handleOpenInvitationWithCelebration = useCallback(() => {
   const reduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
   if (!reduced) {
     setCelebrationBurstId((n) => n + 1);
     setShowCelebrationConfetti(true);
     window.setTimeout(() => setShowCelebrationConfetti(false), 2400);
   }
   handleOpenEnvelope();
 }, [handleOpenEnvelope]);

 // Update timer every second
 useEffect(() => {
   const timer = setInterval(() => {
     setTimeLeft(calculateTimeLeft());
   }, 1000);

   return () => clearInterval(timer);
 }, []);

 // Initialize EmailJS
 useEffect(() => {
   emailjs.init('zZXU1FFQ88dH-aVov');
 }, []);

 // Font imports
 useEffect(() => {
   const link = document.createElement('link');
   link.href =
     'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Italianno&family=Source+Sans+3:ital,wght@0,400;0,500;0,600&display=swap';
   link.rel = 'stylesheet';
   document.head.appendChild(link);
 }, []);

 // Background music: loop 1:02–1:30 (starts when invite opens)
 useEffect(() => {
   if (!envelopeOpened) return;
   const audio = audioRef.current;
   if (!audio) return;

   const onTimeUpdate = () => {
     if (audio.currentTime >= BG_MUSIC_LOOP_END_SEC) {
       audio.currentTime = BG_MUSIC_LOOP_START_SEC;
     }
   };
   audio.addEventListener('timeupdate', onTimeUpdate);

   return () => {
     audio.removeEventListener('timeupdate', onTimeUpdate);
   };
 }, [envelopeOpened]);

 useEffect(() => {
   const audio = audioRef.current;
   if (audio) audio.muted = bgMusicMuted;
 }, [bgMusicMuted]);

 // Closing video: autoplay when section is on screen, pause when scrolled away
 useEffect(() => {
   if (!envelopeOpened) return;
   const video = closingVideoRef.current;
   if (!video) return;

   const reduceMotion =
     typeof window !== 'undefined' &&
     window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

   const tryPlay = () => {
     if (reduceMotion) return;
     const p = video.play();
     if (p !== undefined) {
       p.catch(() => {
         video.muted = true;
         void video.play().catch(() => {});
       });
     }
   };

   const observer = new IntersectionObserver(
     (entries) => {
       const entry = entries[0];
       if (!entry) return;
       if (entry.isIntersecting && entry.intersectionRatio >= 0.38) {
         tryPlay();
       } else {
         video.pause();
       }
     },
     { threshold: [0, 0.38, 0.55, 0.75], rootMargin: '0px 0px -8% 0px' }
   );

   observer.observe(video);
   return () => observer.disconnect();
 }, [envelopeOpened]);

 const handleDrinkToggle = (drink) => {
   setFormData(prev => ({
     ...prev,
     drinks: prev.drinks.includes(drink)
       ? prev.drinks.filter(d => d !== drink)
       : [...prev.drinks, drink]
   }));
 };

 const validate = () => {
   const newErrors = {};
   if (!formData.name.trim()) newErrors.name = true;
   if (!formData.attendance) newErrors.attendance = true;
   if (formData.drinks.length === 0) newErrors.drinks = true;
   setErrors(newErrors);
   return Object.keys(newErrors).length === 0;
 };

 const handleSubmit = (e) => {
   e.preventDefault();
   if (!validate()) return;

   setIsSubmitting(true);

   const templateParams = {
     to_email: 'nikhitha.thimmannagaari@gmail.com',
     from_name: formData.name,
     attendance: formData.attendance === 'yes' ? 'Yes, will attend' : formData.attendance === 'no' ? 'Cannot attend' : 'Will confirm later',
     drinks: formData.drinks.join(', ') || 'Not specified',
     message: `New RSVP Submission\n\nName: ${formData.name}\nAttendance: ${formData.attendance === 'yes' ? 'Yes, will attend' : formData.attendance === 'no' ? 'Cannot attend' : 'Will confirm later'}\nDrinks: ${formData.drinks.join(', ') || 'Not specified'}`
   };

   emailjs.send('service_mopkcmt', 'template_73jmv6m', templateParams)
     .then(() => {
       setIsSubmitting(false);
       setShowModal(true);
       setFormData({ name: '', attendance: '', drinks: [] });
     })
     .catch((error) => {
       console.error('Email send error:', error);
       setIsSubmitting(false);
       alert('Error submitting form. Please try again.');
     });
 };

 // Helper to pad numbers with leading zeros
 const formatNum = (num) => num.toString().padStart(2, '0');

 return (
   <div className="min-h-screen w-full max-w-[100vw] overflow-x-hidden bg-[#FDFBF9] font-['Source_Sans_3'] text-[#4A4A4A] antialiased selection:bg-[#D4C3B3] selection:text-white">
     <EntryConfettiBurst burstId={celebrationBurstId} visible={showCelebrationConfetti} />
     <audio
       ref={audioRef}
       src={BACKGROUND_AUDIO_SRC}
       preload="auto"
       playsInline
       className="sr-only"
       aria-hidden="true"
     />
     {/* Entry gate — wedding motion + gold/silver confetti on open */}
     {!envelopeOpened && (
       <div className="fixed inset-0 z-50 flex flex-col overflow-y-auto overflow-x-hidden bg-[#FAFAFA] text-neutral-900">
         <style>{`
           @keyframes entry-fade-up {
             from { opacity: 0; transform: translateY(10px); }
             to { opacity: 1; transform: translateY(0); }
           }
           @keyframes entry-heart-float {
             0%, 100% { transform: translateY(0) rotate(-6deg) scale(1); opacity: 0.2; }
             50% { transform: translateY(-16px) rotate(6deg) scale(1.12); opacity: 0.4; }
           }
           @keyframes entry-sparkle {
             0%, 100% { opacity: 0.15; transform: scale(1); }
             50% { opacity: 0.55; transform: scale(1.25); }
           }
           @keyframes entry-rings-sway {
             0%, 100% { transform: rotate(-4deg); }
             50% { transform: rotate(4deg); }
           }
           @keyframes entry-floral-glow {
             0%, 100% { opacity: 1; filter: brightness(1) saturate(1); }
             50% { opacity: 0.94; filter: brightness(1.06) saturate(1.08); }
           }
           @keyframes entry-title-soft {
             0%, 100% { text-shadow: 0 0 0 rgba(91, 61, 122, 0); }
             50% { text-shadow: 0 6px 28px rgba(91, 61, 122, 0.08); }
           }
           .entry-animate { animation: entry-fade-up 0.7s ease-out both; }
           .entry-animate-delay { animation: entry-fade-up 0.7s ease-out 0.1s both; }
           .entry-animate-delay-2 { animation: entry-fade-up 0.7s ease-out 0.2s both; }
           .entry-deco-heart { animation: entry-heart-float 5.2s ease-in-out infinite; }
           .entry-deco-heart-2 { animation: entry-heart-float 6s ease-in-out 0.5s infinite; }
           .entry-deco-heart-3 { animation: entry-heart-float 5.5s ease-in-out 1s infinite reverse; }
           .entry-sparkle-dot { animation: entry-sparkle 2.8s ease-in-out infinite; }
           .entry-rings-wrap { animation: entry-rings-sway 5s ease-in-out infinite; }
           .entry-floral-pulse { animation: entry-floral-glow 7s ease-in-out infinite; }
           .entry-names-glow { animation: entry-title-soft 5s ease-in-out infinite; }
         `}</style>

         {/* Ambient wedding decor */}
         <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
           <Heart className="entry-deco-heart absolute bottom-[18%] left-[6%] h-10 w-10 text-rose-300/50 sm:left-[10%]" strokeWidth={1} />
           <Heart className="entry-deco-heart-2 absolute bottom-[24%] right-[8%] h-8 w-8 text-violet-200/60 sm:right-[12%]" strokeWidth={1} />
           <Heart className="entry-deco-heart-3 absolute top-[38%] left-[4%] h-6 w-6 text-amber-200/45 sm:left-[8%]" strokeWidth={1} />
           <span className="entry-sparkle-dot absolute top-[32%] right-[14%] h-1.5 w-1.5 rounded-full bg-amber-400/80 sm:right-[18%]" />
           <span className="entry-sparkle-dot absolute top-[48%] left-[20%] h-1 w-1 rounded-full bg-violet-300/70" style={{ animationDelay: '0.6s' }} />
           <span className="entry-sparkle-dot absolute bottom-[30%] right-[22%] h-1.5 w-1.5 rounded-full bg-amber-300/60" style={{ animationDelay: '1.1s' }} />
         </div>

         {/* Softer floral header — shorter so content sits higher on phones */}
         <div className="entry-floral-pulse pointer-events-none relative h-[min(28vh,200px)] w-full shrink-0 sm:h-[min(32vh,240px)]">
           <svg
             className="absolute inset-x-0 top-0 h-full w-full text-transparent"
             viewBox="0 0 900 220"
             preserveAspectRatio="xMidYMin slice"
             aria-hidden="true"
           >
             <defs>
               <filter id="entry-watercolor" x="-20%" y="-20%" width="140%" height="140%">
                 <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="b" />
                 <feColorMatrix in="b" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.9 0" />
               </filter>
               <linearGradient id="entry-leaf" x1="0%" y1="0%" x2="100%" y2="100%">
                 <stop offset="0%" stopColor="#7D9B76" stopOpacity="0.5" />
                 <stop offset="100%" stopColor="#4A6350" stopOpacity="0.4" />
               </linearGradient>
             </defs>
             <g filter="url(#entry-watercolor)">
               <ellipse cx="120" cy="42" rx="48" ry="58" fill="#5B3D7A" opacity="0.42" transform="rotate(-8 120 42)" />
               <ellipse cx="220" cy="64" rx="40" ry="50" fill="#8B6CB0" opacity="0.38" />
               <ellipse cx="780" cy="46" rx="50" ry="60" fill="#5B3D7A" opacity="0.4" transform="rotate(10 780 46)" />
               <ellipse cx="680" cy="70" rx="42" ry="52" fill="#A78BC8" opacity="0.36" />
               <ellipse cx="450" cy="32" rx="64" ry="44" fill="#6B4E8C" opacity="0.32" />
               <ellipse cx="380" cy="54" rx="44" ry="48" fill="#B59FD9" opacity="0.34" />
               <ellipse cx="520" cy="50" rx="46" ry="46" fill="#8E6EAE" opacity="0.3" />
             </g>
             <path d="M40 16 Q88 88 130 180" fill="none" stroke="url(#entry-leaf)" strokeWidth="12" strokeLinecap="round" opacity="0.3" />
             <path d="M860 18 Q812 92 770 184" fill="none" stroke="url(#entry-leaf)" strokeWidth="12" strokeLinecap="round" opacity="0.28" />
             <g fill="#C9A227" opacity="0.5">
               <circle cx="200" cy="30" r="2" />
               <circle cx="420" cy="18" r="1.6" />
               <circle cx="640" cy="24" r="1.8" />
               <circle cx="480" cy="40" r="1.4" />
             </g>
           </svg>
         </div>

         <div className="relative z-10 mx-auto flex w-full max-w-lg flex-1 flex-col px-4 pb-8 pt-2 text-center sm:max-w-xl sm:px-8">
           <p className="entry-animate font-['Cormorant_Garamond'] text-[11px] uppercase tracking-[0.28em] text-neutral-600 sm:text-xs">
             Together with their families
           </p>
           <h1 className="entry-animate-delay entry-names-glow mt-4 font-['Cormorant_Garamond'] text-[clamp(1.6rem,5.5vw,2.75rem)] font-semibold leading-tight text-neutral-900">
             Urvisha <span className="text-neutral-400 font-normal">&amp;</span> Samyak
           </h1>
           <p className="entry-animate-delay mt-5 font-['Cormorant_Garamond'] text-[13px] leading-relaxed text-neutral-700 sm:text-sm">
             June 21, 2026
             <span className="mx-2 text-neutral-300">·</span>
             Malhar Heritage, Indore
           </p>
           <p className="entry-animate-delay-2 mt-2 font-['Cormorant_Garamond'] text-sm text-neutral-600">
             <span className="font-semibold tabular-nums text-[#5B3D7A]">{Math.max(0, timeLeft.days)}</span>
             {' '}days to go
           </p>

           <div className="entry-animate-delay-2 entry-rings-wrap mx-auto mt-8 flex justify-center text-neutral-400/90" aria-hidden="true">
             <svg width="72" height="40" viewBox="0 0 72 40" fill="none" className="drop-shadow-sm">
               <ellipse cx="28" cy="22" rx="14" ry="16" stroke="currentColor" strokeWidth="1.5" transform="rotate(-18 28 22)" />
               <ellipse cx="44" cy="22" rx="14" ry="16" stroke="currentColor" strokeWidth="1.5" transform="rotate(18 44 22)" />
               <circle cx="36" cy="8" r="1.5" fill="#E8C547" opacity="0.85" />
             </svg>
           </div>

           <div className="entry-animate-delay-2 mt-10 w-full flex flex-col items-center gap-3">
             <button
               type="button"
               onClick={handleOpenInvitationWithCelebration}
               className="flex min-h-[52px] w-full max-w-[300px] items-center justify-center rounded-2xl bg-[#4A3568] px-6 text-[15px] font-semibold tracking-wide text-white shadow-md transition hover:bg-[#3d2c56] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4A3568] focus-visible:ring-offset-2"
             >
               Open invitation
             </button>
           </div>
         </div>
       </div>
     )}

     {envelopeOpened && (
       <style>{`
         body { overflow: auto; }
       `}</style>
     )}
     {/* Hero Section */}
     <section id="welcome" className="relative isolate scroll-mt-6 overflow-hidden px-4 pb-8 pt-8 sm:px-6 sm:pb-10 sm:pt-10">
       <InviteSectionDecor variant={0} />
       <div className="relative z-10 mx-auto flex w-full max-w-lg flex-col items-center sm:max-w-xl">
       <div className="mb-6 flex w-full max-w-full justify-between gap-3 border-b border-[#4A4A4A]/20 pb-2 text-sm sm:mb-8">
         <div className="text-center">
           <p className="font-['Cormorant_Garamond'] text-lg">21.06.26</p>
           <p className="uppercase tracking-widest text-[10px] opacity-60">date</p>
         </div>
         <div className="text-center">
           <p className="font-['Cormorant_Garamond'] text-lg">Malhar Heritage, Indore</p>
           <p className="uppercase tracking-widest text-[10px] opacity-60">place</p>
         </div>
       </div>

       <h2 className="font-['Italianno'] mb-4 text-[2.75rem] leading-none md:text-6xl">Urvisha &amp; Samyak</h2>
       <h1 className="mb-3 max-w-md px-1 text-center font-['Cormorant_Garamond'] text-lg leading-tight sm:mb-4 sm:text-xl">
         We are inviting you to our wedding!
       </h1>
      
       {/* Countdown Timer */}
       {/* <div className="flex gap-4 mb-8 font-['Cormorant_Garamond'] text-[#4A4A4A]/80">
         <div className="flex flex-col items-center">
           <span className="text-2xl">{formatNum(timeLeft.days)}</span>
           <span className="text-[10px] uppercase tracking-tighter opacity-60">Days</span>
         </div>
         <span className="text-2xl opacity-30">:</span>
         <div className="flex flex-col items-center">
           <span className="text-2xl">{formatNum(timeLeft.hours)}</span>
           <span className="text-[10px] uppercase tracking-tighter opacity-60">Hours</span>
         </div>
         <span className="text-2xl opacity-30">:</span>
         <div className="flex flex-col items-center">
           <span className="text-2xl">{formatNum(timeLeft.minutes)}</span>
           <span className="text-[10px] uppercase tracking-tighter opacity-60">Mins</span>
         </div>
         <span className="text-2xl opacity-30">:</span>
         <div className="flex flex-col items-center">
           <span className="text-2xl">{formatNum(timeLeft.seconds)}</span>
           <span className="text-[10px] uppercase tracking-tighter opacity-60">Secs</span>
         </div>
       </div> */}
       
       <p className="mb-4 text-center font-['Cormorant_Garamond'] italic opacity-80 sm:mb-5">
         Let&apos;s celebrate the best day<br />of our life together!
       </p>
       <div className="relative aspect-[3/4] w-full max-w-full overflow-hidden rounded-t-full shadow-2xl sm:max-w-md">
         <img
           src="assets/images/3e752669-0d2c-451b-917a-aad4e9c85d90.jpg"
           alt="Couple"
           className="w-full h-full object-cover"
         />
         <div className="absolute inset-0 bg-gradient-to-t from-[#FDFBF9] via-transparent to-transparent opacity-40"></div>
       </div>
       </div>
     </section>

     {/* Intro Text */}
     <section id="our-story" className="relative isolate mx-auto w-full max-w-2xl scroll-mt-6 overflow-hidden px-4 py-10 text-center sm:px-8 sm:py-14">
       <InviteSectionDecor variant={1} />
       <div className="relative z-10">
       <h3 className="font-['Italianno'] mb-5 text-4xl md:mb-6 md:text-5xl">Dear friends and family!</h3>
       <p className="mb-4 font-['Cormorant_Garamond'] leading-relaxed sm:mb-5">
         This summer a very special and happy event is going to happen - our wedding.
       </p>
       <p className="mb-8 font-['Cormorant_Garamond'] leading-relaxed sm:mb-10">
         It is impossible to imagine this day without our closest people. Thus, we are happy to invite you to join and share this wonderful occasion with us.
       </p>
      
       {/* Decorative Dove/Leaf */}
       <div className="flex justify-center">
        {/* Countdown Timer */}
       <div className="flex gap-4 mb-8 font-['Cormorant_Garamond'] text-[#4A4A4A]/80">
         <div className="flex flex-col items-center">
           <span className="text-2xl">{formatNum(timeLeft.days)}</span>
           <span className="text-[10px] uppercase tracking-tighter opacity-60">Days</span>
         </div>
         <span className="text-2xl opacity-30">:</span>
         <div className="flex flex-col items-center">
           <span className="text-2xl">{formatNum(timeLeft.hours)}</span>
           <span className="text-[10px] uppercase tracking-tighter opacity-60">Hours</span>
         </div>
         <span className="text-2xl opacity-30">:</span>
         <div className="flex flex-col items-center">
           <span className="text-2xl">{formatNum(timeLeft.minutes)}</span>
           <span className="text-[10px] uppercase tracking-tighter opacity-60">Mins</span>
         </div>
         <span className="text-2xl opacity-30">:</span>
         <div className="flex flex-col items-center">
           <span className="text-2xl">{formatNum(timeLeft.seconds)}</span>
           <span className="text-[10px] uppercase tracking-tighter opacity-60">Secs</span>
         </div>
       </div>
       </div>
       <div className="mt-8 pt-6 sm:mt-10 sm:pt-8">
         <div className="h-px bg-gradient-to-r from-transparent via-[#4A4A4A]/30 to-transparent"></div>
       </div>
       </div>
     </section>
      {/* Timeline */}
      <section id="schedule" className="relative isolate scroll-mt-6 overflow-hidden px-4 pb-10 pt-6 sm:px-6 sm:pb-14 sm:pt-8">
       <InviteSectionDecor variant={2} />
       <div className="relative z-10 mx-auto w-full max-w-xl sm:max-w-2xl">
       <h3 className="font-['Italianno'] mb-3 text-center text-4xl sm:text-5xl md:text-6xl">Event timeline</h3>
       <h3 className="font-['Italianno'] mb-6 text-center text-3xl sm:mb-8 sm:text-4xl md:text-5xl">Pre-Wedding Celebrations</h3>
       <div className="relative mx-auto w-full rounded-[40px] border border-[#4A4A4A]/20 p-5 sm:p-8">
         <div className="-mt-8 mb-6 flex justify-center sm:-mt-12 sm:mb-8">
           <div className="bg-[#FDFBF9] px-6 py-2 border border-[#4A4A4A]/20 rounded-full font-['Cormorant_Garamond']">
             20 June
           </div>
         </div>

         <div className="space-y-6 font-['Cormorant_Garamond'] sm:space-y-8">
           <div className="text-center">
             <p className="font-bold">1:00 pm - Traditional Rituals</p>
             <p className="text-sm opacity-70">(Gehu, Chana Muhurat, Peravani & Botna/Mayra),<br />“Honoring traditions and family blessings”</p>
           </div>
           <div className="text-center">
             <p className="font-bold">2:00 pm - Haldi Carnival</p>
             <p className="text-sm opacity-70">“A vibrant splash of color, laughter & love”</p>
           </div>
           <div className="text-center">
             <p className="font-bold">5:30 pm - Pre-Sunset Dinner</p>
             <p className="text-sm opacity-70">“An elegant evening under the golden sky”</p>
           </div>
           <div className="text-center">
             <p className="font-bold">7:00 pm - Glamorous Sangeet</p>
             <p className="text-sm opacity-70">“An evening of music, dance & celebration”</p>
           </div>
           <div className="text-center">
             <p className="font-bold">11:00 pm - After Party / DJ Night</p>
             <p className="text-sm opacity-70">“Dance the night away” ✨</p>
           </div>
         </div>
        
         <div className="flex justify-center mt-8 gap-1">
           <div className="w-1 h-1 rounded-full bg-[#4A4A4A]/40"></div>
           <div className="w-4 h-1 rounded-full bg-[#4A4A4A]/60"></div>
           <div className="w-1 h-1 rounded-full bg-[#4A4A4A]/40"></div>
         </div>
       </div>
       </div>
     </section>
      {/* Timeline */}
      <section className="relative isolate overflow-hidden px-4 pb-10 pt-4 sm:px-6 sm:pb-14 sm:pt-6">
       <InviteSectionDecor variant={3} />
       <div className="relative z-10 mx-auto w-full max-w-xl sm:max-w-2xl">
       <h3 className="font-['Italianno'] mb-6 text-center text-4xl sm:mb-8 sm:text-5xl md:text-6xl">Where forever begins!!</h3>
       <div className="relative mx-auto w-full rounded-[40px] border border-[#4A4A4A]/20 p-5 sm:p-8">
         <div className="-mt-8 mb-6 flex justify-center sm:-mt-12 sm:mb-8">
           <div className="bg-[#FDFBF9] px-6 py-2 border border-[#4A4A4A]/20 rounded-full font-['Cormorant_Garamond']">
             21 June
           </div>
         </div>

         <div className="space-y-6 font-['Cormorant_Garamond'] sm:space-y-8">
           <div className="text-center">
             <p className="font-bold">8:00 am - Sacred Dev Darshan</p>
             <p className="text-sm opacity-70">A Sacred Beginning with Divine Blessings</p>
           </div>
           <div className="text-center">
             <p className="font-bold">11:00 am - Baraat/Procession</p>
             <p className="text-sm opacity-70">A Grand Celebration of Joy & Rhythm<br />Keep energy high (dhol + maybe a DJ mix)</p>
           </div>
           <div className="text-center">
             <p className="font-bold">11:30 am - Lagan Ceremony</p>
             <p className="text-sm opacity-70">Where Two Souls Become One</p>
           </div>
           <div className="text-center">
             <p className="font-bold">12:00 pm - Reception</p>
             <p className="text-sm opacity-70">An Afternoon of Love, Laughter & Celebration</p>

           </div>
           <div className="text-center">
             <p className="font-bold">4:30 pm - Musical Pheras</p>
             <p className="text-sm opacity-70">Sacred Vows Around the Eternal Flame</p>
           </div>
           <div className="text-center">
             <p className="font-bold">7:00 pm - Vidai/Farewell</p>
             <p className="text-sm opacity-70">A Bittersweet Farewell to New Beginnings</p>
           </div>
         </div>
        
         <div className="flex justify-center mt-8 gap-1">
           <div className="w-1 h-1 rounded-full bg-[#4A4A4A]/40"></div>
           <div className="w-4 h-1 rounded-full bg-[#4A4A4A]/60"></div>
           <div className="w-1 h-1 rounded-full bg-[#4A4A4A]/40"></div>
         </div>
       </div>
       </div>
     </section>
    

     {/* Image Separator */}
     <section className="relative isolate h-[min(52vh,520px)] w-full overflow-hidden sm:h-[min(55vh,600px)]">
       <img
         src="/assets/images/PHOTO-2026-04-27-20-16-19.jpg"
         alt="Wedding mood"
         className="h-full w-full object-cover"
       />
       <div
         className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#FDFBF9]/90 via-transparent to-[#FDFBF9]/25"
         aria-hidden="true"
       />
       <Heart
         strokeWidth={1}
         className="invite-deco-drift absolute left-[8%] top-[20%] h-8 w-8 text-white/45 drop-shadow-sm"
       />
       <Heart
         strokeWidth={1}
         className="invite-deco-drift-slow absolute bottom-[18%] right-[10%] h-6 w-6 text-white/35 drop-shadow-sm"
       />
       <Sparkles className="invite-deco-sparkle absolute left-1/2 top-[15%] h-6 w-6 -translate-x-1/2 text-amber-200/60" />
       <div
         className="absolute inset-0 opacity-30"
         style={{
           backgroundImage:
             'radial-gradient(circle at center, rgba(255,255,255,0.35) 1px, transparent 1px)',
           backgroundSize: '18px 18px',
         }}
         aria-hidden="true"
       />
     </section>

     {/* Dress Code */}
     <section className="relative isolate mx-auto w-full max-w-2xl overflow-hidden px-4 py-12 sm:px-6 sm:py-16">
       <InviteSectionDecor variant={0} />
       <div className="relative z-10">
       <h3 className="font-['Italianno'] mb-3 text-center text-5xl md:mb-4 md:text-6xl">Dress code</h3>
       <p className="mb-8 text-center font-['Cormorant_Garamond'] text-sm italic opacity-80 sm:mb-10">
         We would love for you to dress for each celebration—here is what we have in mind.
       </p>

       <div className="mx-auto mb-10 max-w-full space-y-3 text-left sm:mb-12 sm:space-y-4">
         <div className="rounded-2xl border border-[#4A4A4A]/12 bg-white/80 px-5 py-4 shadow-sm backdrop-blur-sm">
           <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#4A4A4A]/55">
             Gehu chana muhurat
           </p>
           <p className="mt-2 font-['Cormorant_Garamond'] text-lg leading-snug text-[#2C2C2C]">
             Bandhage / Chunari <span className="text-sm font-normal text-[#4A4A4A]/75">(women)</span>
           </p>
         </div>
         <div className="rounded-2xl border border-[#4A4A4A]/12 bg-white/80 px-5 py-4 shadow-sm backdrop-blur-sm">
           <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#4A4A4A]/55">
             Haldi
           </p>
           <p className="mt-2 font-['Cormorant_Garamond'] text-lg leading-snug text-[#2C2C2C]">
             Shades of pastel pink and lavender{' '}
             <span className="text-sm font-normal text-[#4A4A4A]/75">(both men and women)</span>
           </p>
         </div>
         <div className="rounded-2xl border border-[#4A4A4A]/12 bg-white/80 px-5 py-4 shadow-sm backdrop-blur-sm">
           <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#4A4A4A]/55">
             Sangeeth
           </p>
           <p className="mt-2 font-['Cormorant_Garamond'] text-lg leading-snug text-[#2C2C2C]">
             Glitz and glitter{' '}
             <span className="text-sm font-normal text-[#4A4A4A]/75">(both men and women)</span>
           </p>
         </div>
       </div>

       {/* <p className="mb-4 text-center text-[10px] font-medium uppercase tracking-[0.18em] text-[#4A4A4A]/50">
         Palette inspiration
       </p>
       <div className="mb-16 flex flex-wrap justify-center gap-3">
         {['#F4D4DC', '#E8D5F2', '#F2E7DC', '#C1AF9F', '#586267'].map((color, i) => (
           <div
             key={i}
             className="h-12 w-12 rounded-lg shadow-sm ring-1 ring-black/5"
             style={{ backgroundColor: color }}
             title={color}
           />
         ))}
       </div> */}

       {/* Polaroids Section */}
       {/* <div className="relative space-y-12"> */}
        
         {/* Men's Polaroid */}
         {/* <div className="relative z-10">
           <div className="mx-auto w-64 -rotate-3 transform bg-white p-3 pb-10 shadow-lg">
           <p className="mb-1 font-['Cormorant_Garamond'] font-semibold text-sm">Style inspiration</p>
             <div className="aspect-square overflow-hidden bg-gray-100">
               <img src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=400" alt="Men's style" className="h-full w-full object-cover" />
             </div>
           </div>
           <div className="relative ml-8 mt-4 max-w-[220px]">
             <p className="text-xs font-['Cormorant_Garamond'] italic leading-relaxed text-[#4A4A4A]/80">
               Think festive tailoring, sparkle, and colour for sangeeth &amp; haldi.
             </p>
             <svg className="absolute -left-12 -top-4 h-12 w-12 text-[#4A4A4A]/30" viewBox="0 0 100 100" aria-hidden>
               <path d="M90 10 Q 50 10 20 80" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
               <path d="M15 75 L 20 80 L 25 75" fill="none" stroke="currentColor" strokeWidth="2" />
             </svg>
           </div>
         </div> */}

         {/* Women's Polaroid */}
         {/* <div className="relative flex flex-col items-end">
           <div className="mr-4 w-64 rotate-2 transform bg-white p-3 pb-10 shadow-lg">
             <div className="aspect-square overflow-hidden bg-gray-100">
               <img src="https://images.unsplash.com/photo-1594462285124-533777142630?auto=format&fit=crop&q=80&w=400" alt="Women's style" className="h-full w-full object-cover" />
             </div>
           </div>
           <div className="relative mr-8 mt-4 max-w-[220px] text-right">
             <p className="text-xs font-['Cormorant_Garamond'] italic leading-relaxed text-[#4A4A4A]/80">
               Lehengas, draped silhouettes, and pastels welcome.
             </p>
             <svg className="absolute -right-12 -top-4 h-12 w-12 scale-x-[-1] text-[#4A4A4A]/30" viewBox="0 0 100 100" aria-hidden>
               <path d="M90 10 Q 50 10 20 80" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
               <path d="M15 75 L 20 80 L 25 75" fill="none" stroke="currentColor" strokeWidth="2" />
             </svg>
           </div>
         </div> */}
       {/* </div> */}

       {/* <p className="mt-16 text-center font-['Cormorant_Garamond'] text-sm italic opacity-80">
         Comfortable shoes are a good idea—some celebrations will be outdoors.
       </p> */}
       </div>
     </section>

     {/* RSVP Form */}

    
     {/* Organizational Aspects */}
     <section id="venue" className="relative isolate mx-auto w-full max-w-2xl scroll-mt-6 overflow-hidden px-4 py-12 text-center sm:px-8 sm:py-16">
       <InviteSectionDecor variant={1} />
       <div className="relative z-10">

       {/* <div className="relative mx-auto mb-8 aspect-video w-full max-w-lg overflow-hidden rounded-3xl sm:mb-10">
         <img
           src="/assets/images/32ae4631-1887-4b57-93fe-2820f2a32058.jpg"
           alt="Couple walking"
           className="w-full h-full object-cover"
         />
       </div> */}

       <h3 className="font-['Italianno'] mb-2 text-center text-5xl md:text-6xl">The location</h3>
       <p className="mx-auto mb-5 max-w-lg px-1 text-center font-['Cormorant_Garamond'] text-base italic text-[#4A4A4A]/75 sm:mb-6">
         Malhar Heritage Garden &amp; Resort · New RTO Road, Palda, Indore
       </p>

       <div className="mx-auto mb-8 w-full max-w-2xl overflow-hidden rounded-2xl border border-[#4A4A4A]/12 bg-white shadow-md sm:mb-10">
         <div className="relative aspect-[4/3] w-full min-h-[220px] bg-neutral-100 sm:aspect-video sm:min-h-[260px]">
           <iframe
             title="Malhar Heritage Garden and Resort, Indore"
             src={VENUE_MAPS_EMBED}
             className="absolute inset-0 h-full w-full border-0"
             loading="lazy"
             referrerPolicy="no-referrer-when-downgrade"
             allowFullScreen
           />
         </div>
       </div>

       <div id="rsvp" className="scroll-mt-6 space-y-2">
         <h3 className="font-['Italianno'] text-4xl md:text-5xl">Hope to see you there !!</h3>
       </div>
       </div>
     </section>

     {/* Closing video — file in public/videos/ */}
     <section
       id="closing-video"
       className="relative isolate scroll-mt-6 overflow-hidden bg-gradient-to-b from-[#FDFBF9] via-[#FAF7F4] to-[#F5EFE8] px-4 py-10 sm:px-6 sm:py-14"
       aria-labelledby="closing-video-heading"
     >
       <InviteSectionDecor variant={2} />
       <div className="relative z-10 mx-auto w-full max-w-3xl px-1 text-center">
         <h2 id="closing-video-heading" className="font-['Italianno'] text-5xl text-[#4A4A4A] md:text-6xl">
           A note from us
         </h2>
         <p className="mx-auto mt-3 max-w-lg font-['Cormorant_Garamond'] text-sm leading-relaxed text-[#4A4A4A]/80 sm:mt-4">
           Thank you for sharing this journey with us—we cannot wait to see you and celebrate together.
         </p>
         <div className="relative mx-auto mt-6 aspect-video w-full max-w-2xl overflow-hidden rounded-2xl border border-[#4A4A4A]/15 bg-neutral-900/5 shadow-2xl ring-1 ring-black/5 sm:mt-8">
           <video
             ref={closingVideoRef}
             className="h-full w-full object-cover"
             controls
             playsInline
             preload="auto"
           >
             <source src={CLOSING_VIDEO_SRC} type="video/mp4" />
             Your browser does not support HTML video.
           </video>
         </div>
       </div>
     </section>

     {/* Success Modal */}
     {showModal && (
       <div className="fixed inset-0 z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
         <div className="absolute inset-0 bg-[#4A4A4A]/40 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
         <div className="bg-white w-full max-w-sm rounded-[40px] p-10 relative text-center shadow-2xl">
           <button
             onClick={() => setShowModal(false)}
             className="absolute top-6 right-6 text-[#4A4A4A]/40 hover:text-[#4A4A4A]"
           >
             <X size={20} />
           </button>
          
           <div className="flex justify-center mb-6">
             <div className="w-16 h-16 rounded-full border border-green-500 flex items-center justify-center text-green-500">
               <CheckCircle2 size={32} />
             </div>
           </div>
          
           <h4 className="font-['Cormorant_Garamond'] text-xl mb-4">Thank you!</h4>
           <p className="font-['Cormorant_Garamond'] italic opacity-70">Your data has been submitted.</p>
         </div>
       </div>
     )}

     {/* Footer */}
     {/* <footer className="mt-12 pt-8 border-t-2 border-amber-200 bg-gradient-to-b from-transparent to-amber-50 text-center py-8">
       <p className="text-sm text-gray-600 font-light">
         With love and joy, we look forward to celebrating with you
       </p>
       <div className="mt-4 flex justify-center gap-2">
         <Heart size={16} className="text-pink-400 fill-pink-400" />
         <Heart size={16} className="text-pink-400 fill-pink-400" />
         <Heart size={16} className="text-pink-400 fill-pink-400" />
       </div>
     </footer> */}

     {/* Sticky background music — lavender pill, no harsh ring */}
     {envelopeOpened && (
       <button
         type="button"
         onClick={toggleBgMusicMute}
         aria-pressed={bgMusicMuted}
         aria-label={bgMusicMuted ? 'Unmute wedding music' : 'Mute wedding music'}
         className="invite-music-btn fixed bottom-5 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-2xl border-0 bg-gradient-to-br from-[#f5f0fc] to-[#e8dff5] p-0 text-[#5B3D7A] shadow-[0_6px_24px_rgba(91,61,122,0.18)] backdrop-blur-md transition hover:from-white hover:to-[#efe6fb] hover:text-[#4A3568] hover:shadow-[0_8px_28px_rgba(91,61,122,0.22)] active:scale-[0.96] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B59FD9] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FDFBF9] sm:bottom-6 sm:right-6"
       >
         {bgMusicMuted ? (
           <VolumeX size={26} strokeWidth={2} className="shrink-0" />
         ) : (
           <Volume2 size={26} strokeWidth={2} className="shrink-0" />
         )}
       </button>
     )}
   </div>
 );
};

export default App;