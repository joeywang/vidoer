import fs from 'fs';
import path from 'path';
import { VideoService } from '../services/videoService';
import { createTestFiles } from './testUtils';

// Mock fluent-ffmpeg for testing
jest.mock('fluent-ffmpeg', () => {
  const mockFFmpeg = {
    input: jest.fn().mockReturnThis(),
    loop: jest.fn().mockReturnThis(),
    audioCodec: jest.fn().mockReturnThis(),
    audioBitrate: jest.fn().mockReturnThis(),
    videoCodec: jest.fn().mockReturnThis(),
    size: jest.fn().mockReturnThis(),
    format: jest.fn().mockReturnThis(),
    on: jest.fn().mockImplementation((event: string, callback: Function) => {
      if (event === 'end') {
        setTimeout(() => {
          // Create a mock output file
          const outputPath = (mockFFmpeg as any).outputPath;
          if (outputPath && !fs.existsSync(outputPath)) {
            const dir = path.dirname(outputPath);
            if (!fs.existsSync(dir)) {
              fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(outputPath, 'mock video content');
          }
          callback();
        }, 10);
      } else if (event === 'error') {
        // Store error callback for later use
        (mockFFmpeg as any).errorCallback = callback;
      }
      return mockFFmpeg;
    }),
    save: jest.fn().mockImplementation((outputPath: string) => {
      (mockFFmpeg as any).outputPath = outputPath;
      return mockFFmpeg;
    })
  };

  return jest.fn(() => mockFFmpeg);
});

describe('VideoService', () => {
  let testFiles: ReturnType<typeof createTestFiles>;
  
  beforeEach(() => {
    testFiles = createTestFiles();
  });
  
  afterEach(() => {
    if (testFiles) {
      testFiles.cleanup();
    }
    
    // Clean up any test output files
    const testOutputDir = path.join(__dirname, '../../test-output');
    if (fs.existsSync(testOutputDir)) {
      try {
        fs.rmSync(testOutputDir, { recursive: true, force: true });
      } catch (error) {
        console.log('Could not clean test output dir:', error);
      }
    }
  });

  describe('processVideo', () => {
    it('should process video successfully with valid inputs', async () => {
      const outputPath = path.join(__dirname, '../../test-output/output.mp4');
      
      const result = await VideoService.processVideo({
        imagePath: testFiles.imagePath,
        audioPath: testFiles.audioPath,
        outputPath
      });

      expect(result.success).toBe(true);
      expect(result.outputPath).toBe(outputPath);
      expect(result.error).toBeUndefined();
    });

    it('should fail when image file does not exist', async () => {
      const result = await VideoService.processVideo({
        imagePath: '/nonexistent/image.png',
        audioPath: testFiles.audioPath,
        outputPath: './test-output/output.mp4'
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Image file not found');
    });

    it('should fail when audio file does not exist', async () => {
      const result = await VideoService.processVideo({
        imagePath: testFiles.imagePath,
        audioPath: '/nonexistent/audio.wav',
        outputPath: './test-output/output.mp4'
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Audio file not found');
    });

    it('should use custom processing options', async () => {
      const outputPath = path.join(__dirname, '../../test-output/custom.mp4');
      
      const result = await VideoService.processVideo({
        imagePath: testFiles.imagePath,
        audioPath: testFiles.audioPath,
        outputPath,
        size: '720x480',
        audioCodec: 'mp3',
        videoCodec: 'h264',
        audioBitrate: '128k'
      });

      expect(result.success).toBe(true);
    });

    it('should create output directory if it does not exist', async () => {
      const outputDir = path.join(__dirname, '../../test-output/nested/deep');
      const outputPath = path.join(outputDir, 'output.mp4');
      
      const result = await VideoService.processVideo({
        imagePath: testFiles.imagePath,
        audioPath: testFiles.audioPath,
        outputPath
      });

      expect(result.success).toBe(true);
      expect(fs.existsSync(outputDir)).toBe(true);
    });
  });

  describe('validateImageFile', () => {
    it('should validate existing image files', () => {
      expect(VideoService.validateImageFile(testFiles.imagePath)).toBe(true);
    });

    it('should reject non-existent files', () => {
      expect(VideoService.validateImageFile('/nonexistent/file.png')).toBe(false);
    });

    it('should validate different image extensions', () => {
      const extensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp'];
      extensions.forEach(ext => {
        // Create temp file for testing
        const tempPath = path.join(__dirname, `../../test-uploads/test${ext}`);
        fs.writeFileSync(tempPath, 'test content');
        
        expect(VideoService.validateImageFile(tempPath)).toBe(true);
        
        // Cleanup
        if (fs.existsSync(tempPath)) {
          fs.unlinkSync(tempPath);
        }
      });
    });

    it('should reject invalid extensions', () => {
      const tempPath = path.join(__dirname, '../../test-uploads/test.txt');
      fs.writeFileSync(tempPath, 'test content');
      
      expect(VideoService.validateImageFile(tempPath)).toBe(false);
      
      fs.unlinkSync(tempPath);
    });
  });

  describe('validateAudioFile', () => {
    it('should validate existing audio files', () => {
      expect(VideoService.validateAudioFile(testFiles.audioPath)).toBe(true);
    });

    it('should reject non-existent files', () => {
      expect(VideoService.validateAudioFile('/nonexistent/file.wav')).toBe(false);
    });

    it('should validate different audio extensions', () => {
      const extensions = ['.mp3', '.wav', '.aac', '.m4a', '.flac'];
      extensions.forEach(ext => {
        const tempPath = path.join(__dirname, `../../test-uploads/test${ext}`);
        fs.writeFileSync(tempPath, 'test content');
        
        expect(VideoService.validateAudioFile(tempPath)).toBe(true);
        
        fs.unlinkSync(tempPath);
      });
    });

    it('should reject invalid extensions', () => {
      const tempPath = path.join(__dirname, '../../test-uploads/test.txt');
      fs.writeFileSync(tempPath, 'test content');
      
      expect(VideoService.validateAudioFile(tempPath)).toBe(false);
      
      fs.unlinkSync(tempPath);
    });
  });

  describe('getFileInfo', () => {
    it('should return file information for existing files', () => {
      const info = VideoService.getFileInfo(testFiles.imagePath);
      
      expect(info).toBeDefined();
      expect(info?.size).toBeGreaterThan(0);
      expect(info?.extension).toBe('.png');
      expect(info?.basename).toBe('test-image.png');
      expect(info?.created instanceof Date).toBe(true);
      expect(info?.modified instanceof Date).toBe(true);
    });

    it('should return null for non-existent files', () => {
      const info = VideoService.getFileInfo('/nonexistent/file.txt');
      expect(info).toBeNull();
    });
  });

  describe('cleanup', () => {
    it('should remove existing files', () => {
      const tempFile1 = path.join(__dirname, '../../test-uploads/temp1.txt');
      const tempFile2 = path.join(__dirname, '../../test-uploads/temp2.txt');
      
      fs.writeFileSync(tempFile1, 'test content 1');
      fs.writeFileSync(tempFile2, 'test content 2');
      
      expect(fs.existsSync(tempFile1)).toBe(true);
      expect(fs.existsSync(tempFile2)).toBe(true);
      
      VideoService.cleanup([tempFile1, tempFile2]);
      
      expect(fs.existsSync(tempFile1)).toBe(false);
      expect(fs.existsSync(tempFile2)).toBe(false);
    });

    it('should handle non-existent files gracefully', () => {
      const nonExistentFiles = [
        '/nonexistent/file1.txt',
        '/nonexistent/file2.txt'
      ];
      
      expect(() => {
        VideoService.cleanup(nonExistentFiles);
      }).not.toThrow();
    });

    it('should handle mixed existing and non-existent files', () => {
      const tempFile = path.join(__dirname, '../../test-uploads/temp.txt');
      fs.writeFileSync(tempFile, 'test content');
      
      const files = [
        tempFile,
        '/nonexistent/file.txt'
      ];
      
      VideoService.cleanup(files);
      
      expect(fs.existsSync(tempFile)).toBe(false);
    });
  });
});
