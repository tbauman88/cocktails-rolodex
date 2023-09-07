import { Module } from '@nestjs/common'

import { AppController } from './app.controller'
import { UserController } from './user.controller'
import { DrinkController } from './drink.controller'
import { IngredientController } from './ingredient.controller'

import { DataUsersModule } from '@cocktails-rolodex/data-users'
import { DataDrinksModule } from '@cocktails-rolodex/data-drinks'
import { DataIngredientsModule } from '@cocktails-rolodex/data-ingredients'

@Module({
  imports: [DataUsersModule, DataDrinksModule, DataIngredientsModule],
  controllers: [
    AppController,
    UserController,
    DrinkController,
    IngredientController
  ],
  providers: []
})
export class AppModule {}
