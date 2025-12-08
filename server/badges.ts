// Badge system for user achievements and social proof

export interface UserBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: 'achievement' | 'verification' | 'rating' | 'milestone';
}

export interface UserStatistics {
  totalHostSessions: number;
  totalDishwasherSessions: number;
  completedHostSessions: number;
  completedDishwasherSessions: number;
  averageRating: number;
  totalRatings: number;
  isEmailVerified?: boolean;
  accountAge?: number; // in days
}

export function calculateUserBadges(stats: UserStatistics): UserBadge[] {
  const badges: UserBadge[] = [];

  // Verification badges
  if (stats.isEmailVerified) {
    badges.push({
      id: 'verified',
      name: 'Verified',
      description: 'Email verified account',
      icon: 'shield-check',
      color: 'blue',
      category: 'verification',
    });
  }

  // Host achievement badges
  if (stats.completedHostSessions >= 100) {
    badges.push({
      id: 'legendary-host',
      name: 'Legendary Host',
      description: '100+ meals hosted',
      icon: 'crown',
      color: 'purple',
      category: 'achievement',
    });
  } else if (stats.completedHostSessions >= 50) {
    badges.push({
      id: 'super-host',
      name: 'Super Host',
      description: '50+ meals hosted',
      icon: 'star',
      color: 'gold',
      category: 'achievement',
    });
  } else if (stats.completedHostSessions >= 10) {
    badges.push({
      id: 'top-host',
      name: 'Top Host',
      description: '10+ meals hosted',
      icon: 'chef-hat',
      color: 'orange',
      category: 'achievement',
    });
  }

  // Dishwasher achievement badges
  if (stats.completedDishwasherSessions >= 100) {
    badges.push({
      id: 'master-dishwasher',
      name: 'Master Dishwasher',
      description: '100+ sessions completed',
      icon: 'trophy',
      color: 'purple',
      category: 'achievement',
    });
  } else if (stats.completedDishwasherSessions >= 50) {
    badges.push({
      id: 'expert-dishwasher',
      name: 'Expert Dishwasher',
      description: '50+ sessions completed',
      icon: 'award',
      color: 'gold',
      category: 'achievement',
    });
  } else if (stats.completedDishwasherSessions >= 10) {
    badges.push({
      id: 'pro-dishwasher',
      name: 'Pro Dishwasher',
      description: '10+ sessions completed',
      icon: 'sparkles',
      color: 'blue',
      category: 'achievement',
    });
  }

  // Rating badges (require at least 5 ratings for credibility)
  if (stats.totalRatings >= 5) {
    if (stats.averageRating >= 4.8) {
      badges.push({
        id: '5-star',
        name: '5-Star Member',
        description: '4.8+ average rating',
        icon: 'star',
        color: 'yellow',
        category: 'rating',
      });
    } else if (stats.averageRating >= 4.5) {
      badges.push({
        id: 'highly-rated',
        name: 'Highly Rated',
        description: '4.5+ average rating',
        icon: 'thumbs-up',
        color: 'green',
        category: 'rating',
      });
    }
  }

  // Milestone badges
  const totalSessions = stats.completedHostSessions + stats.completedDishwasherSessions;
  if (totalSessions >= 100) {
    badges.push({
      id: 'century-club',
      name: 'Century Club',
      description: '100+ total sessions',
      icon: 'medal',
      color: 'gold',
      category: 'milestone',
    });
  }

  // Early adopter badge (account older than 6 months)
  if (stats.accountAge && stats.accountAge >= 180) {
    badges.push({
      id: 'early-adopter',
      name: 'Early Adopter',
      description: 'Member for 6+ months',
      icon: 'calendar',
      color: 'indigo',
      category: 'milestone',
    });
  }

  // Consistent performer (at least 1 session per month on average)
  if (stats.accountAge && stats.accountAge >= 30) {
    const monthlyRate = totalSessions / (stats.accountAge / 30);
    if (monthlyRate >= 1) {
      badges.push({
        id: 'consistent',
        name: 'Consistent',
        description: 'Active member',
        icon: 'check-circle',
        color: 'teal',
        category: 'milestone',
      });
    }
  }

  return badges;
}
