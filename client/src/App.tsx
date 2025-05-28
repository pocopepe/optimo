import React, { useEffect, useState, useCallback } from 'react';

// Import components
import NavBar from './components/NavBar';
import Admin from './components/Admin';
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import DashboardPage from './components/DashboardPage';
import AdminNavBar from './components/AdminNavBar';
// Re-introducing PatientsInQueuePage import
import PatientsInQueuePage from './components/PatientsInQueuePage'; 

// Import shared types
import type {
  NavigationLink,
  AuthTokenPayload,
  AuthenticatedRoleData,
  PatientDetail,
} from './types';

// Assuming Font Awesome is linked in public/index.html or imported globally
// <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"></link>


// Helper function to retrieve the authentication token from local storage
const getAuthToken = (): string | null => localStorage.getItem('authToken');

// Helper function to fetch authenticated role data from the backend API
const getAuthenticatedRoleData = async (token: string): Promise<AuthenticatedRoleData> => {
  const response = await fetch('https://server.avijusanjai.workers.dev/patient-data', { 
    headers: {
      'Authorization': `Bearer ${token}`, // Include the auth token in headers
    },
  });

  // Check if the response was successful
  if (!response.ok) {
    const errorData = await response.json();
    // Throw an error with a specific message if available, otherwise a generic one
    throw new Error(errorData.error || 'Failed to fetch patient data');
  }

  // Parse the JSON response into AuthenticatedRoleData type
  const data: AuthenticatedRoleData = await response.json();
  return data;
};

