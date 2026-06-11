export function useSecureCookies() {
  return process.env.SECURE_COOKIES === "true";
}
