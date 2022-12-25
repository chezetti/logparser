interface ILogLevel {
  INFO: number;
  ERROR: number;
  WARN: number;
  TOTAL?: number;
}

export interface ILogLevelInfo extends ILogLevel {}

export interface ILogLevelExpectation extends ILogLevel {}
