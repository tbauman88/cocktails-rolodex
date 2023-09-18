import { faker } from '@faker-js/faker'
import { Test, TestingModule } from '@nestjs/testing'
import {
  INestApplication,
  ValidationPipe
} from '@nestjs/common'
import { useContainer } from 'class-validator'
import { config } from 'dotenv'

import {
  Prisma,
  PrismaService
} from '@cocktails-rolodex/prisma-client-cocktails'
import { IngredientService } from './ingredient.service'
import { DataIngredientsModule } from './data-ingredients.module'

config({ path: '.env.test' })

describe('IngredientService', () => {
  let app: INestApplication
  let service: IngredientService
  let prisma: PrismaService

  const drinks = [
    {
      name: 'Negroni',
      ingredients: [
        { name: 'Sweet Vermouth', amount: '1', amount_unit: 'oz' },
        { name: 'Campari', amount: '1', amount_unit: 'oz' },
        { name: 'Gin', amount: '1', amount_unit: 'oz' }
      ]
    },
    {
      name: 'Adonis',
      ingredients: [
        { name: 'Sweet Vermouth', amount: '2', amount_unit: 'oz' },
        { name: 'Sherry', amount: '1', amount_unit: 'oz' },
        { name: 'Orange bitters', amount: '2', amount_unit: 'dashes' }
      ]
    }
  ]

  const uniqueIngredients = new Set()

  drinks.forEach((drink) => {
    drink.ingredients.forEach((ingredient) => {
      uniqueIngredients.add(ingredient.name)
    })
  })

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DataIngredientsModule]
    }).compile()

    app = module.createNestApplication()
    prisma = module.get<PrismaService>(PrismaService)
    service = module.get<IngredientService>(IngredientService)

    useContainer(app.select(DataIngredientsModule), { fallbackOnErrors: true })
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }))

    await app.init()
  })

  afterAll(async () => {
    prisma.$disconnect()
    await app.close()
  })

  afterEach(async () => {
    await prisma.$transaction([
      prisma.ingredientOnDrink.deleteMany(),
      prisma.ingredient.deleteMany(),
      prisma.drink.deleteMany(),
      prisma.user.deleteMany()
    ])
  })

  describe('index', () => {
    it.each([
      {
        orderBy: Prisma.SortOrder['asc'],
        expectedOrder: Array.from(uniqueIngredients).sort()
      },
      {
        orderBy: Prisma.SortOrder['desc'],
        expectedOrder: Array.from(uniqueIngredients).sort().reverse()
      }
    ])(
      'should return an $orderBy ordered array of ingredients',
      async ({ orderBy, expectedOrder }) => {
        await createUserWithMultipleDrinks(drinks)

        const actual = await service.index({ orderBy: { name: orderBy } })

        expect(expectedOrder).toEqual(actual.map((i) => i.name))
      }
    )
  })

  const createUserWithMultipleDrinks = async (
    drinks: { name: string; ingredients: any[] }[]
  ) => {
    return await prisma.user.create({
      data: {
        name: faker.person.fullName(),
        email: faker.internet.exampleEmail(),
        drinks: {
          create: drinks.map((drink) => ({
            name: drink.name,
            ingredients: {
              create: drink.ingredients.map((ingredient: any) => ({
                amount: ingredient.amount,
                amount_unit: ingredient.amount_unit,
                ingredient: {
                  connectOrCreate: {
                    where: { name: ingredient.name },
                    create: { name: ingredient.name }
                  }
                }
              }))
            }
          }))
        }
      }
    })
  }
})
