'use client';

import { useEffect, useState } from 'react';
import { healthAPI } from '@/lib/api';

interface HealthCheckProps {
  onHealthy?: () => void;
  showOnSuccess?: boolean;
}

export default function BackendHealthCheck({ onHealthy, showOnSuccess = false }: HealthCheckProps) {
  const [status, setStatus] = useState<'checking' | 'healthy' | 'error'>('checking');
  const [error, setError] = useState<string>('');
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  useEffect(() => {
    checkHealth();
  }, [retryCount]);

  const checkHealth = async () => {
    try {
      setStatus('checking');
      setError('');
      
      const response = await healthAPI.check();
      
      if (response.status === 'ok' && response.database === 'connected') {
        setStatus('healthy');
        if (onHealthy) {
          onHealthy();
        }
      } else {
        throw new Error('Backend is not fully operational');
      }
    } catch (err: any) {
      console.error('Health check failed:', err);
      setError(err.message || 'Failed to connect to backend');
      setStatus('error');
    }
  };

  const handleRetry = () => {
    if (retryCount < maxRetries) {
      setRetryCount(retryCount + 1);
    }
  };

  if (status === 'checking') {
    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="mb-4">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Checking Backend Status...
            </h3>
            <p className="text-gray-600">
              Please wait while we connect to the server
            </p>
            {retryCount > 0 && (
              <p className="text-sm text-gray-500 mt-2">
                Retry attempt {retryCount} of {maxRetries}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="mb-4">
              <svg
                className="mx-auto h-12 w-12 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Backend Not Available
            </h3>
            <p className="text-gray-600 mb-4">
              The backend server is not responding. Please try again later.
            </p>
            <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <div className="space-y-3">
              {retryCount < maxRetries ? (
                <button
                  onClick={handleRetry}
                  className="w-full bg-green-500 text-white py-3 rounded-md font-semibold hover:bg-green-600 transition-colors"
                >
                  Retry Connection ({maxRetries - retryCount} attempts left)
                </button>
              ) : (
                <div className="text-sm text-gray-600">
                  <p>Maximum retry attempts reached.</p>
                  <p className="mt-2">Please contact support if the issue persists.</p>
                </div>
              )}
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-gray-200 text-gray-700 py-3 rounded-md font-semibold hover:bg-gray-300 transition-colors"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'healthy' && showOnSuccess) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-4">
        <div className="flex items-center">
          <svg
            className="h-5 w-5 text-green-500 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <p className="text-sm text-green-700">Backend is connected and operational</p>
        </div>
      </div>
    );
  }

  return null;
}
