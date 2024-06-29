import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import RealTimeTranscription from './app/playground/screens/RealTimeTranscription';
import Dashboard from './app/dashboard/screens/Dashboard';
import Login from './app/auth/screens/Login';

import { AuthProvider } from "./contexts/AuthContext";
import RequireAuth from "./app/utils/WithPrivateRoute";
import Register from './app/auth/screens/Register';

import { getAuth, onAuthStateChanged } from "firebase/auth";

function App() {

  const [user, setUser] = useState(null);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, [auth]);

  return (
    <AuthProvider>
      <Router>
          <Routes>
              <Route exact path="/" element={<RequireAuth> <Dashboard user={user} /></RequireAuth>} />
              <Route exact path="/playground" element={<RequireAuth> <RealTimeTranscription user={user} /> </RequireAuth>} />
              <Route exact path="/playground/:noteID" element={<RequireAuth><RealTimeTranscription user={user} /></RequireAuth>} />
              <Route exact path="/login" element={<Login />} />
              <Route exact path="/register" element={<Register/>} />
          </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
