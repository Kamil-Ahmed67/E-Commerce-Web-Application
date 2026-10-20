'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const WHATSAPP_NUMBER = '8801302815322';
const WHATSAPP_MESSAGE = 'Hello! I found you on Mingle Fashion and would like to know more.';
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

export default function WhatsAppButton() {
    const [hovered, setHovered] = useState(false);

    return (
        <div className="fixed bottom-6 right-4 z-9999">
            {/* Tooltip — absolutely positioned above the button, never shifts layout */}
            <AnimatePresence>
                {hovered && (
                    <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        transition={{ duration: 0.15 }}
                        className="absolute bottom-14 right-0 bg-gray-900 text-white text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap shadow-lg pointer-events-none"
                    >
                        Chat with us
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Button */}
            <motion.a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat on WhatsApp"
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="relative flex items-center justify-center w-12 h-12 lg:w-10 lg:h-10 rounded-full shadow-xl"
                style={{ background: '#25D366' }}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 32 32"
                    className="w-7 h-7 lg:w-5 lg:h-5 fill-white"
                >
                    <path d="M16.003 2.667C8.637 2.667 2.667 8.637 2.667 16c0 2.364.634 4.676 1.838 6.698L2.667 29.333l6.82-1.79A13.29 13.29 0 0016.003 29.333C23.369 29.333 29.333 23.363 29.333 16S23.369 2.667 16.003 2.667zm0 24.267a11.01 11.01 0 01-5.618-1.537l-.403-.24-4.048 1.062 1.08-3.94-.263-.416A10.977 10.977 0 015.003 16c0-6.065 4.935-11 11-11s11 4.935 11 11-4.935 11-11 11zm6.04-8.224c-.332-.166-1.963-.968-2.267-1.08-.304-.11-.525-.166-.747.166-.22.33-.858 1.08-1.051 1.3-.194.22-.387.247-.72.082-.33-.166-1.397-.515-2.661-1.641-.984-.877-1.648-1.96-1.842-2.292-.193-.332-.021-.511.145-.677.15-.149.332-.387.498-.58.166-.193.22-.33.33-.55.11-.22.055-.413-.028-.58-.082-.165-.747-1.8-1.023-2.466-.27-.648-.544-.56-.747-.57l-.636-.011c-.22 0-.58.082-.883.413-.304.33-1.16 1.134-1.16 2.766s1.188 3.208 1.354 3.43c.165.22 2.34 3.573 5.671 5.01.793.342 1.412.546 1.893.7.795.252 1.52.216 2.093.131.638-.095 1.963-.803 2.24-1.578.275-.776.275-1.44.192-1.578-.082-.138-.303-.22-.636-.387z"/>
                </svg>

                {/* Pulse ring */}
                <span
                    className="absolute inset-0 rounded-full animate-ping opacity-25 pointer-events-none"
                    style={{ background: '#25D366' }}
                />
            </motion.a>
        </div>
    );
}
