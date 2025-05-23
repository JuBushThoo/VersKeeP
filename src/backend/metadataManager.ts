import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { Version, VersionMetadata } from './types';

const fsReadFile = promisify(fs.readFile);
const fsWriteFile = promisify(fs.writeFile);

export class MetadataManager {
  private getMetadataPath(workspacePath: string, filePath: string): string {
    const versionsDir = path.join(workspacePath, '.versions');
    const relativeFilePath = path.relative(workspacePath, filePath);
    return path.join(versionsDir, `${relativeFilePath}.metadata.json`);
  }

  /**
   * Get metadata for a specific file
   */
  public async getMetadata(workspacePath: string, filePath: string): Promise<VersionMetadata> {
    const metadataPath = this.getMetadataPath(workspacePath, filePath);
    
    try {
      const data = await fsReadFile(metadataPath, 'utf8');
      return JSON.parse(data) as VersionMetadata;
    } catch (error) {
      // If file doesn't exist, return empty metadata
      return {
        versions: {},
        currentVersion: '',
        lastUpdated: Date.now()
      };
    }
  }

  /**
   * Save metadata for a specific file
   */
  public async saveMetadata(workspacePath: string, filePath: string, metadata: VersionMetadata): Promise<void> {
    const metadataPath = this.getMetadataPath(workspacePath, filePath);
    const metadataDir = path.dirname(metadataPath);
    
    // Create directory if it doesn't exist
    await promisify(fs.mkdir)(metadataDir, { recursive: true });
    
    // Save metadata
    await fsWriteFile(metadataPath, JSON.stringify(metadata, null, 2), 'utf8');
  }

  /**
   * Add a new version to the metadata
   */
  public async addVersion(workspacePath: string, filePath: string, version: Version): Promise<VersionMetadata> {
    const metadata = await this.getMetadata(workspacePath, filePath);
    
    metadata.versions[version.id] = version;
    metadata.currentVersion = version.id;
    metadata.lastUpdated = Date.now();
    
    await this.saveMetadata(workspacePath, filePath, metadata);
    return metadata;
  }

  /**
   * Remove a version from the metadata
   */
  public async removeVersion(workspacePath: string, filePath: string, versionId: string): Promise<VersionMetadata | null> {
    const metadata = await this.getMetadata(workspacePath, filePath);
    
    if (!metadata.versions[versionId]) {
      return null;
    }
    
    delete metadata.versions[versionId];
    metadata.lastUpdated = Date.now();
    
    // Set currentVersion to the latest version if we're deleting the current one
    if (metadata.currentVersion === versionId) {
      const versions = Object.values(metadata.versions);
      if (versions.length > 0) {
        // Find most recent version
        const latestVersion = versions.reduce((prev, current) => 
          prev.timestamp > current.timestamp ? prev : current
        );
        metadata.currentVersion = latestVersion.id;
      } else {
        metadata.currentVersion = '';
      }
    }
    
    await this.saveMetadata(workspacePath, filePath, metadata);
    return metadata;
  }
}