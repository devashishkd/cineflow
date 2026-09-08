import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Loader2, ShieldCheck, CreditCard, Smartphone, Building2 } from 'lucide-react';

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [error, setError] = useState('');

  const { bookingId, amount, showId, seatIds, seatNumbers, movie, theatre, showDate, showTime, lockExpiresAt } = location.state || {};
  const [lockSecondsLeft, setLockSecondsLeft] = useState(null);
  const [lockExpired, setLockExpired] = useState(false);

  // Redirect if no booking data
  useEffect(() => {
    if (!bookingId) navigate('/');
  }, [bookingId, navigate]);

  // Dynamically load Razorpay checkout script
  useEffect(() => {
    if (document.getElementById('razorpay-script')) { setScriptLoaded(true); return; }
    const script = document.createElement('script');
    script.id = 'razorpay-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    script.onerror = () => setError('Failed to load payment gateway. Check your network.');
    document.body.appendChild(script);
  }, []);

  // Seat lock countdown timer
  useEffect(() => {
    if (!lockExpiresAt) return;
    const expiry = new Date(lockExpiresAt).getTime();
    const tick = () => {
      const remaining = Math.max(0, Math.floor((expiry - Date.now()) / 1000));
      setLockSecondsLeft(remaining);
      if (remaining === 0) setLockExpired(true);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [lockExpiresAt]);

  const handlePayment = async () => {
    if (!scriptLoaded) {
      setError('Payment gateway is still loading. Please wait.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Step 1: Create Razorpay order on backend
      // NOTE: userId is NOT sent — backend extracts it from the JWT
      const { data: resp } = await api.post('/payments/create-order', {
        bookingId,
        amount,
      });

      const { orderId, currency, amount: orderAmount, keyId } = resp.data;

      if (!keyId || keyId === 'rzp_test_placeholder') {
        setError('Razorpay is not configured yet. Please add your RAZORPAY_KEY_ID to docker-compose.yml first.');
        setLoading(false);
        return;
      }

      // Step 2: Open Razorpay modal
      const options = {
        key: keyId,
        amount: orderAmount,   // in paise (already converted)
        currency: currency,
        name: 'CineFlow',
        description: `Booking #${bookingId.slice(0, 8)}`,
        image: 'https://via.placeholder.com/150x50?text=CineFlow',
        order_id: orderId,
        handler: async function (response) {
          try {
            // Step 3: Verify signature on backend
            await api.post('/payments/verify', {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              bookingId,
              // NOTE: userId and showId come from JWT on backend; seatIds still needed for seat update
              showId,
              seatIds,
            });
            // Navigate to status page — booking-service will confirm after Kafka event
            navigate('/booking/status', { state: { bookingId } });
          } catch (err) {
            console.error('Verification failed:', err);
            // Navigate anyway — status page handles both confirmed and failed
            navigate('/booking/status', { state: { bookingId } });
          }
        },
        prefill: {
          name: user.name || '',
          email: user.email || '',
          contact: ''
        },
        theme: {
          color: '#14b8a6'
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);

      rzp.on('payment.failed', function (response) {
        console.error('Payment failed:', response.error);
        setError(response.error?.description || 'Payment failed. Please try again.');
        setLoading(false);
      });

      rzp.open();

    } catch (err) {
      console.error('Error initiating payment:', err);
      setError(err.response?.data?.message || 'Failed to initialize payment gateway.');
      setLoading(false);
    }
  };

  if (!bookingId) return null;

  // Format MM:SS
  const formatTimer = (secs) => {
    if (!secs && secs !== 0) return null;
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };
  const timerDisplay = formatTimer(lockSecondsLeft);
  const timerUrgent = lockSecondsLeft !== null && lockSecondsLeft < 120; // red under 2 min

  const paymentMethods = [
    { icon: <Smartphone className="w-5 h-5" />, label: 'UPI' },
    { icon: <CreditCard className="w-5 h-5" />, label: 'Cards' },
    { icon: <Building2 className="w-5 h-5" />, label: 'Net Banking' },
  ];

  return (
    <div className="flex-grow flex items-center justify-center p-4 bg-zinc-950">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-zinc-950 p-6 text-center border-b border-zinc-800">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <ShieldCheck className="w-4 h-4 text-zinc-400" />
            <span className="text-xs text-zinc-400 font-medium">Secure Checkout</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Complete Your Booking</h1>
          {/* Seat lock countdown timer */}
          {timerDisplay && !lockExpired && (
            <div className={`mt-2 flex items-center justify-center gap-1.5 text-xs font-mono font-medium ${timerUrgent ? 'text-red-400' : 'text-zinc-400'}`}>
              <Loader2 className={`w-3 h-3 ${timerUrgent ? 'animate-spin text-red-400' : 'text-zinc-500'}`} />
              Seats held for <span className={timerUrgent ? 'text-red-400' : 'text-zinc-200'}>{timerDisplay}</span>
            </div>
          )}
          {lockExpired && (
            <div className="mt-2 text-xs text-red-400 font-semibold">⚠ Seat hold expired — please go back and reselect your seats</div>
          )}
        </div>

        <div className="p-6">
          {/* Order Summary */}
          <div className="bg-zinc-950 rounded-xl p-4 border border-zinc-800 space-y-3 mb-5">
            <h3 className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider border-b border-zinc-800/80 pb-2">Order Summary</h3>
            
            {movie && (
              <div className="flex gap-3">
                {movie.posterUrl && (
                  <img src={movie.posterUrl} alt={movie.title} className="w-12 h-16 object-cover rounded-md border border-zinc-800" />
                )}
                <div>
                  <div className="font-semibold text-sm text-white leading-tight">{movie.title}</div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">{theatre?.name}{theatre?.city ? `, ${theatre.city}` : ''}</div>
                  <div className="text-[11px] text-zinc-500">{showDate} | {showTime}</div>
                </div>
              </div>
            )}

            <div className="space-y-1.5 pt-2 border-t border-zinc-800 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-400">Booking ID</span>
                <span className="font-mono text-zinc-200">{bookingId.slice(0, 8).toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Seats ({seatIds?.length || 0})</span>
                <span className="font-semibold text-zinc-100">{seatNumbers?.join(', ') || ''}</span>
              </div>
            </div>

            <div className="border-t border-zinc-800 pt-3 flex justify-between items-center mt-2">
              <span className="text-zinc-300 font-medium text-xs">Total Payable</span>
              <span className="font-bold text-2xl text-white">₹{amount}</span>
            </div>
          </div>

          {/* Accepted payment methods */}
          <div className="mb-5">
            <p className="text-zinc-500 text-[11px] text-center mb-2.5">Pay securely via Razorpay</p>
            <div className="flex justify-center gap-2">
              {paymentMethods.map(({ icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-1 bg-zinc-950 rounded-lg px-3.5 py-1.5 border border-zinc-800">
                  <div className="text-zinc-400">{icon}</div>
                  <span className="text-[10px] text-zinc-400 font-medium">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg mb-4 text-xs text-center">
              {error}
            </div>
          )}

          {/* Pay Button */}
          <button
            onClick={handlePayment}
            disabled={loading || !scriptLoaded || lockExpired}
            className="w-full py-3 bg-white text-zinc-950 font-bold rounded-lg hover:bg-zinc-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Opening Gateway...
              </>
            ) : !scriptLoaded ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading...
              </>
            ) : lockExpired ? (
              'Session Expired — Go Back'
            ) : (
              `Pay ₹${amount}`
            )}
          </button>

          <p className="text-center text-zinc-500 text-[10px] mt-3">
            🔒 256-bit encrypted · Powered by Razorpay
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
