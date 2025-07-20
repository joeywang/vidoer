import { jest } from '@jest/globals';
import fs from 'fs';
import path from 'path';

// Create test directories if they don't exist
const testUploadsDir = path.join(__dirname, '../../test-uploads');
const uploadsDir = path.join(__dirname, '../../uploads');

beforeAll(() => {
  if (!fs.existsSync(testUploadsDir)) {
    fs.mkdirSync(testUploadsDir, { recursive: true });
  }
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
});

// Clean up test files after each test
afterEach(() => {
  // Clean up test upload files
  if (fs.existsSync(testUploadsDir)) {
    const files = fs.readdirSync(testUploadsDir);
    files.forEach(file => {
      const filePath = path.join(testUploadsDir, file);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });
  }
});

// Mock console to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
