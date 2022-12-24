import { BadRequestException, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { ParsedLogDto } from './dto/parser.dto';
import { ParserService } from './parser.service';

@ApiTags('parser')
@Controller('parser')
export class ParserController {
  constructor(private readonly parserService: ParserService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  parseLog(@UploadedFile() file: Express.Multer.File): ParsedLogDto {
    if (!file) {
      throw new BadRequestException('No file provided to parse');
    }

    return this.parserService.parseLog(file);
  }
}
