import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import MovieDetail from './pages/MovieDetail';
import SeatSelection from './pages/SeatSelection';
import BookingStatus from './pages/BookingStatus';

function App() {
  return (
    <div className="min-h-screen bg-obsidian text-white flex flex-col font-['Outfit']">
      <Navbar />
      <main className="flex-grow flex flex-col">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/movie/:id" element={<MovieDetail />} />
          <Route path="/show/:showId/seats" element={<SeatSelection />} />
          <Route path="/booking/status" element={<BookingStatus />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
