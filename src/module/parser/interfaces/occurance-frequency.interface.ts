export interface IOccuranceFrequency {
  [level: string]: {
    [date: string]: number;
  };
}

export interface ITransportLogOccuranceFrequency {
  levelCountsByTimestamp: IOccuranceFrequency;
  classNameCountsByTimestamp: IOccuranceFrequency;
  messageCountsByTimestamp: IOccuranceFrequency;
}
