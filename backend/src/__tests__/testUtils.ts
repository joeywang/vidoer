import fs from 'fs';
import path from 'path';
import { jest } from '@jest/globals';

// Create a test image buffer (1x1 pixel PNG)
export const createTestImageBuffer = (): Buffer => {
  // PNG header + minimal 1x1 pixel data
  const pngData = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,  // PNG signature
    0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,  // IHDR chunk
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,  // 1x1 dimensions
    0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,  // bit depth, color type, etc.
    0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41,  // IDAT chunk start
    0x54, 0x08, 0x99, 0x01, 0x01, 0x01, 0x00, 0x00,  // image data
    0xFE, 0x00, 0x00, 0x02, 0x00, 0x01, 0xE2, 0x21,  // end of image data
    0xBC, 0x33, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45,  // IEND chunk
    0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
  ]);
  return pngData;
};

// Create a test audio buffer (minimal WAV file)
export const createTestAudioBuffer = (): Buffer => {
  const sampleRate = 44100;
  const duration = 0.1; // 0.1 seconds
  const numSamples = Math.floor(sampleRate * duration);
  const bytesPerSample = 2;
  const numChannels = 1;
  
  const dataSize = numSamples * bytesPerSample;
  const fileSize = 36 + dataSize;
  
  const buffer = Buffer.alloc(44 + dataSize);
  let offset = 0;
  
  // RIFF header
  buffer.write('RIFF', offset); offset += 4;
  buffer.writeUInt32LE(fileSize, offset); offset += 4;
  buffer.write('WAVE', offset); offset += 4;
  
  // fmt subchunk
  buffer.write('fmt ', offset); offset += 4;
  buffer.writeUInt32LE(16, offset); offset += 4; // PCM format size
  buffer.writeUInt16LE(1, offset); offset += 2;  // PCM format
  buffer.writeUInt16LE(numChannels, offset); offset += 2;
  buffer.writeUInt32LE(sampleRate, offset); offset += 4;
  buffer.writeUInt32LE(sampleRate * numChannels * bytesPerSample, offset); offset += 4;
  buffer.writeUInt16LE(numChannels * bytesPerSample, offset); offset += 2;
  buffer.writeUInt16LE(8 * bytesPerSample, offset); offset += 2;
  
  // data subchunk
  buffer.write('data', offset); offset += 4;
  buffer.writeUInt32LE(dataSize, offset); offset += 4;
  
  // Fill with sine wave data
  for (let i = 0; i < numSamples; i++) {
    const sample = Math.floor(Math.sin(2 * Math.PI * 440 * i / sampleRate) * 16383);
    buffer.writeInt16LE(sample, offset);
    offset += 2;
  }
  
  return buffer;
};

// Create test files in filesystem
export const createTestFiles = () => {
  const testDir = path.join(__dirname, '../../test-uploads');
  
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }
  
  const imagePath = path.join(testDir, 'test-image.png');
  const audioPath = path.join(testDir, 'test-audio.wav');
  
  fs.writeFileSync(imagePath, createTestImageBuffer());
  fs.writeFileSync(audioPath, createTestAudioBuffer());
  
  return {
    imagePath,
    audioPath,
    cleanup: () => {
      try {
        if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
        if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
      } catch (error) {
        console.log('Cleanup error:', error);
      }
    }
  };
};

// Mock ffmpeg for testing
export const mockFFmpeg = () => {
  const mockFFmpeg: any = {
    input: jest.fn().mockReturnThis(),
    loop: jest.fn().mockReturnThis(),
    audioCodec: jest.fn().mockReturnThis(),
    audioBitrate: jest.fn().mockReturnThis(),
    videoCodec: jest.fn().mockReturnThis(),
    size: jest.fn().mockReturnThis(),
    format: jest.fn().mockReturnThis(),
    on: jest.fn().mockImplementation((...args: any[]) => {
      const [event, callback] = args;
      if (event === 'end') {
        setTimeout(() => {
          callback();
        }, 100); // Simulate async completion
      }
      return mockFFmpeg;
    }),
    save: jest.fn().mockReturnThis()
  };
  
  return mockFFmpeg;
};

// Wait helper for async operations
export const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
