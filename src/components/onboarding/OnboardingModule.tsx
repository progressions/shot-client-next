'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Box, Paper, Slide } from '@mui/material';
import { OnboardingProgress, getCurrentMilestone } from '@/lib/onboarding';
import { CampaignOnboarding } from './CampaignOnboarding';
import { OnboardingCarousel } from './OnboardingCarousel';
import { CongratulationsModule } from './CongratulationsModule';

export interface OnboardingModuleProps {
  user: {
    onboardingProgress: OnboardingProgress;
  };
}

export const OnboardingModule: React.FC<OnboardingModuleProps> = ({ user }) => {
  const pathname = usePathname();
  const { onboardingProgress } = user;

  // Don't show anything if onboarding is complete
  if (onboardingProgress.onboardingComplete) {
    return null;
  }

  // Show congratulations if all milestones complete but not dismissed
  if (onboardingProgress.readyForCongratulations) {
    return (
      <Slide in={true} direction="down" timeout={500}>
        <Box sx={{ p: 2 }}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              mb: 2, 
              border: '2px solid',
              borderColor: 'success.main',
              backgroundColor: 'success.50',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <CongratulationsModule />
          </Paper>
        </Box>
      </Slide>
    );
  }

  // Show single CTA for pre-campaign users
  if (!onboardingProgress.firstCampaignCreatedAt) {
    return (
      <Slide in={true} direction="down" timeout={500}>
        <Box sx={{ p: 2 }}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              mb: 2, 
              border: '2px solid',
              borderColor: 'primary.main',
              backgroundColor: 'primary.50',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <CampaignOnboarding currentPath={pathname} />
          </Paper>
        </Box>
      </Slide>
    );
  }

  // Show carousel for post-campaign users
  return (
    <Slide in={true} direction="down" timeout={500}>
      <Box sx={{ p: 2 }}>
        <Paper 
          elevation={3} 
          sx={{ 
            p: 3, 
            mb: 2, 
            border: '2px solid',
            borderColor: 'info.main',
            backgroundColor: 'info.50',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)',
              animation: 'onboarding-shimmer 3s infinite',
              pointerEvents: 'none'
            },
            '@keyframes onboarding-shimmer': {
              '0%': { transform: 'translateX(-100%)' },
              '100%': { transform: 'translateX(100%)' }
            }
          }}
        >
          <OnboardingCarousel progress={onboardingProgress} currentPath={pathname} />
        </Paper>
      </Box>
    </Slide>
  );
};