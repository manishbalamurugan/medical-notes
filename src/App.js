import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import RealTimeTranscription from './app/playground/screens/RealTimeTranscription'; // Component for real-time transcription functionality
import Dashboard from './app/dashboard/screens/Dashboard'; // Component for the dashboard view
import Login from './app/auth/screens/Login'; // Component for user login

import { AuthProvider } from "./contexts/AuthContext"; // Context provider for authentication
import RequireAuth from "./app/utils/WithPrivateRoute"; // Higher-order component for private routes
import Register from './app/auth/screens/Register'; // Component for user registration

import { getAuth, onAuthStateChanged } from "firebase/auth"; // Firebase authentication

function App() {

  const [user, setUser] = useState(null); // State to hold the current user
  const auth = getAuth(); // Firebase authentication instance

  useEffect(() => {
    // Listen for changes in the authentication state
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribe(); // Cleanup function to stop listening
  }, [auth]);

  return (
    <AuthProvider> {/* Provides authentication context to the app */}
      <Router>
          <Routes>
              <Route exact path="/" element={<RequireAuth> <Dashboard user={user} /></RequireAuth>} /> {/* Dashboard route, protected by RequireAuth */}
              <Route exact path="/playground" element={<RequireAuth> <RealTimeTranscription user={user} /> </RequireAuth>} /> {/* Real-time transcription route, protected by RequireAuth */}
              <Route exact path="/playground/:noteID" element={<RequireAuth><RealTimeTranscription user={user} /></RequireAuth>} /> {/* Real-time transcription route with noteID, protected by RequireAuth */}
              <Route exact path="/login" element={<Login />} /> {/* Login route */}
              <Route exact path="/register" element={<Register/>} /> {/* Register route */}
          </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
