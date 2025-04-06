import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '../components/AuthProvider';
import Header from '../components/Header';
import AdminNav from '../components/AdminNav';
import TeacherNav from '../components/TeacherNav';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Use dynamic import for components that might delay rendering
const DynamicHeader = dynamic(() => import('../components/Header'), {
  ssr: true,
  loading: () => <div className="h-16 border-b border-gray-200 dark:border-gray-800"></div>
});

const DynamicAdminNav = dynamic(() => import('../components/AdminNav'), {
  ssr: true,
  loading: () => null
});

const DynamicTeacherNav = dynamic(() => import('../components/TeacherNav'), {
  ssr: true,
  loading: () => null
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Beyond Measure | Connecting Teachers with Donors",
  description: "Beyond Measure connects donors with teachers to fund educational projects that make a difference in students' lives.",
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-full flex flex-col`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <DynamicAdminNav />
          <DynamicTeacherNav />
          <DynamicHeader />
          <main className="flex-grow">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              {children}
            </div>
          </main>
          <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="mb-8 md:mb-0">
                  <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent mb-2">Beyond Measure</div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">Connecting teachers with donors to fund educational projects that make a difference in students' lives.</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-2 gap-8 md:gap-12 text-center md:text-left">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Resources</h3>
                    <ul className="space-y-3">
                      <li>
                        <Link href="/about" className="text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary-light text-sm">About</Link>
                      </li>
                      <li>
                        <Link href="/contact" className="text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary-light text-sm">Contact</Link>
                      </li>
                      <li>
                        <Link href="/faq" className="text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary-light text-sm">FAQ</Link>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Legal</h3>
                    <ul className="space-y-3">
                      <li>
                        <Link href="/privacy-policy" className="text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary-light text-sm">Privacy Policy</Link>
                      </li>
                      <li>
                        <Link href="/terms-of-use" className="text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary-light text-sm">Terms of Use</Link>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800 text-center text-sm text-gray-500 dark:text-gray-400">
                <div className="flex justify-center space-x-6 mb-6">
                  <a href="https://fb.me/GoBeyondMeasure.org" className="text-gray-400 hover:text-primary">
                    <span className="sr-only">Facebook</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                    </svg>
                  </a>
                  <a href="https://www.instagram.com/gobeyondmeasure" className="text-gray-400 hover:text-primary">
                    <span className="sr-only">Instagram</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                    </svg>
                  </a>
                  <a href="https://twitter.com/BeyondMeasureGo" className="text-gray-400 hover:text-primary">
                    <span className="sr-only">X (Twitter)</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M13.6823 10.6218L20.2391 3H18.5778L12.9336 9.61788L8.41036 3H3.26562L10.0836 13.0074L3.26562 21H4.92702L10.8323 14.0113L15.5897 21H20.7344L13.6823 10.6218ZM11.5336 13.0371L10.6553 11.6697L5.18352 4.2971H7.14168L11.5835 10.1533L12.4617 11.5207L18.1559 19.1631H16.1977L11.5336 13.0371Z" />
                    </svg>
                  </a>
                </div>
                <p>© {new Date().getFullYear()} Beyond Measure. All rights reserved.</p>
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
