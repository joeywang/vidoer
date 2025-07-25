import express from 'express';
import multer from 'multer';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';

// Set FFmpeg path
if (ffmpegPath && typeof ffmpeg.setFfmpegPath === 'function') {
  ffmpeg.setFfmpegPath(ffmpegPath);
}

const createServer = () => {
  const app = express();

  const storage = multer.diskStorage({
    destination: './uploads',
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    },
  });

  const upload = multer({ storage });

  app.post('/api/upload', upload.fields([{ name: 'image' }, { name: 'audio' }]), (req, res) => {
    if (!req.files) {
      return res.status(400).send('No files were uploaded.');
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (!files['image'] || !files['image'][0]) {
      return res.status(400).send('Image file is required.');
    }
    
    if (!files['audio'] || !files['audio'][0]) {
      return res.status(400).send('Audio file is required.');
    }

    const image = files['image'][0];
    const audio = files['audio'][0];

    const outputPath = `./uploads/output.mp4`;

    ffmpeg()
      .input(image.path)
      .loop(1)
      .input(audio.path)
      .audioCodec('aac')
      .audioBitrate('192k')
      .videoCodec('libx264')
      .size('1920x1080')
      .format('mp4')
      .on('end', () => {
        res.json({ message: 'Video generated successfully!', path: outputPath });
      })
      .on('error', (err) => {
        console.error(err);
        res.status(500).send('Error generating video.');
      })
      .save(outputPath);
  });

  return app;
};

export default createServer;

