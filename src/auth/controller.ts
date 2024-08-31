import { Body, Controller, Post, Res, Get } from "@nestjs/common";
import { Response } from "express";
import { Public } from "../utils/publicRoutes";
import { AuthService } from "./service";
import { LoginUserDto, RegisterUserDto } from "./types";
import { failureResponse, successResponse } from "src/utils/formatResponses";
import { z } from "zod";
import { zodRequestValidation } from "src/utils/zodValidation";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post("register")
  @ApiOperation({
    summary: "Creates a user account",
    requestBody: {
      content: {
        "application/json": {
          schema: {
            type: "object",
            example: {
              name: "Already",
              email: "already@user.com",
              password: "ayo",
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: "Created successfully.",
    schema: {
      type: "object",
    },
    example: {
      data: {
        name: "Already",
        email: "already@user.com",
        _id: "66d24f57e6443eb007d0e18c",
        banned: false,
        role: "user",
      },
    },
  })
  @ApiResponse({ status: 403, description: "Forbidden." })
  @ApiResponse({ status: 400, description: "Error: Account already exists" })
  @ApiResponse({ status: 500, description: "Something went wrong" })
  async register(
    @Body() createUserDto: RegisterUserDto,
    @Res({ passthrough: true }) res?: Response,
  ) {
    try {
      const { name, email, password } = createUserDto;
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
      const { access_token, refresh_token } =
        await this.authService.generateTokens(userDetails);
      res?.cookie("tokens", {
        access_token,
        refresh_token,
      });
      return successResponse(userDetails, "User created", 201, true);
    } catch (e) {
      failureResponse(e);
    }
  }

  @Public()
  @Post("login")
  @ApiOperation({
    summary: "Logs a user or admin into the system",
    requestBody: {
      content: {
        "application/json": {
          schema: {
            type: "object",
            example: {
              email: "already@user.com",
              password: "ayo",
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: "Logged in.",
    schema: {
      type: "object",
    },
    example: {
      data: {
        name: "Already",
        email: "already@user.com",
        _id: "66d24f57e6443eb007d0e18c",
        banned: false,
        role: "user",
      },
    },
  })
  @ApiResponse({ status: 403, description: "Forbidden." })
  @ApiResponse({
    status: 400,
    description: "Error: Invalid username or password",
  })
  @ApiResponse({
    status: 422,
    description:
      "Unprocessable Entity. Failed because the required password field was missing",
  })
  @ApiResponse({ status: 500, description: "Something went wrong" })
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
      const { access_token, refresh_token } =
        await this.authService.generateTokens(userDetails);
      res?.cookie("tokens", {
        access_token,
        refresh_token,
      });
      return successResponse(userDetails, "Logged in", 201, true);
    } catch (e) {
      failureResponse(e);
    }
  }

  @Get("logout")
  @ApiOperation({ summary: "Logs a user or admin out of the system" })
  @ApiResponse({
    status: 200,
    description: "Logged out",
    schema: {
      type: "object",
    },
    example: {
      data: null,
      message: "Logged out",
      statusCode: 200,
      success: true,
    },
  })
  @ApiResponse({ status: 403, description: "Forbidden." })
  @ApiResponse({ status: 401, description: "Error: Access denied" })
  async logout(@Res({ passthrough: true }) res: Response) {
    try {
      res.clearCookie("tokens");
      return successResponse(null, "Logged out", 200, true);
    } catch (e) {
      failureResponse(e);
    }
  }
}
