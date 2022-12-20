import { Injectable } from '@nestjs/common';
import { decode } from 'iconv-lite';

import { ParserDto } from './dto/parser.dto';

@Injectable()
export class ParserService {
  ERROR = 'ERROR';
  INFO = 'INFO';
  WARN = 'WARN';
  REGEX = new RegExp(/^\s*(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3})\s+(\w+)\s+(.+?)\s+-\s+(.+?)\s*$/, 'u');

  getLogInfo(file: Express.Multer.File): ParserDto {
    let errorCount: number = 0,
      infoCount: number = 0,
      warnCount: number = 0;

    const contents = decode(file.buffer, 'windows1251');

    let levelCountsByTimestamp: Record<string, Record<string, number>> = {};
    let classNameCountsByTimestamp: Record<string, Record<string, number>> = {};
    let messageCountsByTimestamp: Record<string, Record<string, number>> = {};

    for (const line of contents.split('\n')) {
      const match = this.REGEX.exec(line);

      if (match) {
        const [, timestamp, level, className, message] = match;

        const countLevelsResult = this.countLevels(level, errorCount, infoCount, warnCount);
        errorCount = countLevelsResult.errorCount;
        infoCount = countLevelsResult.infoCount;
        warnCount = countLevelsResult.warnCount;

        levelCountsByTimestamp = this.findOccuranceFrequencyOfLogGroup(timestamp, level, levelCountsByTimestamp);
        classNameCountsByTimestamp = this.findOccuranceFrequencyOfLogGroup(
          timestamp,
          className,
          classNameCountsByTimestamp
        );
        messageCountsByTimestamp = this.findOccuranceFrequencyOfLogGroup(timestamp, message, messageCountsByTimestamp);
      }
    }

    console.log(levelCountsByTimestamp);

    return { errorCount, infoCount, warnCount };
  }

  findOccuranceFrequencyOfLogGroup(
    timestamp: string,
    logGroup: string,
    logGroupCountsByTimestamp: Record<string, Record<string, number>>
  ): Record<string, Record<string, number>> {
    if (!(logGroup in logGroupCountsByTimestamp)) {
      logGroupCountsByTimestamp[logGroup] = {};
    }

    if (timestamp in logGroupCountsByTimestamp[logGroup]) {
      logGroupCountsByTimestamp[logGroup][timestamp] += 1;
    } else {
      logGroupCountsByTimestamp[logGroup][timestamp] = 1;
    }

    return logGroupCountsByTimestamp;
  }

  countLevels(
    level: string,
    errorCount: number,
    infoCount: number,
    warnCount: number
  ): { errorCount: number; infoCount: number; warnCount: number } {
    if (this.isError(level)) {
      errorCount++;
    } else if (this.isInfo(level)) {
      infoCount++;
    } else if (this.isWarn(level)) {
      warnCount++;
    }

    return { errorCount, infoCount, warnCount };
  }

  isError(level: string): boolean {
    return level === this.INFO;
  }

  isInfo(level: string): boolean {
    return level === this.ERROR;
  }

  isWarn(level: string): boolean {
    return level === this.WARN;
  }
}
