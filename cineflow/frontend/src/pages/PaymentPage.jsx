import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Loader2,
  ShieldCheck,
  CreditCard,
  Smartphone,
  Building2,
  ChevronLeft,
  Lock,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Film,
  Calendar,
  MapPin,
  Sparkles,
  Ticket,
} from 'lucide-react';

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('upi');
  const [isCancelling, setIsCancelling] = useState(false);

  const {
    bookingId,
    amount,
    showId,
    seatIds,
    seatNumbers,
    movie,
    theatre,
    showDate,
    showTime,
    lockExpiresAt,
  } = location.state || {};

  const [lockSecondsLeft, setLockSecondsLeft] = useState(null);
  const [lockExpired, setLockExpired] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const razorpayOpenRef = useRef(false);

  // ── Browser back-button interception ──────────────────────────────────────
  // useBlocker (React Router) cannot intercept POP navigations to history
  // entries created by window.history.pushState (e.g. Razorpay's SDK), which
  // always causes the "POP to unknown location" warning. We use a sentinel
  // pushState + popstate listener pattern instead:
  //   1. On mount: push a sentinel entry so the first back-press pops IT, not
  //      the router's payment entry.
  //   2. On popstate: if Razorpay is open, ignore (that's its own cleanup pop).
  //      Otherwise re-push the sentinel (keeping us on the payment page) and
  //      show the cancel modal.
  //   3. On confirm cancel: navigate away normally via React Router.
  useEffect(() => {
    if (!bookingId || lockExpired) return;

    // Push a sentinel so the first "back" hits this entry, not the router page
    window.history.pushState({ cineflowPaymentSentinel: true }, '');

    const handlePopState = () => {
      // Razorpay pushes/pops its own entries — let those through untouched
      if (razorpayOpenRef.current) return;
      if (!bookingId || lockExpired) return;

      // Re-push sentinel to "undo" the navigation, then show confirmation modal
      window.history.pushState({ cineflowPaymentSentinel: true }, '');
      setShowExitModal(true);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId, lockExpired]);


  // Redirect if no booking data or if already confirmed
  useEffect(() => {
    if (!bookingId) {
      navigate('/');
      return;
    }
    api.get(`/bookings/${bookingId}`)
      .then((res) => {
        if (res.data?.data?.status === 'CONFIRMED') {
          navigate('/booking/status', { state: { bookingId }, replace: true });
        }
      })
      .catch(() => {});
  }, [bookingId, navigate]);

  // Lazily loads the Razorpay checkout.js script with a 10s timeout.
  // Called only when the user clicks Pay — avoids pre-loading a script
  // that Brave Shields / ad blockers will silently block on page mount.
  const ensureRazorpayLoaded = () => {
    return new Promise((resolve) => {
      if (typeof window.Razorpay === 'function') {
        return resolve(true);
      }
      // Remove any stale/failed script tag before retrying
      const existing = document.getElementById('razorpay-script');
      if (existing) existing.remove();

      const script = document.createElement('script');
      script.id = 'razorpay-script';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;

      // 10-second timeout — Brave/ad-blockers stall the request indefinitely
      const timeout = setTimeout(() => resolve(false), 10000);
      script.onload = () => { clearTimeout(timeout); resolve(typeof window.Razorpay === 'function'); };
      script.onerror = () => { clearTimeout(timeout); resolve(false); };
      document.body.appendChild(script);
    });
  };

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

  // Before unload warning (covers tab close / page refresh)
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!bookingId || lockExpired) return;
      e.preventDefault();
      e.returnValue = 'Are you sure that you want to cancel the transaction?';
      return e.returnValue;
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [bookingId, lockExpired]);

  // In-page back button — show the cancel modal, same as browser back button
  const handleBackClick = () => {
    if (!bookingId || lockExpired) {
      // No active booking or already expired — just navigate away freely
      if (showId) {
        navigate(`/show/${showId}/seats`);
      } else {
        navigate(-1);
      }
      return;
    }
    // Active booking: show the cancel confirmation modal
    setShowExitModal(true);
  };

  // User confirms cancellation and leaving
  const handleConfirmCancel = async () => {
    setIsCancelling(true);
    try {
      if (bookingId) {
        await api.post(`/bookings/${bookingId}/cancel`, {
          reason: 'User cancelled transaction on checkout page',
        });
      }
    } catch (err) {
      console.warn('Error cancelling booking on server:', err);
    } finally {
      setIsCancelling(false);
      setShowExitModal(false);
      // Navigate away — React Router takes over from here
      if (showId) {
        navigate(`/show/${showId}/seats`, { replace: true });
      } else {
        navigate(-1);
      }
    }
  };

  const handleStayOnPage = () => {
    // Sentinel is already re-pushed by the popstate handler; just close modal
    setShowExitModal(false);
  };


  const handlePayment = async () => {
    setError('');
    setLoading(true);

    // Ensure Razorpay script is loaded (lazy — only on click, not on mount)
    if (typeof window.Razorpay !== 'function') {
      const ready = await ensureRazorpayLoaded();
      if (!ready || typeof window.Razorpay !== 'function') {
        setError(
          '⚠️ Razorpay checkout could not be loaded. ' +
          'If you are using Brave browser, click the Brave Shield icon (🦁) in the address bar and disable shields for this page, then click Pay again. ' +
          'If using another ad blocker, pause it for localhost and retry.'
        );
        setLoading(false);
        return;
      }
    }

    try {
      // Step 1: Create Razorpay order on backend
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
        amount: orderAmount,
        currency: currency,
        name: 'CineFlow',
        description: `Booking #${bookingId.slice(0, 8)}`,
        image: 'https://via.placeholder.com/150x50?text=CineFlow',
        order_id: orderId,
        handler: async function (response) {
          razorpayOpenRef.current = false;
          try {
            // Step 3: Verify signature on backend
            await api.post('/payments/verify', {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              bookingId,
              showId,
              seatIds,
            });
            navigate('/booking/status', { state: { bookingId } });
          } catch (err) {
            console.error('Verification failed:', err);
            navigate('/booking/status', { state: { bookingId } });
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: '',
        },
        theme: {
          color: '#18181b',
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            // Razorpay calls history.back() internally after ondismiss fires,
            // popping the state it pushed via window.history.pushState.
            // We must keep razorpayOpenRef.current=true until AFTER that
            // popstate event is processed — otherwise useBlocker intercepts
            // Razorpay's own cleanup pop and logs the "POP navigation to
            // unknown location" warning.
            setTimeout(() => {
              razorpayOpenRef.current = false;
            }, 0);
          },
        },
      };

      if (typeof window.Razorpay !== 'function') {
        setError('Payment gateway (Razorpay) is not available. Please disable Brave Shields or ad blockers for localhost and refresh.');
        setLoading(false);
        return;
      }

      // Set flag BEFORE creating Razorpay instance — its constructor can fire history events
      razorpayOpenRef.current = true;
      const rzp = new window.Razorpay(options);

      rzp.on('payment.failed', function (response) {
        console.error('Payment failed:', response.error);
        setError(response.error?.description || 'Payment failed. Please try again.');
        setLoading(false);
        razorpayOpenRef.current = false;
      });

      rzp.open();
    } catch (err) {
      console.error('Error initiating payment:', err);
      razorpayOpenRef.current = false;
      if (err.response?.data?.isAlreadyConfirmed) {
        navigate('/booking/status', { state: { bookingId }, replace: true });
        return;
      }
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
  const timerUrgent = lockSecondsLeft !== null && lockSecondsLeft < 120; // under 2 min

  const paymentMethods = [
    {
      id: 'upi',
      name: 'UPI / QR Code',
      icon: <Smartphone className="w-5 h-5 text-emerald-400" />,
      subtext: 'Google Pay, PhonePe, Paytm, BHIM',
      badge: 'Popular',
    },
    {
      id: 'card',
      name: 'Credit & Debit Cards',
      icon: <CreditCard className="w-5 h-5 text-blue-400" />,
      subtext: 'Visa, Mastercard, RuPay, Maestro',
      badge: null,
    },
    {
      id: 'netbanking',
      name: 'Net Banking',
      icon: <Building2 className="w-5 h-5 text-purple-400" />,
      subtext: 'All major Indian banks supported',
      badge: null,
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      {/* Dedicated Professional Checkout Top Bar */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBackClick}
              className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 px-3 py-1.5 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <div className="h-4 w-[1px] bg-zinc-800 hidden sm:block" />
            <div className="flex items-center gap-2">
              <span className="font-black text-lg tracking-wider bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                CINEFLOW
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Lock className="w-2.5 h-2.5" /> SECURE CHECKOUT
              </span>
            </div>
          </div>

          {/* Seat hold countdown timer */}
          {timerDisplay && !lockExpired && (
            <div
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-mono font-medium transition-all ${
                timerUrgent
                  ? 'border-red-500/40 bg-red-500/10 text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.2)]'
                  : 'border-zinc-800 bg-zinc-900/90 text-zinc-300'
              }`}
            >
              <Clock className={`w-3.5 h-3.5 ${timerUrgent ? 'animate-pulse text-red-400' : 'text-zinc-400'}`} />
              <span className="hidden md:inline text-zinc-400">Seats reserved:</span>
              <span className="font-bold">{timerDisplay}</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 flex-grow flex flex-col justify-start">
        {/* Expired warning if timer hit 0 */}
        {lockExpired && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 text-red-400" />
              <div>
                <p className="text-sm font-semibold">Your seat hold has expired</p>
                <p className="text-xs text-red-300/80">The 10-minute hold window elapsed. Please re-select your seats to complete booking.</p>
              </div>
            </div>
            <button
              onClick={() => navigate(showId ? `/show/${showId}/seats` : '/')}
              className="px-4 py-2 bg-red-500 text-white rounded-lg text-xs font-bold hover:bg-red-600 transition-colors flex-shrink-0"
            >
              Reselect Seats
            </button>
          </div>
        )}

        {/* 2-Column Professional Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Payment Options & Security (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-zinc-900/60 border border-zinc-800/90 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-white tracking-tight">Payment Methods</h2>
                  <p className="text-xs text-zinc-400 mt-0.5">Select your preferred payment method</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified Safe</span>
                </div>
              </div>

              {/* Payment Methods List */}
              <div className="space-y-3 mb-6">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    className={`cursor-pointer p-4 rounded-xl border transition-all flex items-center justify-between ${
                      selectedMethod === method.id
                        ? 'bg-zinc-800/80 border-zinc-500 shadow-md ring-1 ring-zinc-500/50'
                        : 'bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/50'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center flex-shrink-0">
                        {method.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-white">{method.name}</span>
                          {method.badge && (
                            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded">
                              {method.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-400 mt-0.5">{method.subtext}</p>
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                      selectedMethod === method.id ? 'border-white bg-white' : 'border-zinc-600'
                    }`}>
                      {selectedMethod === method.id && (
                        <div className="w-2 h-2 rounded-full bg-zinc-950" />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3.5 rounded-xl mb-4 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Primary Pay Action */}
              <button
                onClick={handlePayment}
                disabled={loading || lockExpired}
                className="w-full py-3.5 bg-white text-zinc-950 font-extrabold rounded-xl hover:bg-zinc-200 transition-all disabled:opacity-40 flex items-center justify-center gap-2 text-sm shadow-lg hover:shadow-xl active:scale-[0.99]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Connecting to Razorpay...</span>
                  </>
                ) : lockExpired ? (
                  <span>Hold Expired — Go Back</span>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-zinc-950" />
                    <span>Pay ₹{amount} Securely</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 mt-3.5 text-[11px] text-zinc-500">
                <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
                <span>256-bit encrypted · Powered by Razorpay · PCI-DSS Compliant</span>
              </div>
            </div>

            {/* Trust Badges / Assurance */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-zinc-900/40 border border-zinc-800/70 rounded-xl p-3 text-center space-y-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" />
                <div className="text-[11px] font-semibold text-zinc-200">100% Refund</div>
                <div className="text-[10px] text-zinc-500">On failed payments</div>
              </div>
              <div className="bg-zinc-900/40 border border-zinc-800/70 rounded-xl p-3 text-center space-y-1">
                <Lock className="w-4 h-4 text-blue-400 mx-auto" />
                <div className="text-[11px] font-semibold text-zinc-200">Bank Grade</div>
                <div className="text-[10px] text-zinc-500">End-to-end encrypted</div>
              </div>
              <div className="bg-zinc-900/40 border border-zinc-800/70 rounded-xl p-3 text-center space-y-1">
                <Sparkles className="w-4 h-4 text-amber-400 mx-auto" />
                <div className="text-[11px] font-semibold text-zinc-200">Instant Pass</div>
                <div className="text-[10px] text-zinc-500">Immediate m-ticket</div>
              </div>
            </div>
          </div>

          {/* Right Column: Order & Cinema Ticket Summary (5 cols) */}
          <div className="lg:col-span-5">
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-5 sticky top-24">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-zinc-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">Order Summary</span>
                </div>
                <span className="text-[10px] font-mono text-zinc-500">#{bookingId.slice(0, 8).toUpperCase()}</span>
              </div>

              {/* Movie Details with Poster */}
              {movie && (
                <div className="flex gap-4">
                  <div className="w-16 h-22 rounded-lg overflow-hidden flex-shrink-0 bg-zinc-950 border border-zinc-800 shadow-md">
                    {movie.posterUrl ? (
                      <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-600">
                        <Film className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col justify-between py-0.5">
                    <div>
                      <h3 className="font-bold text-base text-white leading-snug">{movie.title}</h3>
                      <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                        <span>{theatre?.name}{theatre?.city ? `, ${theatre.city}` : ''}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                      <span>{showDate} · {showTime}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Selected Seats Tag Chips */}
              <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-xl p-3.5 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400">Selected Seats</span>
                  <span className="text-zinc-400 font-medium">{seatIds?.length || 0} Ticket{(seatIds?.length || 0) > 1 ? 's' : ''}</span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {seatNumbers?.map((seat) => (
                    <span key={seat} className="px-2.5 py-1 rounded bg-zinc-800 border border-zinc-700 text-xs font-bold text-white shadow-sm">
                      {seat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 text-xs pt-1 border-t border-zinc-800/80">
                <div className="flex justify-between text-zinc-400">
                  <span>Tickets ({seatIds?.length || 0} × ₹{((amount || 0) / (seatIds?.length || 1)).toFixed(0)})</span>
                  <span className="text-zinc-200">₹{amount}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Convenience Fee & Taxes</span>
                  <span className="text-emerald-400 font-medium">FREE</span>
                </div>
              </div>

              {/* Total Payable */}
              <div className="border-t border-zinc-800 pt-4 flex justify-between items-baseline">
                <div>
                  <span className="text-xs text-zinc-400 font-medium block">Total Payable</span>
                  <span className="text-[10px] text-zinc-500">Includes all applicable GST</span>
                </div>
                <span className="text-2xl font-black text-white tracking-tight">₹{amount}</span>
              </div>

              {/* Cancellation Policy snippet */}
              <div className="bg-zinc-950/40 rounded-lg p-3 text-[11px] text-zinc-500 border border-zinc-800/60 leading-relaxed">
                ℹ Tickets can be cancelled up to 2 hours prior to showtime for a full refund.
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Exit / Cancel Transaction Dialog */}
      {showExitModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1.5">
              <h3 className="text-base font-bold text-white">Cancel Transaction?</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Are you sure that you want to cancel the transaction? Your seats <span className="text-white font-semibold">{seatNumbers?.join(', ')}</span> will be released.
              </p>
            </div>
            <div className="flex gap-2.5 pt-2">
              <button
                onClick={handleConfirmCancel}
                disabled={isCancelling}
                className="flex-1 py-2.5 px-3 rounded-lg border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold transition-colors disabled:opacity-50"
              >
                {isCancelling ? 'Cancelling...' : 'Cancel Transaction'}
              </button>
              <button
                onClick={handleStayOnPage}
                disabled={isCancelling}
                className="flex-1 py-2.5 px-3 rounded-lg bg-white text-zinc-950 hover:bg-zinc-200 text-xs font-bold transition-colors shadow-sm disabled:opacity-50"
              >
                Continue Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentPage;
