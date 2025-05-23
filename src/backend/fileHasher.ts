import * as crypto from 'crypto';
import * as fs from 'fs';
import { promisify } from 'util';

const fsReadFile = promisify(fs.readFile);

export class FileHasher {
  /**
   * Generate a hash of file contents
   */
  public async hashFile(filePath: string): Promise<string> {
    const buffer = await fsReadFile(filePath);
    const hash = crypto.createHash('sha256');
    hash.update(buffer);
    return hash.digest('hex');
  }

  /**
   * Generate a hash of string content
   */
  public hashContent(content: string | Buffer): string {
    const hash = crypto.createHash('sha256');
    hash.update(content);
    return hash.digest('hex');
  }

  /**
   * Compare file with its stored version hash
   */
  public async hasFileChanged(filePath: string, storedHash: string): Promise<boolean> {
    const currentHash = await this.hashFile(filePath);
    return currentHash !== storedHash;
  }
}