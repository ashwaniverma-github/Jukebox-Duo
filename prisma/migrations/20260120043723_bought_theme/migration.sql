-- AlterTable
ALTER TABLE "User" ADD COLUMN     "boughtThemes" TEXT[] DEFAULT ARRAY['default']::TEXT[];
