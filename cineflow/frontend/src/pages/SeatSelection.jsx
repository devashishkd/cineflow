import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ChevronLeft, Film, Clock, MapPin, Calendar, Timer, AlertTriangle, X } from 'lucide-react';

/** Format seconds as MM:SS */
const formatCountdown = (secs) => {
  if (secs <= 0) return '00:00';
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

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
  // Countdown timer — seconds remaining until seat lock expires
  const [lockSecondsLeft, setLockSecondsLeft] = useState(null);
  const [lockExpiresAt, setLockExpiresAt] = useState(null);
  const [showExitModal, setShowExitModal] = useState(false);
  const isExitingRef = useRef(false);

  // Handle in-page back click
  const handleBackClick = () => {
    if (selectedSeats.length > 0) {
      setShowExitModal(true);
    } else {
      if (show?.movieId || show?.movie?.id) {
        navigate(`/movie/${show.movieId || show.movie.id}`);
      } else {
        navigate(-1);
      }
    }
  };

  // Intercept browser back button when seats are selected
  useEffect(() => {
    const hasSeats = selectedSeats.length > 0;
    if (!hasSeats) return;

    window.history.pushState({ seatSelection: true }, '');

    const handlePopState = () => {
      if (isExitingRef.current) return;
      window.history.pushState({ seatSelection: true }, '');
      setShowExitModal(true);
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [selectedSeats.length > 0]);

  const handleConfirmExit = () => {
    isExitingRef.current = true;
    setShowExitModal(false);
    if (show?.movieId || show?.movie?.id) {
      navigate(`/movie/${show.movieId || show.movie.id}`, { replace: true });
    } else {
      navigate(-1);
    }
  };

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
      // Generate a client-side idempotency key so retries don't create duplicate bookings
      const idempotencyKey = crypto.randomUUID();
      const response = await api.post(
        '/bookings',
        { showId, seatIds: selectedSeats },
        { headers: { 'Idempotency-Key': idempotencyKey } }
      );
      const booking = response.data.data;
      // expiresAt from the server tells us exactly when the Redis lock expires
      const expiresAt = booking.expiresAt ? new Date(booking.expiresAt) : null;
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
          showTime,
          lockExpiresAt: expiresAt?.toISOString(),
        }
      });
    } catch (error) {
      if (error.response?.status === 401) {
        setBookingError('Your session has expired. Please log in again to book tickets.');
        setTimeout(() => navigate('/login'), 1200);
      } else {
        setBookingError(error.response?.data?.message || 'Failed to initiate booking');
      }
      setIsBooking(false);
    }
  };

  if (loading) return (
    <div className="flex-grow flex items-center justify-center">
      <div className="flex gap-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
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
    <div className="max-w-6xl mx-auto w-full px-4 py-8 flex flex-col bg-zinc-950">
      {/* Back button */}
      <button onClick={handleBackClick} className="flex items-center gap-1 text-zinc-400 hover:text-white mb-6 transition-colors text-xs font-medium">
        <ChevronLeft className="w-4 h-4" /> Back
      </button>

      {/* Movie Info Header */}
      {movie && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-zinc-950 border border-zinc-800 flex items-center justify-center">
            {movie.posterUrl ? (
              <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />
            ) : (
              <Film className="w-5 h-5 text-zinc-600" />
            )}
          </div>
          <div className="flex-grow">
            <h1 className="text-lg font-bold text-white tracking-tight">{movie.title}</h1>
            <div className="flex flex-wrap items-center gap-4 mt-1 text-xs text-zinc-400">
              {theatre && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                  {theatre.name}{theatre.city ? `, ${theatre.city}` : ''}
                </span>
              )}
              {showDate && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                  {showDate}
                </span>
              )}
              {showTime && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-zinc-400" />
                  {showTime}
                </span>
              )}
              {movie.duration && (
                <span>{movie.duration} mins</span>
              )}
            </div>
          </div>
          <div className="flex-shrink-0 text-right">
            <div className="text-[11px] text-zinc-500">Price per seat</div>
            <div className="text-base font-bold text-white">₹{show?.price}</div>
          </div>
        </div>
      )}

      {/* Screen indicator */}
      <div className="text-center mb-8">
        <div className="w-1/2 mx-auto h-1 bg-zinc-700 rounded-full" />
        <p className="text-zinc-500 text-[10px] mt-2 tracking-widest uppercase font-semibold">Screen</p>
      </div>

      {bookingError && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg mb-6 text-center text-xs">
          {bookingError}
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mb-6 text-xs text-zinc-400">
        <div className="flex items-center gap-1.5"><div className="w-3.5 h-3.5 rounded bg-zinc-900 border border-zinc-700" />Available</div>
        <div className="flex items-center gap-1.5"><div className="w-3.5 h-3.5 rounded bg-white border border-white" />Selected</div>
        <div className="flex items-center gap-1.5"><div className="w-3.5 h-3.5 rounded bg-zinc-950 border border-zinc-900" />Booked</div>
      </div>

      {/* Seat Grid — fixed positions */}
      <div className="overflow-x-auto pt-2 pb-4 mb-6 flex justify-center">
        <div className="inline-block">
          {sortedRows.map(row => (
            <div key={row} className="flex items-center gap-2 mb-2">
              {/* Row label */}
              <div className="w-6 text-center text-xs font-semibold text-zinc-500 flex-shrink-0">{row}</div>
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
                      className={`w-9 h-9 md:w-10 md:h-10 flex-shrink-0 rounded-t-lg rounded-b-sm border transition-all flex items-center justify-center text-[10px] font-semibold
                        ${isBooked
                          ? 'bg-zinc-950 border-zinc-900 text-zinc-700 cursor-not-allowed'
                          : isSelected
                            ? 'bg-white border-white text-zinc-950 font-bold'
                            : 'bg-zinc-900 border-zinc-800 hover:border-zinc-600 text-zinc-400 hover:text-white'
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
      <div className="bg-zinc-900 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-4 sticky bottom-6 border border-zinc-800 shadow-2xl">
        <div>
          <div className="text-zinc-400 text-xs mb-1">Selected Seats</div>
          <div className="text-sm font-semibold flex gap-1.5 flex-wrap min-h-[24px]">
            {selectedSeats.length > 0
              ? selectedSeats.map(id => {
                  const seat = seats.find(s => s.id === id);
                  return (
                    <span key={id} className="bg-zinc-800 border border-zinc-700 px-2 py-0.5 rounded text-xs text-white font-medium">
                      {seat?.seatNumber}
                    </span>
                  );
                })
              : <span className="text-zinc-500 text-xs font-normal">None selected</span>
            }
          </div>
        </div>

        <div className="flex items-center gap-6 w-full sm:w-auto">
          <button
            onClick={handleBooking}
            disabled={selectedSeats.length === 0 || isBooking}
            className="flex-grow sm:flex-grow-0 px-6 py-2.5 bg-white text-zinc-950 font-semibold rounded-lg hover:bg-zinc-200 transition-colors disabled:opacity-40 text-xs"
          >
            {isBooking ? 'Processing...' : `Pay ₹${totalPrice}`}
          </button>
        </div>
      </div>

      {/* Exit Confirmation Modal */}
      {showExitModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-white">Leave Seat Selection?</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                You have selected <span className="text-white font-semibold">{selectedSeats.length} seat{selectedSeats.length > 1 ? 's' : ''}</span>. Leaving now will release your selected seats.
              </p>
            </div>
            <div className="flex gap-2.5 pt-2">
              <button
                onClick={handleConfirmExit}
                className="flex-1 py-2.5 px-3 rounded-lg border border-zinc-700 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold transition-colors"
              >
                Discard & Leave
              </button>
              <button
                onClick={() => setShowExitModal(false)}
                className="flex-1 py-2.5 px-3 rounded-lg bg-white text-zinc-950 hover:bg-zinc-200 text-xs font-bold transition-colors shadow-sm"
              >
                Keep My Seats
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeatSelection;
