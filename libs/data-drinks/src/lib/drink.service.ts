import { Injectable, NotFoundException } from '@nestjs/common'
import {
  Prisma,
  PrismaService,
  Drink
} from '@cocktails-rolodex/prisma-client-cocktails'

export type DrinkWithIngredients = Drink & {
  ingredients: {
    name: string
    amount: string
    amount_unit: string
  }[]
}

type Ingredient = {
  id: string
  name: string
  amount: string
  amount_unit?: string
  brand?: string
  garnish?: boolean
}

export class CreateDrinkDto {
  userId: string
  name: string
  directions?: string
  serves?: number
  notes?: string
  published?: boolean
  ingredients: Ingredient[]
}

@Injectable()
export class DrinkService {
  private includeIngredients = {
    ingredients: {
      select: {
        ingredient: true,
        amount: true,
        amount_unit: true,
        brand: true,
        garnish: true
      }
    }
  }

  constructor(private prisma: PrismaService) {}

  async index(params: {
    skip?: number
    take?: number
    cursor?: Prisma.DrinkWhereUniqueInput
    where?: Prisma.DrinkWhereInput
    orderBy?: Prisma.DrinkOrderByWithRelationInput
  }): Promise<Drink[]> {
    const { skip, take, cursor, where, orderBy } = params

    const drinks = await this.prisma.drink.findMany({
      skip,
      take,
      cursor,
      where: { ...where, deletedAt: null },
      orderBy,
      include: this.includeIngredients
    })

    return drinks.map((drink) => ({
      ...drink,
      ingredients: drink.ingredients.map(({ ingredient }) => ({
        name: ingredient.name
      }))
    }))
  }

  async show(
    drinkWhereUniqueInput: Prisma.DrinkWhereUniqueInput
  ): Promise<DrinkWithIngredients | NotFoundException | string> {
    const drink = await this.prisma.drink.findUnique({
      where: drinkWhereUniqueInput,
      include: this.includeIngredients
    })

    if (!drink) {
      throw new NotFoundException(
        `Drink with ID ${drinkWhereUniqueInput.id} not found.`
      )
    }

    if (drink.deletedAt != null) return `${drink.name} has been deleted.`

    return {
      ...drink,
      ingredients: drink.ingredients.map(
        ({ amount, amount_unit, ingredient, brand, garnish }) => {
          const name = brand ?? ingredient.name
          return {
            name: garnish ? `${name} (for garnish)` : name,
            amount,
            amount_unit: amount_unit ?? ''
          }
        }
      )
    }
  }

  async create(data: CreateDrinkDto): Promise<Drink> {
    const { userId, name, directions, serves, notes, ingredients } = data

    await this.prisma.user.findUniqueOrThrow({ where: { id: userId } })

    return await this.prisma.drink.create({
      data: {
        name,
        directions,
        serves,
        notes,
        user: { connect: { id: userId } },
        ingredients: {
          create: await this.upsertIngredients(ingredients)
        }
      },
      include: { ingredients: true }
    })
  }

  async update(params: {
    where: Prisma.DrinkWhereUniqueInput
    data: Prisma.DrinkUpdateInput
  }): Promise<Drink> {
    const { where, data } = params
    return this.prisma.drink.update({
      where,
      data,
      include: { ingredients: true }
    })
  }

  async delete(where: Prisma.DrinkWhereUniqueInput): Promise<string> {
    const drink = await this.prisma.drink.findUnique({ where })

    if (!drink) {
      return `Drink with ID ${where.id} not found.`
    }

    if (drink.deletedAt != null) return `${drink.name} has been deleted.`

    await this.prisma.drink.update({
      where,
      data: { deletedAt: new Date() }
    })

    return 'Drink deleted successfully.'
  }

  private async upsertIngredients(
    ingredients: Ingredient[]
  ): Promise<Prisma.IngredientOnDrinkCreateWithoutDrinkInput[]> {
    return await Promise.all(
      ingredients.map(async (i: Ingredient) => {
        return {
          ingredient: {
            connectOrCreate: {
              where: { name: i.name },
              create: { name: i.name }
            }
          },
          amount: i.amount,
          ...(i.amount_unit && { amount_unit: i.amount_unit }),
          ...(i.brand && { brand: i.brand }),
          ...(i.garnish && { garnish: i.garnish })
        }
      })
    )
  }
}
