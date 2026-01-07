import { IsOptional, IsUUID, IsArray } from 'class-validator';

export class MarkMessagesReadDto {
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  messageIds?: string[];
}
