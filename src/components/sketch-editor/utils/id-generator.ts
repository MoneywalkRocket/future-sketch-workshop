let counter = 0;

export function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  counter++;
  return `obj_${Date.now()}_${counter}`;
}
