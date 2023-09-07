import { Controller, Get, Param, Query } from '@nestjs/common'
import { IngredientService } from '@cocktails-rolodex/data-ingredients'
import { Ingredient } from '@cocktails-rolodex/prisma-client'

@Controller()
export class IngredientController {
  constructor(private readonly ingredientService: IngredientService) {}

  @Get('ingredients')
  async ingredients(
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

  @Get('ingredient/:id')
  async ingredient(@Param('id') id: string): Promise<Ingredient | null> {
    return this.ingredientService.show({ id })
  }
}
