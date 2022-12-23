import { Injectable } from '@nestjs/common';
import { decode } from 'iconv-lite';

import { TRANSPORT_LOG_REGEX } from 'src/config/regex.config';
import { ParserDto } from './dto/parser.dto';
import { logLevelEnum } from './enums/log-level.enum';
import { ILevelInfo } from './interfaces/level-info.interface';
import { IOccuranceFrequency, ITransportLogOccuranceFrequency } from './interfaces/occurance-frequency.interface';

@Injectable()
export class ParserService {
  getLogInfo(file: Express.Multer.File): ParserDto {
    let levelInfo: ILevelInfo = {
      infoCount: 0,
      errorCount: 0,
      warnCount: 0,
    };

    let occuranceFrequency: ITransportLogOccuranceFrequency = {
      levelCountsByTimestamp: {},
      classNameCountsByTimestamp: {},
      messageCountsByTimestamp: {},
    };

    const contents = decode(file.buffer, 'windows1251');

    for (const line of contents.split('\n')) {
      const transportLogMatch = TRANSPORT_LOG_REGEX.exec(line);

      if (transportLogMatch) {
        levelInfo = this.countLevels(transportLogMatch, levelInfo);

        occuranceFrequency = this.findOccuranceFrequencyOfTransportLogs(transportLogMatch, occuranceFrequency);
      }
    }

    return { levelInfo, occuranceFrequency };
  }

  findOccuranceFrequencyOfTransportLogs(
    transportLogMatch: RegExpExecArray,
    occuranceFrequency: ITransportLogOccuranceFrequency
  ): ITransportLogOccuranceFrequency {
    const [, timestamp, level, className, message] = transportLogMatch;

    occuranceFrequency.levelCountsByTimestamp = this.findOccuranceFrequencyOfLogGroup(
      timestamp,
      level,
      occuranceFrequency.levelCountsByTimestamp
    );
    occuranceFrequency.classNameCountsByTimestamp = this.findOccuranceFrequencyOfLogGroup(
      timestamp,
      className,
      occuranceFrequency.classNameCountsByTimestamp
    );
    occuranceFrequency.messageCountsByTimestamp = this.findOccuranceFrequencyOfLogGroup(
      timestamp,
      message,
      occuranceFrequency.messageCountsByTimestamp
    );

    return occuranceFrequency;
  }

  findOccuranceFrequencyOfLogGroup(
    firstLogGroup: string,
    secondLogGroup: string,
    logGroupCountsBy: IOccuranceFrequency
  ): IOccuranceFrequency {
    if (!(secondLogGroup in logGroupCountsBy)) {
      logGroupCountsBy[secondLogGroup] = {};
    }

    if (firstLogGroup in logGroupCountsBy[secondLogGroup]) {
      logGroupCountsBy[secondLogGroup][firstLogGroup] += 1;
    } else {
      logGroupCountsBy[secondLogGroup][firstLogGroup] = 1;
    }

    return logGroupCountsBy;
  }

  countLevels(transportLogMatch: RegExpExecArray, levelInfo: ILevelInfo): ILevelInfo {
    const [, , level, ,] = transportLogMatch;

    if (this.isError(level)) {
      levelInfo.errorCount++;
    } else if (this.isInfo(level)) {
      levelInfo.infoCount++;
    } else if (this.isWarn(level)) {
      levelInfo.warnCount++;
    }

    return levelInfo;
  }

  isError(level: string): boolean {
    return level === logLevelEnum.ERROR;
  }

  isInfo(level: string): boolean {
    return level === logLevelEnum.INFO;
  }

  isWarn(level: string): boolean {
    return level === logLevelEnum.WARN;
  }
}
