const socket = new WebSocket('ws://localhost:3000');

const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');
const pauseButton = document.getElementById('pauseButton');
const resumeButton = document.getElementById('resumeButton');
const voiceIdSelect = document.getElementById('voiceId');
const pitchInput = document.getElementById('pitch');
const speedInput = document.getElementById('speed');
const volumeInput = document.getElementById('volume');
const transcriptionText = document.getElementById('transcriptionText');
const responseText = document.getElementById('responseText');

let isSpeaking = false;
let audioContext;
let mediaStream;
let mediaStreamSource;
let vad;
let audioChunks = [];
let audioBuffer;

startButton.addEventListener('click', startVoiceInteraction);
stopButton.addEventListener('click', stopVoiceInteraction);
pauseButton.addEventListener('click', pauseVoiceInteraction);
resumeButton.addEventListener('click', resumeVoiceInteraction);

socket.addEventListener('message', handleSocketMessage);

function startVoiceInteraction() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            mediaStream = stream;
            mediaStreamSource = audioContext.createMediaStreamSource(stream);
            vad = new VAD(mediaStreamSource);
            vad.on('speech', handleSpeech);
            vad.on('silence', handleSilence);
        })
        .catch(error => console.error('Error accessing microphone:', error));
}

function stopVoiceInteraction() {
    if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
    }
    if (audioContext) {
        audioContext.close();
    }
    isSpeaking = false;
}

function pauseVoiceInteraction() {
    if (audioContext) {
        audioContext.suspend();
    }
}

function resumeVoiceInteraction() {
    if (audioContext) {
        audioContext.resume();
    }
}

function handleSpeech() {
    if (!isSpeaking) {
        isSpeaking = true;
        audioChunks = [];
    }
}

function handleSilence() {
    if (isSpeaking) {
        isSpeaking = false;
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        socket.send(audioBlob);
    }
}

function handleSocketMessage(event) {
    const data = JSON.parse(event.data);
    if (data.type === 'transcription') {
        transcriptionText.textContent = data.text;
    } else if (data.type === 'response') {
        responseText.textContent = data.text;
        playResponseAudio(data.audio);
    }
}

function playResponseAudio(audioData) {
    const audioBufferSource = audioContext.createBufferSource();
    audioContext.decodeAudioData(audioData, buffer => {
        audioBufferSource.buffer = buffer;
        audioBufferSource.connect(audioContext.destination);
        audioBufferSource.start();
    });
}

class VAD {
    constructor(mediaStreamSource) {
        this.mediaStreamSource = mediaStreamSource;
        this.analyser = audioContext.createAnalyser();
        this.mediaStreamSource.connect(this.analyser);
        this.analyser.fftSize = 512;
        this.dataArray = new Uint8Array(this.analyser.fftSize);
        this.speaking = false;
        this.speechThreshold = 0.1;
        this.silenceThreshold = 0.05;
        this.speechTimeout = null;
        this.silenceTimeout = null;
        this.speechListeners = [];
        this.silenceListeners = [];
        this.start();
    }

    start() {
        this.analyser.getByteTimeDomainData(this.dataArray);
        const rms = this.calculateRMS(this.dataArray);
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

    on(event, listener) {
        if (event === 'speech') {
            this.speechListeners.push(listener);
        } else if (event === 'silence') {
            this.silenceListeners.push(listener);
        }
    }
}

function fetchVoiceIds() {
    fetch('/api/elevenlabs/voices')
        .then(response => response.json())
        .then(data => {
            data.voices.forEach(voice => {
                const option = document.createElement('option');
                option.value = voice.id;
                option.textContent = voice.name;
                voiceIdSelect.appendChild(option);
            });
        })
        .catch(error => console.error('Error fetching voice IDs:', error));
}

fetchVoiceIds();
