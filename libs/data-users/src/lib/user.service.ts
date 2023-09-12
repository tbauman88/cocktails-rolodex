import { Body, Injectable, NotFoundException } from '@nestjs/common'
import {
  Prisma,
  PrismaService,
  User
} from '@cocktails-rolodex/prisma-client-cocktails'

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async show(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput
  ): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: userWhereUniqueInput,
      include: { drinks: true }
    })
  }

  async index(params: {
    skip?: number
    take?: number
    cursor?: Prisma.UserWhereUniqueInput
    where?: Prisma.UserWhereInput
    orderBy?: Prisma.UserOrderByWithRelationInput
    include?: Prisma.UserInclude
  }): Promise<User[]> {
    const { skip, take, cursor, where, orderBy, include } = params
    return this.prisma.user.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include
    })
  }

  async create(@Body() data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({ data })
  }

  async update(params: {
    where: Prisma.UserWhereUniqueInput
    data: Prisma.UserUpdateInput
  }): Promise<User | NotFoundException> {
    const { where, data } = params
    const existingUser = await this.prisma.user.findUnique({ where })

    if (!existingUser) {
      throw new NotFoundException('Record to update does not exist.')
    }

    return this.prisma.user.update({ data, where })
  }

  async delete(where: Prisma.UserWhereUniqueInput): Promise<User> {
    return this.prisma.user.delete({ where })
  }
}
