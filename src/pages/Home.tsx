import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useProperties } from '../lib/useProperties';
import { useHeroCarousel } from '../lib/useHeroCarousel';
import PropertyCard from '../components/PropertyCard';
import Testimonials from '../components/Testimonials';
import SocialFeed from '../components/SocialFeed';
import { Search } from 'lucide-react';

const defaultHeroImages = [
  '/Casa-07.jpg',
  '/Casa-08.jpg',
  '/Casa-09.jpg',
  '/Casa-10.jpg',
  '/Casa-11.jpg',
  '/Casa-12.jpg',
  '/Casa-13.jpg',
  '/Casa-14.jpg',
  '/Casa-15.jpg',
  '/Casa-16.jpg',
  '/Casa-17.jpg',
];

export default function Home() {
  const { language, t } = useLanguage();
  const { properties, loading: loadingProps } = useProperties(false);
  const { images: heroCarouselImages, loading: loadingCarousel } = useHeroCarousel();
  const navigate = useNavigate();

  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterTypology, setFilterTypology] = useState('all');
  const [filterPrice, setFilterPrice] = useState('all');
  const [filterBusinessType, setFilterBusinessType] = useState('comprar');

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Use uploaded carousel images if available, otherwise fallback to default
  const activeHeroImages = useMemo(() => {
    if (heroCarouselImages && heroCarouselImages.length > 0) {
      // Filter only public images if you want, or just get all uploaded
      const publicImages = heroCarouselImages.filter(img => img.isPublic);
      if (publicImages.length > 0) return publicImages.map(img => img.url);
      return heroCarouselImages.map(img => img.url);
    }
    return defaultHeroImages;
  }, [heroCarouselImages]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % activeHeroImages.length);
    }, 5000); // 5 seconds per image
    return () => clearInterval(interval);
  }, [activeHeroImages.length]);

  const filteredProperties = useMemo(() => {
    return properties.filter(p => {
      // 0. Business Type Match
      if (filterBusinessType !== 'all') {
        const pType = p.businessType || 'comprar'; // default to comprar for old data
        if (pType !== filterBusinessType) return false;
      }

      // 1. Search term match
      const s = searchTerm.toLowerCase();
      const matchesSearch = !s ||
        p.title.pt.toLowerCase().includes(s) ||
        p.title.en.toLowerCase().includes(s) ||
        p.location.toLowerCase().includes(s);

      // 2. Type match
      let matchesType = true;
      if (filterType !== 'all') {
        if (p.propertyType) {
          matchesType = p.propertyType === filterType;
        } else {
          // Fallback text matching just in case
          const typeSearchStr = `${p.title.pt} ${p.title.en} ${p.tags.map(tag => tag.pt + ' ' + tag.en).join(' ')}`.toLowerCase();
          if (filterType === 'casa') {
            matchesType = ['moradia', 'house', 'villa', 'casa'].some(w => typeSearchStr.includes(w));
          } else if (filterType === 'apartamento') {
            matchesType = ['apartamento', 'apartment', 'flat'].some(w => typeSearchStr.includes(w));
          } else if (['terreno_rustico', 'terreno_misto'].includes(filterType)) {
            matchesType = ['quinta', 'herdade', 'estate', 'farm', 'terreno rustico'].some(w => typeSearchStr.includes(w));
          } else if (['terreno_urbano', 'lote_urbano', 'lote_industrial'].includes(filterType)) {
            matchesType = ['terreno', 'land', 'lote'].some(w => typeSearchStr.includes(w));
          } else if (filterType === 'loja') {
            matchesType = ['loja', 'store', 'shop'].some(w => typeSearchStr.includes(w));
          } else if (filterType === 'escritorio') {
            matchesType = ['escritorio', 'office'].some(w => typeSearchStr.includes(w));
          }
        }
      }

      // 3. Typology match
      let matchesTypology = true;
      if (filterTypology !== 'all') {
        matchesTypology = p.typology === filterTypology;
      }

      // 4. Price match
      let matchesPrice = true;
      if (filterPrice !== 'all') {
        if (filterPrice === 'over5') {
          matchesPrice = p.price > 5000000;
        } else {
          matchesPrice = p.price <= parseInt(filterPrice, 10);
        }
      }

      return matchesSearch && matchesType && matchesTypology && matchesPrice;
    });
  }, [properties, searchTerm, filterType, filterTypology, filterPrice]);

  const handleSearch = () => {
    navigate('/properties', {
      state: {
        searchTerm,
        filterBusinessType,
        filterType,
        filterTypology,
        filterPrice
      }
    });
  };

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative h-screen min-h-[700px] flex items-center justify-center pt-20">
        {/* Background Overlay */}
        <div className="absolute inset-0 z-0 bg-black">
          {activeHeroImages.map((img, idx) => (
            <img 
              key={img}
              src={img} 
              alt={`Luxury Property Azores ${idx + 1}`} 
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${idx === currentImageIndex ? 'opacity-65' : 'opacity-0'}`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 w-full px-4 text-center">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-white tracking-widest mb-6 animate-in fade-in slide-in-from-bottom-8 duration-700 font-light">
            CARLA DUARTE ALMEIDA
          </h1>
          <p className="text-sm md:text-base tracking-[0.3em] uppercase text-brand-gold mb-12 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
            {t('hero.subtitle')}
          </p>

          {/* Search / Lead Capture Component */}
          <div className="bg-white/5 backdrop-blur-md p-4 sm:p-6 shadow-2xl max-w-4xl mx-auto animate-in fade-in duration-1000 delay-300 border border-white/20">
            {/* Tabs */}
            <div className="flex gap-4 mb-6 justify-center">
              <button 
                onClick={() => setFilterBusinessType('comprar')}
                className={`pb-2 font-light tracking-widest uppercase text-sm sm:text-base border-b-2 transition-all ${filterBusinessType === 'comprar' ? 'border-brand-gold text-white' : 'border-transparent text-gray-300 hover:text-white'}`}
              >
                {t('business.comprar')}
              </button>
              <button 
                onClick={() => setFilterBusinessType('arrendar')}
                className={`pb-2 font-light tracking-widest uppercase text-sm sm:text-base border-b-2 transition-all ${filterBusinessType === 'arrendar' ? 'border-brand-gold text-white' : 'border-transparent text-gray-300 hover:text-white'}`}
              >
                {t('business.arrendar')}
              </button>
              <button 
                onClick={() => setFilterBusinessType('vender')}
                className={`pb-2 font-light tracking-widest uppercase text-sm sm:text-base border-b-2 transition-all ${filterBusinessType === 'vender' ? 'border-brand-gold text-white' : 'border-transparent text-gray-300 hover:text-white'}`}
              >
                {t('business.vender')}
              </button>
            </div>
            
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-0 bg-white">
                <div className="flex-grow flex items-center px-4 py-4 sm:py-5 border-b sm:border-b-0 sm:border-r border-gray-200">
                  <Search className="w-5 h-5 text-gray-400 mr-3" />
                  <input 
                    type="text" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={t('hero.search')}
                    className="bg-transparent w-full focus:outline-none text-gray-700 font-light placeholder-gray-400"
                  />
                </div>
                <button 
                  onClick={handleSearch} 
                  className="bg-brand-blue hover:bg-brand-blue/90 text-white font-medium px-10 py-4 sm:py-5 transition-colors uppercase tracking-widest text-sm whitespace-nowrap hidden sm:block"
                >
                  {t('hero.searchButton')}
                </button>
              </div>

              {/* Advanced Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 bg-white border-t border-gray-100">
                <select 
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="bg-transparent px-4 py-4 text-sm tracking-wide text-gray-600 outline-none w-full appearance-none cursor-pointer border-r border-gray-100 last:border-r-0 font-light"
                >
                  <option value="all">{language === 'pt' ? 'Tipo de Imóvel' : 'Property Type'}</option>
                  <option value="casa">{language === 'pt' ? 'Casa' : 'House'}</option>
                  <option value="apartamento">{language === 'pt' ? 'Apartamento' : 'Apartment'}</option>
                  <option value="terreno_urbano">{language === 'pt' ? 'Terreno Urbano' : 'Urban Land'}</option>
                  <option value="terreno_rustico">{language === 'pt' ? 'Terreno Rústico' : 'Rustic Land'}</option>
                  <option value="terreno_misto">{language === 'pt' ? 'Terreno Misto' : 'Mixed Land'}</option>
                  <option value="terreno_industrial">{language === 'pt' ? 'Terreno Industrial' : 'Industrial Land'}</option>
                  <option value="lote_urbano">{language === 'pt' ? 'Lote Urbano' : 'Urban Lot'}</option>
                  <option value="lote_industrial">{language === 'pt' ? 'Lote Industrial' : 'Industrial Lot'}</option>
                  <option value="loja">{language === 'pt' ? 'Loja' : 'Store'}</option>
                  <option value="escritorio">{language === 'pt' ? 'Escritório' : 'Office'}</option>
                </select>

                <select 
                  value={filterTypology}
                  onChange={(e) => setFilterTypology(e.target.value)}
                  className="bg-transparent px-4 py-4 text-sm tracking-wide text-gray-600 outline-none w-full appearance-none cursor-pointer border-t sm:border-t-0 sm:border-r border-gray-100 font-light"
                >
                  <option value="all">{language === 'pt' ? 'Quartos (Qualquer)' : 'Bedrooms (Any)'}</option>
                  {['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'V1', 'V2', 'V3', 'V4', 'V5'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>

                <select 
                  value={filterPrice}
                  onChange={(e) => setFilterPrice(e.target.value)}
                  className="bg-transparent px-4 py-4 text-sm tracking-wide text-gray-600 outline-none w-full appearance-none cursor-pointer border-t sm:border-t-0 border-gray-100 font-light"
                >
                  <option value="all">{language === 'pt' ? 'Preço (Qualquer)' : 'Price (Any)'}</option>
                  <option value="500000">{language === 'pt' ? 'Até 500.000€' : 'Up to 500k €'}</option>
                  <option value="1000000">{language === 'pt' ? 'Até 1.000.000€' : 'Up to 1M €'}</option>
                  <option value="2000000">{language === 'pt' ? 'Até 2.000.000€' : 'Up to 2M €'}</option>
                  <option value="5000000">{language === 'pt' ? 'Até 5.000.000€' : 'Up to 5M €'}</option>
                  <option value="over5">{language === 'pt' ? 'Mais de 5.000.000€' : 'Over 5M €'}</option>
                </select>
              </div>

              {/* Mobile Search Button */}
              <button 
                onClick={handleSearch} 
                className="bg-brand-blue hover:bg-brand-blue/90 text-white font-medium px-8 py-4 uppercase tracking-widest text-sm transition-colors whitespace-nowrap sm:hidden w-full"
              >
                {t('hero.searchButton')}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col items-center mb-20 text-center">
            <span className="text-brand-gold uppercase tracking-[0.2em] text-sm mb-4 font-semibold">Exclusivo</span>
            <h2 className="text-3xl md:text-5xl font-serif text-brand-blue mb-6 tracking-wide font-light">{t('featured.title')}</h2>
            <div className="w-16 h-px bg-brand-gold"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {loadingProps ? (
              <div className="col-span-full text-center py-12 text-gray-500">
                {language === 'pt' ? 'A carregar imóveis...' : 'Loading properties...'}
              </div>
            ) : filteredProperties.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-500">
                {language === 'pt' ? 'Nenhum imóvel encontrado.' : 'No properties found.'}
              </div>
            ) : (
              filteredProperties.slice(0, 6).map(property => (
                <PropertyCard key={property.id} property={property} />
              ))
            )}
          </div>
          
          <div className="mt-20 text-center">
            <Link 
              to="/properties" 
              className="inline-block border text-brand-blue border-brand-blue hover:bg-brand-blue hover:text-white uppercase tracking-widest text-sm font-medium px-10 py-4 transition-colors"
            >
              {language === 'pt' ? 'Ver Coleção Completa' : 'View Complete Collection'}
            </Link>
          </div>
        </div>
      </section>

      {/* About The Agent Overview (New Section) */}
      <section className="py-24 bg-gray-50 border-y border-gray-200">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center gap-12 lg:gap-24">
          <div className="w-full md:w-1/2 flex justify-center">
            <div className="aspect-[4/5] w-full max-w-sm relative">
              <img src="/carla-1.jpg" alt="Carla Duarte Almeida" className="w-full h-full object-cover shadow-2xl" />
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-brand-gold/10 -z-10"></div>
              <div className="absolute -top-6 -left-6 w-32 h-32 bg-brand-blue/10 -z-10"></div>
            </div>
          </div>
          <div className="w-full md:w-1/2 text-left space-y-6">
            <span className="text-brand-gold uppercase tracking-[0.2em] text-sm font-semibold">Remax 4You</span>
            <h2 className="text-3xl md:text-5xl font-serif text-brand-blue font-light">
              Carla Duarte Almeida
            </h2>
            <p className="text-gray-600 font-light leading-relaxed text-lg">
              {language === 'pt' 
                ? 'A sua parceira de eleição na mediação de propriedades de luxo e investimento na deslumbrante Ilha de São Miguel. Uma abordagem pautada pela exclusividade, rigor e profundo conhecimento do mercado açoriano.'
                : 'Your trusted partner in luxury real estate mediation and investment in the stunning island of São Miguel. An approach guided by exclusivity, rigor, and deep knowledge of the Azorean market.'}
            </p>
            <div className="pt-4">
              <Link to="/about" className="text-brand-blue hover:text-brand-gold font-medium uppercase tracking-widest text-sm transition-colors border-b border-brand-blue pb-1 hover:border-brand-gold">
                {language === 'pt' ? 'Conheça o meu perfil' : 'Discover my profile'}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Map Section (Mock iframe) */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col items-center mb-16 text-center">
            <span className="text-brand-gold uppercase tracking-[0.2em] text-sm mb-4 font-semibold">{t('nav.home') || 'Localização'}</span>
            <h2 className="text-3xl md:text-4xl font-serif text-brand-blue mb-4 font-light">{language === 'pt' ? 'Imóveis nos Açores' : 'Properties in Azores'}</h2>
            <div className="w-16 h-px bg-brand-gold"></div>
          </div>
          <div className="aspect-[16/9] md:aspect-[21/9] w-full rounded-none overflow-hidden border border-gray-200">
            {/* Using a simple OpenStreetMap iframe centered roughly on Azores for demonstration */}
            <iframe 
              width="100%" 
              height="100%" 
              frameBorder="0" 
              scrolling="no" 
              marginHeight={0} 
              marginWidth={0} 
              src="https://www.openstreetmap.org/export/embed.html?bbox=-29.0%2C36.8%2C-24.8%2C39.8&amp;layer=mapnik" 
              className="w-full h-full"
            />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <Testimonials />

      {/* Social Feed / Links Section */}
      <SocialFeed />

    </div>
  );
}
