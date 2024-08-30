import { Body, Controller, Post, Res, Get, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { Response } from 'express';
import { Public } from '../utils/publicRoutes';
import { AuthService } from './service';
import { LoginUserDto, RegisterUserDto } from './types';
import { INTERNAL_SERVER_ERROR_MESSAGE } from 'src/utils/constants';

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
    } catch (e) {
      console.log(e);
      if (e?.message?.startsWith("Error: ")) {
        throw new BadRequestException(e?.message);
      } else {
        throw new InternalServerErrorException(INTERNAL_SERVER_ERROR_MESSAGE);
      }
    }
  }

  @Public()
  @Post('login')
  async login(
    @Body() loginUserDto: LoginUserDto,
    @Res({ passthrough: true }) res?: Response,
  ) {
    try {
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
    } catch (e) {
      console.log(e);
      if (e?.message?.startsWith("Error: ")) {
        throw new BadRequestException(e?.message);
      } else {
        throw new InternalServerErrorException(INTERNAL_SERVER_ERROR_MESSAGE);
      }
    }
    
  }

  @Get('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    try {
      res.clearCookie('tokens');
      return {
        data: null,
        message: "Logged successfully",
        success: true,
        statusCode: 200,
      };
    } catch (e) {
      console.log(e);
      if (e?.message?.startsWith("Error: ")) {
        throw new BadRequestException(e?.message);
      } else {
        throw new InternalServerErrorException(INTERNAL_SERVER_ERROR_MESSAGE);
      }
    }
  }
}
