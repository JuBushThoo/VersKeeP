import * as vscode from 'vscode';
import { VersionManager } from './backend/versionManager';
import { VersionsView } from './frontend/versionsView';
import { CommandHandler } from './frontend/commands';
import { logger } from './utils/logger';

export function activate(context: vscode.ExtensionContext) {
    logger.info('VersKeeP extension is now active!');

    // Initialize the version manager
    const versionManager = new VersionManager();
    
    // Initialize the versions view
    const versionsView = new VersionsView(versionManager);

    // Initialize and register commands
    const commandHandler = new CommandHandler(versionManager, versionsView);
    commandHandler.registerCommands(context);

    logger.info('VersKeeP extension initialized successfully');
}

export function deactivate() {
    logger.info('VersKeeP extension deactivated');
} 