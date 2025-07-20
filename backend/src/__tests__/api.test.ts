import request from 'supertest';
import fs from 'fs';
import path from 'path';
import createServer from '../server';
import { createTestFiles, createTestImageBuffer, createTestAudioBuffer } from './testUtils';

// Mock ffmpeg to avoid actual video processing in tests
jest.mock('fluent-ffmpeg', () => {
  const mockFFmpeg = {
    input: jest.fn().mockReturnThis(),
    loop: jest.fn().mockReturnThis(),
    audioCodec: jest.fn().mockReturnThis(),
    audioBitrate: jest.fn().mockReturnThis(),
    videoCodec: jest.fn().mockReturnThis(),
    size: jest.fn().mockReturnThis(),
    format: jest.fn().mockReturnThis(),
    on: jest.fn().mockImplementation((event, callback) => {
      if (event === 'end') {
        setTimeout(callback, 100);
      }
      return mockFFmpeg;
    }),
    save: jest.fn().mockReturnThis()
  };

  return jest.fn(() => mockFFmpeg);
});

describe('API Tests', () => {
  let app: any;

  beforeAll(() => {
    app = createServer();
  });

  beforeEach(() => {
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
  });

  afterEach(() => {
    // Clean up created files
    const uploadsDir = path.join(__dirname, '../../uploads');
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      files.forEach(file => {
        const filePath = path.join(uploadsDir, file);
        if (fs.lstatSync(filePath).isFile()) {
          fs.unlinkSync(filePath);
        }
      });
    }
  });

  describe('POST /api/upload', () => {
    it('should return 400 when no files are uploaded', async () => {
      const response = await request(app)
        .post('/api/upload');

      expect(response.status).toBe(400);
      expect(response.text).toBe('No files were uploaded.');
    });

    it('should return 400 when only image is uploaded', async () => {
      const imageBuffer = createTestImageBuffer();

      const response = await request(app)
        .post('/api/upload')
        .attach('image', imageBuffer, 'test.png');

      expect(response.status).toBe(400);
    });

    it('should return 400 when only audio is uploaded', async () => {
      const audioBuffer = createTestAudioBuffer();

      const response = await request(app)
        .post('/api/upload')
        .attach('audio', audioBuffer, 'test.wav');

      expect(response.status).toBe(400);
    });

    it('should process video when both image and audio are uploaded', async () => {
      const imageBuffer = createTestImageBuffer();
      const audioBuffer = createTestAudioBuffer();

      const response = await request(app)
        .post('/api/upload')
        .attach('image', imageBuffer, 'test.png')
        .attach('audio', audioBuffer, 'test.wav');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Video generated successfully!');
      expect(response.body).toHaveProperty('path', './uploads/output.mp4');
    });

    it('should handle large files', async () => {
      const largeImageBuffer = Buffer.alloc(1024 * 1024); // 1MB buffer
      const audioBuffer = createTestAudioBuffer();

      // Fill with PNG-like data
      const pngHeader = createTestImageBuffer();
      pngHeader.copy(largeImageBuffer, 0);

      const response = await request(app)
        .post('/api/upload')
        .attach('image', largeImageBuffer, 'large.png')
        .attach('audio', audioBuffer, 'test.wav');

      expect(response.status).toBe(200);
    });

    it('should handle different file types', async () => {
      const imageBuffer = createTestImageBuffer();
      const audioBuffer = createTestAudioBuffer();

      const response = await request(app)
        .post('/api/upload')
        .attach('image', imageBuffer, 'test.jpg')
        .attach('audio', audioBuffer, 'test.mp3');

      expect(response.status).toBe(200);
    });
  });

  describe('Server Health', () => {
    it('should create server successfully', () => {
      expect(app).toBeDefined();
    });

    it('should handle invalid routes gracefully', async () => {
      const response = await request(app)
        .get('/api/nonexistent');

      // This will be handled by Next.js handler, so expect a different response
      expect(response.status).not.toBe(500);
    });
  });
});
