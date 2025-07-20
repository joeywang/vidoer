import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const stat = promisify(fs.stat);
const unlink = promisify(fs.unlink);
const readdir = promisify(fs.readdir);

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
  fileInfo?: {
    size: number;
    type: string;
    extension: string;
  };
}

export class FileUtils {
  // File size limits (in bytes)
  static readonly MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
  static readonly MAX_AUDIO_SIZE = 50 * 1024 * 1024; // 50MB
  
  // Allowed file types
  static readonly ALLOWED_IMAGE_TYPES = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
  static readonly ALLOWED_AUDIO_TYPES = ['.mp3', '.wav', '.aac', '.m4a', '.flac', '.ogg'];

  /**
   * Validate an uploaded image file
   */
  static async validateImageFile(filePath: string): Promise<FileValidationResult> {
    try {
      if (!fs.existsSync(filePath)) {
        return {
          isValid: false,
          error: 'File does not exist'
        };
      }

      const stats = await stat(filePath);
      const extension = path.extname(filePath).toLowerCase();

      // Check file size
      if (stats.size > this.MAX_IMAGE_SIZE) {
        return {
          isValid: false,
          error: `Image file too large. Maximum size: ${this.MAX_IMAGE_SIZE / (1024 * 1024)}MB`
        };
      }

      // Check file type
      if (!this.ALLOWED_IMAGE_TYPES.includes(extension)) {
        return {
          isValid: false,
          error: `Invalid image format. Allowed types: ${this.ALLOWED_IMAGE_TYPES.join(', ')}`
        };
      }

      return {
        isValid: true,
        fileInfo: {
          size: stats.size,
          type: 'image',
          extension
        }
      };
    } catch (error) {
      return {
        isValid: false,
        error: `File validation error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Validate an uploaded audio file
   */
  static async validateAudioFile(filePath: string): Promise<FileValidationResult> {
    try {
      if (!fs.existsSync(filePath)) {
        return {
          isValid: false,
          error: 'File does not exist'
        };
      }

      const stats = await stat(filePath);
      const extension = path.extname(filePath).toLowerCase();

      // Check file size
      if (stats.size > this.MAX_AUDIO_SIZE) {
        return {
          isValid: false,
          error: `Audio file too large. Maximum size: ${this.MAX_AUDIO_SIZE / (1024 * 1024)}MB`
        };
      }

      // Check file type
      if (!this.ALLOWED_AUDIO_TYPES.includes(extension)) {
        return {
          isValid: false,
          error: `Invalid audio format. Allowed types: ${this.ALLOWED_AUDIO_TYPES.join(', ')}`
        };
      }

      return {
        isValid: true,
        fileInfo: {
          size: stats.size,
          type: 'audio',
          extension
        }
      };
    } catch (error) {
      return {
        isValid: false,
        error: `File validation error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Create directory if it doesn't exist
   */
  static ensureDirectoryExists(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  /**
   * Generate a unique filename
   */
  static generateUniqueFilename(originalName: string, prefix?: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const extension = path.extname(originalName);
    const baseName = path.basename(originalName, extension);
    
    const uniqueName = prefix 
      ? `${prefix}_${timestamp}_${random}_${baseName}${extension}`
      : `${timestamp}_${random}_${baseName}${extension}`;
    
    return uniqueName;
  }

  /**
   * Clean up uploaded files
   */
  static async cleanupFiles(filePaths: string[]): Promise<void> {
    const promises = filePaths.map(async (filePath) => {
      try {
        if (fs.existsSync(filePath)) {
          await unlink(filePath);
        }
      } catch (error) {
        console.error(`Failed to delete file ${filePath}:`, error);
      }
    });

    await Promise.all(promises);
  }

  /**
   * Get directory size in bytes
   */
  static async getDirectorySize(dirPath: string): Promise<number> {
    if (!fs.existsSync(dirPath)) {
      return 0;
    }

    let totalSize = 0;
    const files = await readdir(dirPath);

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = await stat(filePath);
      
      if (stats.isDirectory()) {
        totalSize += await this.getDirectorySize(filePath);
      } else {
        totalSize += stats.size;
      }
    }

    return totalSize;
  }

  /**
   * Clean old files from directory
   */
  static async cleanOldFiles(dirPath: string, maxAgeMs: number): Promise<number> {
    if (!fs.existsSync(dirPath)) {
      return 0;
    }

    let deletedCount = 0;
    const files = await readdir(dirPath);
    const now = Date.now();

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      
      try {
        const stats = await stat(filePath);
        const fileAge = now - stats.mtime.getTime();
        
        if (fileAge > maxAgeMs && stats.isFile()) {
          await unlink(filePath);
          deletedCount++;
        }
      } catch (error) {
        console.error(`Error processing file ${filePath}:`, error);
      }
    }

    return deletedCount;
  }

  /**
   * Format file size for human reading
   */
  static formatFileSize(bytes: number): string {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const size = bytes / Math.pow(1024, i);
    
    return `${size.toFixed(1)} ${sizes[i]}`;
  }

  /**
   * Check if file is an image by reading magic bytes
   */
  static isImageFile(filePath: string): boolean {
    try {
      const buffer = fs.readFileSync(filePath);
      
      // Check for common image file signatures
      const signatures = {
        jpg: [0xFF, 0xD8, 0xFF],
        png: [0x89, 0x50, 0x4E, 0x47],
        gif: [0x47, 0x49, 0x46],
        bmp: [0x42, 0x4D],
        webp: [0x52, 0x49, 0x46, 0x46, 0x57, 0x45, 0x42, 0x50] // RIFF + WEBP
      };

      for (const [format, signature] of Object.entries(signatures)) {
        if (signature.every((byte, index) => buffer[index] === byte)) {
          return true;
        }
      }

      return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if file is an audio file by reading magic bytes
   */
  static isAudioFile(filePath: string): boolean {
    try {
      const buffer = fs.readFileSync(filePath);
      
      // Check for WAV (RIFF + WAVE)
      if (buffer.length >= 12 &&
          buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 && // RIFF
          buffer[8] === 0x57 && buffer[9] === 0x41 && buffer[10] === 0x56 && buffer[11] === 0x45) { // WAVE
        return true;
      }
      
      // Check for other audio file signatures
      const signatures = {
        mp3: [0xFF, 0xFB], // MP3 with MPEG-1 Layer 3
        flac: [0x66, 0x4C, 0x61, 0x43], // fLaC
        ogg: [0x4F, 0x67, 0x67, 0x53] // OggS
      };

      for (const [format, signature] of Object.entries(signatures)) {
        if (signature.every((byte, index) => buffer[index] === byte)) {
          return true;
        }
      }

      // Additional check for MP3 ID3 tags
      if (buffer[0] === 0x49 && buffer[1] === 0x44 && buffer[2] === 0x33) {
        return true; // ID3v2 tag
      }

      return false;
    } catch (error) {
      return false;
    }
  }
}
