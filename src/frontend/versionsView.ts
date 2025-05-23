import * as vscode from 'vscode';
import * as path from 'path';
import { VersionManager } from '../backend/versionManager';
import { Version } from '../backend/types';

class VersionTreeItem extends vscode.TreeItem {
    constructor(
        public readonly version: Version,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState
    ) {
        super(version.id, collapsibleState);
        this.tooltip = `${version.description || 'No description'} (${new Date(version.timestamp).toLocaleString()})`;
        this.description = version.description || new Date(version.timestamp).toLocaleString();
        this.contextValue = 'version';
        
        // Use different icons based on version status (current, older, etc.)
        this.iconPath = new vscode.ThemeIcon('history');
    }
}

class FileTreeItem extends vscode.TreeItem {
    constructor(
        public readonly filePath: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState
    ) {
        super(path.basename(filePath), collapsibleState);
        this.tooltip = filePath;
        this.contextValue = 'file';
        this.iconPath = new vscode.ThemeIcon('file');
    }
}

export class VersionsView implements vscode.TreeDataProvider<vscode.TreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<vscode.TreeItem | undefined | null | void> = new vscode.EventEmitter<vscode.TreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<vscode.TreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

    constructor(private versionManager: VersionManager) {
        // Register the tree data provider
        vscode.window.registerTreeDataProvider('verskeepVersionsView', this);
        
        // Register commands related to the tree view
        vscode.commands.registerCommand('verskeep.treeView.loadVersion', (item: VersionTreeItem) => {
            if (item.version) {
                versionManager.loadVersion(item.version.filePath, item.version.id);
            }
        });
        
        vscode.commands.registerCommand('verskeep.treeView.deleteVersion', (item: VersionTreeItem) => {
            if (item.version) {
                vscode.window.showWarningMessage(
                    `Are you sure you want to delete version ${item.version.id}?`,
                    { modal: true },
                    'Delete'
                ).then(confirmed => {
                    if (confirmed === 'Delete') {
                        versionManager.deleteVersion(item.version.filePath, item.version.id)
                            .then(success => {
                                if (success) {
                                    this.refresh();
                                }
                            });
                    }
                });
            }
        });
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
        return element;
    }

    async getChildren(element?: vscode.TreeItem): Promise<vscode.TreeItem[]> {
        if (!element) {
            // Root level: show files with versions
            const activeEditor = vscode.window.activeTextEditor;
            if (!activeEditor) {
                return [new vscode.TreeItem('No active file', vscode.TreeItemCollapsibleState.None)];
            }
            
            const filePath = activeEditor.document.uri.fsPath;
            return [new FileTreeItem(filePath, vscode.TreeItemCollapsibleState.Expanded)];
        } else if (element instanceof FileTreeItem) {
            // File level: show versions
            const versions = this.versionManager.getVersions(element.filePath);
            
            if (versions.length === 0) {
                return [new vscode.TreeItem('No versions saved', vscode.TreeItemCollapsibleState.None)];
            }
            
            return versions.map(version => new VersionTreeItem(version, vscode.TreeItemCollapsibleState.None));
        }
        
        return [];
    }
}
