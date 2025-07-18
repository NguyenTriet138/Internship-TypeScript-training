export function generateId(prefix: string = 'id'): string {
  return `${prefix}-${Math.random().toString(36).substring(2, 9)}`;
}
