import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  async logout() {
    return {
      ok: true,
      message: 'Logged out successfully',
    };
  }
}
