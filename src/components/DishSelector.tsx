// src/components/DishSelector.tsx
import { useState } from 'react';

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

  if (!dishes.length) return null;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Dish selector buttons */}
      <div className="flex flex-wrap gap-2 justify-center mb-6">
        {dishes.map((dish) => (
          <button
            key={dish.name}
            onClick={() => setSelected(dish)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              selected?.name === dish.name
                ? 'bg-accent text-ink shadow-lg scale-105'
                : 'bg-ground/60 text-muted hover:bg-ground/80 hover:text-ink border border-muted/30'
            }`}
            aria-pressed={selected?.name === dish.name}
          >
            {dish.name}
          </button>
        ))}
      </div>

      {/* Selected dish detail */}
      {selected && (
        <div className="bg-ground/40 backdrop-blur-sm rounded-2xl p-6 border border-muted/20 transition-all duration-300">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {selected.image && (
              <img
                src={selected.image}
                alt={selected.name}
                className="w-full md:w-48 h-48 object-cover rounded-xl"
                loading="lazy"
              />
            )}
            <div className="flex-1 text-left">
              <p className="font-display text-xl font-bold text-ink mb-2">
                {selected.name}
              </p>
              <p className="text-muted text-sm mb-3">{selected.description}</p>
              <p className="text-secondary font-bold text-lg mb-4">
                {selected.price}€
              </p>

              {selected.ingredients && (
                <div className="mb-3">
                  <p className="text-xs text-muted uppercase tracking-wider mb-1">Ingredientes</p>
                  <p className="text-sm text-ink">{selected.ingredients.join(' · ')}</p>
                </div>
              )}

              {selected.story && (
                <div className="mb-3">
                  <p className="text-xs text-muted uppercase tracking-wider mb-1">Historia</p>
                  <p className="text-sm text-ink italic">{selected.story}</p>
                </div>
              )}

              {selected.pairing && (
                <div>
                  <p className="text-xs text-muted uppercase tracking-wider mb-1">Maridaje sugerido</p>
                  <p className="text-sm text-secondary">{selected.pairing}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
