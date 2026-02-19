import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
    /**
     * Since we are using JWT-based auth (stateless),
     * logout is handled client-side by deleting the token.
     * Backend simply returns success.
     */
    async logout() {
        return {
            ok: true,
            message: 'Logged out successfully',
        };
    }
}
