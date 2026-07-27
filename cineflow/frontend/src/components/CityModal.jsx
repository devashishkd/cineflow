import { useCity } from '../context/CityContext';
import { MapPin, X } from 'lucide-react';

const CityModal = () => {
  const { cities, selectedCity, changeCity, isCityModalOpen, setIsCityModalOpen } = useCity();

  if (!isCityModalOpen) return null;

  // We only allow closing the modal if a city is already selected
  const canClose = !!selectedCity;

  const handleClose = () => {
    if (canClose) {
      setIsCityModalOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center animate-fade-in p-4">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-obsidian/80 backdrop-blur-sm ${canClose ? 'cursor-pointer' : ''}`}
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-charcoal border border-white/10 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden z-10 scale-in">
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-white/5">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <MapPin className="w-5 h-5 text-neonTeal" />
            Pick a Region
          </h2>
          {canClose && (
            <button 
              onClick={handleClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-white/50 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {!canClose && (
            <p className="text-white/60 mb-6 text-sm">
              Please select your city to see movies playing near you.
            </p>
          )}
          
          {cities.length === 0 ? (
            <div className="text-center py-8 text-white/40">
              <div className="w-8 h-8 border-2 border-neonTeal border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              Loading cities...
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              <button
                onClick={() => changeCity('All Cities')}
                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all hover:-translate-y-1 ${
                  selectedCity === 'All Cities' || (!selectedCity && canClose)
                    ? 'border-neonTeal bg-neonTeal/10 text-neonTeal shadow-[0_0_15px_rgba(20,184,166,0.15)]' 
                    : 'border-white/10 bg-white/5 hover:border-white/30 text-white/70'
                }`}
              >
                <span className="font-semibold text-sm">All Cities</span>
              </button>
              
              {cities.map(city => (
                <button
                  key={city}
                  onClick={() => changeCity(city)}
                  className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all hover:-translate-y-1 ${
                    selectedCity === city 
                      ? 'border-neonTeal bg-neonTeal/10 text-neonTeal shadow-[0_0_15px_rgba(20,184,166,0.15)]' 
                      : 'border-white/10 bg-white/5 hover:border-white/30 text-white/70'
                  }`}
                >
                  <span className="font-semibold text-sm">{city}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CityModal;
