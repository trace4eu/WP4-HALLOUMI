import pkg from 'jsonwebtoken';
import { compare, hash } from 'bcrypt';
import {  BadRequestException, HttpCode, Param, Query, Response } from '@nestjs/common';
import { Body, Controller, Get, Post, Req } from '@nestjs/common';
//import { Request, Response } from 'express';
import { UAuthDto, responseLoginSchema } from './dtos/uauth.dto.js';
import { UserService } from './user.service.js';
import type { FastifyReply } from "fastify";
import crypto from 'crypto';
import GetVerifyParamsDto from './dtos/get-verify.params.dto.js';
import { NewLinkDto } from './dtos/newlink.dto.js';
import { sendEmail } from '../../shared/utils/sendEmail.js';
//import { ApiTags, ApiResponse, ApiOkResponse } from '@nestjs/swagger';
//@ApiTags('Auth')
const { sign } = pkg;

@Controller('/uauth')
export class UserAuthController {
  constructor(private userService: UserService,) { }

  //@ApiOkResponse(responseLoginSchema)
  @HttpCode(200)
  @Post('login',)
  async login(@Body() signinCredentials: UAuthDto, 
              @Response({ passthrough: true }) res: FastifyReply
  ) {
   
    const user = await this.userService.findOne(signinCredentials.email)
  //https://stackoverflow.com/questions/70284761/unauthorizedexception-is-deliver-as-internal-server-error
  //  if (!user) throw new UnauthorizedException('The email/password combination is invalid');
    if (!user) {
      res.code(401).send('The email/password combination is invalid');
      return;
    }

    const isMatch = await compare(signinCredentials.password, user.password)
  
   // if (!isMatch) throw new UnauthorizedException('The email/password combination is invalid');
    if (!isMatch) {
      res.code(401).send('The email/password combination is invalid');
      return;
    }

    if (!user.verified) {
      res.code(403).send('your account is not verified yet');
      return;
    }

    await this.userService.update(user._id, { loggedIn: true })

    // user.loggedIn = true;

    // await user.save();


      return {
        'message': 'Login Successfully',
        'name': user.nickname,
        'token': sign({ _id: user._id, nickname: user.nickname, email:user.email },
          `${process.env['JWT_SECRET_PASSWORD']}`,
          { 'expiresIn': '15m', 'algorithm': 'HS256' })
      }
    
  }

  @HttpCode(200)
  @Get('logout')
  async logout(@Query('email') email: string,
               @Response({ passthrough: true }) res: FastifyReply) {
   

    if (!email) {
      res.code(400).send( 'email not specified');
      return;
    }

    const user = await this.userService.findOne(email)

    if (user)
    await this.userService.update(user._id, { loggedIn: false })
    else {
      res.code(400).send( `User ${email} not found`);
      return ;
    }
      
    res.code(200).send( 'Logout Successfully');
    return ;  
       
    

  }

  @HttpCode(200)
  @Post('sign-up')
 
  async signUp(@Body() signUpCredentials: UAuthDto, ) {

    signUpCredentials.password = await hash(signUpCredentials.password, 10)

    if (!signUpCredentials.email)
      throw new BadRequestException('email is required');

      if (!signUpCredentials.nickname)
      throw new BadRequestException('name is required');

    if (signUpCredentials.email.length < 5 || signUpCredentials.email.length > 40)
      throw new BadRequestException('The email must be between 5 and 20 characters')

    const user = await this.userService.findOne(signUpCredentials.email)

    if (user) throw new BadRequestException('The email is already taken');

    const newuser=await this.userService.create({
      nickname: signUpCredentials.nickname,
      email: signUpCredentials.email,
      password: signUpCredentials.password,
      loggedIn: false,
      verified:true,
    })

    // const vertoken=await this.userService.createVerToken({
    //   userid: newuser._id,
    //   vertoken: crypto.randomBytes(32).toString("hex"),
    // })

    // console.log('verlink->'+newuser._id+' '+vertoken.vertoken);
    // // const url = `${process.env.BASE_URL}users/${user.id}/verify/${token.token}`;
    // const url=`${process.env['PORTAL_URL']}/verlink?id=${newuser._id}&vertoken=${vertoken.vertoken}`
		// await sendEmail(newuser.email, "Verify Email", url);
    // return {
    //   'message': 'A verification link was sent to your email account. it will expire in 5 mins',
    //   'verurl': `portalurl/vertoken?id=${newuser._id}&vertoken=${vertoken.vertoken}`
    // }

  }

  
  @HttpCode(200)
  @Post('newlink')

  async newlink(@Body() newlinkreq: NewLinkDto,) {

    const user = await this.userService.findOne(newlinkreq.email)

    if (!user) throw new BadRequestException('email not found');

    const vertoken=await this.userService.createVerToken({
      userid: user._id,
      vertoken: crypto.randomBytes(32).toString("hex"),
    })
   
    console.log('verlink->'+user._id+' '+vertoken.vertoken);
    // const url = `${process.env.BASE_URL}users/${user.id}/verify/${token.token}`;
		// await sendEmail(user.email, "Verify Email", url);
    const url=`please use this link to verify your account: ${process.env['PORTAL_URL']}/verlink?id=${user._id}&vertoken=${vertoken.vertoken}`
		await sendEmail(user.email, "Verify Email", url);
    return {
      'message': 'A verification link was sent to your email account. it will expire in 5 mins',
      'verurl': `portalurl/vertoken?id=${user._id}&vertoken=${vertoken.vertoken}`
    }
  }

  @Get("/:id/verify/:vertoken")
  @HttpCode(201)
  async getStream(
    @Param() params: GetVerifyParamsDto
  ) {
    await this.userService.verifyLink(params.id,params.vertoken);
    return {
      'message': 'Email verified succesfully',
    }
  }

}