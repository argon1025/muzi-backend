import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@Controller()
@ApiTags('- ALB Health Check')
export class HealthController {
  @Get('health')
  healthCheck() {
    return 'I am healthy!';
  }
}
