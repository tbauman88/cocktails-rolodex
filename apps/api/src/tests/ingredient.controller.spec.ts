import { faker } from '@faker-js/faker'
import { HttpStatus, INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import request from 'supertest'

import { PrismaService } from '@cocktails-rolodex/prisma-client-cocktails'
import { AppModule } from '../app/app.module'

describe('IngredientController', () => {
  let app: INestApplication
  let prisma: PrismaService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile()

    app = module.createNestApplication()
    prisma = module.get<PrismaService>(PrismaService)

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
    it('should return an array of ingredients', async () => {
      await createUserWithDrink('Negroni', [
        { name: 'Sweet Vermouth', amount: '1', amount_unit: 'oz' },
        { name: 'Campari', amount: '1', amount_unit: 'oz' },
        { name: 'Gin', amount: '1', amount_unit: 'oz' }
      ])

      await createUserWithDrink('Adonis', [
        { name: 'Sweet Vermouth', amount: '2', amount_unit: 'oz' },
        { name: 'Sherry', amount: '1', amount_unit: 'oz' },
        { name: 'Orange bitters', amount: '2', amount_unit: 'dashes' }
      ])

      const [ingredient] = await prisma.ingredient.findMany()

      const response = await request(app.getHttpServer())
        .get('/ingredients')
        .expect(HttpStatus.OK)

      expect(response.body.length).toEqual(5)

      const [firstIngredient] = response.body
      expect(firstIngredient.drinks.length).toEqual(2)

      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: ingredient.name,
            id: ingredient.id
          })
        ])
      )
    })
  })

  describe('show', () => {
    it('should return an ingredient', async () => {
      await createUserWithDrink('Adonis', [
        { name: 'Sweet Vermouth', amount: '2', amount_unit: 'oz' },
        { name: 'Sherry', amount: '1', amount_unit: 'oz' },
        { name: 'Orange bitters', amount: '2', amount_unit: 'dashes' }
      ])

      const ingredient = await prisma.ingredient.findFirst({
        where: { name: 'Sweet Vermouth' }
      })

      const ingredientRes = await request(app.getHttpServer())
        .get(`/ingredients/${ingredient.id}`)
        .expect(HttpStatus.OK)

      expect(ingredientRes.body).toEqual(
        expect.objectContaining({ id: ingredient.id })
      )
    })

    it('should throw 404 if ingredient not found', async () => {
      const response = await request(app.getHttpServer())
        .get(`/ingredients/123`)
        .expect(HttpStatus.NOT_FOUND)

      expect(response.body.message).toEqual('Ingredient with ID 123 not found.')
    })
  })

  const createUserWithDrink = async (drinkName: string, drinkIngredients) => {
    return await prisma.user.create({
      data: {
        name: faker.person.fullName(),
        email: faker.internet.exampleEmail(),
        drinks: {
          create: {
            name: drinkName,
            ingredients: {
              create: drinkIngredients.map((ingredient) => ({
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
          }
        }
      }
    })
  }
})
