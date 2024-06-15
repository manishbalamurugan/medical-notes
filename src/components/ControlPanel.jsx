import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';

function ControlPanel({
  isUploadOpen,
  setIsUploadOpen,
  isRecordOpen,
  setIsRecordOpen,
  getRootProps,
  getInputProps,
  isDragActive,
  uploading,
  transcribeAudio,
  startRecording,
  stopRecording,
  handleAudioSave,
  isRecording
}) {
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    let timer;
    if (isRecording && !isPaused) {
      timer = setInterval(() => {
        setRecordingTime(prevTime => prevTime + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRecording, isPaused]);

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <aside className="w-64 border-l border-gray-200 dark:border-gray-800 overflow-auto p-4 bg-white dark:bg-gray-900">
      <nav className="flex flex-col gap-4">
        <div className="space-y-4 mt-[1rem]">
          <div id="upload" className="flex flex-col">
            <h3 className="text-md font-bold text-gray-700 dark:text-gray-300 cursor-pointer" onClick={() => setIsUploadOpen(!isUploadOpen)}>Upload Audio</h3>
            {isUploadOpen && (
              <div className="flex flex-col mt-2">
                <div {...getRootProps()} className="bg-gray-50 dark:bg-gray-800 w-full rounded-md p-4 dropzone border-2 border-dashed border-gray-300 dark:border-gray-600 cursor-pointer transition duration-150 ease-in-out hover:bg-gray-100 dark:hover:bg-gray-700">
                  <input {...getInputProps()} />
                  {isDragActive ? (
                    <p className="text-center text-gray-500 dark:text-gray-300">Drop the audio file here...</p>
                  ) : (
                    <p className="text-center text-gray-500 dark:text-gray-300">Drag & drop an audio file here, or click to select one</p>
                  )}
                </div>
                <button className={`mt-4 bg-blue-500 hover:bg-blue-700 text-white font-medium text-sm py-2 rounded ${uploading ? "bg-gray-100 disable" : ""}`} onClick={transcribeAudio} disabled={uploading}>
                  {uploading ? 'Transcribing...' : 'Transcribe'}
                </button>
              </div>
            )}
          </div>
          <hr className="border-t border-gray-200 dark:border-gray-800"/>
          <div id="record" className="flex flex-col">
            <h3 className="text-md font-bold text-gray-700 dark:text-gray-300 cursor-pointer" onClick={() => setIsRecordOpen(!isRecordOpen)}>Record Audio</h3>
            {isRecordOpen && (
              <div className="flex flex-col mt-2 space-y-2">
                <div className="flex items-center space-x-2">
                  <button
                    className={`${
                      isRecording
                        ? isPaused
                          ? 'bg-yellow-500 hover:bg-yellow-700'
                          : 'bg-violet-500 hover:bg-violet-700'
                        : 'bg-green-500 hover:bg-green-700'
                    } text-white font-medium text-sm py-2 px-4 rounded transition duration-150 ease-in-out`}
                    onClick={isRecording ? handlePause : startRecording}
                    disabled={uploading}
                  >
                    {isRecording ? (isPaused ? 'Resume' : 'Pause') : 'Start'}
                  </button>
                  <button className="bg-red-500 hover:bg-red-700 text-white font-medium text-sm py-2 px-4 rounded transition duration-150 ease-in-out" onClick={stopRecording} disabled={!isRecording || uploading}>
                    Stop
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex-grow bg-gray-200 dark:bg-gray-700 h-2 rounded">
                    <div className="bg-blue-500 h-2 rounded" style={{ width: `${(recordingTime / 60) * 100}%` }}></div>
                  </div>
                  <div className="text-gray-500 dark:text-gray-300">
                    {formatTime(recordingTime)}
                  </div>
                </div>
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-medium text-sm py-2 px-4 rounded transition duration-150 ease-in-out" onClick={handleAudioSave} disabled={uploading}>
                  {uploading ? 'Transcribing...' : 'Transcribe'}
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </aside>
  );
}

export default ControlPanel;

