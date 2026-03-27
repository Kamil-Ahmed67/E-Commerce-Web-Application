'use client'

export default function Footer() {
    return (
        <footer className="footer footer-center p-3.5 text-xs bg-gray-900 text-center text-gray-100">
          <div className="flex justify-center items-center">
              &copy; {new Date().getFullYear()} Mingle Fashion.Version-1.5
          </div>
        </footer>
    );
}
