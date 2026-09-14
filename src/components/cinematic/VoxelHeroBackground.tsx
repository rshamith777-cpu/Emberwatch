import React, { useRef, useState } from 'react';

interface VoxelHeroBackgroundProps {
  children?: React.ReactNode;
  className?: string;
  videoClassName?: string;
  showOverlays?: boolean;
}

/**
 * VoxelHeroBackground - High-precision recreation of the specified cinematic digital studio background.
 *
 * Specification:
 * - Background Base: #050505 (Deep Black)
 * - Video URL: https://strvid.nyc3.cdn.digitaloceanspaces.com/motionsite/nexo-hero-bg-video.webm
 * - Attributes: Absolute, inset-0, w-full, h-full, object-cover, z-0. Autoplay, loop, muted, playsinline.
 * - Overlays (z-10, pointer-events-none):
 *   1. Gradient: absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent
 *   2. Dark Wash: absolute inset-0 bg-black/10
 */
export const VoxelHeroBackground: React.FC<VoxelHeroBackgroundProps> = ({
  children,
  className = '',
  videoClassName = '',
  showOverlays = true
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  return (
    <div
      className={`relative w-full h-full min-h-screen overflow-hidden bg-[#050505] flex items-center ${className}`}
      style={{ backgroundColor: '#050505' }}
    >
      {/* Absolute Background Video */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        onLoadedData={() => setIsVideoLoaded(true)}
        className={`absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-1000 ${
          isVideoLoaded ? 'opacity-100' : 'opacity-75'
        } ${videoClassName}`}
      >
        <source
          src="https://strvid.nyc3.cdn.digitaloceanspaces.com/motionsite/nexo-hero-bg-video.webm"
          type="video/webm"
        />
        <source
          src="https://cdn.pixabay.com/video/2020/05/25/40149-425126830_large.mp4"
          type="video/mp4"
        />
      </video>

      {/* Specified Overlays */}
      {showOverlays && (
        <>
          {/* Gradient Overlay: from-black/80 via-black/30 to-transparent */}
          <div
            className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent pointer-events-none z-10"
            aria-hidden="true"
          />

          {/* Solid Dark Wash: bg-black/10 */}
          <div
            className="absolute inset-0 bg-black/10 pointer-events-none z-10"
            aria-hidden="true"
          />
        </>
      )}

      {/* Content Container */}
      {children && <div className="relative z-20 w-full h-full">{children}</div>}
    </div>
  );
};
