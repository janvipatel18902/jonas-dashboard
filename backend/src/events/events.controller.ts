import { Controller, Get } from '@nestjs/common';
import { EventsService } from './events.service';
import { WebinarWithParticipants } from './types';

@Controller('events')
export class EventsController {
    constructor(private readonly eventsService: EventsService) { }

    @Get()
    async getAllEvents(): Promise<WebinarWithParticipants[]> {
        return this.eventsService.getAllWebinarsWithParticipants();
    }
}
