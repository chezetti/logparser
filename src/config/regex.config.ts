export const TRANSPORT_LOG_REGEX = new RegExp(
  /^\s*(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3})\s+(\w+)\s+(.+?)\s+-\s+(.+?)\s*$/,
  'u'
);

export const ACCESS_LOG_REGEX = new RegExp(
  /^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\s+-\s+-\s+\[(\d{2}\/[A-Za-z]{3}\/\d{4}:\d{2}:\d{2}:\d{2}\s+\+\d{4})\]\s+"([A-Z]{3,6}\s+\/[^"]+)"\s+(\d{3})$/
);
