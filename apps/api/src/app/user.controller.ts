import {
  Body,
  ConflictException,
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

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query('orderBy') orderBy?: 'asc' | 'desc'
  ): Promise<User[] | null> {
    return this.userService.index({ orderBy: { name: orderBy } })
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User> {
    try {
      return await this.userService.show({ id })
    } catch (error) {
      throw new NotFoundException(error.message)
    }
  }

  @Post('signup')
  async create(@Body() data: Prisma.UserCreateInput): Promise<User> {
    try {
      return await this.userService.create(data)
    } catch (error) {
      throw new ConflictException(error.message)
    }
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() data: Prisma.UserUpdateInput
  ): Promise<User | NotFoundException> {
    try {
      return await this.userService.update({ where: { id }, data })
    } catch (error) {
      throw new NotFoundException(error.message)
    }
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    try {
      return await this.userService.delete({ id })
    } catch (error) {
      throw new NotFoundException(error.message)
    }
  }
}
