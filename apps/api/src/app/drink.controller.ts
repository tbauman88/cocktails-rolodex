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

@Controller()
export class DrinkController {
  constructor(private readonly drinkService: DrinkService) {}

  @Get('drinks')
  async drinks(
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

  @Get('drink/:id')
  async getDrinkById(
    @Param('id') id: string
  ): Promise<Drink | NotFoundException | string> {
    return this.drinkService.show({ id })
  }

  @Post('drink')
  async createDrink(
    @Body() data: CreateDrinkDto
  ): Promise<Drink | ConflictException> {
    return this.drinkService.create(data)
  }

  @Put('drink/:id')
  async updateDrink(
    @Param('id') id: string,
    @Body() data: Prisma.DrinkUpdateInput
  ): Promise<Drink> {
    return this.drinkService.update({ where: { id }, data })
  }

  @Delete('drink/:id')
  async deleteDrink(@Param('id') id: string): Promise<string> {
    return this.drinkService.delete({ id })
  }
}
