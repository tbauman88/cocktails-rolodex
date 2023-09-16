import {
  Body,
  ConflictException,
  Injectable,
  NotFoundException
} from '@nestjs/common'
import {
  Prisma,
  PrismaService,
  User
} from '@cocktails-rolodex/prisma-client-cocktails'

@Injectable()
export class UserService {
  private includeDrinks = {
    drinks: {
      select: {
        id: true,
        name: true
      }
    }
  }

  constructor(private prisma: PrismaService) {}

  async index(params: {
    skip?: number
    take?: number
    cursor?: Prisma.UserWhereUniqueInput
    where?: Prisma.UserWhereInput
    orderBy?: Prisma.UserOrderByWithRelationInput
    include?: Prisma.UserInclude
  }): Promise<User[]> {
    const { skip, take, cursor, where, orderBy } = params
    return this.prisma.user.findMany({
      skip,
      take,
      cursor,
      where: { ...where, deletedAt: null },
      orderBy,
      include: this.includeDrinks
    })
  }

  async show(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput
  ): Promise<User | NotFoundException> {
    const user = await this.prisma.user.findUnique({
      where: userWhereUniqueInput,
      include: this.includeDrinks
    })

    if (!user) {
      throw new NotFoundException(
        `Drink with ID ${userWhereUniqueInput.id} not found.`
      )
    }

    return user
  }

  async create(
    @Body() data: Prisma.UserCreateInput
  ): Promise<User | ConflictException> {
    const existingUser = await this.prisma.user.findFirst({
      where: { email: data.email, name: data.name }
    })

    if (existingUser) {
      throw new ConflictException(
        'User with provided email and name already exists.'
      )
    }

    return this.prisma.user.create({ data })
  }

  async update({
    where,
    data
  }: {
    where: Prisma.UserWhereUniqueInput
    data: Prisma.UserUpdateInput
  }): Promise<User | NotFoundException> {
    if (!(await this.prisma.user.findUnique({ where }))) {
      throw new NotFoundException(`User with ID ${where.id} not found.`)
    }

    return this.prisma.user.update({ data, where })
  }

  async delete(where: Prisma.UserWhereUniqueInput): Promise<string> {
    const user = await this.prisma.user.findUnique({ where })

    if (!user) return `User with ID ${where.id} not found.`

    if (user.deletedAt) return `${user.name} has been deleted.`

    await this.prisma.user.update({ where, data: { deletedAt: new Date() } })

    return `User: ${user.name} deleted successfully.`
  }
}
