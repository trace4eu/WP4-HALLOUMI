import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  Logger,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import {
  ProblemDetailsError,
  InternalServerError,
  NotFoundError,
  BadRequestError,
} from "@cef-ebsi/problem-details-errors";
import type { FastifyReply } from "fastify";
import axios from "axios";
import { ValidationError } from "@cef-ebsi/verifiable-credential";
import { OAuth2Error } from "../shared/errors/index.js";

function getProblemDetailsError(error: unknown): ProblemDetailsError {
  if (error instanceof ProblemDetailsError) {
    return error;
  }

  if (error instanceof NotFoundException) {
    return new NotFoundError(NotFoundError.defaultTitle, {
      detail: error.message,
    });
  }

  if (error instanceof BadRequestException) {
    let detail = error.message;
    const resp = error.getResponse();

    if (typeof resp === "object") {
      const { message } = resp as { message: string };
      if (message) {
        if (typeof message === "string") detail = message;
        else detail = JSON.stringify(message);
      }
    }

    return new BadRequestError(BadRequestError.defaultTitle, {
      detail,
    });
  }

  return new InternalServerError(undefined, {
    detail:
      "The server encountered an internal error and was unable to complete your request",
  });
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(err: Error, host: ArgumentsHost): FastifyReply {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();

    // Case 1: axios-specific error
    if (axios.isAxiosError(err)) {
      // Properly log error, https://github.com/axios/axios#handling-errors
      this.logger.error("Axios error intercepted.", err.stack);
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        this.logger.error({
          data: err.response.data as unknown,
          status: err.response.status,
          headers: err.response.headers,
        });
      } else if (err.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        this.logger.error({
          request: err.request as unknown,
        });
      } else {
        // Something happened in setting up the request that triggered an Error
        this.logger.error({
          message: err.message,
        });
      }

      this.logger.error(err.toJSON());
    } else if (err instanceof ValidationError) {
      this.logger.error(err.toJSON(), err.stack);
    } else {
      this.logger.error(err.message, err.stack);
    }

    // Case 2: service-specific error
    if (err instanceof OAuth2Error) {
      return response
        .code(err.statusCode)
        .type("application/json")
        .send(err.toJSON());
    }

    // Case 3: generic error
    const problemError = getProblemDetailsError(err);

    this.logger.debug(
      `${problemError.toString()}: ${problemError.detail || "No detail"}`
    );

    return response
      .code(problemError.status)
      .type("application/problem+json")
      .send(problemError.toJSON());
  }
}

export default AllExceptionsFilter;
