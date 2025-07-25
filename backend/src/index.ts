
import express from 'express';
import multer from 'multer';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import next from 'next';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev, dir: './' });
const handle = app.getRequestHandler();

if (ffmpegPath) {
  ffmpeg.setFfmpegPath(ffmpegPath);
}

app.prepare().then(() => {
  const server = express();

  const storage = multer.diskStorage({
    destination: './uploads',
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    },
  });

  const upload = multer({ storage });

  server.post('/api/upload', upload.fields([{ name: 'image' }, { name: 'audio' }]), (req, res) => {
    if (!req.files) {
      return res.status(400).send('No files were uploaded.');
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

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

  server.all('*', (req, res) => {
    return handle(req, res);
  });

  server.listen(3001, () => {
    console.log('Server started on port 3001');
  });
});
