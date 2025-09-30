"use client";

import type React from "react";
import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ChevronsLeft, ChevronsRight, Pause, Play } from "lucide-react";

export interface CarouselItem {
  id: string;
  title: string;
  subtitle?: string;
  cover: string;
  description?: string;
  audioUrl?: string;
  // Allow additional custom properties, but discourage 'any' in use
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface Carousel3DProps {
  items: CarouselItem[];
  onItemChange?: (item: CarouselItem, index: number) => void;
  onItemClick?: (item: CarouselItem, index: number) => void;
  showControls?: boolean;
  showInfo?: boolean;
  className?: string;
  containerHeight?: string;
  centerItemWidth?: number;
  centerItemHeight?: number;
  sideItemWidth?: number;
  sideItemHeight?: number;
  radius?: number;
  dragSensitivity?: number;
  centerScale?: number;
  centerZOffset?: number;
  panelCurveDegrees?: number; // total curve angle across panel (deg)
  panelSlices?: number; // how many vertical slices to approximate curve
}

export default function Carousel3D({
  items,
  onItemChange,
  onItemClick,
  showControls = true,
  showInfo = true,
  className = "",
  containerHeight = "500px",
  centerItemWidth = 280,
  centerItemHeight = 200,
  sideItemWidth = 180,
  sideItemHeight = 130,
  radius = 400,
  dragSensitivity = 0.5,
  centerScale = 0.92,
  centerZOffset = 10,
  panelCurveDegrees = 18,
  panelSlices = 16,
}: Carousel3DProps) {
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startRotation, setStartRotation] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const getCurrentIndex = useCallback(() => {
    const itemAngle = 360 / items.length;
    const normalizedRotation = ((-rotation % 360) + 360) % 360;
    return Math.round(normalizedRotation / itemAngle) % items.length;
  }, [items.length, rotation]);

  const currentItem = items[getCurrentIndex()];

  useEffect(() => {
    if (onItemChange) {
      onItemChange(currentItem, getCurrentIndex());
    }
    // getCurrentIndex depends on items.length and rotation indirectly via currentItem
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentItem, onItemChange]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
    setStartRotation(rotation);
    e.preventDefault();
  };

