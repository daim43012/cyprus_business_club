const JWT_COOKIE = "jwt";

export function hasJwtCookie(): boolean {
  if (typeof document === "undefined") return false;

  return document.cookie
    .split("; ")
    .some((c) => c.startsWith(`${JWT_COOKIE}=`));
}
