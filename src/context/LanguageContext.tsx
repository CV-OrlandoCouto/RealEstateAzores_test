import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'pt' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  pt: {
    'nav.home': 'Início',
    'nav.properties': 'Imóveis',
    'nav.about': 'Sobre Mim',
    'nav.blog': 'Blog Açores',
    'nav.contact': 'Contacto',
    'nav.admin': 'Gestão (CMS)',
    'hero.title': 'Descubra a Sua Casa de Sonho nos Açores',
    'hero.subtitle': 'Propriedades exclusivas com profissionalismo, modernidade e confiança.',
    'hero.search': 'Pesquisar Imóveis...',
    'hero.searchButton': 'Pesquisar',
    'business.comprar': 'Comprar',
    'business.arrendar': 'Arrendar',
    'business.vender': 'Vender',
    'featured.title': 'Propriedades em Destaque',
    'property.moreInfo': 'Mais Informações',
    'property.contact': 'Contactar Consultor',
    'property.features': 'Características',
    'price.discount': 'Desconto',
    'map.title': 'Explore os Açores',
    'testimonials.title': 'O Que Dizem Os Nossos Clientes',
    'footer.rights': 'Todos os direitos reservados.',
    'footer.phone': 'Telemóvel:',
    'footer.nav': 'Navegação',
    'cookie.message': 'Utilizamos cookies de acordo com o RGPD para melhorar a sua experiência.',
    'cookie.accept': 'Aceitar',
    'status.novidade': 'Novidade',
    'status.baixa_preco': 'Baixa de Preço',
    'status.reservado': 'Reservado',
    'status.vendido': 'Vendido',
    'type.casa': 'Casa',
    'type.apartamento': 'Apartamento',
    'type.terreno_urbano': 'Terreno Urbano',
    'type.terreno_rustico': 'Terreno Rústico',
    'type.terreno_misto': 'Terreno Misto',
    'type.terreno_industrial': 'Terreno Industrial',
    'type.lote_urbano': 'Lote Urbano',
    'type.lote_industrial': 'Lote Industrial',
    'type.loja': 'Loja',
    'type.escritorio': 'Escritório',
  },
  en: {
    'nav.home': 'Home',
    'nav.properties': 'Properties',
    'nav.about': 'About',
    'nav.blog': 'Azores Blog',
    'nav.contact': 'Contact',
    'nav.admin': 'Management (CMS)',
    'hero.title': 'Discover Your Dream Home in the Azores',
    'hero.subtitle': 'Exclusive properties with professionalism, modernity, and trust.',
    'hero.search': 'Search Properties...',
    'hero.searchButton': 'Search',
    'business.comprar': 'Buy',
    'business.arrendar': 'Rent',
    'business.vender': 'Sell',
    'featured.title': 'Featured Properties',
    'property.moreInfo': 'More Info',
    'property.contact': 'Contact Agent',
    'property.features': 'Features',
    'price.discount': 'Discount',
    'map.title': 'Explore the Azores',
    'testimonials.title': 'What Our Clients Say',
    'footer.rights': 'All rights reserved.',
    'footer.phone': 'Mobile:',
    'footer.nav': 'Navigation',
    'cookie.message': 'We use cookies in accordance with GDPR to improve your experience.',
    'cookie.accept': 'Accept',
    'status.novidade': 'New',
    'status.baixa_preco': 'Price Reduction',
    'status.reservado': 'Reserved',
    'status.vendido': 'Sold',
    'type.casa': 'House',
    'type.apartamento': 'Apartment',
    'type.terreno_urbano': 'Urban Land',
    'type.terreno_rustico': 'Rustic Land',
    'type.terreno_misto': 'Mixed Land',
    'type.terreno_industrial': 'Industrial Land',
    'type.lote_urbano': 'Urban Lot',
    'type.lote_industrial': 'Industrial Lot',
    'type.loja': 'Store',
    'type.escritorio': 'Office',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('pt');

  useEffect(() => {
    // Auto-detect based on browser language
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('en')) {
      setLanguage('en');
    }
  }, []);

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
