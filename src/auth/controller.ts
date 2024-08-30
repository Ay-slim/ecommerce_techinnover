import { Body, Controller, Post, Res, Get } from '@nestjs/common';
import { Response } from 'express';
import { Public } from '../utils/publicRoutes';
import { AuthService } from './service';
import { LoginUserDto, RegisterUserDto } from './types';
import { failureResponse, successResponse } from 'src/utils/formatResponses';
import { z } from 'zod';
import { zodRequestValidation } from 'src/utils/zodValidation';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(
    @Body() createUserDto: RegisterUserDto,
    @Res({ passthrough: true }) res?: Response,
  ) {
    try {
      const {
        name,
        email,
        password
      } = createUserDto;
      const validator = z.object({
        name: z.string(),
        email: z.string(),
        password: z.string(),
      });
      zodRequestValidation(validator, createUserDto);
      const userDetails = await this.authService.register({
        name,
        email,
        password,
      });
      const {access_token, refresh_token} = await this.authService.generateTokens(userDetails);
      res?.cookie('tokens', {
        access_token,
        refresh_token,
      });
      return successResponse(userDetails, "User created", 201, true);
    } catch (e) {
      failureResponse(e);
    }
  }

  @Public()
  @Post('login')
  async login(
    @Body() loginUserDto: LoginUserDto,
    @Res({ passthrough: true }) res?: Response,
  ) {
    try {
      const validator = z.object({
        email: z.string(),
        password: z.string(),
      });
      zodRequestValidation(validator, loginUserDto);
      const userDetails = await this.authService.login(loginUserDto);
      const {access_token, refresh_token} = await this.authService.generateTokens(userDetails);
      res?.cookie('tokens', {
        access_token,
        refresh_token,
      });
      return successResponse(userDetails, "Logged in", 201, true)
    } catch (e) {
      failureResponse(e);
    }
    
  }

  @Get('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    try {
      res.clearCookie('tokens');
      return successResponse(null, "Logged out", 200, true);
    } catch (e) {
      failureResponse(e);
    }
  }
}
