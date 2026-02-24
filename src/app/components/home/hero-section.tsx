import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { FaGithub, FaLinkedinIn, FaInstagram } from 'react-icons/fa';
import portraitFormal from '../../../assets/9e641df13b5d7bc38d68f3ca2778898ddf81d65c.png';
import portraitCasual from '../../../assets/be825304a1167328a4cd2b48436f3eda237415be.png';

/* ── Staggered word-reveal animation variants ── */
const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const wordVariants = {
  hidden: { 
    opacity: 0, 
    y: 40,
    filter: 'blur(8px)',
  },
  visible: { 
    opacity: 1, 
    y: 0,
    filter: 'blur(0px)',
    transition: { 
      duration: 0.6, 
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
};

/* Reusable animated word component */
function RevealWord({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.span variants={wordVariants} className={`inline-block ${className || ''}`}>
      {children}
    </motion.span>
  );
}

export function HeroSection() {
  const unicornRef = useRef<HTMLDivElement>(null);
  const portraitRef = useRef<HTMLDivElement>(null);
  
  // Mouse tracking for 3D tilt effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Spring physics for smooth animation
  const rotateX = useSpring(useTransform(mouseY, [-300, 300], [15, -15]), { 
    stiffness: 300, 
    damping: 30 
  });
  const rotateY = useSpring(useTransform(mouseX, [-300, 300], [-15, 15]), { 
    stiffness: 300, 
    damping: 30 
  });
  
  const [isHovered, setIsHovered] = useState(false);
  const [portraitHovered, setPortraitHovered] = useState(false);

  // Handle mouse move for parallax effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!portraitRef.current) return;
    
    const rect = portraitRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    mouseX.set(e.clientX - centerX);
    mouseY.set(e.clientY - centerY);
  };
  
  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  useEffect(() => {
    // Load Unicorn Studio script
    const w = window as any;
    if (w.UnicornStudio && w.UnicornStudio.init) {
      w.UnicornStudio.init();
      return;
    }

    w.UnicornStudio = { isInitialized: false };
    const script = document.createElement('script');
    script.src =
      'https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v2.0.5/dist/unicornStudio.umd.js';
    script.onload = () => {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          (window as any).UnicornStudio.init();
        });
      } else {
        (window as any).UnicornStudio.init();
      }
      setTimeout(() => {
        const watermark = document.querySelector('[data-us-watermark]');
        if (watermark) (watermark as HTMLElement).style.display = 'none';
        const madeWith = document.querySelector('.us-watermark, [class*="watermark"]');
        if (madeWith) (madeWith as HTMLElement).style.display = 'none';
      }, 1000);
    };
    (document.head || document.body).appendChild(script);

    return () => {
      // Cleanup: destroy Unicorn Studio scenes if possible
      try {
        if ((window as any).UnicornStudio?.destroy) {
          (window as any).UnicornStudio.destroy();
        }
      } catch {
        // ignore
      }
    };
  }, []);

  return (
    <section className="relative min-h-[85vh] md:min-h-screen flex items-center overflow-hidden">
      {/* Unicorn Studio Background */}
      <div
        ref={unicornRef}
        data-us-project="m5iWeTgUIAg80wvxtlhQ"
        className="absolute inset-0 w-full h-full"
        style={{ pointerEvents: 'auto' }}
      />

      {/* Gradient overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/50 to-transparent z-[5]" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/40 z-[5]" />

      {/* Cover Unicorn Studio watermark — full-width strip at bottom */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-20 z-[9998] pointer-events-none"
        style={{ 
          marginBottom: '-20px',
          background: 'linear-gradient(to top, var(--background) 60%, transparent)'
        }}
      />
      <style>{`
        [data-us-watermark] {
          display: none !important;
          opacity: 0 !important;
          visibility: hidden !important;
        }
      `}</style>

      {/* ═══════════════════════════════════
          MOBILE HERO — Centered clean layout
          ═══════════════════════════════════ */}
      <div className="relative z-10 w-full md:hidden">
        <div className="max-w-6xl mx-auto px-6 py-24 flex flex-col items-center text-center">
          {/* University / Status pill */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-card/60 backdrop-blur-md border border-border/40">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
              <span className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-sans">Univ. Trunojoyo Madura</span>
            </div>
          </motion.div>

          {/* Name — cinematic word-by-word reveal */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mt-10"
          >
            <h1 className="!text-[2.75rem] !leading-[1.08] text-foreground font-sans flex flex-wrap justify-center gap-x-3" style={{ fontWeight: 600 }}>
              <RevealWord>Ar&apos;raffi</RevealWord>
            </h1>
            <h1 className="!text-[2.75rem] !leading-[1.08] mt-1 font-sans flex flex-wrap justify-center gap-x-3" style={{ fontWeight: 600 }}>
              <RevealWord className="text-primary relative">
                Abqori
              </RevealWord>
              <RevealWord className="text-primary relative">
                Nur
              </RevealWord>
              <RevealWord className="text-primary relative">
                A.
                <span className="absolute -bottom-1 left-0 right-0 h-[3px] bg-primary/30 rounded-full" />
              </RevealWord>
            </h1>
          </motion.div>

          {/* Subtitle — staggered reveal */}
          <motion.div
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.06, delayChildren: 0.6 } },
            }}
            initial="hidden"
            animate="visible"
            className="mt-7 flex flex-wrap justify-center gap-x-2 font-sans"
            style={{ fontSize: '1.125rem', fontWeight: 500 }}
          >
            {['Sistem', 'Informasi', '&', 'AI', 'Enthusiast.'].map((word, i) => (
              <RevealWord key={i} className="text-foreground">{word}</RevealWord>
            ))}
          </motion.div>

          {/* Description — same text as desktop, centered */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-4 text-muted-foreground leading-relaxed max-w-[320px] font-sans"
            style={{ fontSize: '0.875rem', fontWeight: 400 }}
          >
            Mahasiswa Sistem Informasi, Asisten Lab Pemrograman, dan tech enthusiast
            yang mendokumentasikan perjalanan belajar melalui kode dan tulisan.
          </motion.p>

          {/* CTA Button — full width, matching reference */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-10 w-full max-w-[320px]"
          >
            <Link to="/#projects" className="block">
              <button
                className="w-full inline-flex items-center justify-center gap-3 py-4 rounded-2xl bg-foreground text-background hover:bg-foreground/90 transition-colors group font-sans"
                style={{ fontSize: '0.9375rem', fontWeight: 500 }}
              >
                View Projects
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </Link>
          </motion.div>

          {/* Social icons — outlined circles, centered */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-8 flex items-center gap-4"
          >
            <a
              href="https://github.com/robet31"
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-full bg-card/80 border border-border/60 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-foreground hover:text-background transition-all duration-300"
            >
              <FaGithub className="w-5 h-5" />
            </a>
            <a
              href="https://www.linkedin.com/in/arraffi-abqori-nur-azizi/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-full bg-card/80 border border-border/60 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-foreground hover:text-background transition-all duration-300"
            >
              <FaLinkedinIn className="w-5 h-5" />
            </a>
            <a
              href="https://www.instagram.com/ravnxx_/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-full bg-card/80 border border-border/60 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-foreground hover:text-background transition-all duration-300"
            >
              <FaInstagram className="w-5 h-5" />
            </a>
          </motion.div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          DESKTOP HERO — Original layout with portrait
          ═══════════════════════════════════════════════ */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 w-full py-0 hidden md:block">
        <div className="flex items-center gap-8 lg:gap-12">
          {/* Left — Text content */}
          <div className="max-w-2xl text-left flex-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary mb-6 border border-primary/20 backdrop-blur-sm">
                <Sparkles className="w-3.5 h-3.5" />
                <span className="text-sm">Sistem Informasi &middot; AI Enthusiast &middot; Builder</span>
              </div>
            </motion.div>

            {/* Desktop heading — cinematic word reveal */}
            <motion.h1
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.07, delayChildren: 0.15 } },
              }}
              initial="hidden"
              animate="visible"
              className="!text-5xl md:!text-6xl !leading-tight text-foreground mb-6 text-left"
            >
              <span className="flex flex-wrap gap-x-3.5">
                <RevealWord className="text-muted-foreground">Hi,</RevealWord>
                <RevealWord className="text-muted-foreground">I&apos;m</RevealWord>
                <RevealWord className="text-primary">Arraffi</RevealWord>
                <RevealWord>.</RevealWord>
              </span>
              <span className="flex flex-wrap gap-x-3.5">
                <RevealWord>I</RevealWord>
                <RevealWord>build</RevealWord>
                <RevealWord>things</RevealWord>
                <RevealWord>for</RevealWord>
              </span>
              <span className="flex flex-wrap gap-x-3.5">
                <RevealWord className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">shape</RevealWord>
                <RevealWord className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">the</RevealWord>
                <RevealWord className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">future.</RevealWord>
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-muted-foreground text-xl mb-8 max-w-xl leading-relaxed text-justify"
            >Mahasiswa Sistem Informasi, AI Enthusiast dan Data Enthusiast. Sangat tertarik dalam mengeksplorasi&nbsp;&nbsp;Data Mining, Data Engineering, Visualisasi Data, AI Engineering dan senang belajar tentang hal baru lainnya.</motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap items-center gap-4 justify-start"
            >
              <Link to="/#projects">
                <button className="inline-flex items-center gap-3 px-7 py-3.5 rounded-full bg-foreground text-background hover:bg-foreground/90 transition-colors group">
                  <span className="text-sm tracking-wide">View Projects</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </Link>
              <div className="flex items-center gap-3">
                <a
                  href="https://github.com/robet31"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 rounded-full bg-foreground/10 border border-foreground/10 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-foreground hover:text-background transition-all duration-300"
                >
                  <FaGithub className="w-5 h-5" />
                </a>
                <a
                  href="https://www.linkedin.com/in/arraffi-abqori-nur-azizi/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 rounded-full bg-foreground/10 border border-foreground/10 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-foreground hover:text-background transition-all duration-300"
                >
                  <FaLinkedinIn className="w-5 h-5" />
                </a>
                <a
                  href="https://www.instagram.com/ravnxx_/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 rounded-full bg-foreground/10 border border-foreground/10 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-foreground hover:text-background transition-all duration-300"
                >
                  <FaInstagram className="w-5 h-5" />
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-wrap items-center gap-6 mt-12 text-muted-foreground justify-start"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm">Open to opportunities</span>
              </div>
              <span className="text-sm">Based in Indonesia</span>
            </motion.div>
          </div>

          {/* Right — Portrait photo (desktop only) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, x: 30 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
            className="hidden lg:block flex-shrink-0"
          >
            <div 
              className="relative perspective-1000" 
              ref={portraitRef} 
              onMouseMove={handleMouseMove} 
              onMouseLeave={handleMouseLeave} 
              onMouseEnter={() => setIsHovered(true)}
            >
              {/* Decorative glow behind photo */}
              <motion.div 
                className="absolute -inset-4 bg-gradient-to-br from-primary/20 via-purple-500/10 to-transparent rounded-3xl blur-2xl"
                animate={{ scale: isHovered ? 1.1 : 1 }}
                transition={{ duration: 0.3 }}
              />
              
              {/* Photo container with 3D tilt */}
              <motion.div 
                className="relative w-[340px] xl:w-[400px] aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-primary/10 cursor-pointer"
                style={{
                  rotateX: rotateX,
                  rotateY: rotateY,
                  transformStyle: 'preserve-3d',
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                onMouseEnter={() => setPortraitHovered(true)}
                onMouseLeave={() => setPortraitHovered(false)}
              >
                {/* Formal portrait (default) */}
                <img
                  src={portraitFormal}
                  alt="Api — Developer & Tech Enthusiast"
                  className="absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-700 ease-in-out"
                  style={{ opacity: portraitHovered ? 0 : 1 }}
                />
                {/* Casual portrait (on hover) */}
                <img
                  src={portraitCasual}
                  alt="Api — Creative Side"
                  className="absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-700 ease-in-out"
                  style={{ opacity: portraitHovered ? 1 : 0 }}
                />
                {/* Subtle gradient overlay at bottom to blend with bg */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent" />
              </motion.div>

              {/* Floating Code Elements — 3D accents */}
              
              {/* Code bracket top-left */}
              <motion.div 
                className="absolute -top-6 -left-6 text-primary/40 pointer-events-none animate-float-slow"
                animate={{
                  y: isHovered ? -8 : 0,
                  x: isHovered ? -8 : 0,
                  rotate: isHovered ? -5 : 0,
                }}
                transition={{ duration: 0.3 }}
                style={{
                  rotateX: useTransform(rotateX, (v) => -v * 0.3),
                  rotateY: useTransform(rotateY, (v) => -v * 0.3),
                  transformStyle: 'preserve-3d',
                  translateZ: 50,
                }}
              >
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" />
                </svg>
              </motion.div>

              {/* Code function top-right */}
              <motion.div 
                className="absolute -top-4 -right-8 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 backdrop-blur-sm pointer-events-none animate-float"
                animate={{
                  y: isHovered ? -12 : 0,
                  x: isHovered ? 12 : 0,
                }}
                transition={{ duration: 0.3, delay: 0.05 }}
                style={{
                  rotateX: useTransform(rotateX, (v) => -v * 0.5),
                  rotateY: useTransform(rotateY, (v) => v * 0.5),
                  transformStyle: 'preserve-3d',
                  translateZ: 80,
                }}
              >
                <code className="text-xs text-primary/70 font-mono">const build = () =&gt;</code>
              </motion.div>

              {/* Terminal symbol left-center */}
              <motion.div 
                className="absolute left-0 top-1/3 -translate-x-8 text-purple-500/40 pointer-events-none animate-float"
                animate={{
                  x: isHovered ? -16 : -8,
                  y: isHovered ? 8 : 0,
                }}
                transition={{ duration: 0.3, delay: 0.1 }}
                style={{
                  rotateY: useTransform(rotateY, (v) => -v * 0.6),
                  transformStyle: 'preserve-3d',
                  translateZ: 60,
                  animationDelay: '0.5s',
                }}
              >
                <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2M4 7V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2" fill="none"/>
                  <path d="M9 10l3 3-3 3M13 16h3"/>
                </svg>
              </motion.div>

              {/* Variable declaration right-center */}
              <motion.div 
                className="absolute right-0 top-1/2 translate-x-6 px-2.5 py-1 rounded bg-purple-500/10 border border-purple-500/20 backdrop-blur-sm pointer-events-none animate-float-slow"
                animate={{
                  x: isHovered ? 12 : 6,
                  rotate: isHovered ? 3 : 0,
                }}
                transition={{ duration: 0.3, delay: 0.15 }}
                style={{
                  rotateX: useTransform(rotateX, (v) => v * 0.4),
                  rotateY: useTransform(rotateY, (v) => v * 0.4),
                  transformStyle: 'preserve-3d',
                  translateZ: 70,
                  animationDelay: '1s',
                }}
              >
                <code className="text-xs text-purple-400/80 font-mono">let tech;</code>
              </motion.div>

              {/* Git branch icon bottom-left */}
              <motion.div 
                className="absolute -bottom-4 left-8 text-emerald-500/40 pointer-events-none animate-float"
                animate={{
                  y: isHovered ? 12 : 0,
                  x: isHovered ? -8 : 0,
                  rotate: isHovered ? -8 : 0,
                }}
                transition={{ duration: 0.3, delay: 0.05 }}
                style={{
                  rotateX: useTransform(rotateX, (v) => v * 0.5),
                  rotateY: useTransform(rotateY, (v) => -v * 0.5),
                  transformStyle: 'preserve-3d',
                  translateZ: 55,
                  animationDelay: '1.5s',
                }}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="6" cy="6" r="3"/><circle cx="18" cy="18" r="3"/>
                  <path d="M6 9v6M18 9a9 9 0 0 1-9 9"/>
                </svg>
              </motion.div>

              {/* JSON curly braces bottom-right */}
              <motion.div 
                className="absolute -bottom-6 -right-4 text-blue-500/40 pointer-events-none animate-float-slow"
                animate={{
                  y: isHovered ? 10 : 0,
                  x: isHovered ? 10 : 0,
                }}
                transition={{ duration: 0.3, delay: 0.2 }}
                style={{
                  rotateX: useTransform(rotateX, (v) => v * 0.3),
                  rotateY: useTransform(rotateY, (v) => v * 0.3),
                  transformStyle: 'preserve-3d',
                  translateZ: 65,
                  animationDelay: '0.8s',
                }}
              >
                <div className="font-mono text-4xl">&#123; &#125;</div>
              </motion.div>

              {/* Decorative sparkle accent */}
              <motion.div 
                className="absolute -bottom-2 -right-2 w-8 h-8 text-primary/60"
                animate={{
                  rotate: isHovered ? 45 : 0,
                  scale: isHovered ? 1.2 : 1,
                }}
                transition={{ duration: 0.3 }}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                  <path d="M12 0L14.59 8.41L23 12L14.59 15.59L12 24L9.41 15.59L1 12L9.41 8.41L12 0Z" />
                </svg>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}