  // mouse move/up are handled globally to allow dragging outside the container

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    setStartRotation(rotation);
    e.preventDefault();
  };

  // touch move handled on container

  const handleTouchEnd = () => {
    if (isDragging) {
      setIsDragging(false);
      const deltaX = Math.abs(rotation - startRotation);
      if (deltaX < 30) {
        const itemAngle = 360 / items.length;
        const currentIndex = getCurrentIndex();
        const targetRotation = -currentIndex * itemAngle;
        setRotation(targetRotation);
      }
    }
  };

  const handleItemClick = (item: CarouselItem, index: number) => {
    if (onItemClick) {
      onItemClick(item, index);
    }
  };

  const goToIndex = (targetIndex: number) => {
    const itemAngle = 360 / items.length;
    const normalizedIndex =
      ((targetIndex % items.length) + items.length) % items.length;
    setRotation(-normalizedIndex * itemAngle);
  };

  const handlePrev = () => {
    goToIndex(getCurrentIndex() - 1);
  };

  const handleNext = () => {
    goToIndex(getCurrentIndex() + 1);
  };

  const handlePlayPause = () => {
    // Only toggle if the current item has an audio URL
    if (!currentItem?.audioUrl) return;

    const next = !isPlaying;
    setIsPlaying(next);

    const audio = audioRef.current;
    if (!audio) return;

    if (next) {
      // Resume/play current track
      audio.play().catch(() => {
        // If play fails (autoplay policy), revert state
        setIsPlaying(false);
      });
    } else {
      audio.pause();
    }
  };

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      e.preventDefault();

      const deltaX = e.clientX - startX;
      const newRotation = startRotation + deltaX * dragSensitivity;
      setRotation(newRotation);
    };

    const handleGlobalMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        const deltaX = Math.abs(rotation - startRotation);
        if (deltaX < 30) {
          const itemAngle = 360 / items.length;
          const targetIndex = getCurrentIndex();
          const targetRotation = -targetIndex * itemAngle;
          setRotation(targetRotation);
        }
      }
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleGlobalMouseMove);
      document.addEventListener("mouseup", handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleGlobalMouseMove);
      document.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [
    isDragging,
    startX,
    startRotation,
    rotation,
    dragSensitivity,
    items.length,
    getCurrentIndex,
  ]);

  // Keep audio element in sync with the current item and play state
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Bind onended to reset play state
    const handleEnded = () => setIsPlaying(false);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const src = currentItem?.audioUrl || "";

    // If track changed, update source and optionally autoplay
    if (audio.src !== src) {
      // Pause before switching
      audio.pause();
      audio.src = src;
      // Reset to start for new track
      audio.currentTime = 0;
    }

    if (!src) {
      // No audio for this item
      if (isPlaying) setIsPlaying(false);
      return;
    }

    if (isPlaying) {
      audio.play().catch(() => {
        setIsPlaying(false);
      });
    }
  }, [currentItem?.audioUrl, isPlaying]);

  return (
    <div className={`w-full relative ${className}`}>
      <div
        ref={carouselRef}
        className={`relative w-full ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
        style={{
          height: containerHeight,
          perspective: "800px",
          transformStyle: "preserve-3d",
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className={`absolute inset-0 ${isDragging ? "" : "transition-transform duration-300 ease-out"}`}
          style={{
            transformStyle: "preserve-3d",
            transform: `rotateY(${rotation}deg)`,
          }}
        >
          {items.map((item, index) => {
            const angle = (index * 360) / items.length;

            // Calculate distance from center position for scaling/opacity
            const currentIndex = getCurrentIndex();
            const indexDiff = Math.abs(
              (index - currentIndex + items.length) % items.length
            );
            const normalizedDiff = Math.min(
              indexDiff,
              items.length - indexDiff
            );

            const isCenter = index === currentIndex;
            const scale = isCenter
              ? centerScale
              : Math.max(0.7, 1 - (normalizedDiff / items.length) * 0.4);
            const opacity = isCenter
              ? 1
              : Math.max(0.5, 1 - (normalizedDiff / items.length) * 0.6);
            const zOffset = isCenter ? centerZOffset : -normalizedDiff * 16;

            // Keep constant wrapper size to avoid vertical jumping
            const baseWidth = centerItemWidth;
            const baseHeight = centerItemHeight;
            const sizeScale = isCenter
              ? 1
              : Math.min(
                  sideItemWidth / centerItemWidth,
                  sideItemHeight / centerItemHeight
                );

            // Build a curved panel by slicing the image into vertical pieces
            const sliceCount = Math.max(
              4,
              Math.min(64, Math.floor(panelSlices))
            );
            const sliceWidth = baseWidth / sliceCount;

            return (
              <div
                key={item.id}
                className="absolute left-1/2 top-1/2 transition-all duration-300 cursor-pointer"
                style={{
                  width: `${baseWidth}px`,
                  height: `${baseHeight}px`,
                  marginLeft: `-${baseWidth / 2}px`,
                  marginTop: `-${baseHeight / 2}px`,
                  transform: `rotateY(${angle}deg) translateZ(${radius + zOffset}px) scale(${scale * sizeScale})`,
                  transformStyle: "preserve-3d",
                  opacity: opacity,
                  zIndex: isCenter ? 10 : Math.max(1, 5 - normalizedDiff),
                  filter: isCenter
                    ? "drop-shadow(0 8px 24px rgba(0,0,0,0.25))"
                    : "drop-shadow(0 4px 16px rgba(0,0,0,0.15))",
                }}
                onClick={() => handleItemClick(item, index)}
              >
                <div
                  className="relative w-full h-full"
                  style={{ transformStyle: "preserve-3d" }}
                >
                  {Array.from({ length: sliceCount }).map((_, s) => {
                    const sliceCenter = (s + 0.5) / sliceCount - 0.5; // -0.5..0.5
                    const rotate = sliceCenter * panelCurveDegrees; // negative on left, positive on right
                    const offsetZ =
                      (1 - Math.cos((rotate * Math.PI) / 180)) *
                      (baseWidth / 4); // subtle bulge
                    const backgroundX = (-s * sliceWidth).toFixed(2);
                    const rounded =
                      Math.abs(sliceCenter) > 0.48
                        ? 14
                        : Math.abs(sliceCenter) > 0.35
                          ? 10
                          : 6;
                    return (
                      <div
                        key={s}
                        className="absolute top-0 overflow-hidden"
                        style={{
                          left: `${s * sliceWidth}px`,
                          width: `${sliceWidth + 0.5}px`,
                          height: `${baseHeight}px`,
                          transform: `translateZ(${offsetZ}px) rotateY(${rotate}deg)`,
                          transformStyle: "preserve-3d",
                          borderTopLeftRadius: s === 0 ? rounded : 0,
                          borderBottomLeftRadius: s === 0 ? rounded : 0,
                          borderTopRightRadius:
                            s === sliceCount - 1 ? rounded : 0,
                          borderBottomRightRadius:
                            s === sliceCount - 1 ? rounded : 0,
                          willChange: "transform",
                        }}
                      >
                        <div
                          className="w-full h-full bg-center bg-no-repeat bg-cover"
                          style={{
                            backgroundImage: `url(${item.cover || "/placeholder.svg"})`,
                            backgroundPosition: `${backgroundX}px 0`,
                            backgroundSize: `${baseWidth}px ${baseHeight}px`,
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Audio Controls */}
      {showControls && (
        <div className="flex justify-center items-center gap-8 mt-6 mb-4">
          <Button
            type="button"
            aria-label="Previous"
            onClick={handlePrev}
            variant="ghost"
            className="rounded-full w-10 h-10 bg-primary/5 hover:bg-primary/10 text-primary shadow-sm border border-primary/10 transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <ChevronsLeft className="w-5 h-5" />
          </Button>

          <Button
            type="button"
            aria-label={isPlaying ? "Pause" : "Play"}
            onClick={handlePlayPause}
            aria-pressed={isPlaying}
            disabled={!currentItem?.audioUrl}
            className="rounded-full w-12 h-12 bg-primary text-primary-foreground shadow-lg hover:bg-primary focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
          >
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full text-black">
              {isPlaying ? (
                <Pause className="w-4 h-4 text-white" />
              ) : (
                <Play className="w-4 h-4 text-white" />
              )}
            </span>
          </Button>

          <Button
            type="button"
            aria-label="Next"
            onClick={handleNext}
            variant="ghost"
            className="rounded-full w-10 h-10 bg-primary/5 hover:bg-primary/10 text-primary shadow-sm border border-primary/10 transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <ChevronsRight className="w-5 h-5" />
          </Button>
        </div>
      )}

      {/* Item Info */}
      {showInfo && currentItem && (
        <div className="text-center">
          {currentItem.subtitle && (
            <p className="text-gray-600 text-sm mb-1">{currentItem.subtitle}</p>
          )}
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            {currentItem.title}
          </h3>
          {currentItem.description && (
            <p className="text-gray-500 text-sm">{currentItem.description}</p>
          )}
        </div>
      )}

      {/* Hidden audio element used for playback */}
      <audio
        ref={audioRef}
        preload="none"
        src={currentItem?.audioUrl || undefined}
      />
    </div>
  );
}
