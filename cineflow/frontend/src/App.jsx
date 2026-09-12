import { createBrowserRouter, RouterProvider, Outlet, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import CityModal from './components/CityModal';
import ProtectedRoute from './components/ProtectedRoute';
import { CityProvider } from './context/CityContext';
import Home from './pages/Home';
import AllMovies from './pages/AllMovies';
import Login from './pages/Login';
import Register from './pages/Register';
import MovieDetail from './pages/MovieDetail';
import SeatSelection from './pages/SeatSelection';
import BookingStatus from './pages/BookingStatus';
import PaymentPage from './pages/PaymentPage';
import MyBookings from './pages/MyBookings';
import AdminDashboard from './pages/AdminDashboard';

function RootLayout() {
  const location = useLocation();
  const hideNavbar = /^\/show\/[^/]+\/seats/.test(location.pathname) || location.pathname === '/payment';

  return (
    <CityProvider>
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
        {!hideNavbar && <Navbar />}
        <CityModal />
        <main className="flex-grow flex flex-col bg-zinc-950">
          <Outlet />
        </main>
      </div>
    </CityProvider>
  );
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'movies', element: <AllMovies /> },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
      { path: 'movie/:id', element: <MovieDetail /> },
      { path: 'show/:showId/seats', element: <SeatSelection /> },
      { path: 'payment', element: <PaymentPage /> },
      { path: 'booking/status', element: <BookingStatus /> },
      { path: 'profile/bookings', element: <MyBookings /> },
      {
        path: 'admin',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN', 'THEATRE_MANAGER']}>
            <AdminDashboard />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;

