'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-purple-50 to-sky-50 px-6 dark:from-slate-900 dark:to-slate-800">
      <motion.div
        className="max-w-md text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.h1
          className="mb-4 bg-gradient-to-r from-purple-600 to-sky-600 bg-clip-text text-9xl font-bold text-transparent dark:from-purple-400 dark:to-sky-400"
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        >
          404
        </motion.h1>

        <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
          Page Not Found
        </h2>
        
        <p className="mb-8 text-gray-600 dark:text-gray-300">
          Oops! The page you&apos;re looking for seems to have wandered off into the digital void.
        </p>

        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-sky-500 px-8 py-3 font-semibold text-white shadow-lg transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2"
          >
            Go home
          </Link>
          
          <Link
            href="/projects"
            className="inline-flex items-center justify-center rounded-full border border-purple-200 bg-white px-8 py-3 font-semibold text-purple-600 backdrop-blur-xl transition-all hover:border-purple-300 hover:bg-white/80 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 dark:border-white/20 dark:bg-white/10 dark:text-purple-200"
          >
            View projects
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
