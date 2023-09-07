import { Module } from '@nestjs/common'
import { IngredientService } from './ingredient.service'
import { PrismaClientModule } from '@cocktails-rolodex/prisma-client'

@Module({
  imports: [PrismaClientModule],
  controllers: [],
  providers: [IngredientService],
  exports: [IngredientService]
})
export class DataIngredientsModule {}
