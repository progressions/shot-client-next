export interface OnboardingMilestone {
  key: string;
  title: string;
  description: string;
  targetPages: string[];
  targetElement: string;
  timestampField: keyof OnboardingProgress;
  suggestedName?: string;
}

export interface OnboardingProgress {
  id: string;
  first_campaign_created_at?: string;
  first_campaign_activated_at?: string;
  first_character_created_at?: string;
  first_fight_created_at?: string;
  first_faction_created_at?: string;
  first_party_created_at?: string;
  first_site_created_at?: string;
  congratulations_dismissed_at?: string;
  all_milestones_complete: boolean;
  onboarding_complete: boolean;
  ready_for_congratulations: boolean;
  next_milestone?: OnboardingMilestone;
}

export const ONBOARDING_MILESTONES: OnboardingMilestone[] = [
  {
    key: 'campaign',
    title: '🎯 Ready to start your first campaign?',
    description: 'Campaigns organize your RPG sessions and characters.',
    targetPages: ['/campaigns'],
    targetElement: 'speed-dial-create',
    timestampField: 'first_campaign_created_at'
  },
  {
    key: 'activate-campaign',
    title: '✨ Activate your Campaign!',
    description: 'Set your campaign as active to start building characters and adventures.',
    targetPages: ['/campaigns'],
    targetElement: 'campaign-activate-button',
    timestampField: 'first_campaign_activated_at'
  },
  {
    key: 'character',
    title: '👤 Create your first character!',
    description: 'Characters are the heroes and villains of your story.',
    targetPages: ['/characters', '/campaigns/[id]/characters'],
    targetElement: 'speed-dial-create',
    timestampField: 'first_character_created_at'
  },
  {
    key: 'faction',
    title: '🏴 Create "The Dragons" faction!',
    description: 'Factions group characters by allegiance. Start with the heroes.',
    targetPages: ['/factions'],
    targetElement: 'speed-dial-create',
    timestampField: 'first_faction_created_at',
    suggestedName: 'The Dragons'
  },
  {
    key: 'fight',
    title: '⚔️ Start your first fight!',
    description: 'Fights manage combat initiative and character actions.',
    targetPages: ['/fights'],
    targetElement: 'speed-dial-create',
    timestampField: 'first_fight_created_at'
  },
  {
    key: 'party',
    title: '👥 Organize a party!',
    description: 'Parties group characters for adventures and missions.',
    targetPages: ['/parties'],
    targetElement: 'speed-dial-create',
    timestampField: 'first_party_created_at'
  },
  {
    key: 'site',
    title: '🏛️ Create your first location!',
    description: 'Sites are the places where your adventures unfold.',
    targetPages: ['/sites'],
    targetElement: 'speed-dial-create',
    timestampField: 'first_site_created_at'
  }
];

/**
 * Get the current milestone based on onboarding progress
 */
export function getCurrentMilestone(progress: OnboardingProgress): OnboardingMilestone | null {
  if (progress.onboarding_complete) {
    return null;
  }

  // If no campaign created yet, always show campaign milestone
  if (!progress.first_campaign_created_at) {
    return ONBOARDING_MILESTONES[0];
  }

  // If campaign created but not activated, show activation milestone
  if (progress.first_campaign_created_at && !progress.first_campaign_activated_at) {
    return ONBOARDING_MILESTONES[1]; // activate-campaign milestone
  }

  // Find the next uncompleted milestone
  return ONBOARDING_MILESTONES.find(milestone => {
    const timestampField = milestone.timestampField;
    return !progress[timestampField];
  }) || null;
}

/**
 * Get milestones relevant to the current page
 */
export function getMilestonesForPage(currentPath: string): OnboardingMilestone[] {
  return ONBOARDING_MILESTONES.filter(milestone =>
    milestone.targetPages.some(page => 
      page === currentPath || currentPath.match(new RegExp(page.replace(/\[.*?\]/g, '[^/]+')))
    )
  );
}

/**
 * Check if the current page is relevant for the given milestone
 */
export function isRelevantPage(milestone: OnboardingMilestone, currentPath: string): boolean {
  return milestone.targetPages.some(page => 
    page === currentPath || currentPath.match(new RegExp(page.replace(/\[.*?\]/g, '[^/]+')))
  );
}

/**
 * Get completed milestones count
 */
export function getCompletedCount(progress: OnboardingProgress): number {
  return ONBOARDING_MILESTONES.filter(milestone => 
    progress[milestone.timestampField]
  ).length;
}

/**
 * Get completion percentage
 */
export function getCompletionPercentage(progress: OnboardingProgress): number {
  return Math.round((getCompletedCount(progress) / ONBOARDING_MILESTONES.length) * 100);
}