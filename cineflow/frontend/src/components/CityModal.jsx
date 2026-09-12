import { useCity } from '../context/CityContext';
import { MapPin, X } from 'lucide-react';

const CityModal = () => {
  const { cities, selectedCity, changeCity, isCityModalOpen, setIsCityModalOpen, isLoadingCities } = useCity();

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
        className={`absolute inset-0 bg-black/80 backdrop-blur-sm ${canClose ? 'cursor-pointer' : ''}`}
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-10">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
          <h2 className="text-lg font-bold flex items-center gap-2 text-white">
            <MapPin className="w-4 h-4 text-zinc-400" />
            Pick a Region
          </h2>
          {canClose && (
            <button 
              onClick={handleClose}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {!canClose && (
            <p className="text-zinc-400 mb-6 text-sm">
              Please select your city to see movies playing near you.
            </p>
          )}
          
          {isLoadingCities ? (
            <div className="text-center py-8 text-zinc-500 text-sm">
              <div className="w-6 h-6 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              Loading cities...
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {cities.map(city => (
                <button
                  key={city}
                  onClick={() => changeCity(city)}
                  className={`flex flex-col items-center justify-center p-3.5 rounded-xl border transition-all ${
                    selectedCity === city 
                      ? 'border-white bg-white text-zinc-950 font-bold' 
                      : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700 text-zinc-300 font-medium'
                  }`}
                >
                  <span className="text-xs">{city}</span>
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
