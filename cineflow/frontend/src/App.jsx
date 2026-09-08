import { Routes, Route } from 'react-router-dom';
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

function App() {
  return (
    <CityProvider>
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
        <Navbar />
        <CityModal />
        <main className="flex-grow flex flex-col bg-zinc-950">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/movies" element={<AllMovies />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/movie/:id" element={<MovieDetail />} />
            <Route path="/show/:showId/seats" element={<SeatSelection />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/booking/status" element={<BookingStatus />} />
            <Route path="/profile/bookings" element={<MyBookings />} />
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN', 'THEATRE_MANAGER']}><AdminDashboard /></ProtectedRoute>} />
          </Routes>
        </main>
      </div>
    </CityProvider>
  );
}

export default App;
