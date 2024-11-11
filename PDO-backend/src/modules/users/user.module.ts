import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../../shared/models/users.model.js';
import { UserAuthController } from './uauth.controller.js';
import { UserService } from './user.service.js';
import { VerToken, VerTokenSchema } from '../../shared/models/vertoken.model.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: VerToken.name, schema: VerTokenSchema },
    ]),
  ],
  providers: [UserService],
  controllers: [UserAuthController],
  exports: [UserService] 
})
export class UserModule {}