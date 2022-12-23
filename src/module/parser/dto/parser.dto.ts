import { ILevelInfo } from '../interfaces/level-info.interface';
import { ITransportLogOccuranceFrequency } from '../interfaces/occurance-frequency.interface';

export interface ParserDto {
  levelInfo: ILevelInfo;
  occuranceFrequency: ITransportLogOccuranceFrequency;
}
