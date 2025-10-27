'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { logError } from '@/lib/logger';
import { getUserFriendlyError } from '@/types/errors';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Error boundary component for catching and displaying errors
 * Automatically wraps all pages in the app directory
 */
export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to console and analytics
    logError(error, {
      digest: error.digest,
      component: 'ErrorBoundary',
      page: window.location.pathname
    });
  }, [error]);

  const userFriendlyMessage = getUserFriendlyError(error);
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-black flex items-center justify-center px-6">
      <div className="max-w-2xl w-full">
        {/* Error Card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 md:p-12 border border-gray-200 dark:border-gray-800">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-4">
            Something Went Wrong
          </h1>

          {/* User-friendly message */}
          <p className="text-lg text-center text-gray-600 dark:text-gray-400 mb-8">
            {userFriendlyMessage}
          </p>

          {/* Development-only: Error details */}
          {isDevelopment && (
            <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <h3 className="font-semibold text-red-900 dark:text-red-300 mb-2">
                Development Error Details:
              </h3>
              <p className="text-sm text-red-800 dark:text-red-400 font-mono mb-2">
                {error.message}
              </p>
              {error.digest && (
                <p className="text-xs text-red-700 dark:text-red-500">
                  Error ID: {error.digest}
                </p>
              )}
              {error.stack && (
                <details className="mt-3">
                  <summary className="text-sm text-red-800 dark:text-red-400 cursor-pointer hover:text-red-900 dark:hover:text-red-300">
                    View Stack Trace
                  </summary>
                  <pre className="mt-2 text-xs text-red-700 dark:text-red-500 overflow-x-auto p-3 bg-red-100 dark:bg-red-900/30 rounded">
                    {error.stack}
                  </pre>
                </details>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={reset}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-semibold shadow-lg hover:shadow-xl"
            >
              <RefreshCw className="w-5 h-5" />
              Try Again
            </button>

            <button
              onClick={() => window.location.href = '/'}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-semibold"
            >
              <Home className="w-5 h-5" />
              Go Home
            </button>
          </div>

          {/* Help Text */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
            <p className="text-sm text-center text-gray-600 dark:text-gray-400">
              If this problem persists, please contact{' '}
              <a
                href="mailto:hello@lookafteryou.agency"
                className="text-purple-600 dark:text-purple-400 hover:underline"
              >
                hello@lookafteryou.agency
              </a>
            </p>
            {error.digest && (
              <p className="text-xs text-center text-gray-500 dark:text-gray-500 mt-2">
                Error Reference: {error.digest}
              </p>
            )}
          </div>
        </div>

        {/* Additional Help */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Common solutions:
          </p>
          <ul className="mt-3 text-sm text-gray-500 dark:text-gray-500 space-y-2">
            <li>• Refresh the page</li>
            <li>• Check your internet connection</li>
            <li>• Clear your browser cache</li>
            <li>• Try again in a few moments</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

