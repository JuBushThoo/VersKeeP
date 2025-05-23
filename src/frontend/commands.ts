import * as vscode from 'vscode';
import { VersionManager } from '../backend/versionManager';
import { VersionsView } from './versionsView';

export class CommandHandler {
    constructor(
        private readonly versionManager: VersionManager,
        private readonly versionsView: VersionsView
    ) {}

    /**
     * Register all commands for the extension
     */
    public registerCommands(context: vscode.ExtensionContext): void {
        // Register all commands here
        const commands = [
            vscode.commands.registerCommand('verskeep.saveVersion', this.saveVersion.bind(this)),
            vscode.commands.registerCommand('verskeep.loadVersion', this.loadVersion.bind(this)),
            vscode.commands.registerCommand('verskeep.deleteVersion', this.deleteVersion.bind(this)),
            vscode.commands.registerCommand('verskeep.viewVersions', this.viewVersions.bind(this))
        ];

        // Add commands to subscriptions
        context.subscriptions.push(...commands);
    }

    /**
     * Save a new version of the current file
     */
    private async saveVersion(): Promise<void> {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active file to save version for');
            return;
        }

        const description = await vscode.window.showInputBox({
            prompt: 'Enter a description for this version (optional)',
            placeHolder: 'e.g. Added new feature'
        });

        const filePath = editor.document.uri.fsPath;
        const result = await this.versionManager.saveVersion(filePath, description);
        
        if (result) {
            vscode.window.showInformationMessage(`Version ${result.id} saved successfully`);
            this.versionsView.refresh();
        }
    }

    /**
     * Load a version of the current file
     */
    private async loadVersion(): Promise<void> {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active file to load version for');
            return;
        }

        const filePath = editor.document.uri.fsPath;
        const versions = this.versionManager.getVersions(filePath);
        
        if (versions.length === 0) {
            vscode.window.showInformationMessage('No saved versions found for this file');
            return;
        }

        const items = versions.map(version => ({
            label: `${version.id} - ${new Date(version.timestamp).toLocaleString()}`,
            description: version.description || '',
            version: version
        }));

        const selectedItem = await vscode.window.showQuickPick(items, {
            placeHolder: 'Select a version to load'
        });

        if (selectedItem) {
            const success = await this.versionManager.loadVersion(filePath, selectedItem.version.id);
            if (success) {
                vscode.window.showInformationMessage(`Version ${selectedItem.version.id} loaded successfully`);
            }
        }
    }

    /**
     * Delete a version of the current file
     */
    private async deleteVersion(): Promise<void> {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active file to delete version for');
            return;
        }

        const filePath = editor.document.uri.fsPath;
        const versions = this.versionManager.getVersions(filePath);
        
        if (versions.length === 0) {
            vscode.window.showInformationMessage('No saved versions found for this file');
            return;
        }

        const items = versions.map(version => ({
            label: `${version.id} - ${new Date(version.timestamp).toLocaleString()}`,
            description: version.description || '',
            version: version
        }));

        const selectedItem = await vscode.window.showQuickPick(items, {
            placeHolder: 'Select a version to delete'
        });

        if (selectedItem) {
            const confirmed = await vscode.window.showWarningMessage(
                `Are you sure you want to delete version ${selectedItem.version.id}?`,
                { modal: true },
                'Delete'
            );

            if (confirmed === 'Delete') {
                const success = await this.versionManager.deleteVersion(filePath, selectedItem.version.id);
                if (success) {
                    vscode.window.showInformationMessage(`Version ${selectedItem.version.id} deleted successfully`);
                    this.versionsView.refresh();
                }
            }
        }
    }

    /**
     * View all versions of the current file
     */
    private viewVersions(): void {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active file to view versions for');
            return;
        }

        // Focus the versions view
        vscode.commands.executeCommand('workbench.view.explorer');
        vscode.commands.executeCommand('verskeepVersionsView.focus');
    }
}
