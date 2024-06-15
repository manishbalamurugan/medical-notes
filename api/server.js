const dotenv = require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { OpenAI } = require("openai");
const AWS = require('aws-sdk');

const { v4: uuidv4 } = require('uuid');
const db = require('./config/db');

const app = express();
const upload = multer();

const openai = new OpenAI(process.env.OPENAI_API_KEY);

db.connect();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('App Ready!');
});

//Mongo Connection

//saveNotes: saves finalized notes to a Mongo Collection
app.post('/api/saveNotes', async (req, res) => {
    const { userID, title,  notes, transcription } = req.body;

    if (!userID || !notes || !title || !transcription) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        const dbInstance = db.getDB();
        const notesCollection = dbInstance.collection('notes');

        const newNote = {
            userID,
            title,
            notesID: uuidv4(),
            notes,
            transcription,
            dateCreated: new Date()
        };

        await notesCollection.insertOne(newNote);
        res.status(201).json({ message: 'Notes saved successfully' });
    } catch (error) {
        console.error('Error saving notes:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


//retrieveNotes: retrieve notes based by passed in userID
app.get('/api/retrieveNotes', async (req, res) => {
    const { userID } = req.query;

    if (!userID) {
        return res.status(400).json({ message: 'Missing required userID' });
    }

    try {
        const dbInstance = db.getDB();
        const notesCollection = dbInstance.collection('notes');

        const userNotes = await notesCollection.find({ userID }).toArray();

        if (userNotes.length === 0) {
            return res.status(404).json({ message: 'No notes found for the given userID' });
        }

        res.status(200).json(userNotes);
    } catch (error) {
        console.error('Error retrieving notes:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


//retrieveNote: Retrieve a single note by noteID
app.get('/api/retrieveNote', async (req, res) => {
    const { noteID } = req.query;

    if (!noteID) {
        return res.status(400).json({ message: 'Missing required noteID' });
    }

    try {
        const dbInstance = db.getDB();
        const notesCollection = dbInstance.collection('notes');

        const note = await notesCollection.findOne({ notesID: noteID });

        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }

        res.status(200).json(note);
    } catch (error) {
        console.error('Error retrieving note:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

//saveNote: update an existing note. 
app.post('/api/saveNote', async (req, res) => {
    const { noteID, userID, title, notes, transcription } = req.body;

    if (!noteID || !userID || !title || !notes || !transcription) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        const dbInstance = db.getDB();
        const notesCollection = dbInstance.collection('notes');

        const updateResult = await notesCollection.updateOne(
            { notesID: noteID, userID: userID },
            { $set: { title: title, notes: notes, transcription: transcription } }
        );

        if (updateResult.matchedCount === 0) {
            return res.status(404).json({ message: 'Note not found' });
        }

        res.status(200).json({ message: 'Note updated successfully' });
    } catch (error) {
        console.error('Error updating note:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});




//Transcription Service
app.post('/api/transcribe', upload.single('file'), async (req, res) => {
    const audioFile = req.file;
  
    if (!audioFile) {
        return res.status(400).json({ message: 'Audio file is required.' });
    }
  
    try {
        const whisperResponse = await transcribeAudioWithWhisper(audioFile);
        const llmTranscript = await formatTranscript(whisperResponse.text);
        const notes = await generateNotes(llmTranscript);
        
        console.log(llmTranscript);
        console.log(notes);
        
        res.json({ transcription: llmTranscript, notes: notes });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error transcribing audio' });
    }
});

//Format Transcription Service
async function formatTranscript(transcript) {
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

            Your answer must only contain the transcript and no additional words, headers, or titles.`
        },
        {
            role: "user",
            content: `Rough Transcript: ${transcript}`
        }
    ];

    const completion = await openai.chat.completions.create({
        messages: messages,
        model: "gpt-4",
    });

    return completion.choices[0].message.content;
}

//Notes Gen Service
async function generateNotes(transcript) {
    const messages = [
        {
            role: "system", 
            content: `You are an expert in generating high quality medical notes.`
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
            are not mentioned within the provided transcript.`
        },
        {
            role: "user",
            content: `Transcript: ${transcript}`
        }
    ];

    const completion = await openai.chat.completions.create({
        messages: messages,
        model: "gpt-4",
    });

    return completion.choices[0].message.content;
}



//Transcription Service
async function transcribeAudioWithWhisper(audioFile) {
    const formData = new FormData();
    const blob = new Blob([audioFile.buffer], { type: audioFile.mimetype });
    formData.append('file', blob, audioFile.originalname);
    formData.append('model', 'whisper-1');
    formData.append('response_format', 'verbose_json');
    formData.append('timestamp_granularities', 'segment');
  
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${openai.apiKey}`,
        },
        body: formData,
    });
  
    return response.json();
}

const PORT = process.env.PORT || 3030;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
