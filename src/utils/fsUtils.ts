import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

// Promisify fs functions
export const readFile = promisify(fs.readFile);
export const writeFile = promisify(fs.writeFile);
export const mkdir = promisify(fs.mkdir);
export const readdir = promisify(fs.readdir);
export const stat = promisify(fs.stat);
export const unlink = promisify(fs.unlink);

/**
 * Ensures a directory exists, creating it if necessary
 */
export async function ensureDir(dirPath: string): Promise<string> {
    try {
        await mkdir(dirPath, { recursive: true });
        return dirPath;
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
            throw error;
        }
        return dirPath;
    }
}

/**
 * Gets the workspace folder for a given file path
 */
export function getWorkspaceFolder(filePath: string, workspaceFolders: readonly { uri: { fsPath: string } }[]): string | undefined {
    if (!workspaceFolders || workspaceFolders.length === 0) {
        return undefined;
    }
    
    // Find the workspace folder that contains the file
    const matchingFolder = workspaceFolders
        .filter(folder => filePath.startsWith(folder.uri.fsPath))
        .sort((a, b) => b.uri.fsPath.length - a.uri.fsPath.length)[0];
    
    return matchingFolder?.uri.fsPath;
}

/**
 * Gets a relative file path from a workspace root
 */
export function getRelativePath(filePath: string, workspaceRoot: string): string {
    return path.relative(workspaceRoot, filePath);
}

/**
 * Gets the versions directory for a workspace
 */
export function getVersionsDir(workspaceRoot: string): string {
    return path.join(workspaceRoot, '.versions');
}

/**
 * Generates a version file path
 */
export function getVersionFilePath(workspaceRoot: string, filePath: string, versionId: string): string {
    const versionsDir = getVersionsDir(workspaceRoot);
    const relativePath = getRelativePath(filePath, workspaceRoot);
    return path.join(versionsDir, `${relativePath}.${versionId}`);
}

/**
 * Generates a metadata file path
 */
export function getMetadataFilePath(workspaceRoot: string, filePath: string): string {
    const versionsDir = getVersionsDir(workspaceRoot);
    const relativePath = getRelativePath(filePath, workspaceRoot);
    return path.join(versionsDir, `${relativePath}.metadata.json`);
}
