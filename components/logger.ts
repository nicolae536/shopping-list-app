import {AsyncStorage} from 'react-native';

class Logger {
    private _activatedLoggers: {} = {};
    private _allLoggedMessages: { logMethod: string, messageBuffers: any[] }[] = [];

    log(loggingHandler: string, ...args) {
        this._logInternal('log', loggingHandler, args);
    }

    warn(loggingHandler: string, ...args) {
        this._logInternal('warn', loggingHandler, args);
    }

    error(loggingHandler: string, ...args) {
        this._logInternal('error', loggingHandler, args);
    }

    info(loggingHandler: string, ...args) {
        this._logInternal('info', loggingHandler, args);
    }

    trace(loggingHandler: string, ...args) {
        this._logInternal('trace', loggingHandler, args);
    }

    table(loggingHandler: string, ...args) {
        this._logInternal('trace', loggingHandler, args);
    }

    debug(loggingHandler: string, ...args) {
        this._logInternal('trace', loggingHandler, args);
    }

    activateLogger(loggerName: string) {
        this._activatedLoggers[loggerName] = true;
    }

    deActivateLogger(loggerName: string) {
        this._activatedLoggers[loggerName] = true;
    }

    private _logInternal(logMethod: string, loggingHandler: string, args: any[]) {
        this._allLoggedMessages.push({
            logMethod,
            messageBuffers: args
        });

        if (this._activatedLoggers[loggingHandler]) {
            console[logMethod](loggingHandler, ...args);
        }

        try {
            AsyncStorage.setItem('@Logs', JSON.stringify(this._allLoggedMessages));
        } catch (e) {

        }
    }
}

export const loggerInstance = new Logger();