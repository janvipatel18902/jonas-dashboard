import { Controller, Get } from '@nestjs/common';
import { InternalEventsService, InternalEventRow } from './internal-events.service';

@Controller('internal-events')
export class InternalEventsController {
    constructor(private readonly internalEventsService: InternalEventsService) { }

    @Get()
    async getEvents(): Promise<{ data: InternalEventRow[] }> {
        const data = await this.internalEventsService.getAllEvents();
        return { data };
    }
}
