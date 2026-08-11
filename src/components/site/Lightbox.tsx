import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import type { GalleryItem } from "@/lib/gallery.functions";

type Props = {
  items: GalleryItem[];
  index: number;
  onClose: () => void;
  onIndexChange: (index: number) => void;
};

/** Fullscreen image viewer with keyboard, swipe and pinch-to-zoom support. */
export function Lightbox({ items, index, onClose, onIndexChange }: Props) {
  const item = items[index];
  const [zoom, setZoom] = useState(1);
  const touch = useRef<{ x: number; startDist: number; startZoom: number } | null>(null);

  const go = useCallback(
    (delta: number) => {
      setZoom(1);
      onIndexChange((index + delta + items.length) % items.length);
    },
    [index, items.length, onIndexChange],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [go, onClose]);

  if (!item) return null;

  const dist = (t: React.TouchList) => {
    const a = t[0];
    const b = t[1];
    if (!a || !b) return 0;
    return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={item.caption}
      className="fixed inset-0 z-100 flex flex-col items-center justify-center bg-black/85 backdrop-blur-md"
      onClick={onClose}
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute top-4 right-4 rounded-full bg-white/15 p-2 text-white transition hover:bg-white/25"
      >
        <X className="h-6 w-6" />
      </button>

      {items.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous image"
            onClick={(e) => {
              e.stopPropagation();
              go(-1);
            }}
            className="absolute left-2 rounded-full bg-white/15 p-2 text-white transition hover:bg-white/25 sm:left-6 sm:p-3"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            aria-label="Next image"
            onClick={(e) => {
              e.stopPropagation();
              go(1);
            }}
            className="absolute right-2 rounded-full bg-white/15 p-2 text-white transition hover:bg-white/25 sm:right-6 sm:p-3"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      <figure
        className="flex max-h-[85vh] w-full max-w-5xl flex-col items-center gap-4 px-4"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => {
          if (e.touches.length === 2) {
            touch.current = { x: 0, startDist: dist(e.touches), startZoom: zoom };
          } else if (e.touches.length === 1) {
            touch.current = { x: e.touches[0]?.clientX ?? 0, startDist: 0, startZoom: zoom };
          }
        }}
        onTouchMove={(e) => {
          if (e.touches.length === 2 && touch.current?.startDist) {
            const next = (touch.current.startZoom * dist(e.touches)) / touch.current.startDist;
            setZoom(Math.min(4, Math.max(1, next)));
          }
        }}
        onTouchEnd={(e) => {
          const start = touch.current;
          touch.current = null;
          if (!start || start.startDist || zoom > 1.05) return;
          const endX = e.changedTouches[0]?.clientX ?? start.x;
          if (Math.abs(endX - start.x) > 55) go(endX < start.x ? 1 : -1);
        }}
      >
        <img
          key={item.id}
          src={item.url}
          alt={item.caption}
          className="max-h-[70vh] w-auto rounded-2xl object-contain shadow-2xl transition-transform duration-300"
          style={{ transform: `scale(${zoom})` }}
        />
        <figcaption className="rounded-full bg-white/12 px-5 py-2 text-center text-sm font-medium text-white">
          {item.caption}
        </figcaption>
      </figure>
    </div>
  );
}
