import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsOptional, IsString } from "class-validator"

class CreateArticleInput {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  title: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  post: string
}

class UpdateArticleInput {
  @ApiProperty()
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  title: string

  @ApiProperty()
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  post: string
}

export { CreateArticleInput, UpdateArticleInput }
