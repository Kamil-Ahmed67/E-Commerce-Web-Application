'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion, useMotionValue } from 'framer-motion';
import {
    FiX, FiChevronLeft, FiChevronRight, FiZoomIn, FiZoomOut,
    FiPlay, FiPause, FiMaximize, FiMinimize,
} from 'react-icons/fi';

const ZOOM_STEPS = [1, 1.5, 2, 3];
const SLIDESHOW_INTERVAL_MS = 2500;
const SWIPE_OFFSET_THRESHOLD = 60;
const SWIPE_VELOCITY_THRESHOLD = 400;

export default function ProductLightbox({ images, altTexts = [], title = '', index, onIndexChange, open, onClose }) {
    const [zoomStep, setZoomStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const rootRef = useRef(null);

    const zoom = ZOOM_STEPS[zoomStep];
    const count = images?.length || 0;
    const slideRef = useRef(null);
    const panX = useMotionValue(0);
    const panY = useMotionValue(0);

    const goTo = (newIndex) => {
        if (count === 0) return;
        onIndexChange(((newIndex % count) + count) % count);
    };
    const goPrev = () => goTo(index - 1);
    const goNext = () => goTo(index + 1);

    // Reset zoom whenever the modal opens or the slide changes.
    useEffect(() => {
        setZoomStep(0);
    }, [index, open]);

    // Recenter the pan position whenever the zoom level or slide changes.
    useEffect(() => {
        panX.set(0);
        panY.set(0);
    }, [zoomStep, index, panX, panY]);

    // Let the mouse scroll wheel pan a zoomed image, like a photo viewer.
    // React binds wheel listeners passively, so preventDefault needs a native listener.
    useEffect(() => {
        const el = slideRef.current;
        if (!el || zoom <= 1) return;
        const clamp = (v, max) => Math.min(max, Math.max(-max, v));
        const onWheel = (e) => {
            e.preventDefault();
            const rect = el.getBoundingClientRect();
            const maxX = (rect.width * (zoom - 1)) / 2;
            const maxY = (rect.height * (zoom - 1)) / 2;
            panX.set(clamp(panX.get() - e.deltaX, maxX));
            panY.set(clamp(panY.get() - e.deltaY, maxY));
        };
        el.addEventListener('wheel', onWheel, { passive: false });
        return () => el.removeEventListener('wheel', onWheel);
    }, [zoom, panX, panY]);

    // Stop the slideshow and exit fullscreen whenever the modal closes.
    useEffect(() => {
        if (!open) {
            setIsPlaying(false);
            if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
        }
    }, [open]);

    useEffect(() => {
        if (!open || !isPlaying || count <= 1) return;
        const id = setInterval(goNext, SLIDESHOW_INTERVAL_MS);
        return () => clearInterval(id);
    }, [open, isPlaying, index, count]);

    useEffect(() => {
        const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    useEffect(() => {
        if (!open) return;
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                if (document.fullscreenElement) return; // let the browser exit fullscreen first
                onClose();
            } else if (e.key === 'ArrowLeft') {
                goPrev();
            } else if (e.key === 'ArrowRight') {
                goNext();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, index, count]);

    const toggleFullscreen = () => {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            rootRef.current?.requestFullscreen?.();
        }
    };

    const handleDragEnd = (e, info) => {
        if (zoom > 1) return; // dragging pans a zoomed image instead of changing slides
        if (info.offset.x > SWIPE_OFFSET_THRESHOLD || info.velocity.x > SWIPE_VELOCITY_THRESHOLD) {
            goPrev();
        } else if (info.offset.x < -SWIPE_OFFSET_THRESHOLD || info.velocity.x < -SWIPE_VELOCITY_THRESHOLD) {
            goNext();
        }
    };

    // Each double-tap/double-click steps one level deeper, wrapping back to 1x at the top.
    const toggleZoom = () => setZoomStep((s) => (s + 1) % ZOOM_STEPS.length);

    // Browsers fire native `dblclick` for mouse but not for touch taps, so
    // detect double-taps manually from consecutive touchend timestamps.
    const lastTapRef = useRef(0);
    const DOUBLE_TAP_MS = 300;
    const handleTouchEnd = () => {
        const now = Date.now();
        if (now - lastTapRef.current < DOUBLE_TAP_MS) {
            toggleZoom();
            lastTapRef.current = 0;
        } else {
            lastTapRef.current = now;
        }
    };

    if (count === 0) return null;
    const currentSrc = images[index];
    const currentAlt = altTexts[index] || title || `Product photo ${index + 1}`;

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    ref={rootRef}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] bg-black flex items-center justify-center select-none"
                >
                    {/* Top-right icon row */}
                    <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
                        <button onClick={() => setZoomStep((s) => Math.min(s + 1, ZOOM_STEPS.length - 1))}
                            disabled={zoomStep === ZOOM_STEPS.length - 1}
                            className="p-2.5 rounded-full bg-white/10 text-white hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-white/10 transition"
                            title="Zoom in">
                            <FiZoomIn size={18} />
                        </button>
                        <button onClick={() => setZoomStep((s) => Math.max(s - 1, 0))}
                            disabled={zoomStep === 0}
                            className="p-2.5 rounded-full bg-white/10 text-white hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-white/10 transition"
                            title="Zoom out">
                            <FiZoomOut size={18} />
                        </button>
                        {count > 1 && (
                            <button onClick={() => setIsPlaying((p) => !p)}
                                className="p-2.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition"
                                title={isPlaying ? 'Pause slideshow' : 'Play slideshow'}>
                                {isPlaying ? <FiPause size={18} /> : <FiPlay size={18} />}
                            </button>
                        )}
                        <button onClick={toggleFullscreen}
                            className="p-2.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition"
                            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
                            {isFullscreen ? <FiMinimize size={18} /> : <FiMaximize size={18} />}
                        </button>
                        <button onClick={onClose}
                            className="p-2.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition"
                            title="Close">
                            <FiX size={18} />
                        </button>
                    </div>

                    {/* Prev / next arrows */}
                    {count > 1 && (
                        <>
                            <button onClick={goPrev}
                                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition"
                                title="Previous image">
                                <FiChevronLeft size={22} />
                            </button>
                            <button onClick={goNext}
                                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition"
                                title="Next image">
                                <FiChevronRight size={22} />
                            </button>
                        </>
                    )}

                    {/* Slide */}
                    <div ref={slideRef} className="relative w-full h-full flex items-center justify-center overflow-hidden px-16 py-16"
                        onDoubleClick={toggleZoom} onTouchEnd={handleTouchEnd}>
                        <motion.div
                            key={`${index}-${zoomStep}`}
                            initial={{ opacity: 0, scale: zoom }}
                            animate={{ opacity: 1, scale: zoom }}
                            transition={{ duration: 0.2 }}
                            drag={zoom > 1 ? true : count > 1 ? 'x' : false}
                            dragElastic={zoom > 1 ? 0.05 : 0.6}
                            dragMomentum={false}
                            {...(zoom > 1 ? { dragConstraints: slideRef } : { dragSnapToOrigin: true })}
                            onDragEnd={handleDragEnd}
                            className="relative w-full h-full"
                            style={{ x: zoom > 1 ? panX : 0, y: zoom > 1 ? panY : 0, cursor: zoom > 1 ? 'grab' : count > 1 ? 'grab' : 'default' }}
                            whileDrag={{ cursor: 'grabbing' }}
                        >
                            <Image
                                src={currentSrc}
                                alt={currentAlt}
                                fill
                                priority
                                draggable={false}
                                className="object-contain pointer-events-none"
                                sizes="100vw"
                            />
                        </motion.div>
                    </div>

                    {count > 1 && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-xs tracking-wide">
                            {index + 1} / {count}
                        </div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
