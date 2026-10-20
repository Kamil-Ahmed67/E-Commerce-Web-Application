export default function MingleLoader({ fullScreen = true }) {
    return (
        <div className={`bg-white flex flex-col items-center justify-center ${fullScreen ? 'min-h-screen' : 'min-h-[320px] w-full'}`}>
            <div className="relative flex items-center justify-center" style={{ width: 88, height: 88 }}>
                {/* Spinning loading ring */}
                <div
                    className="absolute inset-0 rounded-full"
                    style={{
                        border: '2.5px solid #e5e7eb',
                        borderTopColor: '#32BBAB',
                        animation: 'spin 0.9s linear infinite',
                    }}
                />
                {/* m letter — does not spin */}
                <span
                    className="text-[#32BBAB] select-none leading-none"
                    style={{
                        fontFamily: 'Manrope, sans-serif',
                        fontWeight: 800,
                        fontSize: 42,
                    }}
                >
                    m
                </span>
            </div>

            <p
                className="mt-7 text-gray-400 uppercase tracking-[0.45em] text-[10px] select-none"
                style={{ fontFamily: 'Manrope, sans-serif' }}
            >
                Mingle In Style
            </p>

            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
