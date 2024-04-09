import React, { useEffect, useState, useCallback} from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '../components/ui/card.jsx';
import { Button } from '../components/ui/button.jsx';
import { useDropzone } from 'react-dropzone';
import { toast, ToastContainer } from 'react-toastify';
import { useAudioRecorder } from 'react-audio-voice-recorder'; 
import axios from 'axios';
import Nav from '../components/Nav.jsx';

function RealTimeTranscription(props) {
  const [uploading, setUploading] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [notes, setNotes] = useState('');
  const [audioFile, setAudioFile] = useState(null);
  const [audioDuration, setAudioDuration] = useState(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isRecordOpen, setIsRecordOpen] = useState(false);

  const user = props.user;

  const {
    startRecording,
    stopRecording,
    recordingBlob,
    isRecording,
  } = useAudioRecorder({
    audioTrackConstraints: { echoCancellation: true }
  });

  useEffect(() => {
    if (!uploading) {
      // Perform any action needed after uploading is complete
      console.log('Upload complete');
    }
  }, [uploading]);

  const handleAudioSave = useCallback(async () => {
    if (!recordingBlob) {
      toast.error('No recording found.');
      return;
    }
  
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', recordingBlob, 'audio.webm');
  
      const response = await axios.post(`http://localhost:3030/api/transcribe`, formData);
  
      setTranscription(response.data.transcription);
      toast.success('Transcription successful.');
    } catch (error) {
      toast.error('An error occurred during transcription.');
    } finally {
      setUploading(false);
    }
  }, [recordingBlob]);

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
      const response = await axios.post(`http://localhost:3030/api/transcribe`, formData);

      console.log(response);

      setTranscription(response.data.transcription);
      setNotes(response.data.notes);
      toast.success('Transcription successful.');
    } catch (error) {
      console.error(error); // For more detailed debugging
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
    <div className="flex flex-col h-screen w-screen bg-white dark:bg-zinc-900">
      <Nav user={user}/>
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 border-r border-zinc-200 dark:border-zinc-800 overflow-auto">
          <nav className="flex flex-col gap-4 p-4">
            <div className="space-y-4">
              <div id="upload" className="flex flex-col">
                <h3 className="text-md font-bold text-zinc-500 dark:text-zinc-400 cursor-pointer" onClick={() => setIsUploadOpen(!isUploadOpen)}>Upload Audio</h3>
                {isUploadOpen && (
                  <div className="flex flex-row justify-around items-center mt-2">
                    <div {...getRootProps()} className="bg-black/5 w-fit rounded-md p-2 dropzone border-2 border-dashed rounded cursor-pointer">
                      <input {...getInputProps()} />
                      {isDragActive ? (
                        <p>Drop the audio file here...</p>
                      ) : (
                        <p className="text-xs font-medium">Upload File</p>
                      )}
                    </div>
                    <button className={`bg-blue-500 hover:bg-blue-700 text-white font-medium text-xs p-2 rounded ${uploading ? "bg-gray-100 disable" : ""}`} onClick={transcribeAudio} disabled={uploading}>
                      {'Transcribe →'}
                    </button>
                  </div>
                )}
              </div>
              <hr className="border-t border-zinc-200 dark:border-zinc-800"/>
              <div id="record" className="flex flex-col">
                <h3 className="text-md font-bold text-zinc-500 dark:text-zinc-400 cursor-pointer" onClick={() => setIsRecordOpen(!isRecordOpen)}>Record Audio</h3>
                {isRecordOpen && (
                  <div className="flex flex-wrap justify-start items-center gap-2 mt-2">
                    <button className="bg-green-500 hover:bg-blue-700 text-white font-medium text-xs p-2 rounded" onClick={startRecording} disabled={isRecording || uploading}>
                      Start Recording
                    </button>
                    <button className="bg-red-500 hover:bg-red-700 text-white font-medium text-xs p-2 rounded" onClick={stopRecording} disabled={!isRecording || uploading}>
                      Stop Recording
                    </button>
                    <button className=" bg-blue-500 hover:bg-blue-700 text-white font-medium text-xs p-2 rounded" onClick={handleAudioSave} disabled={uploading}>
                      {uploading ? 'Transcribing...' : 'Transcribe →'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </nav>
        </aside>
        <main className="flex-1 overflow-auto p-4">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Transcription Output</h2>
            </CardHeader>
            {/* <CardContent>
              {transcription.length > 0 ? (
                transcription.map((segment, index) => (
                  <p key={index} className="text-gray-700 dark:text-gray-300">
                    <strong>Speaker {segment.speaker}: </strong>
                    {segment.text}
                    <span className="text-xs text-gray-500"> ({segment.start}s - {segment.end}s)</span>
                  </p>
                ))
              ) : (
                <p className="text-gray-700 dark:text-gray-300">Start speaking, and your words will appear here...</p>
              )}
            </CardContent> */}
            <CardContent>
              {uploading ? (
                <div className="flex justify-center items-center" role="status">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-gray-700 dark:border-gray-300 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                  <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)] text-gray-700 dark:text-gray-300 ml-4">Loading...</span>
                </div>
              ) : (
                <div className="flex flex-row justify-between space-x-5">
                  <div className="w-1/2 space-y-4 text-md font-medium">
                    {transcription.length > 0 && <p className='text-xl font-semibold'>Transcription</p>}
                    {transcription.split('\n').map((line, index) => (
                      <p key={index}>{line}</p>
                    ))}
                  </div>
                  <div className="w-1/2 space-y-4 text-md font-medium">
                    {notes.length > 0 && <p className='text-xl font-semibold'>Transcription</p>}
                    {notes.split('\n').map((note, index) => (
                      <p key={index}>{note}</p>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}

export default RealTimeTranscription;



