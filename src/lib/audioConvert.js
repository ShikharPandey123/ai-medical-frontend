import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

const ffmpeg = new FFmpeg({ log: true });

export async function convertWebmToMp3(webmBlob) {
  if (!ffmpeg.loaded) {
    await ffmpeg.load();
  }

  // Write the webm file to ffmpeg FS
  await ffmpeg.writeFile('input.webm', await fetchFile(webmBlob));

  // Run ffmpeg command
  await ffmpeg.exec(['-i', 'input.webm', '-b:a', '192k', 'output.mp3']);

  // Read the result
  const mp3Data = await ffmpeg.readFile('output.mp3');

  return new Blob([mp3Data.buffer], { type: 'audio/mp3' });
}
