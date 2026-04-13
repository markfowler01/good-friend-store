import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "teal" | "blue" | "red" | "gray" | "green";
  className?: string;
}

export default function Badge({ children, variant = "teal", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        {
          "bg-bca-teal/10 text-bca-teal": variant === "teal",
          "bg-bca-blue/10 text-bca-blue": variant === "blue",
          "bg-red-100 text-bca-red": variant === "red",
          "bg-gray-100 text-gray-600": variant === "gray",
          "bg-green-100 text-green-700": variant === "green",
        },
        className
      )}
    >
      {children}
    </span>
  );
}
