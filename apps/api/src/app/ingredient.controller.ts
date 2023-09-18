import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query
} from '@nestjs/common'

import { IngredientService } from '@cocktails-rolodex/data-ingredients'
import { Ingredient } from '@cocktails-rolodex/prisma-client-cocktails'

@Controller('ingredients')
export class IngredientController {
  constructor(private readonly ingredientService: IngredientService) {}

  @Get()
  async findAll(
    @Query('take') take?: number,
    @Query('skip') skip?: number,
    @Query('search') search?: string,
    @Query('orderBy') orderBy?: 'asc' | 'desc'
  ): Promise<Ingredient[] | null> {
    const or = search ? { OR: [{ name: { contains: search } }] } : {}

    return this.ingredientService.index({
      skip: Number(skip) || undefined,
      take: Number(take) || undefined,
      orderBy: { name: orderBy },
      where: { ...or }
    })
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Ingredient | null> {
    try {
      return await this.ingredientService.show({ id })
    } catch (error) {
      throw new NotFoundException(error.message)
    }
  }
}
