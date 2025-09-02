let ffmpeg = null;
let fetchFile = null;

export async function convertWebmToMp3(webmBlob) {
  if (typeof window === 'undefined') {
    throw new Error('convertWebmToMp3 can only be used in the browser.');
  }
  // Dynamically import ffmpeg.wasm and util only in the browser
  if (!ffmpeg || !fetchFile) {
    const [{ FFmpeg }, util] = await Promise.all([
      import('@ffmpeg/ffmpeg'),
      import('@ffmpeg/util')
    ]);
    ffmpeg = new FFmpeg({ log: true });
    fetchFile = util.fetchFile;
  }
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
