import React, { useState } from 'react';
import { useProperties } from '../../lib/useProperties';
import { useHeroCarousel } from '../../lib/useHeroCarousel';
import GalleryManager from '../GalleryManager';
import { Folder, Image as ImageIcon, ChevronLeft, ChevronRight, X, LayoutTemplate } from 'lucide-react';

export default function AdminGallery() {
  const { properties, loading: loadingProps } = useProperties(true);
  const { images: heroImages, loading: loadingHero, saveImages: saveHeroImages } = useHeroCarousel();
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (loadingProps || loadingHero) {
    return <div className="p-8 text-center text-gray-500">A carregar galeria...</div>;
  }

  const isHeroSelected = selectedPropertyId === 'hero_carousel';
  const selectedProperty = !isHeroSelected && selectedPropertyId 
    ? properties.find(p => p.id === selectedPropertyId) 
    : null;

  if (isHeroSelected) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 border-b border-gray-200 pb-4">
          <button 
            onClick={() => setSelectedPropertyId(null)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-serif font-bold text-gray-900">
              Carrossel da Homepage
            </h2>
            <p className="text-sm text-gray-500">Faça o upload e gira as imagens do carrossel principal</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <GalleryManager 
            images={heroImages} 
            onChange={saveHeroImages}
          />
        </div>
      </div>
    );
  }

  if (selectedProperty) {
    const images = selectedProperty.images || [];
    return (
      <div className="space-y-6">
        {lightboxIndex !== null && images[lightboxIndex] && (
          <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4">
            <button 
              onClick={() => setLightboxIndex(null)}
              className="absolute top-4 right-4 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors z-[101]"
            >
              <X className="w-8 h-8" />
            </button>

            <div className="absolute top-4 left-4 z-[101] flex gap-2">
              {!images[lightboxIndex].isPublic && (
                <span className="bg-red-500/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                  Privada
                </span>
              )}
              {images[lightboxIndex].category && (
                <span className="bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium capitalize">
                  {images[lightboxIndex].category === 'principais' ? 'Principais' : images[lightboxIndex].category}
                </span>
              )}
            </div>
            
            {images.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); setLightboxIndex(prev => prev! > 0 ? prev! - 1 : images.length - 1); }}
                className="absolute left-4 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors z-[101]"
              >
                <ChevronLeft className="w-10 h-10" />
              </button>
            )}

            <img 
              src={images[lightboxIndex].url}
              alt="Imagem em tamanho original" 
              className="max-w-full max-h-[90vh] object-contain rounded shadow-2xl relative z-[100]"
            />

            {images.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); setLightboxIndex(prev => prev! < images.length - 1 ? prev! + 1 : 0); }}
                className="absolute right-4 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors z-[101]"
              >
                <ChevronRight className="w-10 h-10" />
              </button>
            )}
            
            <div className="absolute bottom-6 inset-x-0 flex justify-center text-white/70 text-sm">
              {lightboxIndex + 1} / {images.length}
            </div>
          </div>
        )}
        <div className="flex items-center gap-4 border-b border-gray-200 pb-4">
          <button 
            onClick={() => setSelectedPropertyId(null)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-serif font-bold text-gray-900">
              {selectedProperty.reference ? `Ref: ${selectedProperty.reference}` : 'Sem Referência'}
            </h2>
            <p className="text-sm text-gray-500">{selectedProperty.title?.pt || 'Sem Título'}</p>
          </div>
        </div>

        {images.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-100 text-gray-500">
            Este imóvel não tem imagens na galeria.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {images.map((img, idx) => (
              <div 
                key={idx} 
                className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group bg-gray-100 shadow-sm cursor-pointer"
                onClick={() => setLightboxIndex(idx)}
              >
                <img 
                  src={img.url} 
                  alt={`Imagem ${idx}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white text-xs font-medium capitalize">{img.category || 'Principais'}</span>
                </div>
                {!img.isPublic && (
                  <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded">
                     Privada
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Filter properties that have images, or we can show all properties as folders.
  // The request says "dentro desta galeria devem ser criadas automaticamente pastas... nomeadas com Referencia"
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-serif font-bold text-gray-900 border-b border-gray-200 pb-4">
        Galeria de Imagens
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {/* Hero Carousel Special Folder */}
        <button
          onClick={() => setSelectedPropertyId('hero_carousel')}
          className="flex flex-col items-center p-6 bg-white border-2 border-brand-gold/30 rounded-2xl hover:border-brand-gold hover:shadow-md transition-all group text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-brand-gold/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative mb-3">
            <LayoutTemplate className="w-16 h-16 text-brand-gold/80 group-hover:text-brand-gold transition-colors drop-shadow-sm" />
            {heroImages && heroImages.length > 0 && (
              <div className="absolute -top-1 -right-1 bg-brand-red text-white text-[10px] font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                {heroImages.length}
              </div>
            )}
          </div>
          <span className="font-bold text-gray-900 text-sm line-clamp-2 w-full mb-1 leading-snug">
            Carrossel <br/> Homepage
          </span>
          <span className="text-[11px] text-gray-500 flex items-center gap-1 justify-center font-medium">
            <ImageIcon className="w-3 h-3" />
            {heroImages?.length || 0} {(heroImages?.length || 0) === 1 ? 'imagem' : 'imagens'}
          </span>
        </button>

        {/* Regular Property Folders */}
        {properties.map(property => {
          const imageCount = property.images?.length || 0;
          const folderName = property.reference || property.title?.pt || 'Sem Referência';
          
          return (
            <button
              key={property.id}
              onClick={() => setSelectedPropertyId(property.id)}
              className="flex flex-col items-center p-6 bg-white border border-gray-200 rounded-2xl hover:border-brand-blue hover:shadow-md transition-all group text-center"
            >
              <div className="relative mb-3">
                <Folder className="w-16 h-16 text-brand-blue/80 group-hover:text-brand-blue transition-colors drop-shadow-sm" />
                {imageCount > 0 && (
                  <div className="absolute -top-1 -right-1 bg-brand-red text-white text-[10px] font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                    {imageCount}
                  </div>
                )}
              </div>
              <span className="font-semibold text-gray-900 text-sm line-clamp-2 w-full mb-1 leading-snug">
                {folderName}
              </span>
              <span className="text-[11px] text-gray-500 flex items-center gap-1 justify-center">
                <ImageIcon className="w-3 h-3" />
                {imageCount} {imageCount === 1 ? 'imagem' : 'imagens'}
              </span>
            </button>
          );
        })}

        {properties.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 bg-gray-50 rounded-xl border border-gray-100">
            Ainda não tem imóveis registados na plataforma.
          </div>
        )}
      </div>
    </div>
  );
}
