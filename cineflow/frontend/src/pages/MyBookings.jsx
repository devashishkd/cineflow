import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Ticket, Calendar, Clock, MapPin, CheckCircle, XCircle, Loader2, ChevronRight } from 'lucide-react';

const statusConfig = {
  CONFIRMED: { color: 'text-green-400', bg: 'bg-green-400/10 border-green-400/20', icon: CheckCircle },
  PENDING:   { color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/20', icon: Loader2 },
  FAILED:    { color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/20', icon: XCircle },
  CANCELLED: { color: 'text-white/40', bg: 'bg-white/5 border-white/10', icon: XCircle },
};

const MyBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await api.get('/bookings/me');
        setBookings(res.data.data || []);
      } catch (err) {
        setError('Could not load your bookings. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

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

  if (loading) return (
    <div className="flex-grow flex items-center justify-center">
      <div className="flex gap-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="w-2 h-2 rounded-full bg-neonTeal animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto w-full px-4 py-12 animate-fade-in">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <Ticket className="w-7 h-7 text-neonTeal" />
          <h1 className="text-3xl font-bold">My Bookings</h1>
        </div>
        <p className="text-white/40 text-sm">All your ticket orders in one place.</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl mb-6 text-sm">
          {error}
        </div>
      )}

      {bookings.length === 0 && !error ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <Ticket className="w-12 h-12 text-white/10 mx-auto mb-4" />
          <p className="text-white/30 font-medium">No bookings yet.</p>
          <p className="text-white/20 text-sm mt-1 mb-6">Book your first movie and it will appear here.</p>
          <Link to="/" className="px-6 py-2.5 bg-gradient-to-r from-neonTeal to-neonPurple text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-all">
            Browse Movies
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map(booking => {
            const cfg = statusConfig[booking.status] || statusConfig.CANCELLED;
            const StatusIcon = cfg.icon;
            const createdAt = new Date(booking.createdAt).toLocaleDateString(undefined, {
              day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
            });

            return (
              <div key={booking.id} className="glass-card rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-all">
                {/* Status bar */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`flex items-center gap-2 text-xs font-bold px-3 py-1 rounded-full border ${cfg.bg} ${cfg.color}`}>
                    <StatusIcon className={`w-3.5 h-3.5 ${booking.status === 'PENDING' ? 'animate-spin' : ''}`} />
                    {booking.status}
                  </div>
                  <span className="text-xs text-white/30">{createdAt}</span>
                </div>

                {/* Booking details */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-white/30 mb-1">Booking ID</p>
                    <p className="text-xs font-mono text-white/60 truncate">{booking.id.slice(0,8).toUpperCase()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/30 mb-1">Seats</p>
                    <div className="flex flex-wrap gap-1">
                      {(booking.seatNumbers || []).map(s => (
                        <span key={s} className="text-xs bg-neonPurple/20 border border-neonPurple/30 text-neonPurple px-2 py-0.5 rounded font-semibold">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                {booking.show?.movie && (
                  <div className="bg-black/30 rounded-lg p-3 border border-white/5 mb-4 flex gap-3">
                    {booking.show.movie.posterUrl && (
                      <img src={booking.show.movie.posterUrl} alt="" className="w-12 h-16 object-cover rounded-md flex-shrink-0" />
                    )}
                    <div className="flex flex-col justify-center">
                      <div className="font-bold text-sm leading-tight">{booking.show.movie.title}</div>
                      <div className="text-xs text-white/50">{booking.show.theatre?.name}</div>
                      <div className="text-xs text-white/50">{booking.show.showDate} | {booking.show.showTime}</div>
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="text-sm font-bold text-neonTeal">₹{parseFloat(booking.totalAmount).toFixed(2)}</div>
                  <div className="flex gap-4">
                    {booking.status === 'CONFIRMED' && (
                      <button
                        onClick={() => handleDownloadPdf(booking.id)}
                        className="text-xs font-bold text-neonPurple hover:text-neonTeal transition-colors"
                      >
                        Download PDF
                      </button>
                    )}
                    <Link
                      to={`/booking/status`}
                      state={{ bookingId: booking.id }}
                      className="flex items-center gap-1 text-xs text-white/30 hover:text-white transition-colors"
                    >
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
