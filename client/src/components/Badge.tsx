// Badge component for displaying user achievements and social proof
import { 
  ShieldCheck, Crown, Star, Award, Trophy, Sparkles, 
  ThumbsUp, Medal, Calendar, CheckCircle, ChefHat 
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface BadgeData {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: 'achievement' | 'verification' | 'rating' | 'milestone';
}

interface UserBadgeProps {
  badge: BadgeData;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const iconMap: Record<string, any> = {
  'shield-check': ShieldCheck,
  'crown': Crown,
  'star': Star,
  'award': Award,
  'trophy': Trophy,
  'sparkles': Sparkles,
  'thumbs-up': ThumbsUp,
  'medal': Medal,
  'calendar': Calendar,
  'check-circle': CheckCircle,
  'chef-hat': ChefHat,
};

const colorMap: Record<string, string> = {
  blue: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
  purple: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30',
  gold: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30',
  orange: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30',
  yellow: 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30',
  green: 'text-green-600 bg-green-100 dark:bg-green-900/30',
  teal: 'text-teal-600 bg-teal-100 dark:bg-teal-900/30',
  indigo: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30',
};

const sizeMap = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
};

export function UserBadge({ badge, size = 'md', showLabel = false }: UserBadgeProps) {
  const IconComponent = iconMap[badge.icon] || Star;
  const colorClass = colorMap[badge.color] || colorMap.blue;
  const iconSize = sizeMap[size];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full",
            colorClass,
            "cursor-help transition-transform hover:scale-105"
          )}>
            <IconComponent className={iconSize} />
            {showLabel && (
              <span className="text-xs font-medium">{badge.name}</span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-center">
            <p className="font-semibold">{badge.name}</p>
            <p className="text-xs text-muted-foreground">{badge.description}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface BadgeListProps {
  badges: BadgeData[];
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
  maxDisplay?: number;
}

export function BadgeList({ badges, size = 'md', showLabels = false, maxDisplay }: BadgeListProps) {
  const displayBadges = maxDisplay ? badges.slice(0, maxDisplay) : badges;
  const remaining = maxDisplay && badges.length > maxDisplay ? badges.length - maxDisplay : 0;

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {displayBadges.map((badge) => (
        <UserBadge key={badge.id} badge={badge} size={size} showLabel={showLabels} />
      ))}
      {remaining > 0 && (
        <span className="text-xs text-muted-foreground">+{remaining} more</span>
      )}
    </div>
  );
}
