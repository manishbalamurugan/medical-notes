# Real-Time Transcription Demo with Electron

This repository showcases a demo project that combines the power of React and Electron to provide a web application designed to transcribe audio in real-time, leveraging Whisper and OpenAI LLMs for accurate audio transcription and notes generation.

## Project Overview

This project is a desktop application built using Electron and React. It leverages WebSockets and the Web Speech API for real-time audio transcription. The application is designed to be cross-platform, working seamlessly on Windows, macOS, and Linux.

## Getting Started

To run this project on your local machine, follow these steps:

1. Clone this repository to your local machine.
2. Navigate to the project directory in your terminal.
3. Run `npm install` to install all the necessary dependencies.
4. To start the application in development mode, run `npm run electron-dev`.

This will launch the Electron application with a React frontend, and you can interact with it as you would with any desktop application. The application will automatically reload if you make any changes to the code.


# Installing Node

To ensure that you have the correct version of Node.js and npm installed, follow these steps for your operating system:

### Installing Node.js and npm using nvm (Node Version Manager)

#### For macOS:
1. Open your terminal.
2. Install nvm by running the following script:
   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
   ```
3. Restart your terminal.
4. Install Node.js by running:
   ```bash
   nvm install node
   ```
5. Verify the installation of Node.js and npm:
   ```bash
   node -v
   npm -v
   ```

#### For Windows:
1. **Download nvm for Windows:**
   - Visit the [nvm-windows releases page](https://github.com/coreybutler/nvm-windows/releases).
   - Look for the latest release and download the `nvm-setup.zip` file.
   - Extract the zip file and run the `nvm-setup.exe` file to start the installer.
   - Follow the on-screen instructions to install nvm. This will typically involve clicking 'Next' a few times.

2. **Open Command Prompt as Administrator:**
   - Click on the Start menu and type `cmd`.
   - Right-click on `Command Prompt` and select `Run as administrator`.
   - If prompted, click `Yes` to allow the app to make changes to your device.

3. **Install Node.js using nvm:**
   - In the Command Prompt, type the following command and press Enter:
     ```cmd
     nvm install latest
     ```
   - After the installation completes, set the installed version of Node.js as the default by typing:
     ```cmd
     nvm use latest
     ```

4. **Verify the Installation:**
   - Check that Node.js and npm are correctly installed by typing the following commands and pressing Enter:
     ```cmd
     node -v
     npm -v
     ```
   - This will display the versions of Node.js and npm installed on your system.

By following these steps, you will have Node.js and npm installed on your system using nvm, which allows you to switch between different versions of Node.js if needed for other projects.



## Key Features

- **Real-Time Audio Transcription**: Captures audio from the user's microphone and uses the Web Speech API to transcribe it in real time.
- **Electron Framework**: Allows for the creation of a standalone desktop application that is compatible across multiple operating systems.
- **React Frontend**: Utilizes modern React features such as hooks and functional components to create a responsive and interactive user interface.
- **Cross-Platform Compatibility**: Works on Windows, macOS, and Linux without any modifications to the codebase.


## Key Components
- **React Components**: Manage the UI and state of the application.
  - `src/app/RealTimeTranscription.jsx`: Main component for handling audio uploads and displaying transcriptions and notes.
- **Server Endpoints**: Handle audio processing and API interactions.
  - `api/server.js`: Express server setup and routes for audio transcription and notes generation.
- **External APIs**:
  - OpenAI's Whisper for enhanced transcription accuracy.
  - GPT-4 for generating medical notes from transcriptions.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the React app in development mode. Open [http://localhost:3000](http://localhost:3000) to view it in your browser. The page will reload with any code changes.

### `npm run electron`

Starts the Electron app in development mode. This script first builds the React app, then launches the Electron application where the React app is loaded.

### `npm test`

Launches the test runner in interactive watch mode. Use this to run your unit tests.

### `npm run build`

Builds the app for production to the `build` folder. It optimizes the build for the best performance by minifying the code and optimizing assets. This is necessary before packaging the app for production.

### `npm run electron-pack`

Packages the Electron app for distribution. This script builds the React app for production, then packages the Electron app using Electron Builder.

## Deployment

This section provides a brief overview of how to package and distribute the Electron application. For more detailed instructions, please refer to the Electron documentation on packaging and distribution.

## License

This project is licensed under the MIT License - see the LICENSE file for details.


