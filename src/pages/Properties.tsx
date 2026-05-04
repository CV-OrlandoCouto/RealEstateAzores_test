import { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useProperties } from '../lib/useProperties';
import PropertyCard from '../components/PropertyCard';
import { Search, SlidersHorizontal, ArrowUpDown } from 'lucide-react';

export default function Properties() {
  const { language, t } = useLanguage();
  const { properties, loading } = useProperties(false);
  const location = useLocation();

  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterTypology, setFilterTypology] = useState('all');
  const [filterBedrooms, setFilterBedrooms] = useState('all');
  const [filterBathrooms, setFilterBathrooms] = useState('all');
  const [filterConstruction, setFilterConstruction] = useState('');
  const [filterPrice, setFilterPrice] = useState('all');
  const [filterBusinessType, setFilterBusinessType] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    if (location.state) {
      if (location.state.searchTerm !== undefined) setSearchTerm(location.state.searchTerm);
      if (location.state.filterType !== undefined) setFilterType(location.state.filterType);
      if (location.state.filterTypology !== undefined) setFilterTypology(location.state.filterTypology);
      if (location.state.filterBedrooms !== undefined) setFilterBedrooms(location.state.filterBedrooms);
      if (location.state.filterPrice !== undefined) setFilterPrice(location.state.filterPrice);
      if (location.state.filterBusinessType !== undefined) setFilterBusinessType(location.state.filterBusinessType);
    }
  }, [location.state]);

  const filteredAndSortedProperties = useMemo(() => {
    let result = properties.filter(p => {
      // 0. Business Type Match
      if (filterBusinessType !== 'all') {
        const pType = p.businessType || 'comprar';
        if (pType !== filterBusinessType) return false;
      }

      // 1. Search term match
      const s = searchTerm.toLowerCase().trim();
      let matchesSearch = !s;
      
      if (!matchesSearch) {
        const removeAccents = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const searchTerms = removeAccents(s).split(/\s+/).filter(Boolean);
        
        const synonyms: Record<string, string[]> = {
          'villa': ['house', 'casa', 'moradia'],
          'house': ['villa', 'casa', 'moradia'],
          'casa': ['villa', 'house', 'moradia'],
          'moradia': ['villa', 'house', 'casa'],
          'apartment': ['apartamento', 'flat'],
          'apartamento': ['apartment', 'flat'],
          'flat': ['apartment', 'apartamento'],
          'farm': ['quinta', 'herdade', 'estate'],
          'quinta': ['farm', 'herdade', 'estate'],
          'herdade': ['farm', 'quinta', 'estate'],
          'land': ['terreno', 'lote', 'plot'],
          'terreno': ['land', 'lote', 'plot'],
          'lote': ['land', 'terreno', 'plot'],
          'pool': ['piscina'],
          'piscina': ['pool'],
          'garage': ['garagem'],
          'garagem': ['garage'],
          'garden': ['jardim'],
          'jardim': ['garden'],
        };

        const searchableText = removeAccents([
          p.title.pt,
          p.title.en,
          p.description.pt,
          p.description.en,
          p.location,
          p.propertyType,
          ...(p.tags || []).flatMap(t => [t.pt, t.en]),
          ...(p.features || []).flatMap(f => [f.pt || '', f.en || '', f.value || ''])
        ].filter(Boolean).join(' ').toLowerCase());

        matchesSearch = searchTerms.every(term => {
           let localExpanded = [term];
           for (const key in synonyms) {
             if (key.includes(term) || term.includes(key) || term === key) {
                localExpanded = [...localExpanded, key, ...synonyms[key]];
             }
           }
           
           // Check if any of the expanded terms match in the searchable text
           return localExpanded.some(expTerm => searchableText.includes(expTerm));
        });
      }

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

      // 3. Bedrooms match
      let matchesBedrooms = true;
      if (filterBedrooms !== 'all') {
        const minBeds = parseInt(filterBedrooms, 10);
        const divBeds = parseInt(p.divisions?.bedroomsCount || '0', 10);
        
        if (!isNaN(divBeds) && divBeds > 0) {
          matchesBedrooms = divBeds >= minBeds;
        } else {
          const bedFeature = p.features.find(f => 
            f.name.pt.toLowerCase().includes('quarto') || 
            f.name.en.toLowerCase().includes('bedroom')
          );
          if (bedFeature && typeof bedFeature.value === 'number') {
            matchesBedrooms = bedFeature.value >= minBeds;
          } else {
            matchesBedrooms = false; 
          }
        }
      }

      // 4. Bathrooms match
      let matchesBathrooms = true;
      if (filterBathrooms !== 'all') {
        const minBaths = parseInt(filterBathrooms, 10);
        const divBaths = parseInt(p.divisions?.bathroomsCount || '0', 10);
        if (!isNaN(divBaths) && divBaths > 0) {
          matchesBathrooms = divBaths >= minBaths;
        } else {
          const bathFeature = p.features.find(f => 
            f.name.pt.toLowerCase().includes('casa de banho') || 
            f.name.en.toLowerCase().includes('bathroom')
          );
          if (bathFeature && typeof bathFeature.value === 'number') {
             matchesBathrooms = bathFeature.value >= minBaths;
          } else {
             matchesBathrooms = false;
          }
        }
      }

      // 5. Typology
      let matchesTypology = true;
      if (filterTypology !== 'all') {
        matchesTypology = p.typology === filterTypology;
      }

      // 6. Construction date
      let matchesConstruction = true;
      if (filterConstruction) {
         matchesConstruction = p.constructionDate?.toLowerCase().includes(filterConstruction.toLowerCase()) ?? false;
      }

      // 7. Price match
      let matchesPrice = true;
      if (filterPrice !== 'all') {
        if (filterPrice === 'over5') {
          matchesPrice = p.price > 5000000;
        } else {
          matchesPrice = p.price <= parseInt(filterPrice, 10);
        }
      }

      return matchesSearch && matchesType && matchesBedrooms && matchesBathrooms && matchesTypology && matchesConstruction && matchesPrice;
    });

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      // newest
      return b.createdAt - a.createdAt;
    });

    return result;
  }, [properties, searchTerm, filterType, filterTypology, filterBedrooms, filterBathrooms, filterConstruction, filterPrice, filterBusinessType, sortBy]);

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        <div className="mb-8">
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-gray-900 mb-4 tracking-tight">
            {language === 'pt' ? 'Todos os Imóveis' : 'All Properties'}
          </h1>
          <p className="text-gray-500 text-lg">
            {language === 'pt' ? 'Explore a nossa seleção exclusiva de propriedades nos Açores.' : 'Explore our exclusive selection of properties in the Azores.'}
          </p>
        </div>

        {/* Filters Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <SlidersHorizontal className="w-5 h-5 text-gray-400" />
            <h2 className="font-semibold text-gray-900">
              {language === 'pt' ? 'Filtros Avançados' : 'Advanced Filters'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4">
            
            {/* Search input */}
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('hero.search') || 'Pesquisar...'}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 focus:border-brand-blue rounded-xl outline-none transition-colors"
              />
            </div>

            {/* Business Type Filter */}
            <select 
              value={filterBusinessType}
              onChange={(e) => setFilterBusinessType(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 focus:border-brand-blue rounded-xl outline-none appearance-none transition-colors cursor-pointer"
            >
              <option value="all">{language === 'pt' ? 'Qualquer Negócio' : 'Any Business'}</option>
              <option value="comprar">{language === 'pt' ? 'Para Comprar' : 'To Buy'}</option>
              <option value="arrendar">{language === 'pt' ? 'Para Arrendar' : 'To Rent'}</option>
              <option value="vender">{language === 'pt' ? 'Para Vender' : 'To Sell'}</option>
            </select>

            {/* Type Filter */}
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 focus:border-brand-blue rounded-xl outline-none appearance-none transition-colors cursor-pointer"
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

            {/* Typology Filter */}
            <select 
              value={filterTypology}
              onChange={(e) => setFilterTypology(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 focus:border-brand-blue rounded-xl outline-none appearance-none transition-colors cursor-pointer"
            >
              <option value="all">{language === 'pt' ? 'Qualquer Tipologia' : 'Any Typology'}</option>
              {['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9', 'V10', 'V11', 'V12'].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            {/* Bedrooms Filter */}
            <select 
              value={filterBedrooms}
              onChange={(e) => setFilterBedrooms(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 focus:border-brand-blue rounded-xl outline-none appearance-none transition-colors cursor-pointer"
            >
              <option value="all">{language === 'pt' ? 'Quartos (Qualquer)' : 'Bedrooms (Any)'}</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
            </select>

            {/* Bathrooms Filter */}
            <select 
              value={filterBathrooms}
              onChange={(e) => setFilterBathrooms(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 focus:border-brand-blue rounded-xl outline-none appearance-none transition-colors cursor-pointer"
            >
              <option value="all">{language === 'pt' ? 'Casas de Banho (Qualquer)' : 'Bathrooms (Any)'}</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
            </select>

            {/* Construction Date Filter */}
            <div className="relative">
              <input 
                type="text" 
                value={filterConstruction}
                onChange={(e) => setFilterConstruction(e.target.value)}
                placeholder={language === 'pt' ? 'Ano de Construção...' : 'Construction Year...'}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 focus:border-brand-blue rounded-xl outline-none transition-colors"
              />
            </div>

            {/* Price Filter */}
            <select 
              value={filterPrice}
              onChange={(e) => setFilterPrice(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 focus:border-brand-blue rounded-xl outline-none appearance-none transition-colors cursor-pointer"
            >
              <option value="all">{language === 'pt' ? 'Preço máximo' : 'Max Price'}</option>
              <option value="500000">{language === 'pt' ? 'Até 500.000€' : 'Up to 500k €'}</option>
              <option value="1000000">{language === 'pt' ? 'Até 1.000.000€' : 'Up to 1M €'}</option>
              <option value="2000000">{language === 'pt' ? 'Até 2.000.000€' : 'Up to 2M €'}</option>
              <option value="5000000">{language === 'pt' ? 'Até 5.000.000€' : 'Up to 5M €'}</option>
              <option value="over5">{language === 'pt' ? 'Mais de 5.000.000€' : 'Over 5M €'}</option>
            </select>
            
          </div>
        </div>

        {/* Results Info & Sorting */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <p className="text-gray-500 font-medium">
            {language === 'pt' 
              ? `${filteredAndSortedProperties.length} imóveis econtrados` 
              : `${filteredAndSortedProperties.length} properties found`}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              {language === 'pt' ? 'Ordenar por:' : 'Sort by:'}
            </span>
            <div className="relative">
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="pl-3 pr-8 py-1.5 bg-white border border-gray-200 rounded-lg outline-none text-sm font-medium transition-colors cursor-pointer appearance-none focus:border-brand-blue shadow-sm"
              >
                <option value="newest">{language === 'pt' ? 'Mais recentes' : 'Newest'}</option>
                <option value="price_asc">{language === 'pt' ? 'Preço: Menor para Maior' : 'Price: Low to High'}</option>
                <option value="price_desc">{language === 'pt' ? 'Preço: Maior para Menor' : 'Price: High to Low'}</option>
              </select>
              <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            <div className="col-span-full text-center py-20 text-gray-500 text-lg">
              {language === 'pt' ? 'A carregar imóveis...' : 'Loading properties...'}
            </div>
          ) : filteredAndSortedProperties.length === 0 ? (
            <div className="col-span-full py-20 text-center">
               <SlidersHorizontal className="w-12 h-12 text-gray-300 mx-auto mb-4" />
               <h3 className="text-xl font-bold text-gray-900 mb-2">
                 {language === 'pt' ? 'Nenhum imóvel encontrado' : 'No properties found'}
               </h3>
               <p className="text-gray-500">
                 {language === 'pt' 
                    ? 'Tente ajustar os filtros de pesquisa.' 
                    : 'Try adjusting your search filters.'}
               </p>
               <button 
                 onClick={() => {
                   setSearchTerm('');
                   setFilterType('all');
                   setFilterTypology('all');
                   setFilterBedrooms('all');
                   setFilterBathrooms('all');
                   setFilterConstruction('');
                   setFilterPrice('all');
                   setFilterBusinessType('all');
                 }}
                 className="mt-6 text-brand-blue font-medium hover:underline underline-offset-4"
               >
                 {language === 'pt' ? 'Limpar Filtros' : 'Clear Filters'}
               </button>
            </div>
          ) : (
            filteredAndSortedProperties.map(property => (
              <PropertyCard key={property.id} property={property} />
            ))
          )}
        </div>

      </div>
    </div>
  );
}
