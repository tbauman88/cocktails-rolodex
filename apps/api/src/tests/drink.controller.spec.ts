import { faker } from '@faker-js/faker'
import { HttpStatus, INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import request from 'supertest'

import { DrinkWithIngredients } from '@cocktails-rolodex/data-drinks'
import { PrismaService } from '@cocktails-rolodex/prisma-client-cocktails'
import { AppModule } from '../app/app.module'

describe('DrinkController', () => {
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
    const deleteDrinks = prisma.drink.deleteMany()
    const deleteUsers = prisma.user.deleteMany()
    await prisma.$transaction([deleteDrinks, deleteUsers])
  })

  describe('index', () => {
    it('should return an array of drinks', async () => {
      await createDrinkForUser()

      const [drink] = await prisma.drink.findMany()

      const response = await request(app.getHttpServer())
        .get('/drinks')
        .expect(HttpStatus.OK)

      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: drink.name, id: drink.id })
        ])
      )
    })
  })

  describe('show', () => {
    it('should return a drink', async () => {
      await createDrinkForUser()

      const newDrink = await prisma.drink.findFirst()

      const drink = {
        name: newDrink.name,
        id: newDrink.id
      } as DrinkWithIngredients

      const response = await request(app.getHttpServer())
        .get(`/drinks/${drink.id}`)
        .expect(HttpStatus.OK)

      expect(response.body).toEqual(expect.objectContaining({ id: drink.id }))
    })

    it('should throw an error if the drink does not exist', async () => {
      const response = await request(app.getHttpServer())
        .get(`/drinks/123`)
        .expect(HttpStatus.NOT_FOUND)

      expect(response.body.message).toEqual('Drink with ID 123 not found.')
    })

    it('should return message when drink has been deleted', async () => {
      await prisma.drink.deleteMany()
      await createDrinkForUser({ deletedAt: new Date() })
      const drink = await prisma.drink.findFirst()

      await prisma.drink.update({
        where: { id: drink.id },
        data: { deletedAt: new Date() }
      })

      const response = await request(app.getHttpServer())
        .get(`/drinks/${drink.id}`)
        .expect(HttpStatus.OK)

      expect(response.text).toEqual(`${drink.name} has been deleted.`)
    })
  })

  describe('create', () => {
    it('should create a drink', async () => {
      const user = await prisma.user.create({
        data: {
          email: faker.internet.exampleEmail(),
          name: faker.person.fullName()
        }
      })

      const drink = {
        name: 'Fernet Is My Safe Word',
        userId: user.id,
        notes: 'Fernet Blanc spray on glass, garnished with a lemon',
        ingredients: []
      }

      const response = await request(app.getHttpServer())
        .post(`/drinks`)
        .send(drink)
        .expect(HttpStatus.CREATED)

      expect(response.body).toEqual(expect.objectContaining(drink))
    })

    it.todo('should return conflict if drink name exists for user')
  })

  describe('update', () => {
    it('should update a drink', async () => {
      await createDrinkForUser()
      const newDrink = await prisma.drink.findFirst()

      const response = await request(app.getHttpServer())
        .put(`/drinks/${newDrink.id}`)
        .send({ published: true })
        .expect(HttpStatus.OK)

      expect(response.body).toEqual(
        expect.objectContaining({ published: true })
      )
    })
  })

  describe('delete', () => {
    it('should delete a drink', async () => {
      await createDrinkForUser()
      const drink = await prisma.drink.findFirst()

      const response = await request(app.getHttpServer())
        .delete(`/drinks/${drink.id}`)
        .expect(HttpStatus.OK)

      expect(response.text).toEqual(`Drink deleted successfully.`)
    })

    it('should return drink has already been deleted message if deleted', async () => {
      await prisma.drink.deleteMany()
      await createDrinkForUser({ deletedAt: new Date() })
      const drink = await prisma.drink.findFirst()

      const response = await request(app.getHttpServer())
        .delete(`/drinks/${drink.id}`)
        .expect(HttpStatus.OK)

      expect(response.text).toEqual(`${drink.name} has been deleted.`)
    })

    it('should throw when drink id is not found', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/drinks/123`)
        .expect(HttpStatus.NOT_FOUND)

      expect(response.body.message).toEqual('Drink with ID 123 not found.')
    })
  })

  const createDrinkForUser = async (extraData = {}) => {
    const user = await prisma.user.create({
      data: {
        email: faker.internet.exampleEmail(),
        name: faker.person.fullName()
      }
    })

    await prisma.drink.create({
      data: {
        name: 'Manhattan',
        user: { connect: { id: user.id } },
        ...extraData
      }
    })
  }
})
