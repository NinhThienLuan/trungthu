import React, { useState, useMemo } from 'react';
import { Search, X, Box, Sparkles } from 'lucide-react';
import { PRODUCT_BOXES, CAKE_FLAVORS } from '../services/catalogService.js';
import { formatCurrency } from '../utils/formatters.js';

export const SearchModal = ({
  isOpen,
  currency,
  language,
  onClose,
  onSelectProduct,
  onSelectCake,
}) => {
  if (!isOpen) return null;

  const [query, setQuery] = useState('');

  const matchedBoxes = useMemo(() => {
    if (!query.trim()) return PRODUCT_BOXES.slice(0, 3);
    const q = query.toLowerCase();
    return PRODUCT_BOXES.filter((b) => 
      b.name.toLowerCase().includes(q) ||
      b.nameEn.toLowerCase().includes(q) ||
      b.code.toLowerCase().includes(q) ||
      b.flavors.some((f) => f.toLowerCase().includes(q))
    );
  }, [query]);

  const matchedCakes = useMemo(() => {
    if (!query.trim()) return CAKE_FLAVORS.slice(0, 4);
    const q = query.toLowerCase();
    return CAKE_FLAVORS.filter((c) =>
      c.name.toLowerCase().includes(q) ||
      c.nameEn.toLowerCase().includes(q) ||
      c.ingredients.some((ing) => ing.toLowerCase().includes(q))
    );
  }, [query]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 bg-overlay/85 backdrop-blur-md">
      <div 
        className="w-full max-w-2xl bg-surface border border-gold/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-border bg-surface-raised flex items-center gap-3">
          <Search className="w-5 h-5 text-gold shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm kiếm hộp quà, vị bánh (Yến sào, Vi cá, Lava, Hạt sen, Matcha...)"
            className="flex-1 bg-transparent border-none text-sm text-text placeholder-text-faint focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-xs text-text-muted hover:text-text px-2 py-1"
            >
              Xóa
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 rounded text-text-muted hover:text-text cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Body */}
        <div className="overflow-y-auto p-5 space-y-6 flex-1 text-xs">
          
          {/* Matched Boxes */}
          <div>
            <div className="text-[11px] font-semibold text-gold-light uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Box className="w-3.5 h-3.5" />
              <span>Hộp Quà Thượng Hạng ({matchedBoxes.length})</span>
            </div>

            <div className="space-y-2">
              {matchedBoxes.map((box) => (
                <div
                  key={box.id}
                  onClick={() => {
                    onSelectProduct(box);
                    onClose();
                  }}
                  className="p-2.5 rounded-xl bg-surface-raised border border-border hover:border-gold/60 flex items-center justify-between gap-3 cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-3">
                    <img src={box.images[0]} alt={box.name} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                    <div>
                      <div className="font-serif font-bold text-sm text-text">{box.name}</div>
                      <div className="text-[11px] text-text-muted">{box.cakeCount} Bánh • {box.boxType}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-serif font-bold text-gold-gradient">
                      {formatCurrency(box.price, currency)}
                    </div>
                    <span className="text-[10px] text-success">{box.badge}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Matched Flavors */}
          <div>
            <div className="text-[11px] font-semibold text-gold-light uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Vị Bánh Nghệ Nhân ({matchedCakes.length})</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {matchedCakes.map((cake) => (
                <div
                  key={cake.id}
                  onClick={() => {
                    onSelectCake(cake);
                    onClose();
                  }}
                  className="p-2 rounded-xl bg-surface-raised border border-border hover:border-gold/60 flex items-center gap-2.5 cursor-pointer transition-all"
                >
                  <img src={cake.image} alt={cake.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-text truncate">{cake.name}</div>
                    <div className="text-[10px] text-text-muted">{cake.weight} • {cake.sugarLevel}</div>
                  </div>
                  <div className="text-[11px] font-mono text-gold-gradient shrink-0">
                    {formatCurrency(cake.singlePrice, currency)}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer Quick Tip */}
        <div className="p-3 bg-surface-raised border-t border-border text-center text-[11px] text-text-faint">
          Nhấn ESC hoặc click ra ngoài để đóng tìm kiếm
        </div>
      </div>
    </div>
  );
};
