import React, { useEffect, useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';
import axios from 'axios';
import Nav from '../../../components/Nav.jsx';
import ControlPanel from '../components/ControlPanel.jsx';
import { v4 as uuidv4 } from 'uuid';

import { useAudioRecorder } from 'react-audio-voice-recorder';


function RealTimeTranscription(props) {
  const [uploading, setUploading] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [notes, setNotes] = useState('');
  const [audioFile, setAudioFile] = useState(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isRecordOpen, setIsRecordOpen] = useState(false);
  const [isNoteEditable, setIsNoteEditable] = useState(true);
  const [noteTitle, setNoteTitle] = useState('Note');
  const [loading, setLoading] = useState(true);

  const user = props.user;
  const noteID = window.location.pathname.split('/playground/')[1];
  console.log("NoteID", noteID);

  const handleAudioData = useCallback((audioData) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('file', audioData, 'audio.wav');
  
    axios.post(`/api/transcribe`, formData)
      .then(response => {
        setTranscription(response.data.transcription);
        setNotes(response.data.notes);
        setIsNoteEditable(true);
        toast.success('Transcription successful.');
      })
      .catch(error => {
        console.error('Error during transcription:', error);
        toast.error('An error occurred during transcription.');
      })
      .finally(() => {
        setUploading(false);
      });
  }, []);

  useEffect(() => {
    if (noteID) {
      fetchNoteData(noteID);
    } else {
      setLoading(false);
    }
  }, [noteID]);


  const fetchNoteData = async (noteID) => {
    try {
      const response = await axios.get(`/api/retrieveNote`, {
        params: { noteID }
      });
      const noteData = response.data;
      console.log(noteData);
      setTranscription(noteData.transcription);
      setNotes(noteData.notes);
      setNoteTitle(noteData.title);
      setIsNoteEditable(false);
    } catch (error) {
      console.error('Error fetching note data:', error);
      toast.error('An error occurred while fetching note data.');
    } finally {
      setLoading(false);
    }
  };

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length === 0) {
      return;
    }

    const file = acceptedFiles[0];
    if (!file.type.startsWith('audio/') || file.size > 400 * 1024 * 1024) {
      return;
    }
    setAudioFile(file);
  }, []);

  const transcribeAudio = async () => {
    setUploading(true);

    try {
      const formData = new FormData();
      audioFile && formData.append('file', audioFile);
      const response = await axios.post(`/api/transcribe`, formData);

      console.log(response);

      setTranscription(response.data.transcription);
      setNotes(response.data.notes);
      setIsNoteEditable(true);
      toast.success('Transcription successful.');
    } catch (error) {
      console.error(error); // For more detailed debugging
      toast.error('An error occurred during transcription.');
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: 'audio/*',
  });

  const getCurrentDateTime = () => {
    const now = new Date();
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' };
    return now.toLocaleDateString('en-US', options);
  };

  const handleSaveNote = async () => {
    if (!noteID) {
      toast.error('No note ID provided.');
      return;
    }

    setIsNoteEditable(false);

    try {
      const response = await axios.post('/api/saveNote', {
        noteID: noteID,
        userID: user?.email,
        title: noteTitle,
        notes: notes.length > 0 ? notes : "N/A",
        transcription: transcription.length > 0 ? transcription : "N/A"
      });

      if (response.status === 200) {
        toast.success('Note saved successfully.');
      } else {
        toast.error('Failed to save note.');
      }
    } catch (error) {
      console.error('Error saving note:', error);
      toast.error('An error occurred while saving note.');
    }
  };

  const handleFinishNote = async () => {

    setIsNoteEditable(false);

    try {
      const response = await axios.post('/api/saveNotes', {
        noteID: noteID ? noteID : uuidv4(),
        userID: user?.email,
        title: noteTitle,
        notes: notes.length > 0 ? notes : "N/A",
        transcription: transcription.length > 0 ? transcription : "N/A"
      });

      if (response.status === 200) {
        toast.success('Notes saved successfully.');
      } else {
        toast.error('Failed to save notes.');
      }
    } catch (error) {
      console.error('Error saving notes:', error);
      toast.error('An error occurred while saving notes.');
    }
  };

  const handleRefreshState = () => {
    setUploading(false);
    setTranscription('');
    setNotes('');
    setAudioFile(null);
    setIsUploadOpen(false);
    setIsRecordOpen(false);
    setIsNoteEditable(true);
    setNoteTitle('Note');
  };

  if (loading) {
    return (
      <div className="flex h-screen w-screen bg-white dark:bg-zinc-900 justify-center items-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-gray-700 dark:border-gray-300 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        <span className="ml-4 text-gray-700 dark:text-gray-300">Loading...</span>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen bg-white dark:bg-zinc-900">
      <Nav user={user} />
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-auto p-4">
          <div className="p-4">
            <div className="flex flex-col mb-4 border-b pb-4">
              <div className="flex justify-between items-center mb-2">
                <input 
                  id="note-title"
                  type="text" 
                  className={`text-lg font-semibold border-b-2 border-gray-300 focus:outline-none focus:border-blue-500 ${!isNoteEditable && 'bg-gray-100'}`} 
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  readOnly={!isNoteEditable}
                />
                <div className="flex items-center space-x-2">
                  <button 
                    className="bg-gray-200 hover:bg-gray-300 text-black text-sm py-2 px-3 rounded"
                    onClick={() => setIsNoteEditable(true)}
                    disabled={isNoteEditable}
                  >
                    Edit
                  </button>
                  {noteID ? (
                    <button 
                      className="bg-gray-200 hover:bg-gray-300 text-black text-sm py-2 px-3 rounded"
                      onClick={handleSaveNote}
                      disabled={!isNoteEditable}
                    >
                      Save
                    </button>
                  ) : (
                    <button 
                      className="bg-gray-200 hover:bg-gray-300 text-black text-sm py-2 px-3 rounded"
                      onClick={handleFinishNote}
                      disabled={!isNoteEditable}
                    >
                      Finish
                    </button>
                  )}
                  <button 
                    className="bg-gray-200 hover:bg-gray-300 text-black text-sm py-2 px-3 rounded"
                    onClick={handleRefreshState}
                  >
                    Refresh
                  </button>
                </div>
              </div>
              <div id="notes-details" className="flex items-center text-sm text-gray-500">
                <span className="mr-4">{getCurrentDateTime()}</span>
                <span id="user-email">Owner: {user?.email}</span>
              </div>
            </div>
            <div className="mt-4 flex flex-col space-y-4 flex-1 h-full border-2 ">
              {uploading ? (
                <div className="flex justify-center items-center mt-2" role="status">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-gray-700 dark:border-gray-300 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                  <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)] text-gray-700 dark:text-gray-300 ml-4">Loading...</span>
                </div>
              ) : (
                <>
                  {notes.length > 0 && (
                    <div>
                      <p className="text-sm m-5 font-semibold uppercase">NOTES</p>
                      <div className="flex justify-center">
                        <textarea
                          className="w-[95%] p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          readOnly={!isNoteEditable}
                          rows="10"
                        />
                      </div>
                    </div>
                  )}
                </>
              )}
              <div className="mt-auto bottom-0">
              <ControlPanel
                  getRootProps={getRootProps}
                  getInputProps={getInputProps}
                  isDragActive={isDragActive}
                  uploading={uploading}
                  transcribeAudio={transcribeAudio}
                  handleAudioData={handleAudioData}
                  audioFile={audioFile}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default RealTimeTranscription;