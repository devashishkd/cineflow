import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ChevronLeft, Film, Clock, MapPin, Calendar } from 'lucide-react';

const SeatSelection = () => {
  const { showId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [show, setShow] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingError, setBookingError] = useState('');
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    const fetchSeats = async () => {
      try {
        const response = await api.get(`/shows/${showId}`);
        const showData = response.data.data;
        setShow(showData);
        if (showData && showData.seats) {
          setSeats(showData.seats);
        }
      } catch (error) {
        console.error('Error fetching seats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSeats();
  }, [showId]);

  const toggleSeat = (seatId) => {
    setSelectedSeats(prev =>
      prev.includes(seatId)
        ? prev.filter(id => id !== seatId)
        : [...prev, seatId]
    );
  };

  const handleBooking = async () => {
    if (!user) { navigate('/login'); return; }
    setIsBooking(true);
    setBookingError('');
    try {
      const response = await api.post('/bookings', { showId, seatIds: selectedSeats });
      const booking = response.data.data;
      navigate('/payment', {
        state: {
          bookingId: booking.id,
          amount: totalPrice,
          showId,
          seatIds: selectedSeats,
          seatNumbers: selectedSeats.map(id => seats.find(s => s.id === id)?.seatNumber),
          movie,
          theatre,
          showDate,
          showTime
        }
      });
    } catch (error) {
      setBookingError(error.response?.data?.message || 'Failed to initiate booking');
      setIsBooking(false);
    }
  };

  if (loading) return (
    <div className="flex-grow flex items-center justify-center">
      <div className="flex gap-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="w-2 h-2 rounded-full bg-neonTeal animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
    </div>
  );

  // Build the seat grid: group by row, find max column per row, keep positions fixed
  const rowMap = {};
  seats.forEach(seat => {
    if (!rowMap[seat.row]) rowMap[seat.row] = {};
    // Extract column number from seatNumber e.g. "A5" → 5
    const col = parseInt(seat.seatNumber.replace(/[A-Za-z]/g, ''), 10);
    rowMap[seat.row][col] = seat;
  });

  const sortedRows = Object.keys(rowMap).sort();
  // Find the max column across all rows
  const maxCol = Math.max(...seats.map(s => parseInt(s.seatNumber.replace(/[A-Za-z]/g, ''), 10)));

  const totalPrice = selectedSeats.length * (show?.price || 0);
  const movie = show?.movie;
  const theatre = show?.theatre;

  const showDate = show?.showDate
    ? new Date(show.showDate + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })
    : '';
  const showTime = show?.showTime?.slice(0, 5) || '';

  return (
    <div className="max-w-5xl mx-auto w-full px-4 py-8 animate-fade-in flex flex-col">
      {/* Back button */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-white/40 hover:text-white mb-6 transition-colors text-sm">
        <ChevronLeft className="w-4 h-4" /> Back
      </button>

      {/* Movie Info Header */}
      {movie && (
        <div className="glass-card rounded-2xl p-5 mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-neonPurple/30 to-neonTeal/30 flex items-center justify-center">
            {movie.posterUrl ? (
              <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />
            ) : (
              <Film className="w-6 h-6 text-white/30" />
            )}
          </div>
          <div className="flex-grow">
            <h1 className="text-xl font-bold text-white">{movie.title}</h1>
            <div className="flex flex-wrap items-center gap-4 mt-1 text-sm text-white/50">
              {theatre && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-neonTeal" />
                  {theatre.name}{theatre.city ? `, ${theatre.city}` : ''}
                </span>
              )}
              {showDate && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-neonPurple" />
                  {showDate}
                </span>
              )}
              {showTime && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {showTime}
                </span>
              )}
              {movie.duration && (
                <span>{movie.duration} mins</span>
              )}
            </div>
          </div>
          <div className="flex-shrink-0 text-right">
            <div className="text-xs text-white/30">Price per seat</div>
            <div className="text-lg font-bold text-neonTeal">₹{show?.price}</div>
          </div>
        </div>
      )}

      {/* Screen indicator */}
      <div className="text-center mb-8">
        <div className="w-2/3 mx-auto h-1 bg-gradient-to-r from-transparent via-neonTeal to-transparent opacity-60 shadow-[0_0_20px_rgba(20,184,166,0.5)] rounded-full" />
        <p className="text-white/30 text-xs mt-2 tracking-widest uppercase">Screen</p>
      </div>

      {bookingError && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl mb-6 text-center text-sm">
          {bookingError}
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mb-6 text-xs text-white/40">
        <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded bg-white/5 border border-white/20" />Available</div>
        <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded bg-neonPurple border-neonPurple" />Selected</div>
        <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded bg-charcoal border border-white/5" />Booked</div>
      </div>

      {/* Seat Grid — fixed positions */}
      <div className="overflow-x-auto pt-2 pb-4 mb-6">
        <div className="inline-block min-w-full">
          {sortedRows.map(row => (
            <div key={row} className="flex items-center gap-2 mb-2">
              {/* Row label */}
              <div className="w-6 text-center text-xs font-bold text-white/30 flex-shrink-0">{row}</div>
              {/* Render all columns 1→maxCol, with placeholder for missing seats */}
              <div className="flex gap-2">
                {Array.from({ length: maxCol }, (_, i) => i + 1).map(col => {
                  const seat = rowMap[row][col];
                  
                  // Add a gap (aisle) before column 11
                  const isAisle = col === 11;

                  const content = [];
                  
                  if (isAisle) {
                    content.push(<div key={`aisle-${col}`} className="w-8 md:w-12 flex-shrink-0" />);
                  }

                  if (!seat) {
                    // Invisible placeholder to keep positions
                    content.push(<div key={`empty-${col}`} className="w-9 h-9 md:w-10 md:h-10 flex-shrink-0 opacity-0 pointer-events-none" />);
                    return content;
                  }
                  const isBooked = seat.status === 'BOOKED' || seat.status === 'LOCKED';
                  const isSelected = selectedSeats.includes(seat.id);
                  
                  content.push(
                    <button
                      key={seat.id}
                      disabled={isBooked}
                      onClick={() => toggleSeat(seat.id)}
                      title={seat.seatNumber}
                      className={`w-9 h-9 md:w-10 md:h-10 flex-shrink-0 rounded-t-lg rounded-b-sm border transition-all flex items-center justify-center text-[10px] font-bold
                        ${isBooked
                          ? 'bg-charcoal border-white/5 text-white/10 cursor-not-allowed'
                          : isSelected
                            ? 'bg-neonPurple border-neonPurple text-white shadow-[0_0_12px_rgba(147,51,234,0.5)] -translate-y-0.5'
                            : 'bg-white/5 border-white/20 hover:border-neonTeal hover:bg-neonTeal/10 text-white/60 hover:-translate-y-0.5'
                        }`}
                    >
                      {col}
                    </button>
                  );

                  return content;
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Checkout Bar */}
      <div className="glass-card p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4 sticky bottom-6 border border-white/10 shadow-2xl">
        <div>
          <div className="text-white/50 text-xs mb-1">Selected Seats</div>
          <div className="text-base font-bold flex gap-2 flex-wrap min-h-[28px]">
            {selectedSeats.length > 0
              ? selectedSeats.map(id => {
                  const seat = seats.find(s => s.id === id);
                  return (
                    <span key={id} className="bg-neonPurple/20 border border-neonPurple/30 px-2 py-0.5 rounded-md text-xs text-neonPurple font-semibold">
                      {seat?.seatNumber}
                    </span>
                  );
                })
              : <span className="text-white/20 text-sm font-normal">None selected</span>
            }
          </div>
        </div>

        <div className="flex items-center gap-6 w-full sm:w-auto">
          <button
            onClick={handleBooking}
            disabled={selectedSeats.length === 0 || isBooking}
            className="flex-grow sm:flex-grow-0 px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all disabled:opacity-40 disabled:grayscale text-sm shadow-lg shadow-blue-600/30"
          >
            {isBooking ? 'Processing...' : `Pay ₹${totalPrice}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SeatSelection;
