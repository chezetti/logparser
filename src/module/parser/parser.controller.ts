import {
  BadRequestException,
  Body,
  Controller,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiCreatedResponse, ApiOkResponse, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ParsedLogDto } from './dto/parsed-log.dto';
import { ParserService } from './parser.service';

@ApiTags('parser')
@Controller('parser')
export class ParserController {
  constructor(private readonly parserService: ParserService) {}

  @Post('/:regex')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @ApiBody({
    description: 'Parse log files',
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
  @ApiCreatedResponse({ type: ParsedLogDto })
  parseLog(@UploadedFile() file: Express.Multer.File, @Param('regex') regex: string): ParsedLogDto {
    if (!file) {
      throw new BadRequestException('No file provided to parse');
    }

    if (regex !== ' ' || !new RegExp(regex)) {
      throw new BadRequestException('Wrong regex');
    }

    return this.parserService.parseLog(file, regex);
  }
}
