/**
 * @param {Float32Array} audioChunk
 * @returns {Uint8Array}
 */
  
  class AudioChopperProcessor extends AudioWorkletProcessor {
    constructor() {
      super();
      this.audioChunkSize = 4096;
      this.currAudioChunkSize = 0;
      this.currAudioChunk = new Float32Array(this.audioChunkSize);
      this.isRecording = false; // Added to manage recording state
      this.numberOfChannels = 1;
      this.port.onmessage = this.handleMessage.bind(this);
    }

    handleMessage(event) {
      if (event.data.command === 'start') {
        this.isRecording = true;
      } else if (event.data.command === 'stop') {
        this.isRecording = false;
        this.flush(); 
      }
    }
  
    resetCurrAudioChunk() {
      this.currAudioChunkSize = 0;
      this.currAudioChunk = new Float32Array(this.audioChunkSize);
    }
  
    isBufferFull() {
      return this.currAudioChunkSize >= this.audioChunkSize;
    }
  
    // Function to encode audio chunk as PCM, similar to the original implementation
    encodeAudioChunkAsPCM(audioChunk) {
      let offset = 0;
      const resultArrayBuffer = new ArrayBuffer(audioChunk.length * 2);
      const resultDataView = new DataView(resultArrayBuffer);
      for (let i = 0; i < audioChunk.length; i++, offset += 2) {
        const s = Math.max(-1, Math.min(1, audioChunk[i]));
        resultDataView.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
      }
      return new Uint8Array(resultArrayBuffer);
    }
  
    // Enhanced process method to handle recording state and multi-channel audio
    process(inputs) {
      console.log('Processing audio data'); // Debug log
      if (!this.isRecording) {
        return true; // Do nothing if not recording
      }
  
      const input = inputs[0]; // Assuming the first input contains our audio data
      for (let channel = 0; channel < this.numberOfChannels; channel++) {
        const inputChannel = input[channel];
        for (let i = 0; i < inputChannel.length; i++) {
          if (this.isBufferFull()) {
            this.flush();
          }
          this.currAudioChunk[this.currAudioChunkSize++] = inputChannel[i];
        }
      }
  
      return true;
    }
  
    flush() {
      if (this.currAudioChunkSize > 0) {
        const audioChunk = this.currAudioChunk.slice(0, this.currAudioChunkSize);
        const encodedAudioChunk = this.encodeAudioChunkAsPCM(audioChunk);
        this.port.postMessage({ audioData: encodedAudioChunk });
        this.resetCurrAudioChunk();
      }
    }
  
  }
  
  registerProcessor("audio-chopper-processor", AudioChopperProcessor)
  