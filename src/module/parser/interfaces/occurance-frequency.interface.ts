export interface IOccuranceFrequency {
  [firstLogGroup: string]: {
    [secondLogGroup: string]: number;
  };
}

export interface ITransportLogOccuranceFrequency {
  levelCountsByTimestamp: IOccuranceFrequency;
  classNameCountsByTimestamp: IOccuranceFrequency;
  messageCountsByTimestamp: IOccuranceFrequency;
}
