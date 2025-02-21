import {
  Body,
  Controller,
  Delete,
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
import { OAuth2Error } from "../../shared/errors/index.js";
import { TntService } from "./tnt.service.js";
import type {
 
  CheckResult,
  CredentialIssuerMetadata,
  JsonWebKeySet,
  KnownIssuersMetadata,
} from "../../shared/interfaces.js";

import type { CredentialOfferPayload, CredentialResponse, DeferredCredentialResponse, VerifyResponse } from "./tnt.interface.js";

import { verifyVCDto } from "./dto/verify-vc.dto.js";
import { BadRequestError, ProblemDetailsError } from "@cef-ebsi/problem-details-errors";
import { deleteForDto } from "./dto/deletefor.dto.js";
import getLicenseDto from "./dto/getlicense.dto.js";
import availActorsDto from "./dto/availactors.dto.js";
import NewBatchDto from "./dto/newbatch.dto.js";
import UpdateBatchDto from "./dto/updatebatch.dto.js";
import { ProductsDto } from "../admin/dto/paginate.dto.js";
import TnTqueryDto from "./dto/tntquery.dto.js";
import TnTdocumentDto, { TnTEventsDto } from "./dto/tntdocument.dto.js";
import GetImageDto from "./dto/getimage.dto.js";
import fs from 'fs'
import path from "path";

@Controller("/tnt")
export class TnTController {
  constructor(private tntService: TntService) {}

  
  @HttpCode(200)
  @Get("/jwks")
  @Header("Content-type", "application/jwk-set+json")
  async getJwks(): Promise<JsonWebKeySet> {
    return this.tntService.getJwks();
  }


  
  @HttpCode(200)
  @Get("/.well-known/openid-credential-issuer")
  getCredentialIssuerMetadata(): CredentialIssuerMetadata {
    return this.tntService.getCredentialIssuerMetadata();
  }

  @Get("/getProfile")
  @HttpCode(201)
  getProfile(): object {
    return this.tntService.getProfile();
  }

  @Get("/active_actors")
  @HttpCode(201)
  async actors(
   
    @Query() params:availActorsDto
    ): Promise<object> {
    const {productName} = params;
    console.log('params->'+JSON.stringify(params));
 

    return await this.tntService.active_actors(productName);
  }

  @Get('/get_license_vc')
  @HttpCode(200)
  @Header("content-type", "text/plain; charset=utf-8")
  // @Redirect('https://docs.nestjs.com', 302) redirect for web wallet only?
   async get_license_vc(
     @Query() getlicensedto: getLicenseDto, // @Res() res: Response
   
     
   ): Promise<string> {
     //const resp = new URLSearchParams(await this.clientService.startflow(startflowdto));
     const queryurl = await this.tntService.get_license_vc(getlicensedto);
    
     return queryurl 
   }

   
  @HttpCode(200)
  @Post("/credential")
  postCredential(
    @Headers("content-type") contentType: string | undefined,
    @Headers("authorization") authorizationHeader: string,
    @Body() body: unknown
  ): Promise<CredentialResponse | DeferredCredentialResponse> {
    // Only accept application/json
    // https://openid.net/specs/openid-4-verifiable-credential-issuance-1_0-11.html#section-7.2
    if (
      !contentType ||
       !contentType.toLowerCase().includes("application/json")) {
      throw new OAuth2Error("invalid_request", {
        errorDescription: "Content-type must be application/json",
      });
    }

    return this.tntService.postCredential(authorizationHeader, body);
  }

  @Get("/products")
  @HttpCode(200)
  async products(
    //@Req() req: Request,
    @Query() params:ProductsDto
    ): Promise<object> {
    const {productName} = params;
    console.log('params->'+JSON.stringify(params));


    return await this.tntService.products(productName);
  }

  //returns only pending batches. for all or specific actor
  @Get("/pendingBatches")
  @HttpCode(200)
  async pendingBatches(
    //@Req() req: Request,
    @Query() params:TnTqueryDto
    ): Promise<object> {
  
    console.log('params->'+JSON.stringify(params));


    return await this.tntService.pendingBatches(params);
  }

  //returns only completed batches. for all or specific lastinchain actor
  @Get("/completedBatches")
  @HttpCode(200)
  async completedBatches(
    //@Req() req: Request,
    @Query() params:TnTqueryDto
    ): Promise<object> {
  
    console.log('params->'+JSON.stringify(params));


    return await this.tntService.completedBatches(params);
  }

   //returns completed events for specific actor, in pending or completed batches 
   @Get("/completedTasks")
   @HttpCode(200)
   async completedTasks(
     //@Req() req: Request,
     @Query() params:TnTqueryDto
     ): Promise<object> {
   
     console.log('params->'+JSON.stringify(params));
 
     if (!params.actordid || !params.allowedEvent) {
      throw new OAuth2Error("invalid_request", {
        errorDescription: "both actordid and allowedEvent are needed",
      });
     }
 
     return await this.tntService.completedTasks(params);
   }

   @Get("/document")
   @HttpCode(200)
   async document(
     @Response({ passthrough: true }) res:FastifyReply,
     @Query() params:TnTdocumentDto
     ): Promise<object|string> {
   
     console.log('params->'+JSON.stringify(params));
 
     
     const result= await this.tntService.document(params);
     if (params.fromCustomer =='true' && typeof result=='string') {
        res.header('Content-Type','text/html');
        
        res.code(200).send(result);
        
     } 

     return result
   }

   @Get("/events")
   @HttpCode(200)
   async events(
     @Response({ passthrough: true }) res:FastifyReply,
     @Query() params:TnTEventsDto
     ): Promise<object> {
   
     console.log('params->'+JSON.stringify(params));
 
     
     const result= await this.tntService.events(params);
     
     return result
   }


  @HttpCode(201)
  @Post("/init_new_batch")
  async init_new_batch(
    @Headers("content-type") contentType: string | undefined,
  //  @Headers("authorization") authorizationHeader: string,
    @Body() body: NewBatchDto
  ): Promise<CheckResult> {
    // Only accept application/json
    // https://openid.net/specs/openid-4-verifiable-credential-issuance-1_0-11.html#section-7.2
    if (!contentType ||
      !contentType.toLowerCase().includes("application/json")) {
      throw new OAuth2Error("invalid_request", {
        errorDescription: "Content-type must be application/json",
      });
    }

    return await this.tntService.init_new_batch( body);
  }

  @HttpCode(201)
  @Post("/update_batch")
  async update_batch(
    @Headers("content-type") contentType: string | undefined,
  //  @Headers("authorization") authorizationHeader: string,
    @Body() body: UpdateBatchDto
  ): Promise<CheckResult> {
    // Only accept application/json
    // https://openid.net/specs/openid-4-verifiable-credential-issuance-1_0-11.html#section-7.2
    if (!contentType ||
      !contentType.toLowerCase().includes("application/json")) {
      throw new OAuth2Error("invalid_request", {
        errorDescription: "Content-type must be application/json",
      });
    }

    return await this.tntService.update_batch( body);
  }

   
   @HttpCode(200)
   @Post("/verifyVC")
   @Header("Cache-Control", "no-store")
   @Header("Pragma", "no-cache")
   async verifyVC(
     @Headers("content-type") contentType: string,
     @Body() body: verifyVCDto // Validate DTO within the service method so we can properly handle the error response
   ): Promise<VerifyResponse> {
    
     if (!contentType.toLowerCase().includes("application/json")) {
      throw new OAuth2Error("invalid_request", {
        errorDescription: "Content-type must be application/json",
      });
     }
 
     return await this.tntService.verifyVC(body.jwtvc);
   }
 

   @Get("/image/:name")
   @HttpCode(201)
   async getImage(
    @Response({ passthrough: true }) res:FastifyReply,
     @Param() params: GetImageDto
   ) {
    res.header('Content-Type','application/octet-stream');
        
   // const data = fs.readFileSync(`D:\\trace4EU\\pdo-backend\\src\\public\\${params.name}`)
    const data = fs.readFileSync(path.resolve( process.cwd(), `./src/public/${params.name}`))
    console.log('data to send->'+data.length);
    res.status(200).send(data);
   }

 
}

export default TnTController;
