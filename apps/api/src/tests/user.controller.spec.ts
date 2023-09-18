import { faker } from '@faker-js/faker'
import { HttpStatus, INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import request from 'supertest'

import { PrismaService, Role } from '@cocktails-rolodex/prisma-client-cocktails'
import { AppModule } from '../app/app.module'

describe('UserController', () => {
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
    it('should return an array of users', async () => {
      const users = [
        { name: faker.person.fullName(), email: faker.internet.exampleEmail() },
        { name: faker.person.fullName(), email: faker.internet.exampleEmail() }
      ]

      await prisma.user.createMany({ data: users })

      const response = await request(app.getHttpServer())
        .get('/users')
        .expect(HttpStatus.OK)

      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            email: users[0].email,
            name: users[0].name
          }),
          expect.objectContaining({
            email: users[1].email,
            name: users[1].name
          })
        ])
      )
    })
  })

  describe('show', () => {
    it('should return a user', async () => {
      const user = await createUser()

      const response = await request(app.getHttpServer())
        .get(`/users/${user.id}`)
        .expect(HttpStatus.OK)

      expect(response.body).toEqual(expect.objectContaining({ id: user.id }))
    })
  })

  describe('create', () => {
    it('should create a user', async () => {
      const user = {
        name: faker.person.fullName(),
        email: faker.internet.exampleEmail()
      }

      const response = await request(app.getHttpServer())
        .post(`/users/signup`)
        .send(user)
        .expect(HttpStatus.CREATED)

      expect(response.body).toEqual(
        expect.objectContaining({ name: user.name, email: user.email })
      )
    })
  })

  describe('update', () => {
    it('should update a user', async () => {
      const user = await createUser()

      const response = await request(app.getHttpServer())
        .put(`/users/${user.id}`)
        .send({ role: Role.ADMIN })
        .expect(HttpStatus.OK)

      expect(response.body).toEqual(
        expect.objectContaining({ role: Role.ADMIN })
      )
    })

    it('should throw an error if the user does not exist', async () => {
      const response = await request(app.getHttpServer())
        .put(`/users/123`)
        .send({ role: Role.ADMIN })
        .expect(HttpStatus.NOT_FOUND)

      expect(response.body.message).toEqual('User with ID 123 not found.')
    })
  })

  describe('delete', () => {
    it('should delete a user', async () => {
      const user = await createUser()

      const response = await request(app.getHttpServer())
        .delete(`/users/${user.id}`)
        .expect(HttpStatus.OK)

      expect(response.body.message).toEqual(
        `User: ${user.name} deleted successfully.`
      )
    })

    it.todo('should return user already deleted message if deleted')

    it('should throw when user not found', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/users/123`)
        .expect(HttpStatus.NOT_FOUND)

      expect(response.body.message).toEqual('User with ID 123 not found.')
    })
  })

  const createUser = async () =>
    await prisma.user.create({
      data: {
        name: faker.person.fullName(),
        email: faker.internet.exampleEmail()
      }
    })
})
