import { BadRequestException, Injectable } from '@nestjs/common';
import { decode } from 'iconv-lite';

import { TRANSPORT_LOG_REGEX } from 'src/config/regex.config';
import { ParserDto } from './dto/parser.dto';
import { logLevelEnum } from './enums/log-level.enum';
import { ILevelInfo } from './interfaces/level-info.interface';
import { ILogLevelExpectation } from './interfaces/log-level-expectation.interface';
import { IOccuranceFrequency, ITransportLogOccuranceFrequency } from './interfaces/occurance-frequency.interface';

@Injectable()
export class ParserService {
  getLogInfo(file: Express.Multer.File): ParserDto {
    if (!file) {
      throw new BadRequestException('No file provided to parse');
    }

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

    const logLevelExpectations = this.calculateLogLevelExpectation(occuranceFrequency.levelCountsByTimestamp);

    if (levelInfo.infoCount + levelInfo.errorCount + levelInfo.warnCount === 0) {
      throw new BadRequestException('Log file can not be parsed');
    }

    return { levelInfo, occuranceFrequency, logLevelExpectations };
  }

  calculateLogLevelExpectation(levelCountsByTimestamp: IOccuranceFrequency): ILogLevelExpectation {
    let totalLogCount = 0;
    for (const level in levelCountsByTimestamp) {
      totalLogCount += Object.values(levelCountsByTimestamp[level]).reduce(
        (previousCount, nextCount) => previousCount + nextCount,
        0
      );
    }

    const logLevelExpectations: ILogLevelExpectation = {};

    for (const level in levelCountsByTimestamp) {
      const logLevelProbability =
        Object.values(levelCountsByTimestamp[level]).reduce(
          (previousCount, nextCount) => previousCount + nextCount,
          0
        ) / totalLogCount;
      logLevelExpectations[level] = logLevelProbability;
    }

    return logLevelExpectations;
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
