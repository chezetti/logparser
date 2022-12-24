interface ILogLevel {
  [level: string]: number;
}

export interface ILogLevelInfo extends ILogLevel {}

export interface ILogLevelExpectation extends ILogLevel {}
