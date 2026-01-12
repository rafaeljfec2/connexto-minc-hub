import { IsEnum } from 'class-validator';

export class DeleteMessageDto {
  @IsEnum(['everyone', 'me'])
  deleteType: 'everyone' | 'me';
}
