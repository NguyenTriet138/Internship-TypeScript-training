import { LoggerService } from "../services/loggerService";

export const logger = new LoggerService(
  process.env.NODE_ENV === "development" ? "debug" : "error"
);
