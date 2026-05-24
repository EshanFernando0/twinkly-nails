import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/firebase';

const ProtectedRoute = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to Firebase to see if a user is currently logged in
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Show a blank screen or loading spinner while Firebase checks the status
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-brand-burgundy font-sans tracking-widest uppercase">Verifying Access...</div>;
  }

  // If no user is logged in, kick them back to the login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If they are logged in, let them see the admin pages!
  return children;
};

export default ProtectedRoute;