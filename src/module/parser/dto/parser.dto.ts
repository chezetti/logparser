import { ILogLevelExpectation, ILogLevelInfo } from '../interfaces/log-level.interface';
import { ITransportLogOccuranceFrequency } from '../interfaces/occurance-frequency.interface';

export interface ParsedLogDto {
  logLevelInfo: ILogLevelInfo;
  occuranceFrequency: ITransportLogOccuranceFrequency;
  logLevelExpectation: ILogLevelExpectation;
}
