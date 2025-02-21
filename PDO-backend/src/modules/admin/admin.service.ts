import { Inject, Injectable, Logger } from "@nestjs/common";
import { Resolver } from "did-resolver";
import { getResolver, util } from "@cef-ebsi/ebsi-did-resolver";
import { ConfigService } from "@nestjs/config";
import axios from "axios";
import type { ApiConfig } from "../../config/configuration.js";
import { DataStoreService } from "../data-store/data-store.service.js";
import { formatZodError } from "../../shared/utils/index.js";



import type {
  CheckResult,
  IntentName,
  IssuerAttribute,
  NewPinResult,
} from "../../shared/interfaces.js";
import {
  accreditAuthoriseParamsSchema,
  didSchema,
  requestSchema,
} from "./validators/index.js";
import { TntService } from "../tnt/tnt.service.js";


// import { createHash, randomBytes } from "node:crypto";
// import type { UpdateListDto } from "./dto/index.js";

// import { HOLDER_WALLET_AUTHORIZATION_CODE_CREDENTIAL_TYPES } from "src/shared/constants.js";
// import { array } from "joi";
// import { Type } from "class-transformer";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import issueVCDto from "./dto/issuevc.dto.js";
import { IssuedVC, IssuedVCDocument } from "../../shared/models/issuedvcs.model.js";
import { Product, ProductDocument } from "../../shared/models/products.model.js";
import NewProductDto from "./dto/newproduct.dto.js";
import EventDetailsDto from "./dto/eventdetails.dto.js";
import { getVCdata, type SupportedVCType } from "../tnt/issuer.vcdata.js";





@Injectable()
export class AdminService {
  
  private readonly logger = new Logger(AdminService.name);
 // private db: Level<LevelDbKey, LevelDbObject>

  constructor(
    // private dataStoreService: DataStoreService,
    @Inject(TntService) private tntService: TntService,
  
    // @Inject(ConfigService)
    // private configService: ConfigService<ApiConfig, true>,
    @InjectModel(IssuedVC.name) private IssuedVCModel: Model<IssuedVCDocument>,
 //  @InjectModel(SharedVC.name) private SharedVCModel: Model<SharedVCDocument>,
   @InjectModel(Product.name) private ProductModel: Model<ProductDocument>,
    
  ) {}


  async walletCab(): Promise<Object> {

    const walletCababilities = await this.tntService.adminWalletCab();
    return walletCababilities;
   
 
   }

  async issue_vc(
    issuevcDto : issueVCDto
  ): Promise<CheckResult | NewPinResult> {

    const pin = Math.floor(100000 + Math.random() * 900000).toString();



    const existingpin = await this.IssuedVCModel.findOne({authpin:pin}).exec();
    if (existingpin) 
      return {
       success: false,
       errors:['pin already exists. try again']
      }


    //check if productName and event are pre-defined

    const product = await this.ProductModel.findOne({productName:issuevcDto.productName}).exec() as Product;
    if (!product) {
      return {
        success: false,
        errors:[`${issuevcDto.productName} is not valid`]
    }}

    if (!(product.requiredEvents.some(event => event==issuevcDto.allowedEvent))) {
      return {
        success: false,
        errors:[`${issuevcDto.allowedEvent} is not valid`]
    }
    }

    //issue vc

    const newvcreq = {
      
      actorDID: issuevcDto.actorDID,
      productName: issuevcDto.productName,
      legalName: issuevcDto.legalName,
      allowedEvent: issuevcDto.allowedEvent,
      lastInChain: issuevcDto.allowedEvent == product.lastInChainEvent ? true : false,
     

    } as IssuedVC

    const jwtvc = await this.tntService.adminIssuePreAuthVC(newvcreq);

    const now = new Date();
    const newvc = {
      authpin: pin,
      actorDID: issuevcDto.actorDID,
      productName: issuevcDto.productName,
      legalName: issuevcDto.legalName,
      allowedEvent: issuevcDto.allowedEvent,
      lastInChain: issuevcDto.allowedEvent == product.lastInChainEvent ? true : false,
      vcjwt: jwtvc,
      status: 'active',
      downloaded: false,
      issuedDate: new Date(now.getTime() - now.getTimezoneOffset()*60000)

    } as IssuedVC

    await new this.IssuedVCModel(newvc).save();


   
    return {
      pin,
    }

  }


