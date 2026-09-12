import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Ticket, CheckCircle, XCircle, Loader2, ChevronRight,
  AlertTriangle, Clock
} from 'lucide-react';

const statusConfig = {
  CONFIRMED:          { color: 'text-green-400',  bg: 'bg-green-400/10 border-green-400/20',   icon: CheckCircle,   label: 'Confirmed' },
  PENDING:            { color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/20', icon: Loader2,       label: 'Pending' },
  PAYMENT_INITIATED:  { color: 'text-blue-400',   bg: 'bg-blue-400/10 border-blue-400/20',     icon: Loader2,       label: 'Payment Processing' },
  PAYMENT_SUCCESS:    { color: 'text-teal-400',   bg: 'bg-teal-400/10 border-teal-400/20',     icon: Loader2,       label: 'Payment Success' },
  PAYMENT_FAILED:     { color: 'text-red-400',    bg: 'bg-red-400/10 border-red-400/20',       icon: XCircle,       label: 'Payment Failed' },
  EXPIRED:            { color: 'text-white/30',   bg: 'bg-white/5 border-white/10',            icon: Clock,         label: 'Expired' },
  CANCELLED:          { color: 'text-white/40',   bg: 'bg-white/5 border-white/10',            icon: XCircle,       label: 'Cancelled' },
};

const MyBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState(null);
  const [confirmCancelId, setConfirmCancelId] = useState(null);

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings/me');
      setBookings(res.data.data || []);
    } catch {
      setError('Could not load your bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

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
    } catch {
      alert('Failed to download PDF. Please try again later.');
    }
  };

  const handleCancel = async (bookingId) => {
    setCancellingId(bookingId);
    try {
      await api.post(`/bookings/${bookingId}/cancel`, { reason: 'User requested cancellation' });
      setConfirmCancelId(null);
      await fetchBookings(); // refresh list
    } catch (err) {
      alert(err.response?.data?.message || 'Could not cancel booking. Please try again.');
    } finally {
      setCancellingId(null);
    }
  };

  const isCancellable = (status) => status === 'CONFIRMED' || status === 'PENDING';

  if (loading) return (
    <div className="flex-grow flex items-center justify-center">
      <div className="flex gap-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto w-full px-4 py-10 bg-zinc-950">
      <div className="mb-8">
        <div className="flex items-center gap-2.5 mb-1.5">
          <Ticket className="w-6 h-6 text-zinc-300" />
          <h1 className="text-2xl font-bold text-white tracking-tight">My Bookings</h1>
        </div>
        <p className="text-zinc-400 text-xs">All your ticket orders in one place.</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg mb-6 text-xs">{error}</div>
      )}

      {bookings.length === 0 && !error ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-10 text-center">
          <Ticket className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
          <p className="text-zinc-300 font-medium text-sm">No bookings yet.</p>
          <p className="text-zinc-500 text-xs mt-1 mb-6">Book your first movie and it will appear here.</p>
          <Link to="/" className="px-5 py-2 bg-white text-zinc-950 rounded-lg text-xs font-semibold hover:bg-zinc-200 transition-colors">
            Browse Movies
          </Link>
        </div>
      ) : (
        <div className="space-y-3.5">
          {bookings.map(booking => {
            const cfg = statusConfig[booking.status] || statusConfig.CANCELLED;
            const StatusIcon = cfg.icon;
            const isSpinning = ['PENDING', 'PAYMENT_INITIATED', 'PAYMENT_SUCCESS'].includes(booking.status);
            const createdAt = new Date(booking.createdAt).toLocaleDateString(undefined, {
              day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
            });

            return (
              <div key={booking.id} className="bg-zinc-900 rounded-xl p-5 border border-zinc-800 transition-all">
                {/* Status bar */}
                <div className="flex items-center justify-between mb-3.5">
                  <div className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-md border border-zinc-700 bg-zinc-950 text-zinc-300">
                    <StatusIcon className={`w-3 h-3 ${isSpinning ? 'animate-spin' : ''}`} />
                    {cfg.label}
                  </div>
                  <span className="text-[11px] text-zinc-500">{createdAt}</span>
                </div>

                {/* Booking details */}
                <div className="grid grid-cols-2 gap-4 mb-3.5">
                  <div>
                    <p className="text-[11px] text-zinc-500 mb-0.5">Booking ID</p>
                    <p className="text-xs font-mono text-zinc-300 truncate">{booking.id.slice(0, 8).toUpperCase()}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-zinc-500 mb-0.5">Seats</p>
                    <div className="flex flex-wrap gap-1">
                      {(booking.seatNumbers || []).map(s => (
                        <span key={s} className="text-xs bg-zinc-800 border border-zinc-700 text-zinc-200 px-2 py-0.5 rounded font-medium">{s}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {booking.show?.movie && (
                  <div className="bg-zinc-950 rounded-lg p-3 border border-zinc-800 mb-3.5 flex gap-3">
                    {booking.show.movie.posterUrl && (
                      <img src={booking.show.movie.posterUrl} alt="" className="w-10 h-14 object-cover rounded flex-shrink-0 border border-zinc-800" />
                    )}
                    <div className="flex flex-col justify-center">
                      <div className="font-semibold text-xs text-white leading-tight">{booking.show.movie.title}</div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">{booking.show.theatre?.name}</div>
                      <div className="text-[11px] text-zinc-500">{booking.show.showDate} | {booking.show.showTime?.slice(0, 5)}</div>
                    </div>
                  </div>
                )}

                {/* Footer actions */}
                <div className="flex items-center justify-between pt-3.5 border-t border-zinc-800 text-xs">
                  <div className="font-bold text-white">₹{parseFloat(booking.totalAmount).toFixed(2)}</div>
                  <div className="flex gap-3.5 items-center">
                    {booking.status === 'CONFIRMED' && (
                      <button onClick={() => handleDownloadPdf(booking.id)} className="font-medium text-zinc-300 hover:text-white transition-colors underline">
                        Download PDF
                      </button>
                    )}
                    {isCancellable(booking.status) && confirmCancelId !== booking.id && (
                      <button
                        onClick={() => setConfirmCancelId(booking.id)}
                        className="font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                    {confirmCancelId === booking.id && (
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-zinc-400" />
                        <span className="text-zinc-400">Sure?</span>
                        <button
                          onClick={() => handleCancel(booking.id)}
                          disabled={cancellingId === booking.id}
                          className="font-bold text-red-400 hover:text-red-300 disabled:opacity-50"
                        >
                          {cancellingId === booking.id ? 'Cancelling…' : 'Yes, Cancel'}
                        </button>
                        <button onClick={() => setConfirmCancelId(null)} className="text-zinc-500 hover:text-white">
                          Keep
                        </button>
                      </div>
                    )}
                    <Link to="/booking/status" state={{ bookingId: booking.id }} className="flex items-center gap-1 text-zinc-400 hover:text-white transition-colors">
                      Status <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
