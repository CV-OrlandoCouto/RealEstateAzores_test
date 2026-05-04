export interface LocalizedString {
  pt: string;
  en: string;
}

export interface PropertyFeature {
  id: string;
  name: LocalizedString;
  isPublic: boolean;
  value: string | number | boolean;
}

export type PropertyImageCategory = 'principais' | 'sala' | 'quartos' | 'casas_de_banho' | 'cozinha' | 'exterior' | 'plantas' | 'arredores';

export interface PropertyImage {
  url: string;
  isPublic: boolean;
  isCover: boolean;
  description?: string;
  tags?: string[];
  category?: PropertyImageCategory;
}

export interface LocationHierarchy {
  ilha: string;
  concelho?: string;
  freguesia?: string;
  lugar?: string;
}

export type BusinessType = 'comprar' | 'arrendar' | 'vender';
export type PropertyStatus = 'novidade' | 'baixa_preco' | 'reservado' | 'vendido';
export type PropertyType = 'casa' | 'apartamento' | 'terreno_urbano' | 'terreno_rustico' | 'terreno_misto' | 'terreno_industrial' | 'lote_urbano' | 'lote_industrial' | 'loja' | 'escritorio';

export interface PropertyArea {
  value: string;
  showOnCover: boolean;
  showOnDetails: boolean;
}

export interface Property {
  id: string;
  reference?: string;
  status?: PropertyStatus | null;
  propertyType?: PropertyType | null;
  title: LocalizedString;
  description: LocalizedString;
  price: number;
  oldPrice?: number;
  location: string;
  locationHierarchy?: LocationHierarchy;
  businessType?: BusinessType;
  condition?: string;
  typology?: string;
  constructionDate?: string;
  tags: LocalizedString[];
  images: PropertyImage[];
  features: PropertyFeature[];
  seoTitle?: LocalizedString;
  seoDescription?: LocalizedString;
  areas?: {
    util?: PropertyArea;
    bruta?: PropertyArea;
    brutaConstrucao?: PropertyArea;
    brutaPrivativa?: PropertyArea;
    terrenoTotal?: PropertyArea;
    brutaDependente?: PropertyArea;
    edificavel?: PropertyArea;
  };
  divisions?: {
    bedroomsCount?: string;
    bedroomAreas?: string[];
    suitesCount?: string;
    suiteAreas?: string[];
    bathroomsCount?: string;
    bathroomAreas?: string[];
    livingRoomsCount?: string;
    livingRoomAreas?: string[];
    kitchensCount?: string;
    kitchenAreas?: string[];
    otherDivisions?: string[];
  };
  isPublic: boolean;
  gpsCoordinates?: string;
  approximateLocation?: boolean;
  createdAt: number;
  updatedAt?: number;
}

export interface Testimonial {
  id: string;
  name: string;
  title: string;
  text: string;
  imageUrl: string;
  createdAt: number;
}

export interface BlogPost {
  id: string;
  title: string;
  author: string;
  imageUrl: string;
  content: string;
  date: string;
  isPublished: boolean;
  createdAt: number;
}
