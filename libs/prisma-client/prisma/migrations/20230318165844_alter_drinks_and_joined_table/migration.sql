-- AlterTable
ALTER TABLE "Drink" ADD COLUMN     "directions" TEXT,
ADD COLUMN     "serves" INTEGER DEFAULT 1;

-- AlterTable
ALTER TABLE "IngredientOnDrink" ADD COLUMN     "garnish" BOOLEAN DEFAULT false,
ALTER COLUMN "amount_unit" DROP NOT NULL;
