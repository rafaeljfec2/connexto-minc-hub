export function SidebarBranding() {
  return (
    <div className="flex items-center justify-center p-6 border-b border-dark-200 dark:border-dark-800">
      <img
        src="/minc-teams-logo.png"
        alt="MINC Teams"
        className="h-16 w-auto object-contain"
        onError={(e) => {
          // Fallback para a logo antiga se a nova não existir
          const target = e.target as HTMLImageElement;
          target.src = "/Logo-minc.png";
          target.className = "h-12 w-auto object-contain brightness-0 dark:brightness-100";
        }}
      />
    </div>
  );
}
