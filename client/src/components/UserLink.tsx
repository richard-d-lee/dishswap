// Reusable component for linking to user profiles
import { Link } from "wouter";
import { cn } from "@/lib/utils";

interface UserLinkProps {
  userId: number;
  name: string | null;
  className?: string;
  showAvatar?: boolean;
}

export function UserLink({ userId, name, className, showAvatar = false }: UserLinkProps) {
  return (
    <Link
      href={`/user/${userId}`}
      className={cn(
        "text-primary hover:underline font-medium transition-colors",
        className
      )}
    >
      {name || "Unknown User"}
    </Link>
  );
}
