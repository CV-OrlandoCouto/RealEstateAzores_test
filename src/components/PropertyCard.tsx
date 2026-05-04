import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useCompare } from '../context/CompareContext';
import { Property } from '../types';
import { MapPin, Home, Building2, Map, Trees, Factory, Store, Briefcase, Scale } from 'lucide-react';

interface Props {
  property: Property;
}

const PropertyCard: React.FC<Props> = ({ property }) => {
  const { language, t } = useLanguage();
  const { isCompared, toggleCompare } = useCompare();
  const coverImage = property.images.find(img => img.isCover) || property.images[0];
  const compared = isCompared(property.id);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(language === 'pt' ? 'pt-PT' : 'en-US', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const getPropertyIcon = (type: string | undefined | null) => {
    switch (type) {
      case 'casa': return <Home className="w-4 h-4 mr-1.5 text-brand-gold flex-shrink-0" />;
      case 'apartamento': return <Building2 className="w-4 h-4 mr-1.5 text-brand-gold flex-shrink-0" />;
      case 'terreno_urbano':
      case 'terreno_misto':
      case 'lote_urbano': return <Map className="w-4 h-4 mr-1.5 text-brand-gold flex-shrink-0" />;
      case 'terreno_rustico': return <Trees className="w-4 h-4 mr-1.5 text-brand-gold flex-shrink-0" />;
      case 'terreno_industrial':
      case 'lote_industrial': return <Factory className="w-4 h-4 mr-1.5 text-brand-gold flex-shrink-0" />;
      case 'loja': return <Store className="w-4 h-4 mr-1.5 text-brand-gold flex-shrink-0" />;
      case 'escritorio': return <Briefcase className="w-4 h-4 mr-1.5 text-brand-gold flex-shrink-0" />;
      default: return null;
    }
  };

  return (
    <div className="group bg-white border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col relative">
      
      <button 
        onClick={(e) => {
          e.preventDefault();
          toggleCompare(property.id);
        }}
        className={`absolute top-4 right-4 z-30 p-2 backdrop-blur-md transition-all shadow-sm
          ${compared 
            ? 'bg-brand-blue text-white' 
            : 'bg-white/80 text-gray-600 hover:bg-white hover:text-brand-blue'}`}
        title={language === 'pt' ? 'Comparar' : 'Compare'}
      >
        <Scale className="w-4 h-4" />
      </button>

      <Link to={`/property/${property.id}`} className="block relative aspect-[4/3] overflow-hidden bg-gray-100">
        <img 
          src={coverImage?.url} 
          alt={property.title[language]} 
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        
        {/* Status Badge */}
        {property.status && (
          <div className="absolute top-4 left-4 z-20">
            <span className="bg-brand-blue text-white text-[10px] font-semibold px-3 py-1 uppercase tracking-widest shadow-sm border border-transparent">
              {t(`status.${property.status}`)}
            </span>
          </div>
        )}

        {/* Tags */}
        <div className={`absolute bottom-4 left-4 flex flex-col gap-2 z-10`}>
          {property.oldPrice && (
            <span className="bg-brand-red text-white text-[10px] font-bold px-3 py-1 uppercase tracking-widest shadow-sm w-fit">
              {t('price.discount')}
            </span>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-start justify-between gap-4 mb-4">
          <Link to={`/property/${property.id}`}>
            <h3 className="font-serif text-xl sm:text-2xl font-light text-brand-blue hover:text-brand-gold transition-colors line-clamp-2">
              {property.title[language]}
            </h3>
          </Link>
        </div>
        
        <div className="flex flex-col gap-2 border-b border-gray-100 pb-4 mb-4">
          <div className="flex items-center text-gray-500 text-sm font-light">
            <MapPin className="w-4 h-4 mr-2 flex-shrink-0 text-brand-gold" />
            <span className="truncate">{property.location}</span>
          </div>
          {property.propertyType && (
            <div className="flex items-center text-gray-500 text-sm font-light">
              {getPropertyIcon(property.propertyType)}
              <span className="truncate ml-0.5">{t(`type.${property.propertyType}`)}</span>
            </div>
          )}
        </div>

        <div className="mt-auto flex flex-col gap-4">
          <div className="flex items-end justify-between">
            <div>
              {property.oldPrice && (
                <p className="text-sm text-gray-400 line-through decoration-gray-300 decoration-1 mb-1 font-light">
                  {formatPrice(property.oldPrice)}
                </p>
              )}
              <p className="text-xl sm:text-2xl font-light text-brand-blue tracking-wide">
                {formatPrice(property.price)}
              </p>
            </div>
            <Link to={`/property/${property.id}`} className="text-xs uppercase tracking-widest font-medium text-brand-gold hover:text-brand-blue transition-colors">
              {t('property.moreInfo')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PropertyCard;
