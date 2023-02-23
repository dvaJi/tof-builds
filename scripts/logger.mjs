import chalk from 'chalk';

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

const currentLogLevel = process.env.LOG_LEVEL || 'INFO';

function log(level, ...messages) {
  if (LOG_LEVELS[level] >= LOG_LEVELS[currentLogLevel]) {
    let message = messages
      .map((message) => {
        if (typeof message === 'string') {
          return message;
        } else {
          return JSON.stringify(message);
        }
      })
      .join(' ');

    switch (level) {
      case 'DEBUG':
        console.debug(chalk.gray(`[${level}] ${message}`));
        break;
      case 'INFO':
        console.log(chalk.cyan(`[${level}] ${message}`));
        break;
      case 'WARN':
        console.warn(chalk.yellow(`[${level}] ${message}`));
        break;
      case 'ERROR':
        console.error(chalk.red(`[${level}] ${message}`));
        break;
      default:
        console.log(`[${level}] ${message}`);
        break;
    }
  }
}

export const logger = {
  debug: (...messages) => log('DEBUG', messages),
  info: (...messages) => log('INFO', messages),
  warn: (...messages) => log('WARN', messages),
  error: (...messages) => log('ERROR', messages),
};
