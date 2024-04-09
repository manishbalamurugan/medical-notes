const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { OpenAI } = require("openai");
const fs = require('fs');
const AWS = require('aws-sdk');

const db = require('./config/db');

const app = express();

db.connect();

app.use(cors());

const openai = new OpenAI({
    apiKey: "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",
});

// AWS.config.update({
//     accessKeyId: 'AKIAZI2LJEJVOBMBEC3B',
//     secretAccessKey: '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',
//     region: 'us-east-1',
// });


//const s3 = new AWS.S3();
//const transcribeService = new AWS.TranscribeService();

const upload = multer();

async function formatTranscript(transcript){
  const messages = [
    {
      role: "system", 
      content: `You are an expert in cleaning up and refining rough audio transcriptions into high quality transcripts.`
    },
    {
      role: "user",
      content: `You will be responsible for contextualizing and understanding unstructured transcripts and converting them into high quality structured transcriptions. 
      When given a transcription, begin your refinement task. Your response can only contain the transcript. Here is an example:
      
      ***

      Example Transcript:

      Person 1: *insert line*
      Person 2: *insert line*
      Person 3: *insert line* 

      ****

      You're answer must only contain the transcript and no additional words, headers, or titles.`


    }
  ]

  messages.push({
    role: "user",
    content: `
    Rough Trancript:
      ${transcript}
    `
  })

  const completion = await openai.chat.completions.create({
    messages: messages,
    model: "gpt-4",
  });

  const finalTranscript = completion.choices[0].message.content;
  return finalTranscript;
}

async function generateNotes(transcript){
  const messages = [
    {
      role: "system", 
      content: `You are an expert in generating high quality medical notes. `
    },
    {
      role: "user",
      content: `For these specific series of transcriptions, you will be responsible for contextualizing and understanding provided transcripts 
      and converting them into high quality medical notes specific to the conversation.  
      When given a transcription, begin your refinement task. Your response can only contain the transcript. Each note must contain the following sections:
      
      - Evaluation
      - Diagnosis
      - Treatment Plan

      All contents within these set of notes must be derived from the provided transcript only - you are not allowed to include topics or treatments that 
      are not mentioned within the provided transcript. 


      **

      When provided a transcript, start your task. Return only the medical notes, nothing else may be present in your response. `
    }
  ]

  messages.push({
    role: "user",
    content: `
    Trancript:
      ${transcript}
    `
  })

  const completion = await openai.chat.completions.create({
    messages: messages,
    model: "gpt-4",
  });

  const notes = completion.choices[0].message.content;
  return  notes;
}


app.use(express.json());

app.get('/', (req, res) => {
    res.send('Welcome to the Whisper Text-to-Speech API!');
});

