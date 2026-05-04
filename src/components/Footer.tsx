import { useLanguage } from '../context/LanguageContext';
import { useSocial } from '../lib/useSocial';
import { Facebook, Instagram, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const { t } = useLanguage();
  const { socialSettings } = useSocial();

  return (
    <footer className="bg-brand-blue text-white py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center md:items-start gap-8">
        
        {/* Left Side: Contact Info */}
        <div className="text-center md:text-left">
          <h3 className="font-serif text-2xl font-bold mb-2">Carla Duarte Almeida</h3>
          <p className="text-gray-300 font-medium mb-6 text-sm md:text-base">Real Estate Azores - in REMAX 4YOU</p>
          <div className="text-gray-300 space-y-2 text-sm md:text-base">
            <p>{t('footer.phone')} +351 966341845</p>
            <p>
              WhatsApp:{' '}
              <a href="https://wa.me/351966341845" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                +351 966341845
              </a>
            </p>
            <p>Email: carladuartealmeida@remax.pt</p>
            <p><a href="https://www.realestateazores.pt" className="hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">www.realestateazores.pt</a></p>
          </div>
        </div>

        {/* Middle: Navigation */}
        <div className="text-center md:text-left pt-4 md:pt-0">
          <h4 className="font-serif font-bold text-xl mb-4">{t('footer.nav')}</h4>
          <div className="flex flex-col gap-3">
            <Link to="/about" className="text-gray-300 hover:text-white transition-colors">{t('nav.about')}</Link>
            <Link to="/blog" className="text-gray-300 hover:text-white transition-colors">{t('nav.blog')}</Link>
            <Link to="/contact" className="text-gray-300 hover:text-white transition-colors">{t('nav.contact')}</Link>
          </div>
        </div>
        
        {/* Right Side: Social Media */}
        <div className="flex flex-col items-center md:items-end justify-center h-full pt-4 md:pt-0">
          <div className="flex justify-center gap-6">
            <a href={socialSettings?.facebookUrl || '#'} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" aria-label="Facebook">
              <Facebook className="w-12 h-12" />
            </a>
            <a href={socialSettings?.instagramUrl || '#'} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" aria-label="Instagram">
              <Instagram className="w-12 h-12" />
            </a>
            <a href={socialSettings?.linkedinUrl || '#'} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" aria-label="LinkedIn">
              <Linkedin className="w-12 h-12" />
            </a>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
        <p>
          © {new Date().getFullYear()} Carla Duarte Almeida. {t('footer.rights')}
        </p>
        <Link to="/admin/login" className="hover:text-white transition-colors opacity-50 hover:opacity-100 flex items-center gap-2">
          Admin
        </Link>
      </div>
    </footer>
  );
}
