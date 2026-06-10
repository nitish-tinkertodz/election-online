export function getRequestClientIp(requestHeaders?: Headers) {
  if (!requestHeaders) {
    return "unknown";
  }

  const forwardedFor = requestHeaders.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return (
    requestHeaders.get("cf-connecting-ip") ??
    requestHeaders.get("x-real-ip") ??
    "unknown"
  );
}

export function getRequestHostName(requestHeaders?: Headers) {
  const hostHeader = requestHeaders?.get("host") ?? "";
  const normalized = hostHeader.trim().toLowerCase();

  if (!normalized) {
    return "";
  }

  if (normalized.startsWith("[")) {
    const closingBracketIndex = normalized.indexOf("]");
    return closingBracketIndex === -1
      ? normalized
      : normalized.slice(1, closingBracketIndex);
  }

  return normalized.split(":")[0]?.trim().toLowerCase() ?? "";
}

export function isAdminHostRequest(requestHeaders?: Headers) {
  const hostName = getRequestHostName(requestHeaders);

  if (!hostName) {
    return false;
  }

  return hostName === "localhost" || hostName === "127.0.0.1" || hostName === "::1";
}
