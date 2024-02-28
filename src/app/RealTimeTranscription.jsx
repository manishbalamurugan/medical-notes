import React, { useState, useEffect, useRef} from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '../components/ui/card.jsx';
import { Button } from '../components/ui/button.jsx';
import { TranscribeStreamingClient, StartStreamTranscriptionCommand } from '@aws-sdk/client-transcribe-streaming';
import { CognitoIdentityClient } from "@aws-sdk/client-cognito-identity";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-provider-cognito-identity";

// Initialize the Cognito Identity client
const REGION = "us-east-1"; // e.g. us-west-2
const IDENTITY_POOL_ID = "us-east-1:63529a34-e830-4043-8433-78015127fba4"; 



function RealTimeTranscription() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const audioContextRef = useRef(null);
  const isRecordingRef = useRef(null);
  const transcribeClientRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const audioChunksQueue = useRef([]);

  useEffect(() => {
    const cognitoIdentityClient = new CognitoIdentityClient({ region: REGION });
    const credentials = fromCognitoIdentityPool({
      client: cognitoIdentityClient,
      identityPoolId: IDENTITY_POOL_ID,
    });
    transcribeClientRef.current = new TranscribeStreamingClient({
      region: REGION,
      credentials: {
        accessKeyId: 'AKIAZI2LJEJVOBMBEC3B',
        secretAccessKey: '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'
      }
    });
    isRecordingRef.current = isRecording; // Synchronize ref with state
  }, [isRecording]);

  const getAudioContext = () => {
    if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
      audioContextRef.current = new AudioContext();
    }
    if (audioContextRef.current.state === "suspended") {
      audioContextRef.current.resume();
    }
    return audioContextRef.current;
  };

  const startRecording = async () => {
    try {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
      audioContextRef.current = new AudioContext();
      setIsRecording(true); // Update state
      isRecordingRef.current = true; // Synchronize ref with state
      setTranscription('');
      const audioContext = getAudioContext();
      mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      await audioContext.audioWorklet.addModule('worklets/audio-chopper-processor.worklet.js');
      const audioWorkletNode = new AudioWorkletNode(audioContext, 'audio-chopper-processor');
      const mediaStreamSource = audioContext.createMediaStreamSource(mediaStreamRef.current);
      mediaStreamSource.connect(audioWorkletNode);

      audioWorkletNode.port.onmessage = (event) => {
        audioChunksQueue.current.push(event.data);
      };

      const audioStream = async function* () {
        while (isRecordingRef.current) {
          while (audioChunksQueue.current.length > 0) {
            const audioChunk = audioChunksQueue.current.shift();
            yield { AudioEvent: { AudioChunk: audioChunk } };
          }
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      };

      const command = new StartStreamTranscriptionCommand({
        LanguageCode: 'en-US',
        MediaSampleRateHertz: 48000,
        MediaEncoding: 'pcm',
        AudioStream: audioStream(),
      });

      let data;
      try {
        data = await transcribeClientRef.current.send(command);
      } catch (error) {
        console.error('Error sending transcription command:', error);
      }

      for await (const event of data.TranscriptResultStream) {
        const results = event.TranscriptEvent.Transcript.Results;
        if (results.length && !results[0].IsPartial) {
          const newTranscript = results[0].Alternatives[0].Transcript;
          setTranscription((prevTranscription) => prevTranscription + newTranscript + ' ');
        }
      };
    } catch (error) {
      console.error('Error starting transcription:', error);
    }
  }

  const cleanup = () => {
    if (transcribeClientRef.current) {
      transcribeClientRef.current.destroy();
    }
  };

  useEffect(() => {
    return cleanup;
  }, []);
  
  const stopRecording = () => {
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setIsRecording(false);
    isRecordingRef.current = false;
    cleanup();
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-white dark:bg-zinc-900">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center space-x-4">
          <svg
            className="h-8 w-8 text-zinc-900 dark:text-zinc-50"
            fill="none"
            height="24"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            width="24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 3v18c-5 0-9-4-9-9s4-9 9-9z" />
            <path d="M12 3c5 0 9 4 9 9s-4 9-9 9V3z" />
          </svg>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Voice to Text Demo</h1>
        </div>
      </nav>
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 border-r border-zinc-200 dark:border-zinc-800 overflow-auto">
          <nav className="flex flex-col gap-4 p-4">
            <h2 className="text-md font-bold text-zinc-500 dark:text-zinc-400">Controls</h2>
            <div className="space-y-4 bg-black/5 w-fit rounded-md">
              <Button onClick={isRecording ? stopRecording : startRecording} variant={isRecording ? "destructive" : "primary"}>
                {isRecording ? "Stop Transcription" : "Start Transcription"}
              </Button>
            </div>
          </nav>
        </aside>
        <main className="flex-1 overflow-auto p-4">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Transcription Output</h2>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300">{transcription || "Start speaking, and your words will appear here..."}</p>
            </CardContent>
          </Card>
        </main>
      </div>
      <footer className="flex items-center justify-between px-6 py-4 border-t border-zinc-200 dark:border-zinc-800">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">©2024 Magnum Consulting</p>
      </footer>
    </div>
  );
}

export default RealTimeTranscription;