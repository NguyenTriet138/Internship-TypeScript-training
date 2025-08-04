export type LogLevel = "debug" | "info" | "warn" | "error" | "silent";

export class LoggerService {
  private currentLevel: LogLevel;

  constructor(level: LogLevel = "info") {
    this.currentLevel = level;
  }

  private shouldLog(level: LogLevel): boolean {
    const order = ["debug", "info", "warn", "error", "silent"];
    return order.indexOf(level) >= order.indexOf(this.currentLevel);
  }

  public debug(...args: unknown[]) {
    if (this.shouldLog("debug")) console.debug(...args);
  }

  public info(...args: unknown[]) {
    if (this.shouldLog("info")) console.info(...args);
  }

  public warn(...args: unknown[]) {
    if (this.shouldLog("warn")) console.warn(...args);
  }

  public error(...args: unknown[]) {
    if (this.shouldLog("error")) console.error(...args);
  }
}
