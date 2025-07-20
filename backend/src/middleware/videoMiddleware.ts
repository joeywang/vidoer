import { Request, Response, NextFunction } from 'express';
import { VideoService } from '../services/videoService';
import path from 'path';
import { FileUtils } from '../utils/fileUtils';

export const uploadMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.files || !req.files['image'] || !req.files['audio']) {
    return res.status(400).send('Both image and audio files are required.');
  }

  const image = req.files['image'][0];
  const audio = req.files['audio'][0];

  const imageValidation = await FileUtils.validateImageFile(image.path);
  const audioValidation = await FileUtils.validateAudioFile(audio.path);

  if (!imageValidation.isValid) {
    await FileUtils.cleanupFiles([image.path]);
    return res.status(400).send(`Image validation failed: ${imageValidation.error}`);
  }

  if (!audioValidation.isValid) {
    await FileUtils.cleanupFiles([audio.path]);
    return res.status(400).send(`Audio validation failed: ${audioValidation.error}`);
  }

  next();
};

export const processVideo = async (req: Request, res: Response) => {
  const image = req.files['image'][0];
  const audio = req.files['audio'][0];

  const outputPath = path.join(__dirname, '../../uploads/', `${Date.now()}_output.mp4`);

  const result = await VideoService.processVideo({
    imagePath: image.path,
    audioPath: audio.path,
    outputPath
  });

  if (result.success) {
    res.json({ message: 'Video generated successfully!', path: result.outputPath });
  } else {
    res.status(500).send(`Error generating video: ${result.error}`);
  }
};
