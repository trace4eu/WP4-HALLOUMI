import { Injectable, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { User, UserDocument } from '../../shared/models/users.model.js';
//import { NextFunction, Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import { VerToken, VerTokenDocument } from '../../shared/models/vertoken.model.js';

interface UserType {
    nickname: string;
    email:string;
    password: string;
    loggedIn?: boolean;
    verified?:boolean;
}

interface VerTokenType {
    userid: string;
    vertoken:string;
   
}

@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @InjectModel(VerToken.name) private verTokenModel: Model<VerTokenDocument>
        ) { }

    async findOne(email: string) {
        return await this.userModel.findOne({ email: email }).exec()
    }

    async findById(id: string) {
        try {
        return await this.userModel.findById(id).exec()
        } catch (e) {
            return null;
        }
    }

    async verify(token: string) {
        const decoded_token: any = jwt.verify(token, `${process.env['JWT_SECRET_PASSWORD']}`)
        if (!decoded_token._id)
            throw new UnauthorizedException('Invalid token')
        return decoded_token._id
    }

    async update(id: string, data: Partial<UserType>) {
        return await this.userModel.findByIdAndUpdate(id, data, { new: true }).exec()
    }

    async create(user: UserType) {
        return await new this.userModel(user).save()
    }

    async createVerToken(vertoken: VerTokenType) {
        //delete if already exists
        const existingvertoken = await this.verTokenModel.findOne({userid:vertoken.userid}).exec();
        if (existingvertoken) {
            await this.verTokenModel.findByIdAndDelete(existingvertoken._id);
        }
        return await new this.verTokenModel(vertoken).save()
    }

    async verifyLink(userid: string, vertoken:string) {

    try {
        const user = await this.findById(userid);
        if (!user) {
            console.log('invalid userid');
            throw new UnauthorizedException('Invalid link')
        }
        const vertoken2 = await this.verTokenModel.findOne({ userid:user._id, vertoken:vertoken}).exec();

        if (!vertoken2) {
            console.log('invalid vertoken');
            throw new UnauthorizedException('Invalid link')
        }

        await this.update(userid,{verified:true});
        await this.verTokenModel.findByIdAndDelete(vertoken2._id);
      } catch (e) {
        console.log('exception->'+e);
        throw new BadRequestException('Invalid link');
      }

    }

}
