import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import { IJwtUtilityService } from './type/jwt-utility.service.interface';
import { JwtUtilityException } from './jwt-utility.exception';

@Injectable()
export class JwtUtilityService implements IJwtUtilityService.Base {
  private readonly ACCESS_TOKEN_SECRET_KEY = this.configService.getOrThrow<string>('JWT_ACCESS_TOKEN_SECRET_KEY');

  private readonly ACCESS_TOKEN_EXPIRES_IN = this.configService.getOrThrow<string>('JWT_ACCESS_TOKEN_EXPIRES_IN');

  private readonly REFRESH_TOKEN_SECRET_KEY = this.configService.getOrThrow<string>('JWT_REFRESH_TOKEN_SECRET_KEY');

  private readonly REFRESH_TOKEN_EXPIRES_IN = this.configService.getOrThrow<string>('JWT_REFRESH_TOKEN_EXPIRES_IN');

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  generateAccessToken(payload: IJwtUtilityService.TokenPayload): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.ACCESS_TOKEN_SECRET_KEY,
      expiresIn: this.ACCESS_TOKEN_EXPIRES_IN,
    });
  }

  generateRefreshToken(payload: IJwtUtilityService.TokenPayload): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.REFRESH_TOKEN_SECRET_KEY,
      expiresIn: this.REFRESH_TOKEN_EXPIRES_IN,
    });
  }

  async validateAccessToken(token: string): Promise<IJwtUtilityService.TokenPayload> {
    try {
      return await this.jwtService.verifyAsync(token, {
        secret: this.ACCESS_TOKEN_SECRET_KEY,
      });
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new JwtUtilityException('TokenExpiredError', error);
      }
      throw new JwtUtilityException('validateFailAccessToken', error);
    }
  }

  async validateRefreshToken(token: string): Promise<IJwtUtilityService.TokenPayload> {
    try {
      return await this.jwtService.verifyAsync(token, {
        secret: this.REFRESH_TOKEN_SECRET_KEY,
      });
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new JwtUtilityException('TokenExpiredError', error);
      }
      throw new JwtUtilityException('validateFailRefreshToken', error);
    }
  }
}
