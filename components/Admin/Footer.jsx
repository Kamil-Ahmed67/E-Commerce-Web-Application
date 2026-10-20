'use client'

export default function Footer() {
    return (
        <footer className="footer footer-center text-xs bg-gray-900 text-center text-gray-100">
            {/* SSLCommerz Pay With Banner */}
            <div className="w-full bg-white px-4 py-3 overflow-hidden">
                <a
                    href="https://www.sslcommerz.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full"
                >
                    <img
                        src="/images/SSL Commerze.jpeg"
                        alt="SSLCommerz - Pay With"
                        style={{ width: '100%', height: 'auto', display: 'block' }}
                    />
                </a>
            </div>
            <div className="flex justify-center items-center p-3.5">
                &copy; {new Date().getFullYear()} Mingle Fashion.Version-3.24
            </div>
        </footer>
    );
}
