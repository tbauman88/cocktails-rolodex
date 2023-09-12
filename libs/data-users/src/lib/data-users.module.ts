import { Module } from '@nestjs/common'
import { UserService } from './user.service'
import { PrismaClientModule } from '@cocktails-rolodex/prisma-client-cocktails'

@Module({
  imports: [PrismaClientModule],
  controllers: [],
  providers: [UserService],
  exports: [UserService]
})
export class DataUsersModule {}
