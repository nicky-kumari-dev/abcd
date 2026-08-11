import { ImageOff } from "lucide-react";
import { useState } from "react";

import { Lightbox } from "@/components/site/Lightbox";
import type { GalleryItem } from "@/lib/gallery.functions";

/** Masonry photo gallery of real school moments. */
export function GallerySection({ items }: { items: GalleryItem[] }) {
  const [active, setActive] = useState<number | null>(null);

  return (
    <section id="gallery" className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold tracking-wide text-primary uppercase">Gallery</p>
          <h2 className="mt-3 font-display text-3xl font-bold text-primary-deep sm:text-4xl">
            Moments From Our Campus
          </h2>
          <p className="mt-4 text-muted-foreground">
            Celebrations, activities and everyday learning — captured at our school.
          </p>
        </div>

        {items.length === 0 ? (
          <div className="mt-12 rounded-3xl border border-dashed border-border py-16 text-center">
            <ImageOff className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">No gallery images available.</p>
          </div>
        ) : (
          <div className="mt-12 columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
            {items.map((item, i) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActive(i)}
                className="group relative block w-full overflow-hidden rounded-3xl shadow-card focus:ring-2 focus:ring-ring focus:outline-none"
              >
                <img
                  src={item.url}
                  alt={item.caption}
                  loading="lazy"
                  decoding="async"
                  className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-4 text-left text-sm font-medium text-white">
                  {item.caption}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {active !== null && (
        <Lightbox
          items={items}
          index={active}
          onIndexChange={setActive}
          onClose={() => setActive(null)}
        />
      )}
    </section>
  );
}
