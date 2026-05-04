import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useCompare } from '../context/CompareContext';
import { useProperties } from '../lib/useProperties';
import { X, Check } from 'lucide-react';

export default function Compare() {
  const { language } = useLanguage();
  const { compareList, removeFromCompare, clearCompare } = useCompare();
  const { properties, loading } = useProperties(false);

  if (loading) {
    return (
      <div className="w-full min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-blue border-t-transparent"></div>
      </div>
    );
  }

  const comparedProperties = properties.filter(p => compareList.includes(p.id));

  if (comparedProperties.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-4">
          {language === 'pt' ? 'Comparar Imóveis' : 'Compare Properties'}
        </h1>
        <p className="text-lg text-gray-500 mb-8">
          {language === 'pt' 
            ? 'Ainda não adicionou nenhum imóvel para comparar.' 
            : "You haven't added any properties to compare yet."}
        </p>
        <Link 
          to="/properties" 
          className="bg-brand-blue text-white px-8 py-3 rounded-xl font-semibold hover:bg-brand-blue/90 transition-colors"
        >
          {language === 'pt' ? 'Ver Imóveis' : 'View Properties'}
        </Link>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 overflow-x-hidden min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-serif font-bold text-gray-900">
          {language === 'pt' ? 'Comparar Imóveis' : 'Compare Properties'}
        </h1>
        <button 
          onClick={clearCompare}
          className="text-brand-red font-medium hover:underline flex items-center gap-2"
        >
          <X className="w-4 h-4" />
          {language === 'pt' ? 'Limpar Tudo' : 'Clear All'}
        </button>
      </div>

      <div className="overflow-x-auto pb-8">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <tbody>
            {/* Images & Title */}
            <tr>
              <th className="p-4 bg-gray-50 border-b border-gray-200 font-medium text-gray-500 w-48 align-top">
                {language === 'pt' ? 'Imóvel' : 'Property'}
              </th>
              {comparedProperties.map(property => {
                const coverImage = property.images.find(img => img.isCover) || property.images[0];
                return (
                  <td key={property.id} className="p-4 border-b border-gray-200 align-top width-[calc(100%/min(4,comparedProperties.length))]">
                    <div className="relative group">
                      <button 
                        onClick={() => removeFromCompare(property.id)}
                        className="absolute top-2 right-2 bg-white/80 p-1.5 rounded-full text-gray-600 hover:text-red-500 hover:bg-white transition-colors z-10"
                        title={language === 'pt' ? 'Remover' : 'Remove'}
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <Link to={`/property/${property.id}`} className="block">
                        <div className="aspect-[4/3] rounded-lg overflow-hidden mb-3 bg-gray-100">
                          {coverImage ? (
                            <img src={coverImage.url} alt={property.title[language]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                          )}
                        </div>
                        <h3 className="font-serif font-bold text-gray-900 line-clamp-2 hover:text-brand-blue">
                          {property.title[language]}
                        </h3>
                      </Link>
                    </div>
                  </td>
                );
              })}
            </tr>

            {/* Price */}
            <tr>
              <th className="p-4 bg-gray-50 border-b border-gray-200 font-medium text-gray-500">
                {language === 'pt' ? 'Preço' : 'Price'}
              </th>
              {comparedProperties.map(property => (
                <td key={property.id} className="p-4 border-b border-gray-200 font-bold text-brand-gold text-lg">
                  {formatPrice(property.price)}
                </td>
              ))}
            </tr>

            {/* Location */}
            <tr>
              <th className="p-4 bg-gray-50 border-b border-gray-200 font-medium text-gray-500">
                {language === 'pt' ? 'Localização' : 'Location'}
              </th>
              {comparedProperties.map(property => (
                <td key={property.id} className="p-4 border-b border-gray-200">
                  {property.location}
                </td>
              ))}
            </tr>

            {/* Property Type */}
            <tr>
              <th className="p-4 bg-gray-50 border-b border-gray-200 font-medium text-gray-500">
                 {language === 'pt' ? 'Tipo' : 'Type'}
              </th>
              {comparedProperties.map(property => (
                <td key={property.id} className="p-4 border-b border-gray-200 capitalize">
                  {property.propertyType 
                    ? (language === 'pt' ? property.propertyType.replace('_', ' ') : property.propertyType.replace('_', ' ')) 
                    : '-'}
                </td>
              ))}
            </tr>

            {/* Typology */}
            <tr>
              <th className="p-4 bg-gray-50 border-b border-gray-200 font-medium text-gray-500">
                 {language === 'pt' ? 'Tipologia' : 'Typology'}
              </th>
              {comparedProperties.map(property => (
                <td key={property.id} className="p-4 border-b border-gray-200">
                  {property.typology || '-'}
                </td>
              ))}
            </tr>

            {/* Condition */}
            <tr>
              <th className="p-4 bg-gray-50 border-b border-gray-200 font-medium text-gray-500">
                 {language === 'pt' ? 'Condição' : 'Condition'}
              </th>
              {comparedProperties.map(property => (
                <td key={property.id} className="p-4 border-b border-gray-200">
                  {property.condition || '-'}
                </td>
              ))}
            </tr>

            {/* Bedrooms */}
            <tr>
              <th className="p-4 bg-gray-50 border-b border-gray-200 font-medium text-gray-500">
                 {language === 'pt' ? 'Quartos' : 'Bedrooms'}
              </th>
              {comparedProperties.map(property => (
                <td key={property.id} className="p-4 border-b border-gray-200">
                  {property.divisions?.bedroomsCount || '-'}
                </td>
              ))}
            </tr>

            {/* Bathrooms */}
            <tr>
              <th className="p-4 bg-gray-50 border-b border-gray-200 font-medium text-gray-500">
                 {language === 'pt' ? 'Casas de Banho' : 'Bathrooms'}
              </th>
              {comparedProperties.map(property => (
                <td key={property.id} className="p-4 border-b border-gray-200">
                  {property.divisions?.bathroomsCount || '-'}
                </td>
              ))}
            </tr>

            {/* Build Year */}
            <tr>
              <th className="p-4 bg-gray-50 border-b border-gray-200 font-medium text-gray-500">
                 {language === 'pt' ? 'Ano de Construção' : 'Build Year'}
              </th>
              {comparedProperties.map(property => (
                <td key={property.id} className="p-4 border-b border-gray-200">
                  {property.constructionDate || '-'}
                </td>
              ))}
            </tr>

            {/* Tags/Features Summary */}
            <tr>
              <th className="p-4 bg-gray-50 font-medium text-gray-500 align-top">
                 {language === 'pt' ? 'Características' : 'Features'}
              </th>
              {comparedProperties.map(property => (
                <td key={property.id} className="p-4 align-top">
                  <div className="flex flex-wrap gap-2">
                    {property.tags?.map((tag, idx) => (
                      <span key={idx} className="bg-gray-100 text-gray-600 text-xs font-semibold px-2 py-1 rounded">
                        {tag[language]}
                      </span>
                    ))}
                    {property.features?.filter(f => f.isPublic).map((feature, idx) => (
                       <div key={idx} className="text-sm text-gray-600 w-full mt-1">
                          • {feature.name[language]}: {feature.value}
                       </div>
                    ))}
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
