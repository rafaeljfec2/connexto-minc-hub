import { BrandText } from "@/components/ui/BrandText";

export function SidebarBranding() {
  return (
    <div className="flex items-center justify-center p-6 border-b border-dark-200 dark:border-dark-800">
      <BrandText size="sm" />
    </div>
  );
}
