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
        "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
        isActive
          ? "bg-primary-600 text-white"
          : "text-dark-300 hover:bg-dark-800 hover:text-dark-50"
      )}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}
