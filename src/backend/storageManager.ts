import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { Version } from './types';

const fsReadFile = promisify(fs.readFile);
const fsWriteFile = promisify(fs.writeFile);
const fsMkdir = promisify(fs.mkdir);

export class StorageManager {
  /**
   * Get the versions directory for the current workspace
   */
  private getVersionsDir(workspacePath: string): string {
    return path.join(workspacePath, '.versions');
  }

  /**
   * Ensure the versions directory exists
   */
  public async ensureVersionsDir(workspacePath: string): Promise<string> {
    const versionsDir = this.getVersionsDir(workspacePath);
    try {
      await fsMkdir(versionsDir, { recursive: true });
      return versionsDir;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
        throw error;
      }
      return versionsDir;
    }
  }

  /**
   * Save file content to the versions directory
   */
  public async saveFile(workspacePath: string, filePath: string, version: Version, content: Buffer): Promise<void> {
    const versionsDir = await this.ensureVersionsDir(workspacePath);
    const relativeFilePath = path.relative(workspacePath, filePath);
    const versionFilePath = path.join(versionsDir, `${relativeFilePath}.${version.id}`);
    
    // Create subdirectories if needed
    const versionFileDir = path.dirname(versionFilePath);
    await fsMkdir(versionFileDir, { recursive: true });
    
    // Save the file content
    await fsWriteFile(versionFilePath, content);
  }

  /**
   * Load file content from the versions directory
   */
  public async loadFile(workspacePath: string, filePath: string, versionId: string): Promise<Buffer> {
    const versionsDir = this.getVersionsDir(workspacePath);
    const relativeFilePath = path.relative(workspacePath, filePath);
    const versionFilePath = path.join(versionsDir, `${relativeFilePath}.${versionId}`);
    
    return await fsReadFile(versionFilePath);
  }
}