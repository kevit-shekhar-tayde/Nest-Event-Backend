// export class UpdateEventDto {
//   name?: string;
//   description?: string;
//   when?: string;
//   address?: string;
// }

import { PartialType } from '@nestjs/mapped-types';
import { CreateEventDto } from './create-event.dto';

// =======OR=======

export class UpdateEventDto extends PartialType(CreateEventDto) {}
