import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function timeAgo(date: Date | string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(date).getTime()) / 1000
  );
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
}

export function getGradeLabel(grade: string): string {
  return grade === "K" ? "Kindergarten" : `Grade ${grade}`;
}

export function getCurrentQuarter(): string {
  const now = new Date();
  const quarter = Math.ceil((now.getMonth() + 1) / 3);
  return `Q${quarter}-${now.getFullYear()}`;
}

export function getQuarterDateRange(quarter: string): { start: Date; end: Date } {
  const [q, year] = quarter.split("-");
  const quarterNum = parseInt(q.replace("Q", ""));
  const yearNum = parseInt(year);
  const startMonth = (quarterNum - 1) * 3;
  return {
    start: new Date(yearNum, startMonth, 1),
    end: new Date(yearNum, startMonth + 3, 0, 23, 59, 59),
  };
}
