import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { AuthTokenDto, RegisterUserDto, UserAuthDto } from './types';
import { LoginUserDto } from './types';
import { UsersService } from '../users/service';
import { LOGIN_ERROR_MESSAGE } from 'src/utils/constants';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private readonly userService: UsersService,
  ) {}

  async signToken(tokenParams: UserAuthDto, secret: string): Promise<string> {
    const { email, name, _id, expiry } = tokenParams;
    const token = await this.jwtService.signAsync(
      {
        email,
        name,
        _id,
      },
      { expiresIn: expiry, secret },
    );
    return token;
  }

  async generateTokens(userDetails: AuthTokenDto): Promise<{access_token: string, refresh_token: string}> {
    const access_token = await this.signToken({
      ...userDetails,
      expiry: process.env.ACCESS_TOKEN_EXPIRY,
    }, process.env.ACCESS_TOKEN_SECRET);
    const refresh_token = await this.signToken({
      ...userDetails,
      expiry: process.env.REFRESH_TOKEN_EXPIRY,
    }, process.env.REFRESH_TOKEN_SECRET);
    return {access_token, refresh_token}
  }

  async login(
    loginUserDto: LoginUserDto,
  ): Promise<AuthTokenDto> {
    const { email, password } = loginUserDto;
    const user = await this.userService.findByEmail(email);
    if (!user) {
      console.log('User does not exist');
      throw new UnauthorizedException(LOGIN_ERROR_MESSAGE);
    }
    if (user.banned) {
      console.log('Banned user');
      throw new UnauthorizedException(LOGIN_ERROR_MESSAGE);
    }
    const isValidPassword = await bcrypt.compare(password, user?.password);
    if (!isValidPassword) {
      console.log('Wrong password');
      throw new UnauthorizedException(LOGIN_ERROR_MESSAGE);
    }
    return {
      name: user?.name,
      email: user?.email,
      _id: user?._id,
      banned: user.banned,
      role: user.role,
    };
  }

  async register(
    RegisterUserDto: RegisterUserDto,
  ): Promise<AuthTokenDto> {
    const { name, email, password } = RegisterUserDto;
    const existingUser = await this.userService.findByEmail(email);
    if (existingUser) {
      throw new BadRequestException('User exists');
    }
    const userDetails = await this.userService.create({
      name,
      email,
      password,
      role: 'user',
    });
    return {
      name: userDetails.name,
      email: userDetails.email,
      _id: userDetails._id,
      banned: userDetails.banned,
      role: userDetails.role,
    };
  }
}
