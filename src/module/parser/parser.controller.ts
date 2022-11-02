import { Controller, Get, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes } from '@nestjs/swagger';
import { ParserDto } from './interfaces/parser.dto';
import { ParserService } from './parser.service';

@Controller('parser')
export class ParserController {
  constructor(private readonly parserService: ParserService) {}

  @Get()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async getLogInfo(@UploadedFile() file: Express.Multer.File): Promise<ParserDto> {
    return await this.parserService.getLogInfo(file);
  }
}
