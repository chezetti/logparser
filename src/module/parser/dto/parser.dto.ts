import { ILevelInfo } from '../interfaces/level-info.interface';
import { ILogLevelExpectation } from '../interfaces/log-level-expectation.interface';
import { ITransportLogOccuranceFrequency } from '../interfaces/occurance-frequency.interface';

export interface ParserDto {
  levelInfo: ILevelInfo;
  occuranceFrequency: ITransportLogOccuranceFrequency;
  logLevelExpectations: ILogLevelExpectation;
}
