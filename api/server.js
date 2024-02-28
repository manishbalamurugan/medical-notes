const express = require('express');
const http = require('http');
const { Server } = require('ws');
const { TranscribeStreamingClient, StartStreamTranscriptionCommand } = require("@aws-sdk/client-transcribe-streaming");
const { PassThrough } = require('stream');

const app = express();
const port = 3030;
const server = http.createServer(app);
const wss = new Server({ server });

const transcribeClient = new TranscribeStreamingClient({ region: "us-east-1" });

wss.on('connection', (ws) => {
    console.log('Client connected');
    const audioStream = new PassThrough();

    

    ws.on('message', (message) => {
      if (message instanceof Buffer) {
        console.log('Streaming audio data to AWS Transcribe');
        audioStream.write(message);
      } else {
        console.log('Received non-binary message', message);
      }
    });

    ws.on('close', () => {
      console.log('Client disconnected');
      audioStream.end();
    });

    const startTranscription = async () => {
      // Create an async generator to yield audio chunks in the correct format
      const audioStreamGenerator = async function* () {
        for await (const chunk of audioStream) {
          yield { AudioEvent: { AudioChunk: chunk } };
        }
      };

      const command = new StartStreamTranscriptionCommand({
        LanguageCode: "en-US",
        MediaSampleRateHertz: 16000,
        MediaEncoding: "pcm",
        AudioStream: audioStreamGenerator(),
      });

      try {
        const response = await transcribeClient.send(command);
        for await (const event of response.TranscriptResultStream) {
          if (event.TranscriptEvent) {
            const transcription = event.TranscriptEvent.Transcript.Results
              .map(result => result.Alternatives[0].Transcript)
              .join('\n');
            ws.send(transcription); // Send transcription back to client
          }
        }
      } catch (err) {
        console.error("Error streaming transcription", err);
        ws.send(JSON.stringify({ error: err.message }));
      }
    };

    // Call the async function to start transcription
    startTranscription().catch(console.error);
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
