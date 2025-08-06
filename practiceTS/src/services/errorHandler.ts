import { logger } from "../config/logger.js";

export function handleError(message: string, error: unknown, redirectUrl = './home'): void {
  alert(message);
  logger.error(message, error);
  navigateTo(redirectUrl);
}

export function navigateTo(page: string): void {
  window.location.href = page;
}
