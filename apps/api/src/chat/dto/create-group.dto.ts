import { IsNotEmpty, IsString, IsArray, IsUUID, ArrayMinSize } from 'class-validator';

export class CreateGroupDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  @IsUUID('4', { each: true })
  @ArrayMinSize(1)
  members: string[];
}
