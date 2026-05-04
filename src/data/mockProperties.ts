import { Property } from '../types';

export const mockProperties: Property[] = [
  {
    id: '1',
    title: { pt: 'Moradia de Luxo com Vista Mar', en: 'Luxury Oceanview Villa' },
    description: { 
      pt: 'Magnífica moradia T4 em São Miguel com acabamentos premium e vista desafogada para o Oceano Atlântico.',
      en: 'Magnificent 4-bedroom villa in São Miguel with premium finishes and clear views of the Atlantic Ocean.'
    },
    price: 1250000,
    oldPrice: 1400000,
    location: 'Ponta Delgada, São Miguel',
    tags: [{ pt: 'Exclusivo', en: 'Exclusive' }, { pt: 'Vista Mar', en: 'Ocean View' }],
    images: [
      { url: 'https://images.unsplash.com/photo-1613490900233-141c556dbd46?auto=format&fit=crop&w=1200&q=80', isPublic: true, isCover: true },
      { url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80', isPublic: true, isCover: false },
      { url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80', isPublic: false, isCover: false } // Private image example
    ],
    features: [
      { id: 'f1', name: { pt: 'Quartos', en: 'Bedrooms' }, isPublic: true, value: 4 },
      { id: 'f2', name: { pt: 'Casas de Banho', en: 'Bathrooms' }, isPublic: true, value: 5 },
      { id: 'f3', name: { pt: 'Piscina Infinita', en: 'Infinity Pool' }, isPublic: true, value: 'Sim' },
      { id: 'f4', name: { pt: 'Cofre Secreto', en: 'Secret Safe' }, isPublic: false, value: 'Cave' }, // Private feature example
    ],
    isPublic: true,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: '2',
    title: { pt: 'Quinta Histórica em Angra do Heroísmo', en: 'Historic Estate in Angra do Heroísmo' },
    description: {
      pt: 'Propriedade única, inserida na zona classificada como Património Mundial da UNESCO. Uma oportunidade rara.',
      en: 'Unique property located in the UNESCO World Heritage zone. A rare opportunity.'
    },
    price: 850000,
    location: 'Angra do Heroísmo, Terceira',
    tags: [{ pt: 'Histórico', en: 'Historic' }],
    images: [
      { url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80', isPublic: true, isCover: true },
      { url: 'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?auto=format&fit=crop&w=1200&q=80', isPublic: true, isCover: false }
    ],
    features: [
      { id: 'f1', name: { pt: 'Área Terreno', en: 'Land Area' }, isPublic: true, value: '5000m²' },
      { id: 'f2', name: { pt: 'Ano Construção', en: 'Year Built' }, isPublic: true, value: 1890 },
    ],
    isPublic: true,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
];
