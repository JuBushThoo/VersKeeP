import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { Version, VersionMetadata } from './types';
import { StorageManager } from './storageManager';
import { MetadataManager } from './metadataManager';
import { FileHasher } from './fileHasher';

export class VersionManager {
  private storageManager: StorageManager;
  private metadataManager: MetadataManager;
  private fileHasher: FileHasher;
  
  constructor() {
    this.storageManager = new StorageManager();
    this.metadataManager = new MetadataManager();
    this.fileHasher = new FileHasher();
  }

  /**
   * Save the current state of a file as a new version
   */
  public async saveVersion(filePath: string, description?: string): Promise<Version | null> {
    try {
      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (!workspaceFolders) {
        vscode.window.showErrorMessage('No workspace folder found.');
        return null;
      }
      const workspacePath = workspaceFolders[0].uri.fsPath;
      const content = await fs.promises.readFile(filePath);
      const hash = await this.fileHasher.hashContent(content);
      const stat = await fs.promises.stat(filePath);
      const size = stat.size;
      const timestamp = Date.now();

      // Get existing metadata
      const metadata = await this.metadataManager.getMetadata(workspacePath, filePath);
      // Auto-increment version id
      let versionNumber = 1;
      let subVersion = 0;
      if (metadata && Object.keys(metadata.versions).length > 0) {
        // Find the latest version id
        const ids = Object.keys(metadata.versions);
        const lastId = ids[ids.length - 1];
        const match = lastId.match(/^v(\d+)\.(\d+)$/);
        if (match) {
          versionNumber = parseInt(match[1], 10);
          subVersion = parseInt(match[2], 10) + 1;
        }
      }
      const versionId = `v${versionNumber}.${subVersion}`;
      const version: Version = {
        id: versionId,
        timestamp,
        description: description || '',
        hash,
        filePath,
        size
      };
      // Save file content
      await this.storageManager.saveFile(workspacePath, filePath, version, content);
      // Update metadata
      await this.metadataManager.addVersion(workspacePath, filePath, version);
      return version;
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to save version: ${error instanceof Error ? error.message : String(error)}`);
      return null;
    }
  }

  /**
   * Get all versions for a specific file
   */
  public getVersions(filePath: string): Version[] {
    try {
      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (!workspaceFolders) {
        vscode.window.showErrorMessage('No workspace folder found.');
        return [];
      }
      const workspacePath = workspaceFolders[0].uri.fsPath;
      // Synchronously get metadata (for tree view)
      const metadataPath = path.join(workspacePath, '.versions', `${path.relative(workspacePath, filePath)}.metadata.json`);
      if (!fs.existsSync(metadataPath)) {
        return [];
      }
      const data = fs.readFileSync(metadataPath, 'utf8');
      const metadata: VersionMetadata = JSON.parse(data);
      return Object.values(metadata.versions).sort((a, b) => a.timestamp - b.timestamp);
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to get versions: ${error instanceof Error ? error.message : String(error)}`);
      return [];
    }
  }

  /**
   * Restore a specific version of a file
   */
  public async loadVersion(filePath: string, versionId: string): Promise<boolean> {
    try {
      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (!workspaceFolders) {
        vscode.window.showErrorMessage('No workspace folder found.');
        return false;
      }
      const workspacePath = workspaceFolders[0].uri.fsPath;
      // Get metadata
      const metadata = await this.metadataManager.getMetadata(workspacePath, filePath);
      if (!metadata.versions[versionId]) {
        vscode.window.showErrorMessage('Version not found.');
        return false;
      }
      // Load file content
      const buffer = await this.storageManager.loadFile(workspacePath, filePath, versionId);
      await fs.promises.writeFile(filePath, buffer);
      return true;
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to load version: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  }

  /**
   * Delete a specific version of a file
   */
  public async deleteVersion(filePath: string, versionId: string): Promise<boolean> {
    try {
      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (!workspaceFolders) {
        vscode.window.showErrorMessage('No workspace folder found.');
        return false;
      }
      const workspacePath = workspaceFolders[0].uri.fsPath;
      // Remove version from metadata
      const metadata = await this.metadataManager.removeVersion(workspacePath, filePath, versionId);
      if (!metadata) {
        vscode.window.showErrorMessage('Version not found in metadata.');
        return false;
      }
      // Delete the version file
      const versionsDir = path.join(workspacePath, '.versions');
      const relativeFilePath = path.relative(workspacePath, filePath);
      const versionFilePath = path.join(versionsDir, `${relativeFilePath}.${versionId}`);
      if (fs.existsSync(versionFilePath)) {
        await fs.promises.unlink(versionFilePath);
      }
      return true;
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to delete version: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  }
}