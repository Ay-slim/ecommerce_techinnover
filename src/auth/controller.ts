import { Body, Controller, Post, Res, Get } from '@nestjs/common';
import { Response } from 'express';
import { Public } from '../utils/publicRoutes';
import { AuthService } from './service';
import { LoginUserDto, RegisterUserDto } from './types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(
    @Body() createUserDto: RegisterUserDto,
    @Res({ passthrough: true }) res?: Response,
  ) {
    const {
      name,
      email,
      password
    } = createUserDto;
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
    return {
      data: userDetails,
      message: "User created successfully",
      success: true,
      statusCode: 201,
    };
  }

  @Public()
  @Post('login')
  async login(
    @Body() loginUserDto: LoginUserDto,
    @Res({ passthrough: true }) res?: Response,
  ) {
    const userDetails = await this.authService.login(loginUserDto);
    const {access_token, refresh_token} = await this.authService.generateTokens(userDetails);
    res?.cookie('tokens', {
      access_token,
      refresh_token,
    });
    return {
      data: userDetails,
      message: "Logged in successfully",
      success: true,
      statusCode: 201,
    };
    
  }

  @Get('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('tokens');
    return {
      data: null,
      message: "Logged successfully",
      success: true,
      statusCode: 200,
    };
  }
}
