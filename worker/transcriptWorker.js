// worker/transcriptWorker.js
const path = require('path');
const envPath = path.join(__dirname, '..', 'server', '.env');

// load environment variables from server/.env
require('dotenv').config({ path: envPath });

const mongoose = require('mongoose');
const Lesson = require('../server/models/Lesson');

const POLL_INTERVAL_MS = 3000; // check every 3s (adjust as needed)

async function connect() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Worker connected to MongoDB');
}

// Mock transcription function — replace with real STT integration later
async function transcribeMock(lesson) {
  // pretend we read file at lesson.contentUrl, run STT, etc.
  const text = `Auto-generated transcript for lesson "${lesson.title}" (lessonId=${lesson._id}). This is a placeholder transcript.`;
  // simulate processing time
  await new Promise(r => setTimeout(r, 1000));
  return text;
}

// Worker loop
async function processPending() {
  const lesson = await Lesson.findOneAndUpdate(
    { transcriptStatus: 'pending' },
    { transcriptStatus: 'processing' },
    { sort: { createdAt: 1 }, new: true }
  );
  if (!lesson) {
    // nothing to do
    return;
  }
  console.log('Processing lesson', lesson._id.toString(), lesson.title);
  try {
    const transcript = await transcribeMock(lesson);
    lesson.transcript = transcript;
    lesson.transcriptStatus = 'ready';
    await lesson.save();
    console.log('Transcription ready for', lesson._id.toString());
  } catch (err) {
    console.error('Transcription failed for', lesson._id.toString(), err);
    lesson.transcriptStatus = 'failed';
    await lesson.save();
  }
}

async function loop() {
  try {
    await processPending();
  } catch (err) {
    console.error('Worker error', err);
  } finally {
    setTimeout(loop, POLL_INTERVAL_MS);
  }
}

connect().then(loop).catch(err => { console.error(err); process.exit(1); });