  async getissuedvcs(page: number =1, limit: number =5, productName:string ='HALLOUMI', order?:string ): Promise<object> {

    let result: {metadata: object,data: object[]} = {metadata:{},data:[]}

    // const deferredvcs = await this.IssuedVCModel.find({
    //   issued:false,
    //   deferred:true
    // });

    const ordertype = (order && order.includes('oldest')) ? 1 : -1;
    //console.log('order->'+order +' '+ordertype);
  
    const pagevcs = await this.IssuedVCModel.aggregate([
      {
        $match: {
         // issued:true,
          // deferred:true,
          // acceptancetoken: {$exists: true},
          actorDID: {$exists: true},
          productName: productName
          // ...(searchtext && {userid: searchtext}),
        },
        
      },
      {
        $sort: {issuedDate: ordertype}
      },
      {
        $facet: {
          metaData: [
            {
              $count: "total",
            },
            {
              $addFields: {
                pageNumber: page,
                totalPages: {$ceil: {$divide: ["$total",limit]}},
              } 
            }
          ],
          data: [
            {
              $skip: (page-1)*limit,
            },
            {
              $limit: limit,
            }

          ]
        }
      }
      
    ])

    result.metadata = pagevcs[0].metaData[0];

    if (pagevcs && pagevcs[0] && pagevcs[0].data.length > 0)

     {
      pagevcs[0].data.map((element: IssuedVC)=> {
       
          result.data.push({
                      issued_id: element._id,
                    //  reqDate: element.reqDate,
                     // deferred: element.deferred,
                     
                      legalName: element.legalName,
                      allowedEvent: element.allowedEvent,
                      issuedDate: element.issuedDate,
                      downloaded:element.downloaded,
                      // acceptanceToken: element.acceptancetoken,
                      // walletdid: element.walletdid,
                  
                      
                    });
        
      });
    }
    return result;
    
  }

  
  async issuedvc(issued_id:string): Promise<object> {

    try {

    
    const result = await this.IssuedVCModel.findById(issued_id).exec() as IssuedVC;
  
    if (result && result.vcjwt) {
      const {status} = await this.tntService.verifyVC(result.vcjwt);
      const vctype = this.tntService.SupportedVC as SupportedVCType;
      const vcdata = getVCdata(result.vcjwt,vctype,result.actorDID);


      return {
       
        status,
        downloaded: result.downloaded,
        vcdata : vcdata,
       
      }

    }
    else return {error: 'not found'}
    
    
    } catch (e) {
      console.log('findbyid exec->'+e);
      return {error: `${e}`}
    }

  }


  async newProduct(
    //authorizationHeader: string,
    newProductBody: NewProductDto
  ): Promise<CheckResult> {

    const {productName, requiredEvents, lastInChainEvent} = newProductBody;

    if (! requiredEvents.some(e => e == lastInChainEvent)) {
      return {
        success:false,
        errors: ['last in chain event must be one of required events']
      }
    }

  try {
    await new this.ProductModel({productName,requiredEvents,lastInChainEvent}).save();
  } catch (e) {
    return {
      success:false,
      errors: [`${e}`]
    }
  } 

    return {success:true}

  }

  async eventDetails(
    //authorizationHeader: string,
    eventsDetailsBody: EventDetailsDto
  ): Promise<CheckResult> {

    const {productName, eventsDetails, } = eventsDetailsBody;

   const product = await this.ProductModel.findOne({productName}).exec();
   if (!product) {
    return {
      success:false,
      errors: ['product not found']
    }
   }

   const {requiredEvents} = product;
   const invalidEvents: string[]=[];
   eventsDetails.map(eventEntry=> {
    if (!requiredEvents.some(event => event== eventEntry.type)) {
      invalidEvents.push(eventEntry.type);
    }
   })

   if (invalidEvents.length > 0) {
    return {
      success:false,
      errors: [`following event types are invalid: ${invalidEvents}`]
    }
   }

  try {
    await this.ProductModel.findByIdAndUpdate(product._id,{eventsDetails}).exec();
  } catch (e) {
    return {
      success:false,
      errors: [`${e}`]
    }
  } 

    return {success:true}

  }

  

  async actors(productName:string, page: number =1, limit: number =5, ): Promise<object> {

    type MetaData ={total:number;pageNumber:number; totalPages:number};
    type resElement = {issuedDate: Date;actorDID:string;legalName:string;allowedEvent:string;lastInChain:boolean;status:string }
    let result: {metadata: MetaData,data: resElement[]} = {metadata:{total:0,pageNumber:0,totalPages:0},data:[]}
  
    const pagevcs = await this.IssuedVCModel.aggregate([
      {
        $match: {
          productName: productName,
          //issued:true,
          // deferred:true,
          // acceptancetoken: {$exists: true},
          downloaded: true
       
        },
        
      },
      {
        $sort: {issuedDate: -1}
      },
      {
        $facet: {
          metaData: [
            {
              $count: "total",
            },
            {
              $addFields: {
                pageNumber: page,
                totalPages: {$ceil: {$divide: ["$total",limit]}},
              } 
            }
          ],
          data: [
            {
              $skip: (page-1)*limit,
            },
            {
              $limit: limit,
            }

          ]
        }
      }
      
    ])

    result.metadata = pagevcs[0].metaData[0];

    if (pagevcs && pagevcs[0] && pagevcs[0].data.length > 0)

     {
      pagevcs[0].data.map((element: IssuedVC)=> {
       
          if ((result.data.some(e =>e.actorDID== element.actorDID) && 
               result.data.some(e=>e.allowedEvent==element.allowedEvent))) {
                result.metadata.total =  result.metadata.total -1;
               } else {
          result.data.push({
                   //   shared_id: element._id,
                      issuedDate: element.issuedDate,
                      actorDID: element.actorDID,
                      legalName: element.legalName,
                      allowedEvent: element.allowedEvent,
                      lastInChain: element.lastInChain,
                      status: element.status,
                    })
                  };
        
      });
    }
    return result;
    
  }
  



}
export default AdminService;
