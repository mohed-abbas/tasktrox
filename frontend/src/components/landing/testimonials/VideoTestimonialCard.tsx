'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { easing, scrollViewport, getStaggerDelay } from '@/lib/animations';

export interface VideoTestimonialCardProps {
  author: {
    name: string;
    role: string;
  };
  thumbnailSrc: string;
  videoSrc?: string;
  className?: string;
  index?: number;
}

export function VideoTestimonialCard({
  author,
  thumbnailSrc,
  videoSrc,
  className = '',
  index = 0,
}: VideoTestimonialCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlayClick = () => {
    if (videoSrc && videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={scrollViewport}
      transition={{ duration: 0.7, ease: easing.smooth, delay: getStaggerDelay(index, 0, 0.08) }}
      className={`relative border border-gray-200 rounded-xl overflow-hidden ${className}`}
    >
      {/* Background Image / Video */}
      {videoSrc && isPlaying ? (
        <video
          ref={videoRef}
          src={videoSrc}
          className="absolute inset-0 w-full h-full object-cover"
          onEnded={handleVideoEnded}
          playsInline
        />
      ) : (
        <Image
          src={thumbnailSrc}
          alt={`${author.name} video testimonial`}
          fill
          className="object-cover"
        />
      )}

      {/* Author Badge - Top Left */}
      <div className="absolute top-[15px] left-[15px] bg-white rounded-xl p-1.5 flex items-center gap-4 w-[360px] max-w-[calc(100%-30px)]">
        {/* Avatar - using thumbnail with face crop */}
        <div className="relative w-[52px] h-[52px] flex-shrink-0 rounded-lg overflow-hidden">
          <Image
            src={thumbnailSrc}
            alt={author.name}
            fill
            className="object-cover object-[50%_15%]"
          />
        </div>
        <div className="flex flex-col gap-0.5">
          <p className="text-xl font-medium text-gray-800 leading-[1.4]">
            {author.name}
          </p>
          <p className="text-base text-gray-500 leading-[1.4]">{author.role}</p>
        </div>
      </div>

      {/* Play Button - Centered */}
      {!isPlaying && (
        <button
          onClick={handlePlayClick}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-0.5 rounded-full backdrop-blur-[6.4px] bg-white/30 transition-transform hover:scale-110"
          aria-label="Play video"
        >
          <Image
            src="/images/testimonials/play-button.svg"
            alt="Play"
            width={56}
            height={56}
          />
        </button>
      )}

      {/* Pause overlay when playing (click to pause) */}
      {isPlaying && (
        <button
          onClick={handlePlayClick}
          className="absolute inset-0 w-full h-full cursor-pointer"
          aria-label="Pause video"
        />
      )}
    </motion.div>
  );
}
