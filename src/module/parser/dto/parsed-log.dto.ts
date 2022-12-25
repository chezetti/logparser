import { ApiProperty } from '@nestjs/swagger';
import { ILogLevelExpectation, ILogLevelInfo } from '../interfaces/log-level.interface';
import { ITransportLogOccuranceFrequency } from '../interfaces/occurance-frequency.interface';

export class ParsedLogDto {
  @ApiProperty({
    example: {
      ERROR: 53,
      INFO: 5408,
      WARN: 17,
      TOTAL: 5478,
    },
  })
  readonly logLevelInfo: ILogLevelInfo;

  @ApiProperty({
    example: {
      levelCountsByTimestamp: {
        INFO: {
          '2022-08-23 08:31:02.330': 1,
          '2022-08-23 08:31:24.422': 7,
        },
        ERROR: {
          '2022-08-23 08:31:26.594': 1,
        },
        WARN: {
          '2022-08-23 08:31:29.828': 1,
        },
      },
      classNameCountsByTimestamp: {
        'org.springframework.web.socket.config.WebSocketMessageBrokerStats': {
          '2022-08-23 08:31:02.330': 1,
        },
      },
      messageCountsByTimestamp: {
        '[Sp update] - Ошибка обновления настроек': {
          '2022-08-23 08:31:02.752': 1,
        },
      },
    },
  })
  readonly occuranceFrequency: ITransportLogOccuranceFrequency;

  @ApiProperty({
    example: {
      ERROR: 0.009675063891931361,
      INFO: 0.9872216137276378,
      WARN: 0.003103322380430814,
    },
  })
  readonly logLevelExpectation: ILogLevelExpectation;
}
