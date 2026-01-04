import { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TableProps extends HTMLAttributes<HTMLTableElement> {
  children: ReactNode;
}

export function Table({ className, children, ...props }: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table className={cn("w-full border-collapse", className)} {...props}>
        {children}
      </table>
    </div>
  );
}

interface TableHeaderProps extends HTMLAttributes<HTMLTableSectionElement> {
  children: ReactNode;
}

export function TableHeader({
  className,
  children,
  ...props
}: TableHeaderProps) {
  return (
    <thead className={cn("bg-dark-800/50", className)} {...props}>
      {children}
    </thead>
  );
}

interface TableBodyProps extends HTMLAttributes<HTMLTableSectionElement> {
  children: ReactNode;
}

export function TableBody({ className, children, ...props }: TableBodyProps) {
  return (
    <tbody className={cn("divide-y divide-dark-800", className)} {...props}>
      {children}
    </tbody>
  );
}

interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  children: ReactNode;
}

export function TableRow({ className, children, ...props }: TableRowProps) {
  return (
    <tr
      className={cn("hover:bg-dark-800/30 transition-colors", className)}
      {...props}
    >
      {children}
    </tr>
  );
}

interface TableHeadProps extends HTMLAttributes<HTMLTableCellElement> {
  children: ReactNode;
}

export function TableHead({ className, children, ...props }: TableHeadProps) {
  return (
    <th
      className={cn(
        "px-4 py-3 text-left text-xs font-semibold text-dark-300 uppercase tracking-wider",
        className
      )}
      {...props}
    >
      {children}
    </th>
  );
}

interface TableCellProps extends HTMLAttributes<HTMLTableCellElement> {
  children: ReactNode;
}

export function TableCell({ className, children, ...props }: TableCellProps) {
  return (
    <td className={cn("px-4 py-3 text-sm text-dark-200", className)} {...props}>
      {children}
    </td>
  );
}
