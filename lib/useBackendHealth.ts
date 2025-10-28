'use client';

import { useState, useEffect } from 'react';
import { healthAPI } from '@/lib/api';

interface HealthStatus {
  isHealthy: boolean;
  isChecking: boolean;
  error: string | null;
  lastChecked: Date | null;
}

export function useBackendHealth(autoCheck: boolean = true) {
  const [status, setStatus] = useState<HealthStatus>({
    isHealthy: false,
    isChecking: false,
    error: null,
    lastChecked: null,
  });

  const checkHealth = async () => {
    setStatus(prev => ({ ...prev, isChecking: true, error: null }));
    
    try {
      const response = await healthAPI.check();
      
      if (response.status === 'ok' && response.database === 'connected') {
        setStatus({
          isHealthy: true,
          isChecking: false,
          error: null,
          lastChecked: new Date(),
        });
      } else {
        throw new Error('Backend is not fully operational');
      }
    } catch (err: any) {
      setStatus({
        isHealthy: false,
        isChecking: false,
        error: err.message || 'Failed to connect to backend',
        lastChecked: new Date(),
      });
    }
  };

  useEffect(() => {
    if (autoCheck) {
      checkHealth();
    }
  }, [autoCheck]);

  return {
    ...status,
    checkHealth,
  };
}
