import { Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';

@Controller('auth')
export class AuthController {

    @Post('logout')
    @HttpCode(HttpStatus.OK)
    logout() {
        return {
            message: 'Logged out successfully',
        };
    }
}
