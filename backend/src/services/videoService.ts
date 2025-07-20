import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import path from 'path';
import fs from 'fs';

// Set FFmpeg path
if (ffmpegPath && typeof ffmpeg.setFfmpegPath === 'function') {
  ffmpeg.setFfmpegPath(ffmpegPath);
}

export interface VideoProcessingOptions {
  imagePath: string;
  audioPath: string;
  outputPath: string;
  size?: string;
  audioCodec?: string;
  videoCodec?: string;
  audioBitrate?: string;
}

export interface VideoProcessingResult {
  success: boolean;
  outputPath?: string;
  error?: string;
}

export class VideoService {
  static async processVideo(options: VideoProcessingOptions): Promise<VideoProcessingResult> {
    return new Promise((resolve) => {
      const {
        imagePath,
        audioPath,
        outputPath,
        size = '1920x1080',
        audioCodec = 'aac',
        videoCodec = 'libx264',
        audioBitrate = '192k'
      } = options;

      // Validate input files exist
      if (!fs.existsSync(imagePath)) {
        return resolve({
          success: false,
          error: `Image file not found: ${imagePath}`
        });
      }

      if (!fs.existsSync(audioPath)) {
        return resolve({
          success: false,
          error: `Audio file not found: ${audioPath}`
        });
      }

      // Create output directory if it doesn't exist
      const outputDir = path.dirname(outputPath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const command = ffmpeg()
        .input(imagePath)
        .loop(1)
        .input(audioPath)
        .audioCodec(audioCodec)
        .audioBitrate(audioBitrate)
        .videoCodec(videoCodec)
        .size(size)
        .format('mp4')
        .on('end', () => {
          resolve({
            success: true,
            outputPath
          });
        })
        .on('error', (err) => {
          resolve({
            success: false,
            error: err.message
          });
        })
        .save(outputPath);
    });
  }

  static validateImageFile(filePath: string): boolean {
    if (!fs.existsSync(filePath)) {
      return false;
    }

    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp'];
    const ext = path.extname(filePath).toLowerCase();
    return allowedExtensions.includes(ext);
  }

  static validateAudioFile(filePath: string): boolean {
    if (!fs.existsSync(filePath)) {
      return false;
    }

    const allowedExtensions = ['.mp3', '.wav', '.aac', '.m4a', '.flac'];
    const ext = path.extname(filePath).toLowerCase();
    return allowedExtensions.includes(ext);
  }

  static getFileInfo(filePath: string) {
    if (!fs.existsSync(filePath)) {
      return null;
    }

    const stats = fs.statSync(filePath);
    return {
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime,
      extension: path.extname(filePath).toLowerCase(),
      basename: path.basename(filePath)
    };
  }

  static cleanup(filePaths: string[]): void {
    filePaths.forEach(filePath => {
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (error) {
          console.error(`Failed to delete file ${filePath}:`, error);
        }
      }
    });
  }
}
