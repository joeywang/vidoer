import fs from 'fs';
import path from 'path';
import { FileUtils } from '../utils/fileUtils';
import { createTestFiles, createTestImageBuffer, createTestAudioBuffer } from './testUtils';

describe('FileUtils', () => {
  let testFiles: ReturnType<typeof createTestFiles>;

  beforeEach(() => {
    testFiles = createTestFiles();
  });

  afterEach(() => {
    if (testFiles) {
      testFiles.cleanup();
    }
  });

  describe('validateImageFile', () => {
    it('should validate a valid image file', async () => {
      const result = await FileUtils.validateImageFile(testFiles.imagePath);

      expect(result.isValid).toBe(true);
      expect(result.fileInfo).toBeDefined();
      expect(result.fileInfo?.type).toBe('image');
      expect(result.fileInfo?.extension).toBe('.png');
      expect(result.fileInfo?.size).toBeGreaterThan(0);
    });

    it('should reject non-existent files', async () => {
      const result = await FileUtils.validateImageFile('/nonexistent/file.png');

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('File does not exist');
    });

    it('should reject files that are too large', async () => {
      // Create a file larger than MAX_IMAGE_SIZE
      const largeFilePath = path.join(__dirname, '../../test-uploads/large-image.png');
      const largeBuffer = Buffer.alloc(FileUtils.MAX_IMAGE_SIZE + 1000);
      
      // Fill with PNG header to make it appear valid
      const pngHeader = createTestImageBuffer();
      pngHeader.copy(largeBuffer, 0);
      
      fs.writeFileSync(largeFilePath, largeBuffer);

      const result = await FileUtils.validateImageFile(largeFilePath);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Image file too large');

      fs.unlinkSync(largeFilePath);
    });

    it('should reject invalid file extensions', async () => {
      const invalidFilePath = path.join(__dirname, '../../test-uploads/invalid.txt');
      fs.writeFileSync(invalidFilePath, 'not an image');

      const result = await FileUtils.validateImageFile(invalidFilePath);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid image format');

      fs.unlinkSync(invalidFilePath);
    });
  });

  describe('validateAudioFile', () => {
    it('should validate a valid audio file', async () => {
      const result = await FileUtils.validateAudioFile(testFiles.audioPath);

      expect(result.isValid).toBe(true);
      expect(result.fileInfo).toBeDefined();
      expect(result.fileInfo?.type).toBe('audio');
      expect(result.fileInfo?.extension).toBe('.wav');
      expect(result.fileInfo?.size).toBeGreaterThan(0);
    });

    it('should reject non-existent files', async () => {
      const result = await FileUtils.validateAudioFile('/nonexistent/file.wav');

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('File does not exist');
    });

    it('should reject files that are too large', async () => {
      const largeFilePath = path.join(__dirname, '../../test-uploads/large-audio.wav');
      const largeBuffer = Buffer.alloc(FileUtils.MAX_AUDIO_SIZE + 1000);
      
      // Fill with WAV header
      const wavHeader = createTestAudioBuffer();
      wavHeader.copy(largeBuffer, 0);
      
      fs.writeFileSync(largeFilePath, largeBuffer);

      const result = await FileUtils.validateAudioFile(largeFilePath);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Audio file too large');

      fs.unlinkSync(largeFilePath);
    });

    it('should reject invalid file extensions', async () => {
      const invalidFilePath = path.join(__dirname, '../../test-uploads/invalid.txt');
      fs.writeFileSync(invalidFilePath, 'not an audio');

      const result = await FileUtils.validateAudioFile(invalidFilePath);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid audio format');

      fs.unlinkSync(invalidFilePath);
    });
  });

  describe('ensureDirectoryExists', () => {
    it('should create directory if it does not exist', () => {
      const testDir = path.join(__dirname, '../../test-new-dir');

      expect(fs.existsSync(testDir)).toBe(false);
      
      FileUtils.ensureDirectoryExists(testDir);
      
      expect(fs.existsSync(testDir)).toBe(true);
      
      // Cleanup
      fs.rmdirSync(testDir);
    });

    it('should not fail if directory already exists', () => {
      const testDir = path.join(__dirname, '../../test-uploads');

      expect(() => {
        FileUtils.ensureDirectoryExists(testDir);
      }).not.toThrow();
    });

    it('should create nested directories', () => {
      const nestedDir = path.join(__dirname, '../../test-nested/deep/directory');

      FileUtils.ensureDirectoryExists(nestedDir);
      
      expect(fs.existsSync(nestedDir)).toBe(true);
      
      // Cleanup
      fs.rmSync(path.join(__dirname, '../../test-nested'), { recursive: true, force: true });
    });
  });

  describe('generateUniqueFilename', () => {
    it('should generate a unique filename', () => {
      const original = 'test.jpg';
      const unique1 = FileUtils.generateUniqueFilename(original);
      const unique2 = FileUtils.generateUniqueFilename(original);

      expect(unique1).not.toBe(unique2);
      expect(unique1).toContain('test');
      expect(unique1).toContain('.jpg');
    });

    it('should include prefix when provided', () => {
      const original = 'test.jpg';
      const prefix = 'upload';
      const unique = FileUtils.generateUniqueFilename(original, prefix);

      expect(unique).toContain(prefix);
      expect(unique).toContain('test');
      expect(unique).toContain('.jpg');
    });

    it('should handle files without extension', () => {
      const original = 'testfile';
      const unique = FileUtils.generateUniqueFilename(original);

      expect(unique).toContain('testfile');
      expect(unique).not.toContain('undefined');
    });
  });

  describe('cleanupFiles', () => {
    it('should delete existing files', async () => {
      const tempFile1 = path.join(__dirname, '../../test-uploads/temp1.txt');
      const tempFile2 = path.join(__dirname, '../../test-uploads/temp2.txt');

      fs.writeFileSync(tempFile1, 'content 1');
      fs.writeFileSync(tempFile2, 'content 2');

      expect(fs.existsSync(tempFile1)).toBe(true);
      expect(fs.existsSync(tempFile2)).toBe(true);

      await FileUtils.cleanupFiles([tempFile1, tempFile2]);

      expect(fs.existsSync(tempFile1)).toBe(false);
      expect(fs.existsSync(tempFile2)).toBe(false);
    });

    it('should handle non-existent files gracefully', async () => {
      const nonExistentFiles = [
        '/nonexistent/file1.txt',
        '/nonexistent/file2.txt'
      ];

      await expect(FileUtils.cleanupFiles(nonExistentFiles)).resolves.not.toThrow();
    });
  });

  describe('getDirectorySize', () => {
    it('should return 0 for non-existent directory', async () => {
      const size = await FileUtils.getDirectorySize('/nonexistent/directory');
      expect(size).toBe(0);
    });

    it('should calculate directory size correctly', async () => {
      const testDir = path.join(__dirname, '../../test-size-dir');
      FileUtils.ensureDirectoryExists(testDir);

      // Create some test files
      fs.writeFileSync(path.join(testDir, 'file1.txt'), 'content1'); // 8 bytes
      fs.writeFileSync(path.join(testDir, 'file2.txt'), 'content22'); // 9 bytes

      const size = await FileUtils.getDirectorySize(testDir);
      expect(size).toBe(17);

      // Cleanup
      fs.rmSync(testDir, { recursive: true, force: true });
    });
  });

  describe('formatFileSize', () => {
    it('should format bytes correctly', () => {
      expect(FileUtils.formatFileSize(0)).toBe('0 B');
      expect(FileUtils.formatFileSize(500)).toBe('500.0 B');
      expect(FileUtils.formatFileSize(1024)).toBe('1.0 KB');
      expect(FileUtils.formatFileSize(1024 * 1024)).toBe('1.0 MB');
      expect(FileUtils.formatFileSize(1024 * 1024 * 1024)).toBe('1.0 GB');
    });

    it('should handle decimal places', () => {
      expect(FileUtils.formatFileSize(1536)).toBe('1.5 KB'); // 1.5 KB
      expect(FileUtils.formatFileSize(2.5 * 1024 * 1024)).toBe('2.5 MB');
    });
  });

  describe('isImageFile', () => {
    it('should identify PNG files correctly', () => {
      expect(FileUtils.isImageFile(testFiles.imagePath)).toBe(true);
    });

    it('should return false for non-image files', () => {
      expect(FileUtils.isImageFile(testFiles.audioPath)).toBe(false);
    });

    it('should handle non-existent files', () => {
      expect(FileUtils.isImageFile('/nonexistent/file.png')).toBe(false);
    });

    it('should create and test different image formats', () => {
      // Test with a simple text file (should return false)
      const textFile = path.join(__dirname, '../../test-uploads/test.txt');
      fs.writeFileSync(textFile, 'This is not an image');
      
      expect(FileUtils.isImageFile(textFile)).toBe(false);
      
      fs.unlinkSync(textFile);
    });
  });

  describe('isAudioFile', () => {
    it('should identify WAV files correctly', () => {
      expect(FileUtils.isAudioFile(testFiles.audioPath)).toBe(true);
    });

    it('should return false for non-audio files', () => {
      expect(FileUtils.isAudioFile(testFiles.imagePath)).toBe(false);
    });

    it('should handle non-existent files', () => {
      expect(FileUtils.isAudioFile('/nonexistent/file.wav')).toBe(false);
    });

    it('should return false for text files', () => {
      const textFile = path.join(__dirname, '../../test-uploads/test.txt');
      fs.writeFileSync(textFile, 'This is not an audio file');
      
      expect(FileUtils.isAudioFile(textFile)).toBe(false);
      
      fs.unlinkSync(textFile);
    });
  });

  describe('cleanOldFiles', () => {
    it('should clean old files based on age', async () => {
      const testDir = path.join(__dirname, '../../test-cleanup-dir');
      FileUtils.ensureDirectoryExists(testDir);

      // Create files with different modification times
      const oldFile = path.join(testDir, 'old-file.txt');
      const newFile = path.join(testDir, 'new-file.txt');

      fs.writeFileSync(oldFile, 'old content');
      fs.writeFileSync(newFile, 'new content');

      // Modify the old file's mtime to be 2 hours ago
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
      fs.utimesSync(oldFile, twoHoursAgo, twoHoursAgo);

      // Clean files older than 1 hour
      const deletedCount = await FileUtils.cleanOldFiles(testDir, 60 * 60 * 1000);

      expect(deletedCount).toBe(1);
      expect(fs.existsSync(oldFile)).toBe(false);
      expect(fs.existsSync(newFile)).toBe(true);

      // Cleanup
      fs.rmSync(testDir, { recursive: true, force: true });
    });

    it('should return 0 for non-existent directory', async () => {
      const deletedCount = await FileUtils.cleanOldFiles('/nonexistent/directory', 1000);
      expect(deletedCount).toBe(0);
    });
  });
});
