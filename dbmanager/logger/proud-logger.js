const { Format } = require('logform');
const {format, createLogger, transports} = require('winston');
const{timestamp, combine,errors,json,prettyPrint} = format;


function buildProdLogger(){

    
    return createLogger({
    
        format: combine(
            timestamp(),
            json(),
            prettyPrint()          ),
        defaultMeta: { service: 'user-service' },
        transports: [
            new transports.File({ filename: 'logs.log' })
          ],
          
      });
}


  module.exports = buildProdLogger;