'use client';

import React, { useState, useEffect } from 'react';
import { useClient } from '@/contexts';
import { CircularProgress, Box } from '@mui/material';
import { OnboardingModule } from './OnboardingModule';

export const OnboardingClientWrapper: React.FC = () => {
  const { client } = useClient();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await client.getCurrentUser();
        console.log('OnboardingClientWrapper - fetched user:', response);
        setUser(response);
        setError(null);
      } catch (err) {
        console.error('OnboardingClientWrapper - error fetching user:', err);
        setError(err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [client]);

  console.log('OnboardingClientWrapper - loading:', loading, 'user:', user, 'error:', error);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !user) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <p>Unable to load user data. Please refresh the page.</p>
      </Box>
    );
  }

  console.log('OnboardingClientWrapper - rendering OnboardingModule with user:', user);
  return <OnboardingModule user={user} />;
};