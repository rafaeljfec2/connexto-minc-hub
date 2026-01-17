import { IsUUID, IsNotEmpty } from 'class-validator';

export class AddGuestVolunteerDto {
  @IsUUID()
  @IsNotEmpty()
  personId: string;
}
