import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

const BookingStatus = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const bookingId = location.state?.bookingId;
  console.log('booking id', bookingId);
  const [status, setStatus] = useState('PENDING'); // PENDING, CONFIRMED, FAILED
  const [bookingDetails, setBookingDetails] = useState(null);

  useEffect(() => {
    if (!bookingId) {
      navigate('/');
      return;
    }

    let pollInterval;

    const checkStatus = async () => {
      try {
        const response = await api.get(`/bookings/${bookingId}`);
        const currentBooking = response.data.data;
        
        if (currentBooking.status === 'CONFIRMED' || currentBooking.status === 'FAILED') {
          setStatus(currentBooking.status);
          setBookingDetails(currentBooking);
          clearInterval(pollInterval); // Stop polling once final state is reached
        }
      } catch (error) {
        console.error('Error fetching booking status:', error);
      }
    };

    // Initial check
    checkStatus();

    // Poll every 2 seconds
    pollInterval = setInterval(checkStatus, 2000);

    return () => clearInterval(pollInterval);
  }, [bookingId, navigate]);

  const handleDownloadPdf = async (bId) => {
    try {
      const response = await api.get(`/bookings/${bId}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ticket-${bId.slice(0, 8)}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF. Please try again later.');
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center p-4">
      <div className="glass-card w-full max-w-md p-10 rounded-3xl text-center relative overflow-hidden animate-slide-up">
        
        {status === 'PENDING' && (
          <div className="space-y-6">
            <div className="absolute inset-0 bg-neonTeal/5 animate-pulse" />
            <Loader2 className="w-20 h-20 text-neonTeal animate-spin mx-auto relative z-10" />
            <div className="relative z-10">
              <h2 className="text-2xl font-bold mb-2">Processing Payment</h2>
              <p className="text-white/60 text-sm">Please wait while we secure your seats...</p>
            </div>
          </div>
        )}

        {status === 'CONFIRMED' && (
          <div className="space-y-6 animate-fade-in">
            <div className="absolute inset-0 bg-green-500/10" />
            <CheckCircle2 className="w-20 h-20 text-green-400 mx-auto relative z-10" />
            <div className="relative z-10">
              <h2 className="text-2xl font-bold mb-2 text-green-400">Booking Confirmed!</h2>
              <p className="text-white/80 mb-6">Your tickets have been secured.</p>
              
              <div className="bg-black/40 rounded-xl p-5 text-left border border-white/5 space-y-3 mb-8">
                {bookingDetails?.show?.movie && (
                  <div className="border-b border-white/5 pb-3 mb-3">
                    <div className="font-bold text-lg">{bookingDetails.show.movie.title}</div>
                    <div className="text-white/50 text-sm mt-1">{bookingDetails.show.theatre.name}, {bookingDetails.show.theatre.city}</div>
                    <div className="text-white/50 text-sm">{bookingDetails.show.showDate} | {bookingDetails.show.showTime}</div>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-white/50 text-sm">Booking ID</span>
                  <span className="font-mono text-sm">{bookingDetails?.id.slice(0,8).toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50 text-sm">Seats</span>
                  <span className="font-bold text-sm text-neonPurple">{bookingDetails?.seatNumbers?.join(', ')}</span>
                </div>
                <div className="flex justify-between border-t border-white/5 pt-3 mt-3">
                  <span className="text-white/50 text-sm">Amount Paid</span>
                  <span className="font-bold text-neonTeal">₹{bookingDetails?.totalAmount}</span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => handleDownloadPdf(bookingDetails.id)}
                  className="w-full bg-gradient-to-r from-neonTeal to-neonPurple hover:opacity-90 font-bold py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(20,184,166,0.3)] text-white"
                >
                  Download E-Ticket (PDF)
                </button>
                <button 
                  onClick={() => navigate('/')}
                  className="w-full bg-white/5 hover:bg-white/10 border border-white/10 font-medium py-3 rounded-xl transition-all text-white/70"
                >
                  Back to Home
                </button>
              </div>
            </div>
          </div>
        )}

        {status === 'FAILED' && (
          <div className="space-y-6 animate-fade-in">
            <div className="absolute inset-0 bg-red-500/5" />
            <XCircle className="w-20 h-20 text-red-400 mx-auto relative z-10" />
            <div className="relative z-10">
              <h2 className="text-2xl font-bold mb-2 text-red-400">Payment Failed</h2>
              <p className="text-white/60 mb-8">We couldn't process your payment. Your seats have been released.</p>
              
              <button 
                onClick={() => navigate('/')}
                className="w-full bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 font-semibold py-3 rounded-xl transition-all"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default BookingStatus;
