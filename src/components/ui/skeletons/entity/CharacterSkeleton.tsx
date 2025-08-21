import React from 'react';
import { Box, Card, CardContent, CardMedia, Chip } from '@mui/material';
import { SkeletonText, SkeletonButton, SkeletonAvatar } from '@/components/ui/skeletons';

interface CharacterSkeletonProps {
  showImage?: boolean;
  showActions?: boolean;
  variant?: 'table' | 'card';
  showStats?: boolean;
}

const CharacterTableRowSkeleton: React.FC = () => (
  <Box display="flex" alignItems="center" gap={2} py={1}>
    {/* Avatar column */}
    <SkeletonAvatar size={40} />
    
    {/* Name column */}
    <Box flex={2}>
      <SkeletonText width="85%" height={20} />
    </Box>
    
    {/* Type column */}
    <Box flex={1}>
      <Chip 
        label={<SkeletonText width={40} height={16} />}
        size="small" 
        sx={{ bgcolor: 'rgba(0,0,0,0.1)' }}
      />
    </Box>
    
    {/* Archetype column */}
    <Box flex={1}>
      <SkeletonText width="70%" height={18} />
    </Box>
    
    {/* Faction column */}
    <Box flex={1}>
      <SkeletonText width="60%" height={18} />
    </Box>
    
    {/* Actions column */}
    <Box flex={1} display="flex" justifyContent="center" gap={1}>
      <SkeletonButton width={32} height={32} />
      <SkeletonButton width={32} height={32} />
    </Box>
  </Box>
);

const CharacterCardSkeleton: React.FC<{ 
  showImage?: boolean; 
  showActions?: boolean;
  showStats?: boolean;
}> = ({ 
  showImage = true, 
  showActions = true,
  showStats = true
}) => (
  <Card sx={{ mb: 2 }}>
    {showImage && (
      <CardMedia sx={{ height: 140 }}>
        <SkeletonText width="100%" height="100%" variant="rectangular" />
      </CardMedia>
    )}
    <CardContent sx={{ p: "1rem" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 2,
        }}
      >
        <Box display="flex" alignItems="center" gap={2} flex={1}>
          <SkeletonAvatar size={48} />
          <Box>
            {/* Character name */}
            <SkeletonText width={150} height={22} />
            {/* Archetype */}
            <SkeletonText width={100} height={16} />
          </Box>
        </Box>
        {showActions && (
          <Box display="flex" gap={1}>
            <SkeletonButton width={32} height={32} />
            <SkeletonButton width={32} height={32} />
          </Box>
        )}
      </Box>
      
      {/* Type and faction chips */}
      <Box display="flex" gap={1} mb={2}>
        <Chip 
          label={<SkeletonText width={30} height={16} />}
          size="small" 
          sx={{ bgcolor: 'rgba(0,0,0,0.1)' }}
        />
        <Chip 
          label={<SkeletonText width={60} height={16} />}
          size="small" 
          sx={{ bgcolor: 'rgba(0,0,0,0.1)' }}
        />
      </Box>
      
      {/* Character description */}
      <Box mb={2}>
        <SkeletonText width="100%" height={16} />
        <SkeletonText width="85%" height={16} />
        <SkeletonText width="70%" height={16} />
      </Box>
      
      {/* Action Values (stats) */}
      {showStats && (
        <Box>
          <SkeletonText width={80} height={18} />
          <Box display="grid" gridTemplateColumns="repeat(4, 1fr)" gap={1} mt={1}>
            {['Body', 'Chi', 'Mind', 'Reflexes'].map((stat, index) => (
              <Box key={stat} textAlign="center">
                <SkeletonText width="80%" height={14} />
                <SkeletonText width="60%" height={20} />
              </Box>
            ))}
          </Box>
        </Box>
      )}
      
      {/* Associated items (weapons, schticks) */}
      <Box mt={2}>
        <Box display="flex" flexWrap="wrap" gap={0.5}>
          <SkeletonText width={70} height={14} />
          <SkeletonText width={85} height={14} />
          <SkeletonText width={60} height={14} />
        </Box>
      </Box>
    </CardContent>
  </Card>
);

export const CharacterSkeleton: React.FC<CharacterSkeletonProps> = ({
  showImage = true,
  showActions = true,
  variant = 'card',
  showStats = true
}) => {
  if (variant === 'table') {
    return <CharacterTableRowSkeleton />;
  }
  
  return (
    <CharacterCardSkeleton 
      showImage={showImage} 
      showActions={showActions}
      showStats={showStats}
    />
  );
};