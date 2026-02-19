import { Controller, Get, Param } from '@nestjs/common';
import { OpenEdxService } from './open-edx.service';
import { CoursesApiResponse } from './types';

@Controller('open-edx')
export class OpenEdxController {
    constructor(private readonly openEdxService: OpenEdxService) { }

    /* ================= LIST ALL COURSES ================= */

    @Get('courses')
    async listAllCourses(): Promise<{ data: CoursesApiResponse }> {
        const data = await this.openEdxService.getCourses();
        return { data };
    }

    /* ================= COURSE DETAILS ================= */

    @Get('courses/:courseId')
    async getCourseDetails(@Param('courseId') courseId: string) {
        const data = await this.openEdxService.getCourseDetails(courseId);
        return { data };
    }

    /* ================= COURSE GRADEBOOK ================= */

    @Get('courses/:courseId/gradebook')
    async getCourseGradebook(@Param('courseId') courseId: string) {
        const data = await this.openEdxService.getCourseGradebook(courseId);
        return { data };
    }

    /* ================= COURSE GRADES ================= */

    @Get('courses/:courseId/grades')
    async getCourseGrades(@Param('courseId') courseId: string) {
        const data = await this.openEdxService.getCourseGrades(courseId);
        return { data };
    }

    /* ================= RAW TOKEN ================= */

    @Get('token')
    async getToken(): Promise<{ access_token: string }> {
        return this.openEdxService.getRawToken();
    }
}
