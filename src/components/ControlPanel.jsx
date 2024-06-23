import React, { useState, useEffect, useRef } from 'react';
import { FaMicrophone, FaStop, FaPause, FaPlay } from 'react-icons/fa';

function ControlPanel({
  getRootProps,
  getInputProps,
  isDragActive,
  uploading,
  transcribeAudio,
  handleAudioData,
  audioFile,
}) {
  const [activeTab, setActiveTab] = useState('upload');
  const [recordingTime, setRecordingTime] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(null);

  useEffect(() => {
    let timer;
    if (isRecording && !isPaused) {
      timer = setInterval(() => {
        setRecordingTime(prevTime => prevTime + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRecording, isPaused]);

  useEffect(() => {
    if (audioURL && activeTab === 'Record') {
      handleTranscribe();
    }
  }, [audioURL]);

  const handleStartRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);
    mediaRecorderRef.current.ondataavailable = (event) => {
      audioChunksRef.current.push(event.data);
    };
    mediaRecorderRef.current.onstop = () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
      setAudioBlob(audioBlob);
      setAudioURL(URL.createObjectURL(audioBlob));
      audioChunksRef.current = [];
    };
    mediaRecorderRef.current.start();
    setIsRecording(true);
    setIsPaused(false);
  };

  const handleStopRecording = () => {
    mediaRecorderRef.current.stop();
    setIsRecording(false);
    setRecordingTime(0);
  };

  const handlePauseRecording = () => {
    if (isPaused) {
      mediaRecorderRef.current.resume();
    } else {
      mediaRecorderRef.current.pause();
    }
    setIsPaused(!isPaused);
  };

  const handleTranscribe = () => {
    if (audioBlob) {
      handleAudioData({ blob: audioBlob });
    } else if (uploadedFile) {
      handleAudioData({ blob: uploadedFile });
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedFile(file);
      setAudioURL(URL.createObjectURL(file));
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className="control-panel border-1 border-gray-200 dark:border-gray-800 overflow-auto p-4 bg-white dark:bg-gray-900">
      <nav className="flex gap-4 border-b border-gray-200 dark:border-gray-800 mb-4">
        <button
          className={`text-md font-bold text-gray-700 dark:text-gray-300 cursor-pointer ${activeTab === 'upload' ? 'border-b-2 border-blue-500' : ''}`}
          onClick={() => setActiveTab('upload')}
        >
          Upload Audio
        </button>
        <button
          className={`text-md font-bold text-gray-700 dark:text-gray-300 cursor-pointer ${activeTab === 'record' ? 'border-b-2 border-blue-500' : ''}`}
          onClick={() => setActiveTab('record')}
        >
          Record Audio
        </button>
      </nav>
      <div className="tab-content">
        {activeTab === 'upload' && (
          <div className="flex flex-col mt-2">
            <div 
              {...getRootProps({ className: 'bg-gray-50 dark:bg-gray-800 w-full rounded-md p-4 dropzone border-2 border-dashed border-gray-300 dark:border-gray-600 cursor-pointer transition duration-150 ease-in-out hover:bg-gray-100 dark:hover:bg-gray-700' })}
            >
              <input {...getInputProps()} className="hidden" />
              <p className="text-center text-gray-500 dark:text-gray-300 pb-5">
                {audioFile ? 'View the preview below: ' : (isDragActive ? 'Drop the files here ...' : 'Drag & drop an audio file here, or click to select one')}
              </p>
              {audioFile && (
                <div className="mt-2 text-center">
                  <p className="text-gray-700 dark:text-gray-300 font-medium">{audioFile.name}</p>
                  <audio controls src={audioURL} className="mt-2 w-full" />
                </div>
              )}
            </div>
            <button
              className="mt-4 w-fit bg-blue-500 hover:bg-blue-700 text-white font-medium text-sm p-2 rounded"
              onClick={transcribeAudio}
            >
              Transcribe
            </button>
          </div>
        )}
        {activeTab === 'record' && (
          <>
          <div className="flex flex-col mt-2 p-4 bg-gray-50 dark:bg-gray-800 w-full rounded-md border-2 border-dashed border-gray-300 dark:border-gray-600">
            <div className="flex items-center justify-between mb-4">
              <div className="flex space-x-2">
                <button
                  className="bg-violet-500 hover:bg-violet-700 text-white font-medium text-sm p-2 rounded"
                  onClick={isRecording ? handleStopRecording : handleStartRecording}
                >
                  {isRecording ? 'Stop' : 'Microphone'}
                </button>
                {isRecording && (
                  <button
                    className="bg-red-500 hover:bg-red-700 text-white font-medium text-sm p-2 rounded"
                    onClick={handlePauseRecording}
                  >
                    {isPaused ? 'Play' : 'Pause'}
                  </button>
                )}
              </div>
              <span className="text-gray-700 dark:text-gray-300">{formatTime(recordingTime)}</span>
            </div>
            {audioURL && (
              <div className="flex flex-col items-center mt-2">
                <hr className="w-1/2 border-t border-gray-300 dark:border-gray-600 my-4 pb-2" />
                <h1 className="mb-5 text-xs font-bold uppercase">Audio Preview</h1>
                <audio ref={audioRef} controls src={audioURL} className="w-full" />
              </div>
            )}
          </div>

          {audioURL && (
            <button
            className="mt-4 w-fit bg-blue-500 hover:bg-blue-700 text-white font-medium text-sm p-2 rounded"
            onClick={transcribeAudio}
            >
            Transcribe
          </button>
          )}
          </>
      )}
      </div>
    </div>
  );
}

export default ControlPanel;