app.post('/api/transcribe', upload.single('file'), async (req, res) => {
    const audioFile = req.file;
  
    if (!audioFile) {
      res.status(400).json({ message: 'Audio file is required.' });
      return;
    }
  
    try {
      const s3Params = {
        Bucket: 'rtt-1',
        Key: `audio/${Date.now()}.mp3`,
        Body: audioFile.buffer,
        ContentType: audioFile.mimetype,
      };
  
      //const s3UploadResult = await s3.upload(s3Params).promise();
      //const audioFileUrl = s3UploadResult.Location;
  
      // Step 1: Use AWS Transcribe for speaker diarization
      //const awsTranscribeResponse = await transcribeAudioWithAWS(audioFileUrl);
      //const awsTranscription = parseAWSTranscribeResponse(awsTranscribeResponse);
  
      // Step 2: Use OpenAI Whisper API for accurate transcription
      const whisperResponse = await transcribeAudioWithWhisper(audioFile);
      //const whisperTranscription = parseWhisperResponse(whisperResponse);
  
      // Step 3: Merge the results using fuzzy logic
      //const mergedTranscription = mergeTranscriptions(awsTranscription, whisperTranscription);


      //Step 4: Clean up with LLM-formator
      const llm_transcript = await formatTranscript(whisperResponse.text)
      const notes = await generateNotes(llm_transcript)
      console.log(llm_transcript);
      console.log(notes)
      res.json({ transcription: llm_transcript, notes: notes});
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error transcribing audio' });
    }
});


  async function transcribeAudioWithAWS(filePath) {
    const params = {
      LanguageCode: 'en-US',
      Media: {
        MediaFileUri: `${filePath}`,
      },
      MediaFormat: 'mp3',
      TranscriptionJobName: `transcription-${Date.now()}`,
      Settings: {
        ShowSpeakerLabels: true,
        MaxSpeakerLabels: 2,
      },
    };
  
    const transcriptionJob = await transcribeService.startTranscriptionJob(params).promise();
    const jobName = transcriptionJob.TranscriptionJob.TranscriptionJobName;
  
    // Wait for the transcription job to complete
    let isJobComplete = false;
    while (!isJobComplete) {
      const jobStatus = await transcribeService.getTranscriptionJob({ TranscriptionJobName: jobName }).promise();
      isJobComplete = jobStatus.TranscriptionJob.TranscriptionJobStatus === 'COMPLETED';
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait for 5 seconds before checking again
    }
  
    const transcriptionResult = await transcribeService.getTranscriptionJob({ TranscriptionJobName: jobName }).promise();
    const transcriptFileUri = transcriptionResult.TranscriptionJob.Transcript.TranscriptFileUri;
  
    // Fetch the transcript JSON file
    const transcriptResponse = await fetch(transcriptFileUri);
    const transcriptData = await transcriptResponse.json();

    console.log("AWS: ", transcriptData);
  
    return transcriptData;
  }
  
  // Function to parse the AWS Transcribe response
  function parseAWSTranscribeResponse(response) {
    const speakerLabels = response.results.speaker_labels.segments.map((segment) => ({
      speaker: segment.speaker_label,
      start: parseFloat(segment.start_time),
      end: parseFloat(segment.end_time),
    }));
  
    return speakerLabels;
  }
  

  //COMMAND: FIX THIS FUNCTION
  async function transcribeAudioWithWhisper(audioFile) {
    const formData = new FormData();
    const blob = new Blob([audioFile.buffer], { type: audioFile.mimetype });
    formData.append('file', blob, audioFile.originalname);
    formData.append('model', 'whisper-1'); // Specify the Whisper model
    formData.append('response_format', 'verbose_json'); // Specify the response format
    formData.append('timestamp_granularities', 'segment'); // Specify the timestamp granularities
  
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openai.apiKey}`,
      },
      body: formData,
    });
  
    const data = await response.json();
    return data;
  }
  
  
  
  
  // Function to parse the Whisper API response
  function parseWhisperResponse(response) {
    const transcriptionSegments = response.segments.map((segment) => ({
      text: segment.text,
      start: segment.start,
      end: segment.end,
    }));
  
    return transcriptionSegments;
  }
  
  // Function to merge transcriptions using fuzzy logic
  function mergeTranscriptions(awsTranscription, whisperTranscription) {
    const mergedTranscription = [];
  
    for (const segment of whisperTranscription) {
      const speakerLabel = findSpeakerLabel(segment, awsTranscription);
      mergedTranscription.push({
        speaker: speakerLabel,
        start: segment.start,
        end: segment.end,
        text: segment.text,
      });
    }
  
    return mergedTranscription;
  }
  
  // Helper function to find the corresponding speaker label for a Whisper segment
  function findSpeakerLabel(segment, awsTranscription) {
    for (const speakerSegment of awsTranscription) {
      if (
        segment.start >= speakerSegment.start &&
        segment.end <= speakerSegment.end
      ) {
        return speakerSegment.speaker;
      }
    }
    return null;
  }

const PORT = process.env.PORT || 3030;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});