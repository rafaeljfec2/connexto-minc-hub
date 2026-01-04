import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface SidebarNavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick?: () => void;
}

export function SidebarNavItem({
  href,
  icon,
  label,
  isActive,
  onClick,
}: SidebarNavItemProps) {
  return (
    <Link
      to={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ease-out",
        "transform hover:scale-105 active:scale-95",
        isActive
          ? "bg-primary-600 text-white shadow-lg shadow-primary-500/30"
          : "text-dark-600 hover:bg-dark-100 hover:text-dark-900 dark:text-dark-300 dark:hover:bg-dark-800 dark:hover:text-dark-50"
      )}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}
