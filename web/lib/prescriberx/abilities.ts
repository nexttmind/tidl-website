/** Interpret PrescribeRx ability lists (wildcard `*` = all). */

export function orgTokenCanIssuePatientToken(abilities: string[]): boolean {
  return abilities.includes("*") || abilities.includes("patient:issue-token");
}

/** Pull ability strings from /auth/me without assuming a single envelope. */
export function extractAbilitiesFromMe(envelope: unknown): string[] {
  if (!envelope || typeof envelope !== "object") return [];
  const root = envelope as Record<string, unknown>;
  const data =
    root.data && typeof root.data === "object" && !Array.isArray(root.data)
      ? (root.data as Record<string, unknown>)
      : root;
  if (Array.isArray(data.abilities)) {
    return data.abilities.filter((a): a is string => typeof a === "string");
  }
  const user =
    data.user && typeof data.user === "object" && !Array.isArray(data.user)
      ? (data.user as Record<string, unknown>)
      : null;
  if (user && Array.isArray(user.abilities)) {
    return user.abilities.filter((a): a is string => typeof a === "string");
  }
  return [];
}
