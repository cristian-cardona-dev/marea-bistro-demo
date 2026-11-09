// src/components/DishSelector.tsx
import { useState, useRef } from 'react';
import styles from './DishSelector.module.css';

interface Dish {
  name: string;
  description: string;
  price: number;
  image?: string;
  ingredients?: string[];
  story?: string;
  pairing?: string;
}

interface Props {
  dishes: Dish[];
}

export default function DishSelector({ dishes }: Props) {
  const [selected, setSelected] = useState<Dish | null>(dishes[0] || null);
  const [prevImage, setPrevImage] = useState<string | null>(null);
  const [entering, setEntering] = useState(true);

  if (!dishes.length) return null;

  function handleSelect(dish: Dish): void {
    if (selected?.name === dish.name) return;
    setPrevImage(selected?.image ?? null);
    setSelected(dish);
    setEntering(false);
    // Crossfade real: el plato saliente se desvanece mientras el entrante aparece.
    requestAnimationFrame(() => setEntering(true));
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Dish selector buttons */}
      <div className="flex flex-wrap gap-2 justify-center mb-6">
        {/* chip: unselected ink #18343A on ground #F2F3EE = 11.83:1; border ink@60% = 4.90:1 (>=3:1 UI); selected accent #1A6F70 on ground #F2F3EE = 5.30:1 */}
        {dishes.map((dish) => (
          <button
            key={dish.name}
            onClick={() => handleSelect(dish)}
            className={`min-h-[44px] min-w-[44px] px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${selected?.name === dish.name ? 'bg-accent text-ground shadow-lg scale-105 border border-ground' : 'bg-ground text-ink hover:bg-ground-alt hover:text-ink border border-ink/60'}`}
            aria-pressed={selected?.name === dish.name}
          >
            {dish.name}
          </button>
        ))}
      </div>

      {/* Selected dish detail */}
      {selected && (
        <div className="bg-ground-alt p-5 md:p-8 border border-ink/15">
          <div className="grid items-center gap-6 md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
            {selected.image && (
              <div className={styles.crossfade}>
                {prevImage && (
                  <img
                    key="prev"
                    src={prevImage}
                    alt=""
                    className={styles.layer}
                    style={{ opacity: entering ? 0 : 1 }}
                    aria-hidden="true"
                  />
                )}
                <img
                  key="curr"
                  src={selected.image}
                  alt={selected.name}
                  className={styles.layer}
                  style={{ opacity: entering ? 1 : 0 }}
                  loading="lazy"
                />
              </div>
            )}
            <div className="min-w-0 text-left">
              <p className="font-display text-xl font-bold text-ink mb-2">
                {selected.name}
              </p>
              {/* description and price retain the high-contrast ink token on the ground-alt surface. */}
              <p className="text-ink text-sm mb-3">{selected.description}</p>
              <p className="text-ink font-bold text-lg mb-4">
                {selected.price}€
              </p>

              {selected.ingredients && (
                <div className="mb-3">
                  <p className="text-xs text-muted uppercase tracking-wider mb-1">
                    Ingredientes
                  </p>
                  <p className="text-sm text-ink">
                    {selected.ingredients.join(' · ')}
                  </p>
                </div>
              )}

              {selected.story && (
                <div className="mb-3">
                  <p className="text-xs text-muted uppercase tracking-wider mb-1">
                    Historia
                  </p>
                  <p className="text-sm text-ink italic">{selected.story}</p>
                </div>
              )}

              {selected.pairing && (
                <div>
                  <p className="text-xs text-muted uppercase tracking-wider mb-1">
                    Maridaje sugerido
                  </p>
                  <p className="text-sm text-accent">{selected.pairing}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
