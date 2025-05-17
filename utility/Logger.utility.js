const winston = require("winston")
const crypto = require("crypto")
function logger(level, message,label){
      const logs_directory = './logs/'
      
      const log = winston.createLogger({
            level: level,
            format: winston.format.json(),
            transports:[
                  new winston.transports.File({filename:`${logs_directory+level}.log`, level: `${level}`}),
                  new winston.transports.File({filename:logs_directory+'combined.log', level:level,}),
                  new winston.transports.File({filename:`${logs_directory+label}.log`, level:'severe'})
            ],
            exceptionHandlers:[
                  // exception handlers
                  new winston.transports.File({filename:logs_directory+'exceptions.log', })
            ],
            rejectionHandlers:[
                  // rejections handlers
                  new winston.transports.File({filename: logs_directory+'rejections.log'})
            ]

      })
      log.log({level,message,label,logId:crypto.randomUUID(),timestamp: new Date().toUTCString(),})
      log.exitOnError = false
      return log
}

if (process.env.NODE_ENV !=='production'){
      winston.add(new winston.transports.Console({
            format: winston.format.simple()
      }))
}

module.exports = {logger}