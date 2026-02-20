import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    CoursesApiResponse,
    CourseDetailResponse,
    GradebookResponse,
    CourseGradesResponse,
} from './types';

@Injectable()
export class OpenEdxService {
    private accessToken: string | null = null;
    private tokenExpiresAt: number | null = null;

    constructor(private readonly configService: ConfigService) { }

    /* =====================================================
       TOKEN MANAGEMENT (WITH CACHING)
    ===================================================== */

    private async getAccessToken(): Promise<string> {
        const now = Date.now();

        // Reuse token if still valid
        if (this.accessToken && this.tokenExpiresAt && now < this.tokenExpiresAt) {
            return this.accessToken;
        }

        const clientId = this.configService.get<string>('OPEN_EDX_CLIENT_ID');
        const clientSecret =
            this.configService.get<string>('OPEN_EDX_CLIENT_SECRET');
        const lmsUrl = this.configService.get<string>('OPEN_EDX_LMS_URL');

        if (!clientId || !clientSecret || !lmsUrl) {
            throw new InternalServerErrorException(
                'Open edX environment variables not configured properly',
            );
        }

        const credential = `${clientId}:${clientSecret}`;
        const encodedCredential = Buffer.from(credential, 'utf-8').toString(
            'base64',
        );

        const response = await fetch(`${lmsUrl}/oauth2/access_token`, {
            method: 'POST',
            headers: {
                Authorization: `Basic ${encodedCredential}`,
                'Cache-Control': 'no-cache',
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'client_credentials',
                token_type: 'jwt',
            }).toString(),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new InternalServerErrorException(
                `Failed to fetch Open edX token: ${errorText}`,
            );
        }

        const tokenResponse = await response.json();

        const accessToken = tokenResponse.access_token;
        const expiresIn = tokenResponse.expires_in ?? 3600;

        if (!accessToken) {
            throw new InternalServerErrorException('No access token received');
        }

        // Cache token
        this.accessToken = accessToken;

        // Expire slightly early (30 sec buffer)
        this.tokenExpiresAt = now + (expiresIn - 30) * 1000;

        return accessToken;
    }

    /* =====================================================
       GENERIC API CALL HELPER
    ===================================================== */

    private async callOpenEdxApi<T>(path: string): Promise<T> {
        const lmsUrl = this.configService.get<string>('OPEN_EDX_LMS_URL');

        if (!lmsUrl) {
            throw new InternalServerErrorException(
                'OPEN_EDX_LMS_URL not configured',
            );
        }

        const token = await this.getAccessToken();

        const response = await fetch(`${lmsUrl}${path}`, {
            method: 'GET',
            headers: {
                Authorization: `JWT ${token}`,
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new InternalServerErrorException(
                `Open edX API error: ${errorText}`,
            );
        }

        return response.json() as Promise<T>;
    }

    /* =====================================================
       PUBLIC METHODS
    ===================================================== */

    async getCourses(): Promise<CoursesApiResponse> {
        return this.callOpenEdxApi<CoursesApiResponse>(
            '/api/courses/v1/courses/',
        );
    }

    async getCourseDetails(
        courseId: string,
    ): Promise<CourseDetailResponse> {
        return this.callOpenEdxApi<CourseDetailResponse>(
            `/api/courseware/course/${courseId}`,
        );
    }

    async getCourseGradebook(
        courseId: string,
    ): Promise<GradebookResponse> {
        return this.callOpenEdxApi<GradebookResponse>(
            `/api/grades/v1/gradebook/${courseId}/`,
        );
    }

    async getCourseGrades(
        courseId: string,
    ): Promise<CourseGradesResponse> {
        return this.callOpenEdxApi<CourseGradesResponse>(
            `/api/grades/v1/courses/${courseId}/`,
        );
    }

    /* =====================================================
       RAW TOKEN (MATCHING SENIOR NEXTJS ENDPOINT)
    ===================================================== */

    async getRawToken(): Promise<{ access_token: string }> {
        const token = await this.getAccessToken();
        return { access_token: token };
    }
}