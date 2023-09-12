import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Query
} from '@nestjs/common'
import { UserService } from '@cocktails-rolodex/data-users'
import { Prisma, User } from '@cocktails-rolodex/prisma-client-cocktails'

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('users')
  @HttpCode(HttpStatus.OK)
  async getUsers(
    @Query('orderBy') orderBy?: 'asc' | 'desc'
  ): Promise<User[] | null> {
    return this.userService.index({
      include: { drinks: true },
      orderBy: { name: orderBy }
    })
  }

  @Get('user/:id')
  async getUserById(@Param('id') id: string): Promise<User | null> {
    return this.userService.show({ id })
  }

  @Post('user/signup')
  async createUser(
    @Body() data: Prisma.UserCreateInput
  ): Promise<User | string> {
    return this.userService.create(data)
  }

  @Put('user/:id')
  async updateUser(
    @Param('id') id: string,
    @Body() data: Prisma.UserUpdateInput
  ): Promise<User | NotFoundException> {
    return this.userService.update({ where: { id }, data })
  }

  @Delete('user/:id')
  async deleteUser(@Param('id') id: string): Promise<{ message: string }> {
    const deleted = this.userService.delete({ id })

    if (deleted) {
      return { message: `User: ${id} was deleted successfully` }
    }
  }
}
