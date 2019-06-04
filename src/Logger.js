const { Signale } = require('signale');

const customLoggers = {
  types: {
    error: {
      badge: '😯',
      label: 'Error',
      color: 'red'
    },
    success: {
      badge: '🤙',
      label: 'Success',
      color: 'green'
    },
    info: {
      badge: '🤓',
      label: 'Info',
      color: 'blue'
    },
    setup: {
      badge: '📝',
      label: 'Setup',
      color: 'yellow'
    },
    registry: {
      badge: '📂',
      label: 'Registry',
      color: 'magenta'
    },
    finish: {
      badge: '🎊',
      label: 'Finished',
      color: 'blueBright'
    }
  }
};

class Logger {
  constructor(customLoggers) {
    this.logger = new Signale(customLoggers);
  }

  async printError(text) {
    return this.logger.error(text);
  }

  async printSuccess(text) {
    return this.logger.success(text);
  }

  async printInfo(text) {
    return this.logger.info(text);
  }

  async printSetupConfigFile(text) {
    return this.logger.setup(text);
  }

  async printRegistryFolder(text) {
    return this.logger.registry(text);
  }

  async printSetupTerminated(text) {
    return this.logger.finish(text);
  }
}

module.exports = new Logger(customLoggers);
