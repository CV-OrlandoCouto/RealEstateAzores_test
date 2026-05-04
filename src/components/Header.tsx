import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useCompare } from '../context/CompareContext';
import { Globe, Menu, Shield, X, Scale } from 'lucide-react';

export default function Header() {
  const { language, setLanguage, t } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { compareList } = useCompare();

  return (
    <header className="fixed top-0 left-0 right-0 h-24 bg-white/95 backdrop-blur-md z-50 border-b border-gray-100 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between relative">
        
        {/* Logo */}
        <Link to="/" className="flex flex-col items-stretch" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="flex justify-center w-full pr-[0.1em]">
            <span className="font-serif text-xl md:text-3xl font-light tracking-[0.1em] text-brand-blue uppercase leading-none whitespace-nowrap">
              Carla Duarte Almeida
            </span>
          </div>
          <div className="flex justify-between w-full text-[10px] md:text-[13px] text-brand-gold uppercase mt-1.5 font-medium">
            {"REAL ESTATE AZORES".split('').map((char, i) => (
              <span key={i} className={char === ' ' ? 'w-0.5 md:w-1' : 'inline-block'}>
                {char}
              </span>
            ))}
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-[13px] font-light tracking-[0.1em] uppercase text-gray-800 hover:text-brand-gold transition-colors">
            {t('nav.home')}
          </Link>
          <Link to="/properties" className="text-[13px] font-light tracking-[0.1em] uppercase text-gray-800 hover:text-brand-gold transition-colors">
            {t('nav.properties')}
          </Link>
          <Link to="/about" className="text-[13px] font-light tracking-[0.1em] uppercase text-gray-800 hover:text-brand-gold transition-colors">
            {t('nav.about')}
          </Link>
          <Link to="/blog" className="text-[13px] font-light tracking-[0.1em] uppercase text-gray-800 hover:text-brand-gold transition-colors">
            {t('nav.blog')}
          </Link>
          <Link to="/contact" className="text-[13px] font-light tracking-[0.1em] uppercase text-gray-800 hover:text-brand-gold transition-colors">
            {t('nav.contact')}
          </Link>
          
          {compareList.length > 0 && (
            <Link to="/compare" className="text-[13px] font-light tracking-[0.1em] uppercase text-gray-800 hover:text-brand-gold transition-colors flex items-center gap-2">
              <Scale className="w-4 h-4" />
              {language === 'pt' ? 'Comparar' : 'Compare'}
              <span className="bg-brand-blue text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {compareList.length}
              </span>
            </Link>
          )}

          <Link to="/admin" className="text-[13px] font-light tracking-[0.1em] uppercase text-gray-400 hover:text-brand-gold transition-colors flex items-center gap-2">
            <Shield className="w-3.5 h-3.5" />
            {t('nav.admin')}
          </Link>

          {/* Language Selector */}
          <div className="flex items-center gap-3 border-l border-gray-200 pl-8 ml-2">
            <button 
              onClick={() => setLanguage('pt')} 
              className={`text-[12px] font-medium tracking-widest uppercase transition-colors ${language === 'pt' ? 'text-brand-gold' : 'text-gray-400 hover:text-brand-blue'}`}
            >
              PT
            </button>
            <span className="text-gray-200">|</span>
            <button 
              onClick={() => setLanguage('en')} 
              className={`text-[12px] font-medium tracking-widest uppercase transition-colors ${language === 'en' ? 'text-brand-gold' : 'text-gray-400 hover:text-brand-blue'}`}
            >
              EN
            </button>
          </div>
        </nav>

        {/* Mobile Menu Toggle */}
        <div className="flex items-center gap-4 md:hidden">
          {compareList.length > 0 && (
            <Link to="/compare" className="relative p-2 text-gray-600 hover:text-brand-blue">
              <Scale className="w-6 h-6" />
              <span className="absolute top-1 right-1 bg-brand-blue text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {compareList.length}
              </span>
            </Link>
          )}
          <button 
            className="p-2 text-gray-600 hover:text-brand-blue"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {isMobileMenuOpen && (
          <div className="absolute top-20 left-0 right-0 bg-white border-b border-gray-100 shadow-xl flex flex-col p-4 gap-4 animate-in slide-in-from-top-2 md:hidden">
            <Link 
              to="/" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-base font-medium text-gray-800 hover:text-brand-blue p-2"
            >
              {t('nav.home')}
            </Link>
            <Link 
              to="/properties" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-base font-medium text-gray-800 hover:text-brand-blue p-2"
            >
              {t('nav.properties')}
            </Link>
            <Link 
              to="/about" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-base font-medium text-gray-800 hover:text-brand-blue p-2"
            >
              {t('nav.about')}
            </Link>
            <Link 
              to="/blog" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-base font-medium text-gray-800 hover:text-brand-blue p-2"
            >
              {t('nav.blog')}
            </Link>
            <Link 
              to="/contact" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-base font-medium text-gray-800 hover:text-brand-blue p-2"
            >
              {t('nav.contact')}
            </Link>
            {compareList.length > 0 && (
              <Link 
                to="/compare" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-base font-medium text-gray-800 hover:text-brand-blue p-2 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Scale className="w-5 h-5 text-gray-400" />
                  {language === 'pt' ? 'Comparar Imóveis' : 'Compare Properties'}
                </div>
                <span className="bg-brand-blue text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {compareList.length}
                </span>
              </Link>
            )}
            <Link 
              to="/admin" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-base font-medium text-gray-800 hover:text-brand-blue p-2 flex items-center gap-2"
            >
              <Shield className="w-5 h-5 text-gray-400" />
              {t('nav.admin')}
            </Link>
            
            <div className="h-px bg-gray-100 my-2"></div>
            
            <div className="flex items-center justify-around p-2">
              <button 
                onClick={() => { setLanguage('pt'); setIsMobileMenuOpen(false); }} 
                className={`text-sm font-semibold transition-colors px-4 py-2 flex-1 rounded-md ${language === 'pt' ? 'bg-brand-red/10 text-brand-red' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                Português
              </button>
              <button 
                onClick={() => { setLanguage('en'); setIsMobileMenuOpen(false); }} 
                className={`text-sm font-semibold transition-colors px-4 py-2 flex-1 rounded-md ${language === 'en' ? 'bg-brand-red/10 text-brand-red' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                English
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
