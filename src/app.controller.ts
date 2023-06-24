import {Controller, Get, Param} from '@nestjs/common';
import { AppService } from './app.service';

@Controller('/proxy')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/getValue/:path')
  async getValue(@Param('path') path: string): Promise<string> {
    return this.appService.getValue(path);
  }
}
