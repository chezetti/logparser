import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

import { ParserDto } from './interfaces/parser.dto';

@Injectable()
export class ParserService {
  ERROR = 'ERROR';
  INFO = 'INFO';
  REGEX = /^(?!.*\R\[\d)\[([\d :.-]+)]ERROR.*?(F:\S*)(?sx).*?\b([a-zA-Z]*Exception)\b/;

  constructor() {}

  async getLogInfo(file: Express.Multer.File): Promise<ParserDto> {
    let errorCount: number, infoCount: number;

    const contents = fs.readFileSync('../../data/transport_info.log', 'utf-8');
    const lines = contents.split('\n');

    for (const line of lines) {
      if (await this.isError(line)) {
        console.log(line);
        infoCount++;
      } else if (await this.isInfo(line)) {
        errorCount++;
      }
    }

    return { errorCount, infoCount };
  }

  async isError(line: string): Promise<boolean> {
    try {
      return line.toLowerCase().includes(this.ERROR.toLowerCase());
    } catch (err) {
      console.error(err);
    }
  }

  async isInfo(line: string): Promise<boolean> {
    try {
      return line.toLowerCase().includes(this.INFO.toLowerCase());
    } catch (err) {
      console.error(err);
    }
  }
}
