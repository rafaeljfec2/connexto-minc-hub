import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold text-dark-50 mb-2">{title}</h1>
        {description && <p className="text-dark-400">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
