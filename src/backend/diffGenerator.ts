import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { promisify } from 'util';
import { Version } from './types';
import { logger } from '../utils/logger';
import * as fsUtils from '../utils/fsUtils';

const readFile = promisify(fs.readFile);

export class DiffGenerator {
    /**
     * Generate a diff between the current file and a saved version
     */
    public async showDiff(filePath: string, version: Version): Promise<void> {
        try {
            // Get workspace folder
            const workspaceFolder = fsUtils.getWorkspaceFolder(
                filePath,
                vscode.workspace.workspaceFolders || []
            );

            if (!workspaceFolder) {
                throw new Error('Cannot find workspace folder for file');
            }

            // Get version file path
            const versionFilePath = fsUtils.getVersionFilePath(
                workspaceFolder,
                filePath,
                version.id
            );

            // Create a temp file URI for the version
            const versionFileUri = vscode.Uri.file(versionFilePath);
            
            // Get the current file URI
            const currentFileUri = vscode.Uri.file(filePath);

            // Show diff between files
            const title = `Current ↔ ${version.id} (${version.description || new Date(version.timestamp).toLocaleString()})`;
            
            await vscode.commands.executeCommand(
                'vscode.diff',
                versionFileUri,
                currentFileUri,
                title
            );

            logger.info(`Showing diff between current file and version ${version.id}`);
        } catch (error) {
            logger.error('Error generating diff:', error);
            vscode.window.showErrorMessage(`Failed to generate diff: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Compare two versions of a file
     */
    public async compareTwoVersions(filePath: string, version1: Version, version2: Version): Promise<void> {
        try {
            // Get workspace folder
            const workspaceFolder = fsUtils.getWorkspaceFolder(
                filePath,
                vscode.workspace.workspaceFolders || []
            );

            if (!workspaceFolder) {
                throw new Error('Cannot find workspace folder for file');
            }

            // Get version file paths
            const version1FilePath = fsUtils.getVersionFilePath(
                workspaceFolder,
                filePath,
                version1.id
            );

            const version2FilePath = fsUtils.getVersionFilePath(
                workspaceFolder,
                filePath,
                version2.id
            );

            // Create URIs for the versions
            const version1Uri = vscode.Uri.file(version1FilePath);
            const version2Uri = vscode.Uri.file(version2FilePath);

            // Show diff between versions
            const title = `${version1.id} ↔ ${version2.id}`;
            
            await vscode.commands.executeCommand(
                'vscode.diff',
                version1Uri,
                version2Uri,
                title
            );

            logger.info(`Comparing versions ${version1.id} and ${version2.id}`);
        } catch (error) {
            logger.error('Error comparing versions:', error);
            vscode.window.showErrorMessage(`Failed to compare versions: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}
