"use client";

import {
  forwardRef,
  useState,
  useEffect,
  useRef,
  useImperativeHandle,
  useCallback,
} from "react";

const MAX_PRICE = 10000;
const STEP = 10;

/* -------------------------------------------------------------------------- */
/*  Helper – clamp + round to nearest step                                   */
/* -------------------------------------------------------------------------- */
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const roundToStep = (value) => Math.round(value / STEP) * STEP;

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */
const PriceNewDropdown = forwardRef(({ priceRange, onChange }, ref) => {
  const [isOpen, setIsOpen] = useState(true);
  const [range, setRange] = useState(priceRange);
  const [dragging, setDragging] = useState(null);

  const trackRef = useRef(null);
  const rafRef = useRef(null);

  /* ---- expose reset ---------------------------------------------------- */
  useImperativeHandle(ref, () => ({
    reset: () => {
      const defaultRange = { from: 0, to: MAX_PRICE };
      setRange(defaultRange);
      onChange(defaultRange);
    },
  }));

  /* ---- sync parent changes ------------------------------------------- */
  useEffect(() => {
    setRange(priceRange);
  }, [priceRange]);

  /* ---- convert pixel position → price --------------------------------- */
  const pixelToValue = useCallback((clientX) => {
    if (!trackRef.current) return 0;
    const rect = trackRef.current.getBoundingClientRect();
    const pos = clamp(clientX - rect.left, 0, rect.width);
    const percent = pos / rect.width;
    return roundToStep(percent * MAX_PRICE);
  }, []);

  /* ---- update range while dragging ------------------------------------ */
  const updateWhileDragging = useCallback(
    (clientX) => {
      if (!dragging) return;

      const raw = pixelToValue(clientX);
      let newFrom = range.from;
      let newTo = range.to;

      if (dragging === "min") {
        newFrom = clamp(raw, 0, range.to - STEP);
      } else {
        newTo = clamp(raw, range.from + STEP, MAX_PRICE);
      }

      const newRange = { from: newFrom, to: newTo };
      setRange(newRange);
      onChange(newRange);
    },
    [dragging, range, pixelToValue, onChange]
  );

  /* ---- mouse / touch move -------------------------------------------- */
  const handleMove = useCallback(
    (e) => {
      if (!dragging) return;
      const clientX = e instanceof MouseEvent ? e.clientX : e.touches[0].clientX;

      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        updateWhileDragging(clientX);
        rafRef.current = null;
      });
    },
    [dragging, updateWhileDragging]
  );

  /* ---- start dragging ------------------------------------------------- */
  const startDrag = (type) => {
    setDragging(type);
  };

  /* ---- stop dragging -------------------------------------------------- */
  const stopDrag = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setDragging(null);
  }, []);

  /* ---- global listeners ------------------------------------------------ */
  useEffect(() => {
    if (dragging) {
      document.addEventListener("mousemove", handleMove);
      document.addEventListener("touchmove", handleMove, { passive: false });
      document.addEventListener("mouseup", stopDrag);
      document.addEventListener("touchend", stopDrag);
      return () => {
        document.removeEventListener("mousemove", handleMove);
        document.removeEventListener("touchmove", handleMove);
        document.removeEventListener("mouseup", stopDrag);
        document.removeEventListener("touchend", stopDrag);
      };
    }
  }, [dragging, handleMove, stopDrag]);

  /* ---- keyboard handling for thumbs ----------------------------------- */
  const handleKeyDown = (type) => (e) => {
    const step = e.shiftKey ? STEP * 10 : STEP;
    let newFrom = range.from;
    let newTo = range.to;

    switch (e.key) {
      case "ArrowLeft":
      case "ArrowDown":
        e.preventDefault();
        if (type === "min") newFrom = Math.max(0, range.from - step);
        else newTo = Math.max(range.from + STEP, range.to - step);
        break;
      case "ArrowRight":
      case "ArrowUp":
        e.preventDefault();
        if (type === "min") newFrom = Math.min(range.to - STEP, range.from + step);
        else newTo = Math.min(MAX_PRICE, range.to + step);
        break;
      case "Home":
        e.preventDefault();
        if (type === "min") newFrom = 0;
        else newTo = MAX_PRICE;
        break;
      case "End":
        e.preventDefault();
        if (type === "min") newFrom = range.to - STEP;
        else newTo = range.from + STEP;
        break;
      default:
        return;
    }

    const newRange = { from: newFrom, to: newTo };
    setRange(newRange);
    onChange(newRange);
  };

  /* ---- input change --------------------------------------------------- */
  const handleInput = (type, raw) => {
    const value = Number(raw);
    if (Number.isNaN(value)) return;

    let newFrom = range.from;
    let newTo = range.to;

    if (type === "min") {
      newFrom = clamp(roundToStep(value), 0, range.to - STEP);
    } else {
      newTo = clamp(roundToStep(value), range.from + STEP, MAX_PRICE);
    }

    const newRange = { from: newFrom, to: newTo };
    setRange(newRange);
    onChange(newRange);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-sm p-6 font-semibold">
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="flex w-full items-center justify-between focus:outline-none"
        aria-expanded={isOpen}
        aria-controls="price-range-content"
      >
        <h2 className="text-base text-gray-800">Price</h2>

        <svg
          className={`h-5 w-5 text-[#32BBAB] transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Content */}
      {isOpen && (
        <div id="price-range-content" className="mt-6 space-y-6 select-none">
          {/* Track */}
          <div
            ref={trackRef}
            className="relative h-1.5 bg-gray-200 rounded-full cursor-pointer"
            role="presentation"
          >
            {/* Filled portion */}
            <div
              className="absolute inset-y-0 bg-gray-700 rounded-full"
              style={{
                left: `${(range.from / MAX_PRICE) * 100}%`,
                right: `${100 - (range.to / MAX_PRICE) * 100}%`,
              }}
              aria-hidden="true"
            />

            {/* Min thumb */}
            <div
              role="slider"
              tabIndex={0}
              aria-label="Minimum price"
              aria-valuemin={0}
              aria-valuemax={range.to}
              aria-valuenow={range.from}
              className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 bg-white border-2 border-[#32BBAB] rounded-full shadow-md focus-visible:ring-2 focus-visible:ring-[#32BBAB] focus-visible:ring-offset-1 outline-none"
              style={{ left: `${(range.from / MAX_PRICE) * 100}%` }}
              onMouseDown={() => startDrag("min")}
              onTouchStart={() => startDrag("min")}
              onKeyDown={handleKeyDown("min")}
            />

            {/* Max thumb */}
            <div
              role="slider"
              tabIndex={0}
              aria-label="Maximum price"
              aria-valuemin={range.from}
              aria-valuemax={MAX_PRICE}
              aria-valuenow={range.to}
              className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 bg-white border-2 border-[#32BBAB] rounded-full shadow-md focus-visible:ring-2 focus-visible:ring-[#32BBAB] focus-visible:ring-offset-1 outline-none"
              style={{ left: `${(range.to / MAX_PRICE) * 100}%` }}
              onMouseDown={() => startDrag("max")}
              onTouchStart={() => startDrag("max")}
              onKeyDown={handleKeyDown("max")}
            />
          </div>

          {/* Input fields */}
          <div className="flex justify-between gap-4">
            {/* Min */}
            <div className="w-1/2">
              <label htmlFor="minPrice" className="mb-1 block text-sm text-gray-500">
                Min
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  ৳
                </span>
                <input
                  id="minPrice"
                  type="number"
                  min={0}
                  max={range.to - STEP}
                  step={STEP}
                  value={range.from}
                  onChange={(e) => handleInput("min", e.target.value)}
                  className="w-full rounded-md border border-gray-300 py-2 pl-7 pr-3 text-sm outline-none focus:border-[#32BBAB] focus:ring-2 focus:ring-[#32BBAB]"
                  aria-label="Minimum price"
                />
              </div>
            </div>

            {/* Max */}
            <div className="w-1/2">
              <label htmlFor="maxPrice" className="mb-1 block text-sm text-gray-500">
                Max
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  ৳
                </span>
                <input
                  id="maxPrice"
                  type="number"
                  min={range.from + STEP}
                  max={MAX_PRICE}
                  step={STEP}
                  value={range.to}
                  onChange={(e) => handleInput("max", e.target.value)}
                  className="w-full rounded-md border border-gray-300 py-2 pl-7 pr-3 text-sm outline-none focus:border-[#32BBAB] focus:ring-2 focus:ring-[#32BBAB]"
                  aria-label="Maximum price"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

PriceNewDropdown.displayName = "PriceNewDropdown";

export default PriceNewDropdown;
