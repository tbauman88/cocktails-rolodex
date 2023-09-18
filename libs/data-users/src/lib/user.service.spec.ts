import { faker } from '@faker-js/faker'
import { Test, TestingModule } from '@nestjs/testing'
import { UserService } from './user.service'
import {
  INestApplication,
  NotFoundException,
  ValidationPipe
} from '@nestjs/common'
import { DataUsersModule } from './data-users.module'
import { useContainer } from 'class-validator'
import { config } from 'dotenv'

import { PrismaService, User } from '@cocktails-rolodex/prisma-client-cocktails'

config({ path: '.env.test' })

describe('UserService', () => {
  let app: INestApplication
  let service: UserService
  let prisma: PrismaService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DataUsersModule]
    }).compile()

    app = module.createNestApplication()
    prisma = module.get<PrismaService>(PrismaService)
    service = module.get<UserService>(UserService)

    useContainer(app.select(DataUsersModule), { fallbackOnErrors: true })
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }))

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
    const createManyUsers = async (
      firstUserName?: string,
      secondUserName?: string
    ) => {
      await prisma.user.createMany({
        data: [
          {
            name: firstUserName || faker.person.fullName(),
            email: faker.internet.exampleEmail()
          },
          {
            name: secondUserName || faker.person.fullName(),
            email: faker.internet.exampleEmail()
          }
        ]
      })

      return await prisma.user.findMany({ include: { drinks: true } })
    }

    it('should return an ordered array of users', async () => {
      await createManyUsers('Carter', 'Bill')

      const actualUsers = await service.index({ orderBy: { name: 'asc' } })

      expect(actualUsers.map((user) => user.name)).toEqual(['Bill', 'Carter'])
    })

    it('should return an array of users', async () => {
      const users: User[] = await createManyUsers()

      expect(await service.index({ include: { drinks: true } })).toEqual(users)
    })
  })

  describe('show', () => {
    it('should return a user with drinks', async () => {
      const user: User = await prisma.user.create({
        data: {
          name: faker.person.fullName(),
          email: faker.internet.exampleEmail()
        }
      })

      expect(await service.show({ id: user.id })).toEqual({
        ...user,
        drinks: []
      })
    })

    it('should return null if user is not found', async () => {
      await expect(service.show({ id: '1' })).rejects.toThrow(
        new NotFoundException('Drink with ID 1 not found.')
      )
    })
  })
})
