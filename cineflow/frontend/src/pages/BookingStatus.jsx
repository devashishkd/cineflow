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
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ticket-${String(bId).slice(0, 8)}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF. Please try again later.');
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center p-4 bg-zinc-950">
      <div className="w-full max-w-md p-8 rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl text-center relative overflow-hidden">
        
        {status === 'PENDING' && (
          <div className="space-y-4">
            <Loader2 className="w-12 h-12 text-zinc-400 animate-spin mx-auto" />
            <div>
              <h2 className="text-xl font-bold mb-1 text-white tracking-tight">Processing Payment</h2>
              <p className="text-zinc-400 text-xs">Please wait while we secure your seats...</p>
            </div>
          </div>
        )}

        {status === 'CONFIRMED' && (
          <div className="space-y-5 animate-fade-in">
            <CheckCircle2 className="w-14 h-14 text-zinc-100 mx-auto" />
            <div>
              <h2 className="text-xl font-bold mb-1 text-white tracking-tight">Booking Confirmed</h2>
              <p className="text-zinc-400 text-xs mb-6">Your tickets have been secured.</p>
              
              <div className="bg-zinc-950 rounded-xl p-4 text-left border border-zinc-800 space-y-2.5 mb-6 text-xs">
                {bookingDetails?.show?.movie && (
                  <div className="border-b border-zinc-800 pb-3 mb-2">
                    <div className="font-semibold text-sm text-white">{bookingDetails.show.movie.title}</div>
                    <div className="text-zinc-400 mt-0.5">{bookingDetails.show.theatre.name}, {bookingDetails.show.theatre.city}</div>
                    <div className="text-zinc-500 mt-0.5">{bookingDetails.show.showDate} | {bookingDetails.show.showTime}</div>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-zinc-400">Booking ID</span>
                  <span className="font-mono text-zinc-200">{bookingDetails?.id.slice(0,8).toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Seats</span>
                  <span className="font-semibold text-zinc-100">{bookingDetails?.seatNumbers?.join(', ')}</span>
                </div>
                <div className="flex justify-between border-t border-zinc-800 pt-2.5 mt-2">
                  <span className="text-zinc-400 font-medium">Amount Paid</span>
                  <span className="font-bold text-white text-sm">₹{bookingDetails?.totalAmount}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                <button 
                  onClick={() => handleDownloadPdf(bookingDetails.id)}
                  className="w-full bg-white hover:bg-zinc-200 text-zinc-950 font-semibold py-2.5 rounded-lg transition-colors text-xs"
                >
                  Download E-Ticket (PDF)
                </button>
                <button 
                  onClick={() => navigate('/')}
                  className="w-full bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-medium py-2.5 rounded-lg transition-colors text-xs"
                >
                  Back to Home
                </button>
              </div>
            </div>
          </div>
        )}

        {status === 'FAILED' && (
          <div className="space-y-4 animate-fade-in">
            <XCircle className="w-14 h-14 text-zinc-400 mx-auto" />
            <div>
              <h2 className="text-xl font-bold mb-1 text-white tracking-tight">Payment Failed</h2>
              <p className="text-zinc-400 text-xs mb-6">We couldn't process your payment. Your seats have been released.</p>
              
              <button 
                onClick={() => navigate('/')}
                className="w-full bg-white hover:bg-zinc-200 text-zinc-950 font-semibold py-2.5 rounded-lg transition-colors text-xs"
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
