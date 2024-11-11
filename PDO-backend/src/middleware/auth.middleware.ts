import { BadRequestException, HttpException, Inject, Injectable, NestMiddleware, UnauthorizedException } from "@nestjs/common";
import type { NextFunction, Request, Response } from "express";
import  jwt from "jsonwebtoken";
import type { UserModule } from "../modules/users/user.module.js";
import { UserService } from "../modules/users/user.service.js";
//import type { FastifyRequest, FastifyReply } from 'fastify';


@Injectable()

export class AuthMiddleware implements NestMiddleware, UserModule {

    constructor(@Inject(UserService) private readonly userservice: UserService) {}

    async use(req: Request | any, res: Response, next: NextFunction) {
   // use(req: FastifyRequest['raw'], res: FastifyReply['raw'], next: () => void) {
        try {
            const token = req.headers["authorization"] && req.headers["authorization"].split(" ")[1];
            
            if (!token)
                   throw new UnauthorizedException('bearer token needed');

            const decoded_token: any = jwt.verify(token, `${process.env["JWT_SECRET_PASSWORD"]}`)

            console.log('error->here');

            if (!decoded_token)
                throw new UnauthorizedException('Invalid or expired token');
               // throw new BadRequestException('Invalid jwt token');
            
            // if (!decoded_token ) {
                
            //     res.status(404).send('unauthorized');
                
            // }

           // req['user_id'] = decoded_token._id;
           const user = await this.userservice.findById(decoded_token._id);
           if (!user?.loggedIn) {
            throw new UnauthorizedException('please login again');
           }
           if (!user?.email) {
            throw new UnauthorizedException('email not found in token');
           }
            req.headers.email = user.email;
            next();

        } catch (error) {
            console.log('error->'+error);
            
         //   next(error);
         //turn error to badrequest as UnauthorizeException gives internal error
         next(new BadRequestException(error));
         // next(new HttpException("message", 400, { cause: new Error(error as string) }))
         
        }

    }
} 