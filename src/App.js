import React from 'react';
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import RealTimeTranscription from './app/RealTimeTranscription';

function App() {
  return (
    <Router>
        <Routes>
            <Route exact path="/" element={<RealTimeTranscription />} />
        </Routes>
    </Router>
  );
}

export default App;
