import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';


const TranscriptionPage = () => {
  const [uploading, setUploading] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [audioFile, setAudioFile] = useState(null);
  const [audioDuration, setAudioDuration] = useState(null);


  const getAudioDuration = (file) => {
    const audio = new Audio(URL.createObjectURL(file));
    audio.addEventListener('loadedmetadata', () => {
      setAudioDuration(audio.duration);
    });
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
    getAudioDuration(file);
  }, []);

  const transcribeAudio = async () => {
    setUploading(true);

    try {
      const formData = new FormData();
      audioFile && formData.append('file', audioFile);

      const response = await axios.post(`http://localhost:3030/api/transcribe`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setTranscription(response.data.transcription);
      toast.success('Transcription successful.')
    } catch (error) {
      toast.error('An error occurred during transcription.');
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: 'audio/*',
  });

  return (
    <div className="container mx-auto py-12">
      <ToastContainer />
      <h1 className="text-4xl mb-6">Wrytr</h1>
      <div
        {...getRootProps()}
        className={`dropzone p-6 border-2 border-dashed rounded ${isDragActive ? 'border-green-500' : isDragReject ? 'border-red-500' : 'border-gray-300'
          }`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the audio file here...</p>
        ) : audioFile ? (
          <p>Selected file: {audioFile.name}</p>
        ) : (
          <p>Drag and drop an audio file here, or click to select a file</p>
        )}
      </div>
      {uploading && <p className="mt-4">Uploading and transcribing...</p>}
      {transcription && (
        <div className="mt-4">
          <h2 className="text-2xl mb-2">Transcription:</h2>
          <p>{transcription}</p>
        </div>
      )}
      <button
        className="mt-4 bg-blue-500 text-white font-bold py-2 px-4 rounded"
        onClick={transcribeAudio}
        disabled={uploading || !audioFile}
      >
        Transcribe
      </button>
    </div>
  );
};

export default TranscriptionPage;