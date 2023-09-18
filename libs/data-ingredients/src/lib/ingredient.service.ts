import { Injectable } from '@nestjs/common'
import {
  Prisma,
  PrismaService,
  Ingredient
} from '@cocktails-rolodex/prisma-client-cocktails'

type IngredientWithDrinks = Ingredient & {
  drinks: { id: string; name: string }[]
}

@Injectable()
export class IngredientService {
  constructor(private prisma: PrismaService) {}

  async index(params: {
    skip?: number
    take?: number
    cursor?: Prisma.IngredientWhereUniqueInput
    where?: Prisma.IngredientWhereInput
    orderBy?: Prisma.IngredientOrderByWithRelationInput
  }): Promise<Ingredient[]> {
    const { skip, take, cursor, where, orderBy } = params
    const ingredients = await this.prisma.ingredient.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include: {
        drinks: {
          select: { drink: { select: { id: true, name: true } } },
          where: { drink: { deletedAt: null } }
        }
      }
    })

    return ingredients.map((ingredient) => ({
      ...ingredient,
      drinks: ingredient.drinks.map(({ drink }) => ({
        id: drink.id,
        name: drink.name
      }))
    }))
  }

  async show(
    ingredientWhereUniqueInput: Prisma.IngredientWhereUniqueInput
  ): Promise<IngredientWithDrinks> {
    const ingredient = await this.prisma.ingredient.findUnique({
      where: ingredientWhereUniqueInput,
      include: {
        drinks: {
          select: { drink: { select: { id: true, name: true } } },
          where: { drink: { deletedAt: null } }
        }
      }
    })

    if (!ingredient) {
      throw new Error(
        `Ingredient with ID ${ingredientWhereUniqueInput.id} not found.`
      )
    }

    return {
      ...ingredient,
      drinks: ingredient?.drinks.map(({ drink }) => ({
        id: drink.id,
        name: drink.name
      }))
    }
  }
}
