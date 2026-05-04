import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Info } from 'lucide-react';

export default function CookieBanner() {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasAccepted = localStorage.getItem('gdpr_accepted');
    if (!hasAccepted) setIsVisible(true);
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('gdpr_accepted', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-gray-50 to-white shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.1)] p-5 z-50 animate-in slide-in-from-bottom-8 fade-in-0 duration-700 ease-out border-t border-gray-100">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3 text-brand-blue">
          <Info className="w-6 h-6 flex-shrink-0" />
          <p className="text-sm text-gray-700 text-center sm:text-left leading-relaxed">
            {t('cookie.message')}
          </p>
        </div>
        <button 
          onClick={acceptCookies}
          className="bg-brand-red text-white px-8 py-2.5 rounded-md font-medium hover:bg-brand-red/90 transition-all shadow-sm hover:shadow-md whitespace-nowrap active:scale-95"
        >
          {t('cookie.accept')}
        </button>
      </div>
    </div>
  );
}
