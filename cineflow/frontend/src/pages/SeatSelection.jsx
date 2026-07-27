import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

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
        console.log("show Data:",showData);
        setShow(showData);
        // Ensure showData.Seats exists (it should be included from API Gateway / Movie Service)
        if (showData && showData.seats) {
          // Sort by seat row/number logic if needed, but for now we just use the array.
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
    if (!user) {
      navigate('/login');
      return;
    }
    
    setIsBooking(true);
    setBookingError('');
    
    try {
      const response = await api.post('/bookings', {
        showId,
        seatIds: selectedSeats
      });
      console.log('booking response', response);
      const booking = response.data.data;
      console.log('booking object', booking);
      // Navigate to payment page with booking details
      navigate('/payment', { 
        state: { 
          bookingId: booking.id,
          amount: totalPrice,
          showId,
          seatIds: selectedSeats
        } 
      });
    } catch (error) {
      setBookingError(error.response?.data?.message || 'Failed to initiate booking');
      setIsBooking(false);
    }
  };

  if (loading) return <div className="flex-grow flex items-center justify-center">Loading Seats...</div>;

  const totalPrice = selectedSeats.length * (show?.price || 0);

  return (
    <div className="max-w-4xl mx-auto w-full px-4 py-12 animate-fade-in flex flex-col h-full">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-2">Select Your Seats</h1>
        <p className="text-white/60">Screen is this way</p>
        <div className="w-full h-2 bg-gradient-to-r from-transparent via-neonTeal to-transparent mt-4 opacity-50 shadow-[0_0_20px_rgba(20,184,166,0.5)]" />
      </div>

      {bookingError && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl mb-8 text-center">
          {bookingError}
        </div>
      )}

      {/* Seat Grid - assuming a rough grid mapping, simplified for demo */}
      <div className="flex-grow flex items-center justify-center mb-12 overflow-x-auto">
        <div className="grid grid-cols-8 gap-4 p-4">
          {seats.map((seat) => {
            const isBooked = seat.status === 'BOOKED';
            const isSelected = selectedSeats.includes(seat.id);
            
            return (
              <button
                key={seat.id}
                disabled={isBooked}
                onClick={() => toggleSeat(seat.id)}
                className={`w-10 h-10 md:w-12 md:h-12 rounded-t-xl rounded-b-md border transition-all flex items-center justify-center text-xs font-bold
                  ${isBooked 
                    ? 'bg-charcoal border-white/5 text-white/10 cursor-not-allowed' 
                    : isSelected
                      ? 'bg-neonPurple border-neonPurple text-white shadow-[0_0_15px_rgba(147,51,234,0.5)] -translate-y-1'
                      : 'bg-white/5 border-white/20 hover:border-neonTeal hover:bg-neonTeal/10 text-white/70'}
                `}
              >
                {seat.seatNumber}
              </button>
            )
          })}
        </div>
      </div>

      {/* Checkout Footer */}
      <div className="glass-card p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-6 mt-auto sticky bottom-8">
        <div>
          <div className="text-white/60 text-sm mb-1">Selected Seats</div>
          <div className="text-xl font-bold flex gap-2 flex-wrap">
            {selectedSeats.length > 0 
              ? selectedSeats.map(id => {
                  const seat = seats.find(s => s.id === id);
                  return <span key={id} className="bg-white/10 px-2 py-1 rounded-md text-sm">{seat?.seatNumber}</span>
                })
              : <span className="text-white/30 text-base font-normal">None selected</span>
            }
          </div>
        </div>
        
        <div className="flex items-center gap-6 w-full sm:w-auto">
          <div className="text-right hidden sm:block">
            <div className="text-white/60 text-sm mb-1">Total Amount</div>
            <div className="text-2xl font-bold text-neonTeal">₹{totalPrice}</div>
          </div>
          <button
            onClick={handleBooking}
            disabled={selectedSeats.length === 0 || isBooking}
            className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-neonTeal to-neonPurple text-white font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:grayscale"
          >
            {isBooking ? 'Processing...' : `Pay ₹${totalPrice}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SeatSelection;
