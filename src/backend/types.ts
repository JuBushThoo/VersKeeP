export interface Version {
    id: string;          // Unique version identifier (e.g., "v1.2")
    timestamp: number;   // Creation timestamp
    description: string; // Optional user description
    hash: string;        // Content hash for comparison
    filePath: string;    // Original file path
    size: number;        // File size in bytes
  }
  
  export interface VersionMetadata {
    versions: Record<string, Version>;
    currentVersion: string;
    lastUpdated: number;
  }