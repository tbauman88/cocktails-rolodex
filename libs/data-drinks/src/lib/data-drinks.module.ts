import { Module } from '@nestjs/common'
import { DrinkService } from './drink.service'
import { PrismaClientModule } from '@cocktails-rolodex/prisma-client'

@Module({
  imports: [PrismaClientModule],
  controllers: [],
  providers: [DrinkService],
  exports: [DrinkService]
})
export class DataDrinksModule {}
