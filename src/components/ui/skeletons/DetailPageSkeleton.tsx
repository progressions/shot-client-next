import React from 'react';
import { Box, FormControl, Stack } from '@mui/material';
import { 
  SkeletonText, 
  SkeletonButton, 
  SkeletonAvatar,
  SkeletonForm
} from './BaseSkeleton';

interface DetailPageSkeletonProps {
  entityType: string;
  hasAvatar?: boolean;
  hasHeroImage?: boolean;
  fieldCount?: number;
  hasActions?: boolean;
  hasRelatedSections?: boolean;
  relatedSectionCount?: number;
}

const SpeedDialSkeleton: React.FC = () => (
  <Box 
    position="fixed" 
    bottom={24} 
    right={24} 
    zIndex={1000}
  >
    <SkeletonButton width={56} height={56} />
  </Box>
);

const HeroImageSkeleton: React.FC = () => (
  <Box
    sx={{
      width: "100%",
      height: { xs: 200, md: 300 },
      mb: 2,
      position: "relative",
      overflow: "hidden",
      borderRadius: 1,
    }}
  >
    <SkeletonText width="100%" height="100%" variant="rectangular" />
    {/* Hero image action buttons */}
    <Box
      position="absolute"
      top={16}
      right={16}
      display="flex"
      gap={1}
    >
      <SkeletonButton width={40} height={40} />
      <SkeletonButton width={40} height={40} />
      <SkeletonButton width={40} height={40} />
    </Box>
  </Box>
);

const NameEditorSkeleton: React.FC<{ hasAvatar?: boolean }> = ({ hasAvatar }) => (
  <FormControl fullWidth margin="normal">
    <Box display="flex" alignItems="center" gap={2}>
      {hasAvatar && <SkeletonAvatar size={48} />}
      <Box flex={1}>
        <SkeletonText width="60%" height={40} />
      </Box>
    </Box>
  </FormControl>
);

const SectionHeaderSkeleton: React.FC<{ title?: string }> = ({ title = "Section" }) => (
  <Box sx={{ mb: 2 }}>
    <Box display="flex" alignItems="center" gap={1} mb={1}>
      <SkeletonAvatar size={24} />
      <SkeletonText width={120} height={24} />
    </Box>
    <SkeletonText width="80%" height={16} />
    <SkeletonText width="70%" height={16} />
  </Box>
);

const EditableRichTextSkeleton: React.FC = () => (
  <Box
    sx={{
      border: "1px solid #e0e0e0",
      borderRadius: 1,
      p: 2,
      mb: 2,
      minHeight: 120,
    }}
  >
    <SkeletonText width="100%" height={16} />
    <SkeletonText width="95%" height={16} />
    <SkeletonText width="88%" height={16} />
    <SkeletonText width="92%" height={16} />
    <SkeletonText width="60%" height={16} />
  </Box>
);

const ManagerSkeleton: React.FC<{ title: string }> = ({ title }) => (
  <Box>
    <Box display="flex" alignItems="center" gap={1} mb={2}>
      <SkeletonAvatar size={24} />
      <SkeletonText width={100} height={24} />
    </Box>
    <SkeletonText width="90%" height={16} />
    <SkeletonText width="85%" height={16} />
    
    {/* Manager content */}
    <Box mt={2}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <SkeletonText width={150} height={20} />
        <SkeletonButton width={80} height={36} />
      </Box>
      
      {/* List of managed items */}
      <Stack spacing={1}>
        {Array.from({ length: 3 }).map((_, index) => (
          <Box key={`managed-${index}`} display="flex" alignItems="center" gap={2} p={1}>
            <SkeletonAvatar size={32} />
            <Box flex={1}>
              <SkeletonText width="70%" height={18} />
              <SkeletonText width="50%" height={14} />
            </Box>
            <SkeletonButton width={60} height={32} />
          </Box>
        ))}
      </Stack>
    </Box>
  </Box>
);

const AlertSkeleton: React.FC = () => (
  <Box 
    sx={{
      mb: 2,
      p: 1,
      borderRadius: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.04)',
    }}
  >
    <SkeletonText width="100%" height={40} />
  </Box>
);

export const DetailPageSkeleton: React.FC<DetailPageSkeletonProps> = ({
  entityType,
  hasAvatar = false,
  hasHeroImage = true,
  fieldCount = 3,
  hasActions = true,
  hasRelatedSections = true,
  relatedSectionCount = 1
}) => {
  // Determine entity-specific features
  const getEntityFeatures = (entityType: string) => {
    switch (entityType.toLowerCase()) {
      case 'campaigns':
        return {
          hasAvatar: false,
          hasHeroImage: true,
          sections: ['Members'],
          hasDescription: true
        };
      case 'characters':
        return {
          hasAvatar: true,
          hasHeroImage: true,
          sections: ['Schticks', 'Weapons', 'Parties'],
          hasDescription: true
        };
      case 'fights':
        return {
          hasAvatar: false,
          hasHeroImage: false,
          sections: ['Participants', 'Shots'],
          hasDescription: true
        };
      case 'vehicles':
        return {
          hasAvatar: false,
          hasHeroImage: true,
          sections: ['Characters'],
          hasDescription: true
        };
      default:
        return {
          hasAvatar: hasAvatar,
          hasHeroImage: hasHeroImage,
          sections: ['Related Items'],
          hasDescription: true
        };
    }
  };

  const features = getEntityFeatures(entityType);

  return (
    <Box
      sx={{
        mb: { xs: 1, md: 2 },
        position: "relative",
      }}
    >
      {/* Breadcrumbs skeleton */}
      <Box mb={2}>
        <SkeletonText width={250} height={20} />
      </Box>

      {/* Speed dial skeleton */}
      {hasActions && <SpeedDialSkeleton />}

      {/* Hero image skeleton */}
      {features.hasHeroImage && <HeroImageSkeleton />}

      {/* Alert skeleton (usually shows status messages) */}
      <AlertSkeleton />

      {/* Name editor skeleton */}
      <NameEditorSkeleton hasAvatar={features.hasAvatar} />

      {/* Description section skeleton */}
      {features.hasDescription && (
        <Box sx={{ mb: 2 }}>
          <SectionHeaderSkeleton title="Description" />
          <EditableRichTextSkeleton />
        </Box>
      )}

      {/* Additional form fields skeleton */}
      {fieldCount > 0 && (
        <Box sx={{ mb: 2 }}>
          <SkeletonForm fields={fieldCount} showActions={false} />
        </Box>
      )}

      {/* Related sections skeleton */}
      {hasRelatedSections && (
        <Stack direction="column" spacing={2}>
          {features.sections.map((sectionName, index) => (
            <ManagerSkeleton key={`section-${index}`} title={sectionName} />
          ))}
        </Stack>
      )}
    </Box>
  );
};