const App: React.FC = () => {
  // Define navigation links for the public-facing NavBar
  const myNavigationLinks: NavigationLink[] = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' }, // Example link, assuming an About page exists
  ];

  // State to keep track of the current URL path for client-side routing
  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname);
  // State to store authenticated user's role data (managed locally, not via Redux)
  const [authenticatedRoleData, setAuthenticatedRoleData] = useState<AuthenticatedRoleData | null>(null);

  // Callback for programmatic navigation using window.history API
  const navigate = useCallback((href: string): void => {
    window.history.pushState({}, '', href); // Change URL without reloading
    setCurrentPath(href); // Update local state to trigger re-render
  }, []);

  // Effect to handle browser's back/forward button navigation (popstate event)
  useEffect(() => {
    const handlePopState = (): void => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    // Cleanup event listener on component unmount to prevent memory leaks
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Callback for application-wide logout functionality
  const handleAppLogout = useCallback((): void => {
    localStorage.removeItem('authToken'); // Remove the stored authentication token
    setAuthenticatedRoleData(null); // Clear authentication data from local state
    navigate('/admin'); // Redirect user to the admin login page
  }, [navigate]); // Dependencies for useCallback

  // Effect to handle initial authentication check and subsequent redirects
  useEffect(() => {
    const authToken = getAuthToken(); // Get token from local storage
    const currentRoute = window.location.pathname; // Get current URL path

    if (authToken) {
      // If an auth token exists, attempt to fetch user data
      getAuthenticatedRoleData(authToken)
        .then((data: AuthenticatedRoleData) => {
          setAuthenticatedRoleData(data); // Store fetched data in local state
          const targetPath = `/${data.role}/dashboard`; // Determine the target dashboard path

          // Redirect to the appropriate dashboard if not already on it
          // Also allow navigation to patients-in-queue if already logged in
          if (!currentRoute.startsWith(targetPath) && !currentRoute.startsWith('/patients-in-queue')) {
            navigate(targetPath);
          }
        })
        .catch((error: Error) => {
          console.error('Authentication failed or data fetch error:', error);
          localStorage.removeItem('authToken'); // Clear invalid or expired token
          // If authentication fails, redirect to admin login unless already on it or home
          if (!currentRoute.startsWith('/admin') && !currentRoute.startsWith('/')) { 
            navigate('/admin');
          }
        });
    } else {
      // If no token, ensure the user is not on an authenticated route
      if (currentRoute.endsWith('/dashboard') || currentRoute.startsWith('/patients-in-queue')) {
        navigate('/admin'); // Redirect to admin login if on a protected route without a token
      }
    }
  }, [currentPath, navigate, handleAppLogout]); // Rerun this effect when these dependencies change

  // Determine if the AdminNavBar should be displayed based on authentication status and current path
  const isUserLoggedInToAdminPortal: boolean = authenticatedRoleData !== null && 
                                              (currentPath.endsWith('/dashboard') || currentPath.startsWith('/patients-in-queue'));
                                              
  // Extract user role for the AdminNavBar, or null if not authenticated
  const userRoleForNavBar: AuthTokenPayload['role'] | null = authenticatedRoleData ? authenticatedRoleData.role : null;

  // Function to render the main content based on the current path and authentication state
  const renderContent = (): React.ReactNode => {
    // Check for authenticated admin pages
    if (authenticatedRoleData) {
      const patientDataForDashboard: PatientDetail[] = authenticatedRoleData.patientData;
      const role = authenticatedRoleData.role;

      if (currentPath.endsWith('/dashboard')) {
        return <DashboardPage navigate={navigate} patientData={patientDataForDashboard} userRole={role} />;
      }
      
      // Enforce role-based access for PatientsInQueuePage
      if (currentPath.startsWith('/patients-in-queue')) {
        if (role === 'doctor' || role === 'nurse') {
          return <PatientsInQueuePage navigate={navigate} patientData={patientDataForDashboard} userRole={role} />;
        } else {
          // Display an access denied message for pharmacists trying to access the queue page
          return (
            <div className="flex items-center justify-center min-h-[calc(100vh-160px)] p-4">
              <div className="bg-red-50 border border-red-200 text-red-800 p-8 rounded-xl shadow-lg max-w-md w-full text-center animate-fade-in">
                <h1 className="text-3xl font-extrabold mb-4 text-red-700">Access Denied!</h1>
                <p className="text-lg mb-6">Pharmacists do not have access to the Patients in Queue page.</p>
                <button
                  onClick={() => navigate(`/${role}/dashboard`)}
                  className="py-3 px-6 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75"
                >
                  Go to your Dashboard
                </button>
              </div>
            </div>
          );
        }
      }
    }

    // Public/Authentication pages
    if (currentPath === '/') return <HomePage />; // Render HomePage for the root path
    
    if (currentPath === '/admin') {
      // Show a loading message if a token exists but authenticated data is not yet loaded
      if (getAuthToken() && !authenticatedRoleData) {
        return (
          <p className="p-4 bg-blue-100 text-blue-800 rounded-lg shadow text-center animate-pulse">
            Authenticating and redirecting...
          </p>
        );
      }
      return <Admin navigate={navigate} />; // Render Admin login page
    }

    // Handle specific role login paths (e.g., /admin/doctor-login)
    const loginRoleMatch = currentPath.match(/\/admin\/(doctor|nurse|pharmacist)-login/);
    if (loginRoleMatch) {
      const role = loginRoleMatch[1] as AuthTokenPayload['role'];
      return <LoginPage navigate={navigate} role={role} />;
    }

    // Default 404 Page Not Found for any unhandled paths
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-160px)] p-4">
        <div className="bg-red-50 border border-red-200 text-red-800 p-8 rounded-xl shadow-lg max-w-md w-full text-center animate-fade-in">
          <h1 className="text-3xl font-extrabold mb-4 text-red-700">404 - Page Not Found</h1>
          <p className="text-lg mb-6">Oops! The page you are looking for does not exist.</p>
          <button
            onClick={() => navigate('/')}
            className="py-3 px-6 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75"
          >
            Go to Home Page
          </button>
        </div>
      </div>
    );
  };

  return (
    // Main container for the entire application, setting min-height, background, and font
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 font-sans antialiased text-gray-800">
      {/* Conditionally render AdminNavBar or public NavBar based on login status */}
      {isUserLoggedInToAdminPortal ? (
        <AdminNavBar
          brandName="Optimo Admin"
          navigate={navigate}
          onLogout={handleAppLogout}
          userRole={userRoleForNavBar}
        />
      ) : (
        <NavBar brandName="Optimo" navLinks={myNavigationLinks} navigate={navigate} />
      )}
      {/* Main content area, centered with padding */}
      <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 mt-4 sm:mt-8">
        {renderContent()} {/* Render the appropriate component based on routing */}
      </main>
    
    </div>
  );
};

export default App;
