'use client';

import { useRef, useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Fact } from '@/types';
import { X, ExternalLink, Calendar, Tag, Shield } from 'lucide-react';

interface FocusModeProps {
  fact: Fact;
  onClose: () => void;
}

export function FocusMode({ fact, onClose }: FocusModeProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const ctx = gsap.context(() => {
      // Animate in
      gsap.fromTo(
        overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: 'power2.out' }
      );

      gsap.fromTo(
        contentRef.current,
        { opacity: 0, scale: 0.9, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'power2.out', delay: 0.1 }
      );
    });

    return () => ctx.revert();
  }, []);

  const handleClose = () => {
    const ctx = gsap.context(() => {
      gsap.to(contentRef.current, {
        opacity: 0,
        scale: 0.9,
        y: 20,
        duration: 0.2,
        ease: 'power2.in',
      });
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.2,
        ease: 'power2.in',
        onComplete: onClose,
      });
    });

    return () => ctx.revert();
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  // Format content with markdown-like styling
  const formatContent = (content: string) => {
    return content
      .split('\n')
      .map((line, i) => (
        <p key={i} className="mb-4 text-gray-300 leading-relaxed">
          {line}
        </p>
      ));
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
      onClick={(e) => e.target === overlayRef.current && handleClose()}
    >
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Content */}
      <div
        ref={contentRef}
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-ui-surface rounded-2xl border border-gray-800 shadow-2xl"
      >
        {/* Header */}
        <div className="sticky top-0 bg-ui-surface/95 backdrop-blur border-b border-gray-800 p-6 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="flex items-center gap-1.5 text-sm text-indigo-400">
                <Calendar width={14} height={14} />
                {fact.dateLabel}
              </span>
              <span className={`px-2 py-0.5 rounded text-xs ${
                fact.metadata.importance === 'high' 
                  ? 'bg-red-500/20 text-red-400' 
                  : fact.metadata.importance === 'medium'
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : 'bg-gray-700 text-gray-400'
              }`}>
                {fact.metadata.importance}
              </span>
            </div>
            <h2 className="font-display text-2xl md:text-3xl font-bold">
              {fact.title}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
            aria-label="Fermer"
          >
            <X width={24} height={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Categories */}
          <div className="flex flex-wrap gap-2 mb-6">
            {(fact.categories || []).map((cat) => (
              <span
                key={cat}
                className="flex items-center gap-1.5 px-3 py-1 bg-gray-800 rounded-full text-sm text-gray-300"
              >
                <Tag width={14} height={14} />
                {cat}
              </span>
            ))}
          </div>

          {/* Content */}
          <div className="prose prose-invert max-w-none">
            {formatContent(fact.content)}
          </div>

          {/* Source */}
          <div className="mt-8 pt-6 border-t border-gray-800">
            <h3 className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-3">
              <Shield width={16} height={16} />
              Source
            </h3>
            <a
              href={fact.source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors group"
            >
              <div>
                <p className="font-medium">{fact.source.name}</p>
                <p className="text-sm text-gray-500 truncate max-w-md">
                  {fact.source.url}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">
                  Fiabilité: {Math.round(fact.source.reliabilityScore * 100)}%
                </span>
                <ExternalLink width={18} height={18} className="text-gray-500 group-hover:text-white transition-colors" />
              </div>
            </a>
          </div>

          {/* Metadata */}
          <div className="mt-4 text-xs text-gray-600 flex items-center gap-4">
            <span>ID: {fact.id}</span>
            <span>Thread: {fact.metadata.threadId}</span>
            <span>Status: {fact.metadata.verificationStatus}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
