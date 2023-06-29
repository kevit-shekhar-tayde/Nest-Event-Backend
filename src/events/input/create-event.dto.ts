import { Length, IsDateString, IsString } from 'class-validator';

export class CreateEventDto {
  @IsString()
  @Length(5, 255, { message: 'name length is incorrect.' })
  name: string;
  @Length(5, 255)
  description: string;
  @IsDateString()
  when: string;
  @Length(5, 255)
  address: string;
}
