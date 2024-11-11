import { BadRequestError } from "@cef-ebsi/problem-details-errors";
import {
  Body,
  Controller,
  Get,
  Header,
  Headers,
  HttpCode,
  Param,
  Post,
  Query,
  Res,
  Response,
} from "@nestjs/common";
import type { FastifyReply } from "fastify";
import { OAuth2TokenError } from "../../shared/errors/index.js";
import type { TokenResponse, OPMetadata, GetAuthorizeHolderWallerDto, GetAuthorizeGenericDto } from "../../shared/auth-server/index.js";
import type { JsonWebKeySet } from "../../shared/interfaces.js";
import { GetAuthorizeDto, GetRequestUriDto } from "../../shared/auth-server/index.js";
import { AuthService } from "./auth.service.js";


@Controller("/auth")
export class AuthController {
  constructor(private authService: AuthService, ) {}

  @HttpCode(200)
  @Get("/.well-known/openid-configuration")
  getOPMetadata(): OPMetadata {
    return this.authService.getOPMetadata();
  }

  @HttpCode(200)
  @Get("/jwks")
  @Header("Content-type", "application/jwk-set+json")
  async getJwks(): Promise<JsonWebKeySet> {
    return this.authService.getJwks();
  }

  @Get("/authorize")
  @Header("content-type", "text/plain; charset=utf-8")
  async getAuthorize(
    @Query() query: GetAuthorizeDto ,
    @Response({ passthrough: true }) res: FastifyReply
  ): Promise<void> {
   // console.log(`controler query->${JSON.stringify(query)}`);
    const location = await this.authService.authorize(query);
    console.log(`location->${location}`);
   // return location;
   if (!query.redirect_uri.includes('redirect')) //patch for issuer CT
    res.code(200).send(location);
    else
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    res.code(302).header("Location", location).send();
  }

  @Get("/request_uri/:requestId")
  @Header("Content-type", "application/jwt")
  async getRequestById(@Param() params: GetRequestUriDto): Promise<string> {
    return this.authService.getRequestById(params.requestId);
  }

  @Post("/direct_post")
  async directPost(
    @Headers("content-type") contentType: string | undefined,
    @Body() body: unknown, // Validate DTO within the service method so we can properly handle the error response
    @Response({ passthrough: true }) res: FastifyReply
  ): Promise<string> {  //correct this to string
    // Only accept application/x-www-form-urlencoded
    // https://openid.net/specs/openid-4-verifiable-presentations-1_0-15.html#name-response-mode-direct_post
    if (
      !contentType ||
      !contentType.toLowerCase().includes("application/x-www-form-urlencoded")
    ) {
      throw new BadRequestError(BadRequestError.defaultTitle, {
        detail: "Content-type must be application/x-www-form-urlencoded",
      });
    }

    const location = await this.authService.directPost(body);

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
   // res.code(302).header("Location", location).send();  //correct this
    // res.code(200).send(location);
    return location;
  }




  @HttpCode(200)
  @Post("/token")
  @Header("Cache-Control", "no-store")
  @Header("Pragma", "no-cache")
  async postToken(
    @Headers("content-type") contentType: string | undefined,
    @Body() body: unknown // Validate DTO within the service method so we can properly handle the error response
  ): Promise<TokenResponse> {
    // Only accept application/x-www-form-urlencoded
    // https://www.rfc-editor.org/rfc/rfc6749#section-4.1.3
    if (
      !contentType ||
      !contentType.toLowerCase().includes("application/x-www-form-urlencoded")
    ) {
      throw new OAuth2TokenError("invalid_request", {
        errorDescription:
          "Content-type must be application/x-www-form-urlencoded",
      });
    }

    return this.authService.token(body);
  }

  





}

export default AuthController;
