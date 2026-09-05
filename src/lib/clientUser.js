export function getStoredUserId(preferLegacyKey = false) {
  const primaryKey = preferLegacyKey ? "vyaparMitraUserId" : "userId";
  const secondaryKey = preferLegacyKey ? "userId" : "vyaparMitraUserId";

  return localStorage.getItem(primaryKey) || localStorage.getItem(secondaryKey);
}