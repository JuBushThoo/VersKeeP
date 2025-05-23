import * as vscode from 'vscode';
import { EXTENSION_NAME } from './constants';

/**
 * Log levels
 */
export enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3
}

/**
 * Logger class for extension
 */
export class Logger {
    private static instance: Logger;
    private outputChannel: vscode.OutputChannel;
    private logLevel: LogLevel = LogLevel.INFO;

    private constructor() {
        this.outputChannel = vscode.window.createOutputChannel(EXTENSION_NAME);
    }

    /**
     * Get logger instance (singleton)
     */
    public static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }

    /**
     * Set log level
     */
    public setLogLevel(level: LogLevel): void {
        this.logLevel = level;
    }

    /**
     * Log debug message
     */
    public debug(message: string, ...args: any[]): void {
        this.log(LogLevel.DEBUG, message, ...args);
    }

    /**
     * Log info message
     */
    public info(message: string, ...args: any[]): void {
        this.log(LogLevel.INFO, message, ...args);
    }

    /**
     * Log warning message
     */
    public warn(message: string, ...args: any[]): void {
        this.log(LogLevel.WARN, message, ...args);
    }

    /**
     * Log error message
     */
    public error(message: string | Error, ...args: any[]): void {
        if (message instanceof Error) {
            this.log(LogLevel.ERROR, message.message, ...args);
            if (message.stack) {
                this.log(LogLevel.ERROR, message.stack);
            }
        } else {
            this.log(LogLevel.ERROR, message, ...args);
        }
    }

    /**
     * Show output channel
     */
    public show(): void {
        this.outputChannel.show();
    }

    /**
     * Dispose output channel
     */
    public dispose(): void {
        this.outputChannel.dispose();
    }

    /**
     * Internal log method
     */
    private log(level: LogLevel, message: string, ...args: any[]): void {
        if (level < this.logLevel) {
            return;
        }

        const prefix = this.getLogLevelPrefix(level);
        const timestamp = new Date().toISOString();
        let formattedMessage = `[${timestamp}] ${prefix} ${message}`;

        // Format args if any
        if (args.length > 0) {
            args.forEach(arg => {
                if (typeof arg === 'object') {
                    formattedMessage += `\n${JSON.stringify(arg, null, 2)}`;
                } else {
                    formattedMessage += ` ${arg}`;
                }
            });
        }

        this.outputChannel.appendLine(formattedMessage);
    }

    /**
     * Get prefix for log level
     */
    private getLogLevelPrefix(level: LogLevel): string {
        switch (level) {
            case LogLevel.DEBUG:
                return '[DEBUG]';
            case LogLevel.INFO:
                return '[INFO]';
            case LogLevel.WARN:
                return '[WARN]';
            case LogLevel.ERROR:
                return '[ERROR]';
            default:
                return '';
        }
    }
}

// Export default logger instance
export const logger = Logger.getInstance();
