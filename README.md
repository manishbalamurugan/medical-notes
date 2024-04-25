# Real-Time Transcription Demo with Electron

This repository showcases a demo project that combines the power of React and Electron to provide real-time transcription capabilities in a desktop application. It demonstrates how to capture audio input from the user's microphone, process it in real time, and display the transcribed text within a sleek and responsive user interface.

## Project Overview

This project is a desktop application built using Electron and React. It leverages WebSockets and the Web Speech API for real-time audio transcription. The application is designed to be cross-platform, working seamlessly on Windows, macOS, and Linux.

## Getting Started

To run this project on your local machine, follow these steps:

1. Clone this repository to your local machine.
2. Navigate to the project directory in your terminal.
3. Run `npm install` to install all the necessary dependencies.
4. To start the application in development mode, run `npm run electron-dev`.

This will launch the Electron application with a React frontend, and you can interact with it as you would with any desktop application. The application will automatically reload if you make any changes to the code.

## Key Features

- **Real-Time Audio Transcription**: Captures audio from the user's microphone and uses the Web Speech API to transcribe it in real time.
- **Electron Framework**: Allows for the creation of a standalone desktop application that is compatible across multiple operating systems.
- **React Frontend**: Utilizes modern React features such as hooks and functional components to create a responsive and interactive user interface.
- **Cross-Platform Compatibility**: Works on Windows, macOS, and Linux without any modifications to the codebase.

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

## Contributing

We welcome contributions to this project! Whether it's submitting a bug report, proposing a new feature, or contributing code, we encourage you to get involved.

## License

This project is licensed under the MIT License - see the LICENSE file for details.


