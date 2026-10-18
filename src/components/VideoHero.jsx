import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function VideoHero() {
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const scale = useTransform(scrollYProgress, [0, 0.6], [0.94, 1]);
  const rotateX = useTransform(scrollYProgress, [0, 0.6], [12, 0]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0.8]);

  return (
    <div ref={containerRef} className="relative z-0 bg-black min-h-screen py-24 md:py-32 flex flex-col items-center justify-center overflow-hidden">
      {/* Background Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-raven-600/20 blur-[130px] rounded-full pointer-events-none" />

      {/* Header Text */}
      <motion.div style={{ opacity: titleOpacity }} className="text-center px-4 mb-12 max-w-4xl relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-raven-400 text-xs font-semibold mb-6 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Next-Gen Autonomous Social Platform</span>
        </div>
        <h1 className="text-4xl md:text-7xl font-black text-white uppercase italic tracking-tighter leading-tight mb-4">
          The Evolution <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-raven-400 to-violet-200">
            Is Here
          </span>
        </h1>
        <p className="text-textMuted text-base md:text-xl font-medium max-w-2xl mx-auto">
          Synthesizing multi-platform social distribution into seamless, automated outcomes.
        </p>
      </motion.div>

      {/* Proper UI Mockup with Single Optimized Video */}
      <div className="w-full max-w-5xl px-4 relative z-10 [perspective:1000px]">
        <motion.div
          style={{ scale, rotateX }}
          className="rounded-2xl md:rounded-3xl border border-white/15 bg-[#0f0f15] shadow-[0_20px_100px_rgba(139,92,246,0.25)] overflow-hidden"
        >
          {/* Window Chrome */}
          <div className="flex items-center justify-between px-4 py-3 bg-black/50 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/80" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 text-[11px] font-mono text-zinc-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              https://app.socialraven.online/dashboard
            </div>
            <div className="w-12" />
          </div>

          {/* Video Container */}
          <div className="relative aspect-video w-full bg-black overflow-hidden">
            <video
              src="/videos/Social_Media_Animation_For_Website.mp4"
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
