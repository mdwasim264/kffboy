import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from './ui/button';

const InstallPWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPopup(true);
    });

    window.addEventListener('appinstalled', () => {
      setShowPopup(false);
      setDeferredPrompt(null);
    });
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowPopup(false);
    }
    setDeferredPrompt(null);
  };

  if (!showPopup) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-[100] animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="bg-white rounded-2xl shadow-2xl border-2 border-orange-100 p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center text-white shadow-lg">
            <span className="font-black italic text-xl">KFF</span>
          </div>
          <div>
            <p className="font-black text-gray-800 text-sm">Install KFF App</p>
            <p className="text-[10px] text-gray-500 font-bold uppercase">Fast & Easy Access</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={handleInstall}
            className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl h-9 px-4 flex gap-2"
          >
            <Download size={14} /> INSTALL
          </Button>
          <button 
            onClick={() => setShowPopup(false)}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallPWA;