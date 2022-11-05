import { Injectable } from '@nestjs/common';

import { ParserDto } from './dto/parser.dto';

@Injectable()
export class ParserService {
  ERROR = 'ERROR';
  INFO = 'INFO';

  getLogInfo(file: Express.Multer.File): ParserDto {
    let errorCount: number = 0, infoCount: number = 0;

    const contents = file.buffer.toString();
    const lines = contents.split('\n');

    for (const line of lines) {
      if (this.isError(line)) {
        errorCount++;
      } else if (this.isInfo(line)) {
        infoCount++;
      }
    }

    return { errorCount, infoCount };
  }

  isError(line: string): boolean {
    try {
      return line.toLowerCase().includes(this.ERROR.toLowerCase());
    } catch (err) {
      console.error(err);
    }
  }

  isInfo(line: string): boolean {
    try {
      return line.toLowerCase().includes(this.INFO.toLowerCase());
    } catch (err) {
      console.error(err);
    }
  }
}
