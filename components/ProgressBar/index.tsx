'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function ProgressBar() {
  const progressRef = useRef<HTMLDivElement>(null);
  const percentageRef = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.to(progressRef.current, {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: document.body,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.3,
          onUpdate: (self) => {
            if (percentageRef.current) {
              percentageRef.current.textContent = `${Math.round(self.progress * 100)}%`;
            }
          },
        },
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <>
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gray-800 z-50">
        <div
          ref={progressRef}
          className="h-full progress-gradient origin-left"
          style={{ transform: 'scaleX(0)' }}
        />
      </div>

      {/* Progress percentage */}
      <div className="fixed top-4 right-4 z-50 px-3 py-1 bg-ui-surface/90 backdrop-blur rounded-full text-xs font-medium border border-gray-800">
        <span ref={percentageRef}>0%</span>
      </div>
    </>
  );
}
