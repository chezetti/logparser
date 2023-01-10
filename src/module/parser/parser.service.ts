import { BadRequestException, Injectable } from '@nestjs/common';
import { decode } from 'iconv-lite';

import { TRANSPORT_LOG_REGEX } from 'src/config/regex.config';
import { ParsedLogDto } from './dto/parsed-log.dto';
import { ILogLevelExpectation, ILogLevelInfo } from './interfaces/log-level.interface';
import { IOccuranceFrequency, ITransportLogOccuranceFrequency } from './interfaces/occurance-frequency.interface';

@Injectable()
export class ParserService {
  parseLog(file: Express.Multer.File, regex?: string): ParsedLogDto {
    const transportRegex = regex !== ' ' ? new RegExp(regex) : TRANSPORT_LOG_REGEX;

    const occuranceFrequency: ITransportLogOccuranceFrequency = this.findOccuranceFrequencyOfTransportLogs(
      decode(file.buffer, 'windows1251'),
      transportRegex
    );

    const logLevelInfo = this.countLogLevels(occuranceFrequency.levelCountsByTimestamp);

    const logLevelExpectation = this.calculateLogLevelExpectation(
      occuranceFrequency.levelCountsByTimestamp,
      logLevelInfo.TOTAL
    );

    if (logLevelInfo.TOTAL === 0) {
      throw new BadRequestException('Log file can not be parsed');
    }

    return { logLevelInfo, occuranceFrequency, logLevelExpectation };
  }

  findOccuranceFrequencyOfTransportLogs(
    transportLogs: string,
    transportRegex: RegExp
  ): ITransportLogOccuranceFrequency {
    let occuranceFrequency: ITransportLogOccuranceFrequency = {
      levelCountsByTimestamp: {},
      classNameCountsByTimestamp: {},
      messageCountsByTimestamp: {},
    };

    for (const line of transportLogs.match(/.+/g)) {
      const transportLogMatch = transportRegex.exec(line);

      if (transportLogMatch) {
        const [, timestamp, level, className, message] = transportLogMatch;
        const logDate = timestamp.replace(',', '.');

        occuranceFrequency.levelCountsByTimestamp = this.findOccuranceFrequencyOfLogGroup(
          logDate,
          level,
          occuranceFrequency.levelCountsByTimestamp
        );
        occuranceFrequency.classNameCountsByTimestamp = this.findOccuranceFrequencyOfLogGroup(
          logDate,
          className,
          occuranceFrequency.classNameCountsByTimestamp
        );
        occuranceFrequency.messageCountsByTimestamp = this.findOccuranceFrequencyOfLogGroup(
          logDate,
          message,
          occuranceFrequency.messageCountsByTimestamp
        );
      }
    }

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

  countLogLevels(levelCountsByTimestamp: IOccuranceFrequency): ILogLevelInfo {
    const logLevelInfo: ILogLevelInfo = { ERROR: 0, INFO: 0, WARN: 0, TOTAL: 0 };

    for (const level in levelCountsByTimestamp) {
      const logLevelCount = Object.values(levelCountsByTimestamp[level]).reduce(
        (previousCount, nextCount) => previousCount + nextCount,
        0
      );

      logLevelInfo[level] = logLevelCount;
    }

    logLevelInfo['TOTAL'] = Object.values(logLevelInfo).reduce(
      (previousCount, nextCount) => previousCount + nextCount,
      0
    );

    return logLevelInfo;
  }

  calculateLogLevelExpectation(
    levelCountsByTimestamp: IOccuranceFrequency,
    totalLogCount: number
  ): ILogLevelExpectation {
    const logLevelExpectations: ILogLevelExpectation = { ERROR: 0, INFO: 0, WARN: 0 };

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
}
