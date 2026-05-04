import React from 'react';
import { useSocial } from '../lib/useSocial';
import { Facebook, Instagram, Linkedin, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function SocialFeed() {
  const { socialSettings } = useSocial();
  const { language } = useLanguage();

  if (!socialSettings) return null;

  return (
    <section className="py-24 bg-brand-blue text-white overflow-hidden relative">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
      
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <span className="text-brand-gold uppercase tracking-[0.2em] text-sm mb-4 font-semibold block">Social Media</span>
          <h2 className="font-serif text-3xl md:text-5xl mb-6 font-light">
            {language === 'pt' ? 'Siga-nos nas Redes Sociais' : 'Follow us on Social Media'}
          </h2>
          <div className="w-16 h-px bg-brand-gold mx-auto"></div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
          {socialSettings.facebookUrl && (
            <a 
              href={socialSettings.facebookUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex flex-col items-center group"
            >
              <div className="w-20 h-20 rounded-full border border-white/20 flex items-center justify-center mb-4 group-hover:border-brand-gold group-hover:bg-brand-gold/10 transition-all duration-300">
                <Facebook className="w-8 h-8 text-white group-hover:text-brand-gold transition-colors" />
              </div>
              <span className="font-medium tracking-wide">Facebook</span>
              <span className="text-brand-gold text-sm mt-2 flex items-center opacity-0 group-hover:opacity-100 transition-opacity -translate-y-2 group-hover:translate-y-0 duration-300">
                Ver Página <ArrowRight className="w-4 h-4 ml-1" />
              </span>
            </a>
          )}

          {socialSettings.instagramUrl && (
            <a 
              href={socialSettings.instagramUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex flex-col items-center group"
            >
              <div className="w-20 h-20 rounded-full border border-white/20 flex items-center justify-center mb-4 group-hover:border-brand-gold group-hover:bg-brand-gold/10 transition-all duration-300">
                <Instagram className="w-8 h-8 text-white group-hover:text-brand-gold transition-colors" />
              </div>
              <span className="font-medium tracking-wide">Instagram</span>
              <span className="text-brand-gold text-sm mt-2 flex items-center opacity-0 group-hover:opacity-100 transition-opacity -translate-y-2 group-hover:translate-y-0 duration-300">
                Ver Perfil <ArrowRight className="w-4 h-4 ml-1" />
              </span>
            </a>
          )}

          {socialSettings.linkedinUrl && (
            <a 
              href={socialSettings.linkedinUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex flex-col items-center group"
            >
              <div className="w-20 h-20 rounded-full border border-white/20 flex items-center justify-center mb-4 group-hover:border-brand-gold group-hover:bg-brand-gold/10 transition-all duration-300">
                <Linkedin className="w-8 h-8 text-white group-hover:text-brand-gold transition-colors" />
              </div>
              <span className="font-medium tracking-wide">LinkedIn</span>
              <span className="text-brand-gold text-sm mt-2 flex items-center opacity-0 group-hover:opacity-100 transition-opacity -translate-y-2 group-hover:translate-y-0 duration-300">
                Ver Empresa <ArrowRight className="w-4 h-4 ml-1" />
              </span>
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
