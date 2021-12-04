function buildDevLogger(){

    const logFormat = printf(({ level, message, timestamp , stack}) => {
        return `${timestamp}  ${level}: ${message}`;
      });
    
     return createLogger({
    
        format: combine(
            format.colorize(),
            timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
            logFormat,
            prettyPrint()

          ),
          transports: [
            // - Write all logs error (and below) to `somefile.log`.
            new transports.File({ filename: 'logs.log', level: 'error' })
          ]
      });
}