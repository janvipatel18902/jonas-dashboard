import { Controller, Get } from '@nestjs/common';
import { UniversitiesService } from './universities.service';

@Controller('universities')
export class UniversitiesController {
    constructor(private readonly universitiesService: UniversitiesService) { }

    @Get()
    async getAll() {
        const data = await this.universitiesService.getUniversities();
        return { data };
    }
}
