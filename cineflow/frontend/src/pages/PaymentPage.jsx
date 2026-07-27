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

  const { bookingId, amount, showId, seatIds, seatNumbers, movie, theatre, showDate, showTime } = location.state || {};

  // Redirect if no booking data
  useEffect(() => {
    if (!bookingId) navigate('/');
  }, [bookingId, navigate]);

  // Dynamically load Razorpay checkout script
  useEffect(() => {
    if (document.getElementById('razorpay-script')) {
      setScriptLoaded(true);
      return;
    }
    const script = document.createElement('script');
    script.id = 'razorpay-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    script.onerror = () => setError('Failed to load payment gateway. Check your network.');
    document.body.appendChild(script);
  }, []);

  const handlePayment = async () => {
    if (!scriptLoaded) {
      setError('Payment gateway is still loading. Please wait.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Step 1: Create Razorpay order on backend
      const { data: resp } = await api.post('/payments/create-order', {
        bookingId,
        userId: user.id,
        amount
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
              userId: user.id,
              amount,
              showId,
              seatIds
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

  const paymentMethods = [
    { icon: <Smartphone className="w-5 h-5" />, label: 'UPI' },
    { icon: <CreditCard className="w-5 h-5" />, label: 'Cards' },
    { icon: <Building2 className="w-5 h-5" />, label: 'Net Banking' },
  ];

  return (
    <div className="flex-grow flex items-center justify-center p-4">
      <div className="glass-card w-full max-w-md rounded-3xl overflow-hidden animate-slide-up">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-neonTeal/20 to-neonPurple/20 p-6 text-center border-b border-white/5">
          <div className="flex items-center justify-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5 text-neonTeal" />
            <span className="text-sm text-neonTeal font-medium">Secure Payment</span>
          </div>
          <h1 className="text-2xl font-bold">Complete Your Booking</h1>
        </div>

        <div className="p-8">
          {/* Order Summary */}
          <div className="bg-black/40 rounded-2xl p-5 border border-white/5 space-y-4 mb-6">
            <h3 className="text-white/60 text-xs uppercase tracking-widest border-b border-white/10 pb-2">Order Summary</h3>
            
            {movie && (
              <div className="flex gap-4">
                {movie.posterUrl && (
                  <img src={movie.posterUrl} alt={movie.title} className="w-16 h-20 object-cover rounded-lg" />
                )}
                <div>
                  <div className="font-bold text-lg leading-tight">{movie.title}</div>
                  <div className="text-xs text-white/50 mt-1">{theatre?.name}{theatre?.city ? `, ${theatre.city}` : ''}</div>
                  <div className="text-xs text-white/50">{showDate} | {showTime}</div>
                </div>
              </div>
            )}

            <div className="space-y-2 pt-2 border-t border-white/5">
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Booking ID</span>
                <span className="font-mono">{bookingId.slice(0, 8).toUpperCase()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Seats ({seatIds?.length || 0})</span>
                <span className="font-semibold text-neonPurple">{seatNumbers?.join(', ') || ''}</span>
              </div>
            </div>

            <div className="border-t border-white/5 pt-3 flex justify-between items-center text-lg mt-2">
              <span className="text-white/80 font-medium">Total Payable</span>
              <span className="font-bold text-3xl text-neonTeal">₹{amount}</span>
            </div>
          </div>

          {/* Accepted payment methods */}
          <div className="mb-6">
            <p className="text-white/40 text-xs text-center mb-3">Pay securely via Razorpay</p>
            <div className="flex justify-center gap-3">
              {paymentMethods.map(({ icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-1 bg-white/5 rounded-xl px-4 py-2 border border-white/10">
                  <div className="text-neonTeal">{icon}</div>
                  <span className="text-xs text-white/50">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl mb-5 text-sm text-center">
              {error}
            </div>
          )}

          {/* Pay Button */}
          <button
            onClick={handlePayment}
            disabled={loading || !scriptLoaded}
            className="w-full py-4 bg-gradient-to-r from-neonTeal to-neonPurple text-white font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-2 text-lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Opening Gateway...
              </>
            ) : !scriptLoaded ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Loading...
              </>
            ) : (
              `Pay ₹${amount}`
            )}
          </button>

          <p className="text-center text-white/30 text-xs mt-4">
            🔒 256-bit encrypted · Powered by Razorpay
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
