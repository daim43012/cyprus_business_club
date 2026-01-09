export function timeAgo(date: string | Date): string {
  if (!date) return "неизвестно";

  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();

  if (diffMs < 0) return "в будущем 🤔";

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);

  if (seconds < 60) return "только что";
  if (minutes < 60)
    return pluralize(minutes, "минуту", "минуты", "минут") + " назад";
  if (hours < 24) return pluralize(hours, "час", "часа", "часов") + " назад";
  if (days < 7) return pluralize(days, "день", "дня", "дней") + " назад";
  if (weeks < 5)
    return pluralize(weeks, "неделю", "недели", "недель") + " назад";

  return past.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function pluralize(
  value: number,
  one: string,
  few: string,
  many: string
): string {
  const mod10 = value % 10;
  const mod100 = value % 100;

  if (mod10 === 1 && mod100 !== 11) return `${value} ${one}`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20))
    return `${value} ${few}`;
  return `${value} ${many}`;
}
