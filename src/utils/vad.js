const WebRTC = require('webrtc-adapter');
const { AudioContext } = require('standardized-audio-context');

class VAD {
  constructor(mediaStream) {
    this.audioContext = new AudioContext();
    this.mediaStreamSource = this.audioContext.createMediaStreamSource(mediaStream);
    this.analyser = this.audioContext.createAnalyser();
    this.mediaStreamSource.connect(this.analyser);
    this.analyser.fftSize = 512;
    this.dataArray = new Uint8Array(this.analyser.fftSize);
    this.speaking = false;
    this.speechThreshold = 0.1;
    this.silenceThreshold = 0.05;
    this.speechListeners = [];
    this.silenceListeners = [];
    this.noiseReductionEnabled = true;
    this.start();
  }

  start() {
    this.analyser.getByteTimeDomainData(this.dataArray);
    const rms = this.calculateRMS(this.dataArray);
    if (this.noiseReductionEnabled) {
      this.applyNoiseReduction(this.dataArray);
    }
    if (rms > this.speechThreshold && !this.speaking) {
      this.speaking = true;
      this.speechListeners.forEach(listener => listener());
    } else if (rms < this.silenceThreshold && this.speaking) {
      this.speaking = false;
      this.silenceListeners.forEach(listener => listener());
    }
    requestAnimationFrame(this.start.bind(this));
  }

  calculateRMS(dataArray) {
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += Math.pow(dataArray[i] / 128 - 1, 2);
    }
    return Math.sqrt(sum / dataArray.length);
  }

  applyNoiseReduction(dataArray) {
    // Implement noise reduction logic here
    // This is a placeholder for noise reduction implementation
  }

  on(event, listener) {
    if (event === 'speech') {
      this.speechListeners.push(listener);
    } else if (event === 'silence') {
      this.silenceListeners.push(listener);
    }
  }

  setSpeechThreshold(threshold) {
    this.speechThreshold = threshold;
  }

  setSilenceThreshold(threshold) {
    this.silenceThreshold = threshold;
  }

  enableNoiseReduction(enable) {
    this.noiseReductionEnabled = enable;
  }
}

module.exports = VAD;
