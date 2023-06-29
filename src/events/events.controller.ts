import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  Logger,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  SerializeOptions,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CreateEventDto } from './input/create-event.dto';
import { UpdateEventDto } from './input/update-event.dto';
import { Event } from './event.entity';
import { Like, MoreThan, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Attendee } from './attendee.entity';
import { EventsService } from './events.service';
import { ListEvents } from './input/list.events';
import { CurrentUser } from 'src/auth/current-user.decorators';
import { User } from 'src/auth/user.entity';
import { AuthGuardJwt } from 'src/auth/auth-guard.jwt';

@Controller('/events')
@SerializeOptions({ strategy: 'excludeAll' })
export class EventsController {
  private readonly logger = new Logger(EventsController.name);

  constructor(private readonly eventService: EventsService) {}

  @Get()
  @UsePipes(new ValidationPipe({ transform: true })) //for populating defaults when not provided
  @UseInterceptors(ClassSerializerInterceptor)
  async findAll(@Query() filter: ListEvents) {
    const events =
      await this.eventService.getEventsWithAttendeeCountFilteredPaginated(
        filter,
        {
          total: true,
          currentPage: filter.page,
          limit: 2,
        },
      );
    return events;
  }

  // @Get('/practice')
  // async practice() {
  //   // return await this.repository.find({
  //   //   // where: { id: 3 },
  //   //   select: ['id', 'when'],
  //   //   where: [
  //   //     {
  //   //       id: MoreThan(3),
  //   //       when: MoreThan(new Date('2021-02-12T13:00:00')),
  //   //     },
  //   //     {
  //   //       description: Like('%meet%'),
  //   //     },
  //   //   ],
  //   //   take: 2,
  //   //   order: {
  //   //     id: 'DESC',
  //   //   },
  //   // });
  // }

  // @Get('/practice2')
  // async practice2() {
  //   // return await this.repository.findOne({
  //   //   where: { id: 1 },
  //   //   relations: ['attendees'],
  //   // });
  //   // const event = await this.repository.findOne({ where: { id: 1 } });
  //   // const attendee = new Attendee();
  //   // attendee.name = 'Jerry';
  //   // attendee.event = event;

  //   // await this.attendeeRepository.save(attendee);
  //   // return event;
  //   // const event = new Event();
  //   // event.id = 1;
  //   // const attendee = new Attendee();
  //   // attendee.name = 'Jerry Jr.';
  //   // attendee.event = event;

  //   // await this.attendeeRepository.save(attendee);
  //   // return event;

  //   // const event = await this.repository.findOne({
  //   //   where: { id: 1 },
  //   //   relations: ['attendees'],
  //   // });

  //   // const attendee = new Attendee();
  //   // attendee.name = 'Jerry Sr. Using cascading';

  //   // event.attendees.push(attendee);

  //   // await this.repository.save(event);
  //   // return event;
  // }

  @Get(':id')
  @UseInterceptors(ClassSerializerInterceptor)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    // console.log(typeof id);
    // const event = await this.repository.findOneBy({ id });
    const event = await this.eventService.getEventWithAttendeeCount(id);
    if (!event) {
      throw new NotFoundException();
    }
    return event;
  }
  @Post()
  @UseGuards(AuthGuardJwt)
  @UseInterceptors(ClassSerializerInterceptor)
  async create(@Body() input: CreateEventDto, @CurrentUser() user: User) {
    return await this.eventService.createEvent(input, user);
  }
  @Patch(':id')
  @UseGuards(AuthGuardJwt)
  @UseInterceptors(ClassSerializerInterceptor)
  async update(
    @Param('id', ParseIntPipe) id,
    @Body() input: UpdateEventDto,
    @CurrentUser() user: User,
  ) {
    const event = await this.eventService.findOne(id);
    if (!event) {
      throw new NotFoundException();
    }

    if (event.organizerId !== user.id) {
      throw new ForbiddenException(
        null,
        'you are not authorized to change this event',
      );
    }
    return await this.eventService.updateEvent(event, input);
  }

  @Delete(':id')
  @UseGuards(AuthGuardJwt)
  @HttpCode(204) //Decorator to send response we want
  async remove(@Param('id', ParseIntPipe) id, @CurrentUser() user: User) {
    const event = await this.eventService.findOne(id);
    if (!event) {
      throw new NotFoundException();
    }

    if (event.organizerId !== user.id) {
      throw new ForbiddenException(
        null,
        'you are not authorized to remove this event',
      );
    }

    await this.eventService.deleteEvent(id);
  }
}
