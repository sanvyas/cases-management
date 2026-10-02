import { Controller, Post, Get, Body, Headers, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() body: { phone: string }) {
    return this.authService.sendOtp(body.phone);
  }

  @Post('verify')
  verify(@Body() body: { phone: string; otp: string }) {
    return this.authService.verifyOtp(body.phone, body.otp);
  }

  @Get('me')
  me(@Headers('authorization') auth?: string) {
    const token = auth?.replace('Bearer ', '');
    if (!token) throw new UnauthorizedException('No token provided');
    return this.authService.getMe(token);
  }

  @Post('refresh')
  refresh(@Body() body: { refreshToken: string }) {
    return this.authService.refresh(body.refreshToken);
  }

  @Post('logout')
  logout(@Headers('authorization') auth?: string) {
    const token = auth?.replace('Bearer ', '');
    if (token) this.authService.logout(token);
    return { message: 'Logged out' };
  }
}
