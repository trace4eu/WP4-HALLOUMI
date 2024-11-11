import { format, transports } from "winston";
import {
  utilities as winstonUtilities,
  WinstonLogger,
  WinstonModule,
} from "nest-winston";

export const consoleTransport = new transports.Console({
  format: format.combine(
    format.timestamp(),
    winstonUtilities.format.nestLike("Server API v3")
  ),
  handleExceptions: true,
});

export const loggerOptions = {
  transports: [consoleTransport],
};

export const createLogger = (): WinstonLogger => {
  return WinstonModule.createLogger(loggerOptions) as WinstonLogger;
};
