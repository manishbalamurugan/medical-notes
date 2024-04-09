import React from 'react';
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import RealTimeTranscription from './app/RealTimeTranscription';
import Login from './app/auth/screens/Login';

import { AuthProvider } from "./contexts/AuthContext";
import RequireAuth from "./app/auth/utils/WithPrivateRoute";
import Register from './app/auth/screens/Register';

import { getAuth } from "firebase/auth";

function App() {

  const auth = getAuth();
  const user = auth.currentUser


  return (
    <AuthProvider>
      <Router>
          <Routes>
              <Route exact path="/" element={<RequireAuth> <RealTimeTranscription user={user} /> </RequireAuth>} />
              <Route exact path="/login" element={<Login />} />
              <Route exact path="/register" element={<Register/>} />
          </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
