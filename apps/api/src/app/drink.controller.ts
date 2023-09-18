import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query
} from '@nestjs/common'

import { CreateDrinkDto, DrinkService } from '@cocktails-rolodex/data-drinks'
import { Drink, Prisma } from '@cocktails-rolodex/prisma-client-cocktails'

@Controller('drinks')
export class DrinkController {
  constructor(private readonly drinkService: DrinkService) {}

  @Get()
  async findAll(
    @Query('take') take?: number,
    @Query('skip') skip?: number,
    @Query('search') search?: string,
    @Query('orderBy') orderBy?: 'asc' | 'desc'
  ): Promise<Drink[] | null> {
    const or = search ? { OR: [{ name: { contains: search } }] } : {}

    return this.drinkService.index({
      skip: Number(skip) || undefined,
      take: Number(take) || undefined,
      orderBy: { name: orderBy },
      where: { ...or }
    })
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Drink | string> {
    try {
      return await this.drinkService.show({ id })
    } catch (error) {
      throw new NotFoundException(error.message)
    }
  }

  @Post()
  async create(@Body() data: CreateDrinkDto): Promise<Drink> {
    try {
      return await this.drinkService.create(data)
    } catch (error) {
      throw new ConflictException(error.message)
    }
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() data: Prisma.DrinkUpdateInput
  ): Promise<Drink> {
    try {
      return await this.drinkService.update({ where: { id }, data })
    } catch (error) {
      throw new NotFoundException(error.message)
    }
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<string> {
    try {
      return await this.drinkService.delete({ id })
    } catch (error) {
      throw new NotFoundException(error.message)
    }
  }
}
