/**
 * @param {Float32Array} audioChunk
 * @returns {Uint8Array}
 */
function encodeAudioChunkAsPCM(audioChunk) {
    let offset = 0;
  
    const resultArrayBuffer = new ArrayBuffer(audioChunk.length * 2);
    const resultDataView = new DataView(resultArrayBuffer);
  
    for (let i = 0; i < audioChunk.length; i++, offset += 2) {
        const s = Math.max(-1, Math.min(1, audioChunk[i]));
        resultDataView.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
  
    return new Uint8Array(resultArrayBuffer);
  }
  
  class AudioChopperProcessor extends AudioWorkletProcessor {
    //audioChunkSize = 4096;
    audioChunkSize = 4096;
    currAudioChunkSize = 0;
    currAudioChunk = new Float32Array(this.audioChunkSize, 1, 1);
  
    constructor() {
      super();
      this.resetCurrAudioChunk();
    }
  
    /**
     * @returns {void}
     */
    resetCurrAudioChunk() {
      this.currAudioChunkSize = 0
    }
  
    /**
     * @returns {boolean}
     */
    isBufferEmpty() {
      return this.currAudioChunkSize === 0
    }
  
     /**
     * @returns {boolean}
     */
    isBufferFull() {
      return this.currAudioChunkSize === this.audioChunkSize
    }
  
     /**
     * @param {Float32Array[][]} audioChunks
     * @returns {boolean}
     */
    process(inputs) {
      const channelData = inputs[0][0];
  
      if (this.isBufferFull()) {
        this.flush()
      }
  
      if (!channelData) return true;
  
      for (let i = 0; i < channelData.length; i++) {
        this.currAudioChunk[this.currAudioChunkSize++] = channelData[i]
      }
  
      return true
    }
  
     /**
     * @returns {void}
     */
     flush() {
      const audioChunk = this.currAudioChunkSize < this.audioChunkSize ?
        this.currAudioChunk.slice(0, this.currAudioChunkSize) :
        this.currAudioChunk;
  
      // Encode the audio chunk as PCM
      const encodedAudioChunk = encodeAudioChunkAsPCM(audioChunk);
  
      // Post the message to the main thread
      this.port.postMessage(encodedAudioChunk);
  
      this.resetCurrAudioChunk();
    }
  
  }
  
  registerProcessor("audio-chopper-processor", AudioChopperProcessor)
  