# Web App for Voice Interaction with LLM using ElevenLabs and OpenRouter

This web app allows users to interact with a large language model (LLM) using voice at a semi-realtime pace. It uses ElevenLabs for text-to-speech (TTS) and speech-to-text (STT) functionalities, and OpenRouter for LLM integration. The app also supports image generation using the Gemini Google API and can be installed as a Progressive Web App (PWA) on iPhone.

## Features

- Voice interaction with LLM using ElevenLabs and OpenRouter
- Real-time communication using WebSockets
- Hands-free turn detection with Voice Activity Detection (VAD)
- User interruption handling during TTS playback
- Image generation using Gemini Google API
- OAuth-based authentication
- Human-readable logs
- Built-in tests for debugging
- Docker container with Tailscale support

## Setup and Running the Web App

### Prerequisites

- Node.js and npm installed
- Docker installed (for Docker container option)
- Tailscale account (for Tailscale support)

### Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/githubnext/workspace-blank.git
   cd workspace-blank
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add the following environment variables:
   ```sh
   ELEVENLABS_API_KEY=your_elevenlabs_api_key
   OPENROUTER_API_KEY=your_openrouter_api_key
   GEMINI_API_KEY=your_gemini_api_key
   ```

### Running the Web App

1. Start the server:
   ```sh
   npm start
   ```

2. Open your browser and navigate to `http://localhost:3000` to access the web app.

## Configuring ElevenLabs, OpenRouter, and Gemini APIs

### ElevenLabs API

- Set up the ElevenLabs API client in `src/api/elevenlabs.js`.
- Implement functions for speech-to-text (STT) and text-to-speech (TTS).
- Handle chunking for both STT and TTS to reduce latency.

### OpenRouter API

- Set up the OpenRouter API client in `src/api/openrouter.js`.
- Implement functions for sending requests and handling responses.
- Handle chunking for responses to reduce latency.

### Gemini Google API

- Set up the Gemini Google API client in `src/api/gemini.js`.
- Implement functions for image generation and handling responses.

## Building and Running the Docker Container with Tailscale Support

### Building the Docker Image

1. Build the Docker image:
   ```sh
   docker build -t voice-interaction-app .
   ```

### Running the Docker Container

1. Create a `docker-compose.yml` file in the root directory with the following content:
   ```yaml
   version: '3'
   services:
     app:
       image: voice-interaction-app
       ports:
         - "3000:3000"
       environment:
         - ELEVENLABS_API_KEY=${ELEVENLABS_API_KEY}
         - OPENROUTER_API_KEY=${OPENROUTER_API_KEY}
         - GEMINI_API_KEY=${GEMINI_API_KEY}
       volumes:
         - .:/app
       command: sh -c "tailscale up --authkey=${TAILSCALE_AUTH_KEY} && npm start"
   ```

2. Start the Docker container:
   ```sh
   docker-compose up
   ```

3. Open your browser and navigate to `http://localhost:3000` to access the web app.

## Testing

### Running Tests

1. Run the tests:
   ```sh
   npm test
   ```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License.
