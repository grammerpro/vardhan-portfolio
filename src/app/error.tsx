'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-purple-50 to-sky-50 px-6 dark:from-slate-900 dark:to-slate-800">
      <motion.div
        className="max-w-md text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        >
          <svg
            className="h-12 w-12 text-red-600 dark:text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </motion.div>

        <h1 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
          Something went wrong!
        </h1>
        
        <p className="mb-8 text-gray-600 dark:text-gray-300">
          We apologize for the inconvenience. An unexpected error has occurred.
          {error.digest && (
            <span className="mt-2 block text-sm text-gray-500 dark:text-gray-400">
              Error ID: {error.digest}
            </span>
          )}
        </p>

        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-sky-500 px-8 py-3 font-semibold text-white shadow-lg transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2"
          >
            Try again
          </button>
          
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-purple-200 bg-white px-8 py-3 font-semibold text-purple-600 backdrop-blur-xl transition-all hover:border-purple-300 hover:bg-white/80 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 dark:border-white/20 dark:bg-white/10 dark:text-purple-200"
          >
            Go home
          </a>
        </div>
      </motion.div>
    </div>
  );
}
