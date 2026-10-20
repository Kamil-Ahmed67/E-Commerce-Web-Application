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
const PriceDropdown = forwardRef(({ priceRange, onChange }, ref) => {
  const [isOpen, setIsOpen] = useState(true);
  const [range, setRange] = useState(priceRange);
  const [dragging, setDragging] = useState(null);

  // Free-typed text for the inputs — kept separate from `range` so a user can
  // clear the field and type a fresh number without it snapping back to 0
  // (a controlled input driven straight off the clamped numeric value would
  // coerce "" to 0 on every keystroke). Clamping only happens on commit.
  const [minText, setMinText] = useState(String(priceRange.from));
  const [maxText, setMaxText] = useState(String(priceRange.to));
  const minFocusedRef = useRef(false);
  const maxFocusedRef = useRef(false);

  const trackRef = useRef(null);
  const rafRef = useRef(null);

  /* ---- expose reset ---------------------------------------------------- */
  useImperativeHandle(ref, () => ({
    reset: () => {
      const defaultRange = { from: 0, to: MAX_PRICE };
      setRange(defaultRange);
      setMinText(String(defaultRange.from));
      setMaxText(String(defaultRange.to));
      onChange(defaultRange);
    },
  }));

  /* ---- sync parent changes ------------------------------------------- */
  useEffect(() => {
    setRange(priceRange);
    if (!minFocusedRef.current) setMinText(String(priceRange.from));
    if (!maxFocusedRef.current) setMaxText(String(priceRange.to));
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

  /* ---- commit a typed value on blur / Enter ---------------------------- */
  const commitInput = (type, raw) => {
    const value = Number(raw);
    let newFrom = range.from;
    let newTo = range.to;

    if (!raw.trim() || Number.isNaN(value)) {
      // Empty or invalid — just revert the text to the last committed value
      setMinText(String(range.from));
      setMaxText(String(range.to));
      return;
    }

    if (type === "min") {
      newFrom = clamp(roundToStep(value), 0, range.to - STEP);
    } else {
      newTo = clamp(roundToStep(value), range.from + STEP, MAX_PRICE);
    }

    const newRange = { from: newFrom, to: newTo };
    setRange(newRange);
    setMinText(String(newRange.from));
    setMaxText(String(newRange.to));
    onChange(newRange);
  };

  return (
    <div className="border-b border-gray-200 py-4 font-semibold">
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
          className={`h-5 w-5 text-gray-700 transition-transform duration-200 ${
            isOpen ? "" : "rotate-180"
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
            d="M5 15l7-7 7 7"
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
                  value={minText}
                  onChange={(e) => setMinText(e.target.value)}
                  onFocus={() => { minFocusedRef.current = true; }}
                  onBlur={(e) => { minFocusedRef.current = false; commitInput("min", e.target.value); }}
                  onKeyDown={(e) => { if (e.key === "Enter") e.target.blur(); }}
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
                  value={maxText}
                  onChange={(e) => setMaxText(e.target.value)}
                  onFocus={() => { maxFocusedRef.current = true; }}
                  onBlur={(e) => { maxFocusedRef.current = false; commitInput("max", e.target.value); }}
                  onKeyDown={(e) => { if (e.key === "Enter") e.target.blur(); }}
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

PriceDropdown.displayName = "PriceDropdown";

export default PriceDropdown;
