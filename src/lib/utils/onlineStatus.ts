import { timeAgo } from "./timeAgo";

export function onlineStatus(date?: string | Date | null): string {
  if (!date) return "неизвестно";

  const past = new Date(date);
  const now = new Date();
  const diffSec = (now.getTime() - past.getTime()) / 1000;

  if (diffSec < 25) {
    return "Онлайн";
  }

  return "Был(а) онлайн: " + timeAgo(date);
}
