import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useCompare } from '../context/CompareContext';
import { ArrowLeft, MapPin, Check, Image as ImageIcon, AlertCircle, ChevronLeft, ChevronRight, Scale, Share2, Facebook, Linkedin, Twitter, X, Maximize2 } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useProperties } from '../lib/useProperties';
import { PropertyImageCategory } from '../types';
import { MapContainer, TileLayer, Marker, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
// @ts-ignore
import icon from 'leaflet/dist/images/marker-icon.png';
// @ts-ignore
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function PropertyDetail() {
  const { id } = useParams<{ id: string }>();
  const { language, t } = useLanguage();
  const { properties, loading } = useProperties(false);
  const { isCompared, toggleCompare } = useCompare();
  
  const property = properties.find(p => p.id === id);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [mainImageLoaded, setMainImageLoaded] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [activeCategory, setActiveCategory] = useState<PropertyImageCategory | 'todas'>('todas');
  const [galleryPage, setGalleryPage] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    setMainImageLoaded(false);
  }, [activeImageIndex]);

  useEffect(() => {
    setActiveImageIndex(0);
    setGalleryPage(0);
  }, [activeCategory]);

  const shareUrl = window.location.href;

  // Form State
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [touched, setTouched] = useState({ name: false, email: false, phone: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Validation functions
  const validateName = (name: string) => name.trim().length >= 3;
  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone: string) => /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/.test(phone) && phone.trim().length >= 9;

  const errors = {
    name: !validateName(formData.name) && touched.name ? 'Nome curto.' : '',
    email: !validateEmail(formData.email) && touched.email ? 'Email inválido.' : '',
    phone: !validatePhone(formData.phone) && touched.phone ? 'Telefone inválido.' : ''
  };

  const isFormValid = validateName(formData.name) && validateEmail(formData.email) && validatePhone(formData.phone);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  // Filter public images and features for the frontend
  const publicImages = property?.images.filter(img => img.isPublic) || [];
  const publicFeatures = property?.features.filter(f => f.isPublic) || [];

  const availableCategories = Array.from(new Set(publicImages.map(img => img.category || 'principais')));
  const orderedCategories = ['principais', 'sala', 'quartos', 'casas_de_banho', 'cozinha', 'exterior', 'plantas', 'arredores'].filter(c => availableCategories.includes(c)) as PropertyImageCategory[];
  
  const categoriesMap: Record<string, string> = {
    todas: 'Todas as Imagens',
    principais: 'Principais',
    sala: 'Sala',
    quartos: 'Quartos',
    casas_de_banho: 'Casas de Banho',
    cozinha: 'Cozinha',
    exterior: 'Exterior',
    plantas: 'Plantas',
    arredores: 'Arredores'
  };

  const displayedImages = activeCategory === 'todas' ? publicImages : publicImages.filter(img => (img.category || 'principais') === activeCategory);

  const getOptimizedUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('data:')) return url;
    return `https://wsrv.nl/?url=${encodeURIComponent(url)}&output=webp&w=800&q=80`;
  };

  const optimizedImages = publicImages.reduce((acc, img) => {
    acc[img.url] = getOptimizedUrl(img.url);
    return acc;
  }, {} as Record<string, string>);

  const isOptimizingImages = false;


  if (loading) {
    return <div className="p-24 text-center">A carregar informações...</div>;
  }

  if (!property) {
    return <div className="p-24 text-center">Propriedade não encontrada.</div>;
  }

  const ITEMS_PER_PAGE = 6;
  const totalPages = Math.ceil(displayedImages.length / ITEMS_PER_PAGE);
  const paginatedImages = displayedImages.slice(galleryPage * ITEMS_PER_PAGE, (galleryPage + 1) * ITEMS_PER_PAGE);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(language === 'pt' ? 'pt-PT' : 'en-US', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <>
    {lightboxIndex !== null && displayedImages[lightboxIndex] && (
      <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4">
        <button 
          onClick={() => setLightboxIndex(null)}
          className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-50 backdrop-blur-sm"
        >
          <X className="w-8 h-8" />
        </button>
        
        {displayedImages.length > 1 && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex(prev => prev !== null ? (prev > 0 ? prev - 1 : displayedImages.length - 1) : null);
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full z-50 backdrop-blur-sm transition-colors"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
        )}

        {displayedImages.length > 1 && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex(prev => prev !== null ? (prev < displayedImages.length - 1 ? prev + 1 : 0) : null);
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full z-50 backdrop-blur-sm transition-colors"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        )}

        <img 
          src={optimizedImages[displayedImages[lightboxIndex].url] || displayedImages[lightboxIndex].url}
          alt="Property lightbox"
          className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl z-40"
        />

        <div className="absolute bottom-6 inset-x-0 flex flex-col items-center justify-center pointer-events-none z-50">
           {(displayedImages[lightboxIndex].description || (displayedImages[lightboxIndex].tags && displayedImages[lightboxIndex].tags!.length > 0)) && (
             <div className="bg-black/60 backdrop-blur-md px-6 py-4 rounded-xl border border-white/10 shadow-2xl max-w-2xl text-center mb-4 pointer-events-auto">
               {displayedImages[lightboxIndex].description && <p className="text-white text-lg font-medium">{displayedImages[lightboxIndex].description}</p>}
             </div>
           )}
           <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10 text-white font-medium shadow-lg pointer-events-auto">
              {lightboxIndex + 1} / {displayedImages.length}
           </div>
        </div>
      </div>
    )}
    <div className="w-full bg-white pb-24">
      {/* Full Bleed Hero Gallery */}
      <div className="w-full relative bg-gray-900 group h-[60vh] md:h-[80vh] flex flex-col justify-between overflow-hidden">
        
        {/* Top bar layer with status badge, back btn & tabs */}
        <div className="absolute top-0 inset-x-0 z-30 p-4 pt-6 flex flex-col items-center pointer-events-none">
          <div className="w-full flex justify-between items-start pointer-events-auto">
             <Link to="/" className="inline-flex items-center text-sm font-medium text-white/80 hover:text-white bg-black/40 px-4 py-2 rounded-lg backdrop-blur-md transition-colors shadow-lg">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('nav.home')}
             </Link>
             
             {property.status && (
               <span className="bg-brand-blue shadow-lg text-white text-sm font-bold px-4 py-2 uppercase tracking-wider backdrop-blur-sm rounded-lg">
                 {t(`status.${property.status}`)}
               </span>
             )}
          </div>
          
          {orderedCategories.length > 0 && (
             <div className="mt-4 bg-black/60 shadow-lg backdrop-blur-md p-1.5 rounded-full flex gap-1 pointer-events-auto overflow-x-auto max-w-full scrollbar-none border border-white/10">
                <button
                   onClick={() => setActiveCategory('todas')}
                   className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${activeCategory === 'todas' ? 'bg-white text-black' : 'text-white hover:bg-white/20'}`}
                >
                   Todas as Imagens
                </button>
                {orderedCategories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${activeCategory === cat ? 'bg-white text-black' : 'text-white hover:bg-white/20'}`}
                  >
                    {categoriesMap[cat]}
                  </button>
                ))}
             </div>
          )}
        </div>

        {/* Gallery container - 3x2 Grid */}
        <div className="flex-1 w-full pt-28 pb-12 px-4 md:px-8 lg:px-12 bg-black/95 relative flex flex-col justify-center overflow-hidden">
          {displayedImages.length === 0 ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
               <ImageIcon className="w-12 h-12 opacity-50 mb-2" />
               <span>Sem imagens correspondentes nesta categoria</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 grid-rows-2 auto-rows-fr gap-4 w-full h-[60vh] md:h-[70vh] lg:h-[75vh]">
              {paginatedImages.map((img, idx) => {
                 const absoluteIdx = galleryPage * ITEMS_PER_PAGE + idx;
                 const optimizedUrl = optimizedImages[img.url] || img.url;
                 return (
                   <div 
                     key={absoluteIdx} 
                     onClick={() => setLightboxIndex(absoluteIdx)}
                     className="relative rounded-lg overflow-hidden border border-white/5 shadow-2xl group cursor-pointer bg-black/40 w-full h-full"
                   >
                      {isOptimizingImages && !optimizedImages[img.url] ? (
                         <div className="absolute inset-0 flex items-center justify-center bg-transparent gap-2 text-white"><ImageIcon className="w-8 h-8 opacity-20 animate-pulse" /></div>
                      ) : null}
                      <img 
                        src={optimizedUrl}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        alt={`${property.title[language]} - ${absoluteIdx + 1}`} 
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                         <Maximize2 className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-lg" />
                      </div>
                      {(img.description || (img.tags && img.tags.length > 0)) && (
                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4 pt-12">
                           {img.description && <p className="text-white text-sm font-medium mb-1 truncate">{img.description}</p>}
                        </div>
                      )}
                   </div>
                 );
              })}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <>
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  setGalleryPage(prev => (prev > 0 ? prev - 1 : totalPages - 1));
                }}
                className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/80 text-white rounded-full z-20 backdrop-blur-md transition-all border border-white/10 shadow-xl"
              >
                <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
              </button>
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  setGalleryPage(prev => (prev < totalPages - 1 ? prev + 1 : 0));
                }}
                className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/80 text-white rounded-full z-20 backdrop-blur-md transition-all border border-white/10 shadow-xl"
              >
                <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
              </button>
            </>
          )}
        </div>
        
        {/* Bottom gallery context */}
        <div className="absolute bottom-4 right-6 z-20 flex gap-2">
           <div className="bg-black/50 backdrop-blur-md text-white text-sm font-medium px-4 py-2 rounded-lg border border-white/10 shadow-lg">
             Página {galleryPage + 1} de {totalPages || 1}
           </div>
           <div className="bg-black/50 backdrop-blur-md text-white text-sm font-medium px-4 py-2 rounded-lg border border-white/10 shadow-lg hidden sm:block">
             {displayedImages.length} {displayedImages.length === 1 ? 'Fotografia' : 'Fotografias'}
           </div>
        </div>
      </div>

      {/* Property Header Details (Price & Title below banner) */}
      <div className="max-w-7xl mx-auto px-4 pt-10 pb-8 border-b border-gray-100">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8">
          <div className="flex-1">
            <div className="flex flex-wrap gap-2 mb-4">
              {property.reference && (
                <span className="bg-gray-100 text-gray-600 border border-gray-200 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  REF: {property.reference}
                </span>
              )}
              {property.tags.map((tag, idx) => (
                <span key={idx} className="bg-brand-blue/10 text-brand-blue text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  {tag[language]}
                </span>
              ))}
            </div>
            <h1 className="text-3xl md:text-5xl font-serif font-black text-gray-900 mb-4 leading-tight">
              {property.title[language]}
            </h1>
            <div className="flex items-center text-gray-500 text-lg">
              <MapPin className="w-6 h-6 mr-2 text-brand-red" />
              {property.location}
            </div>
          </div>
          <div className="text-left lg:text-right flex flex-col lg:items-end shrink-0">
            <div>
              {property.oldPrice && (
                <p className="text-xl text-gray-400 line-through decoration-brand-red/50 decoration-2 mb-1">
                  {formatPrice(property.oldPrice)}
                </p>
              )}
              <p className="text-4xl md:text-5xl font-black text-brand-blue mb-6">
                {formatPrice(property.price)}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="flex items-center justify-center border-2 border-gray-200 bg-white text-gray-700 font-bold px-6 py-3 rounded-lg transition-all shadow-sm hover:border-brand-blue hover:text-brand-blue relative"
                title={language === 'pt' ? 'Partilhar' : 'Share'}
              >
                <Share2 className="w-5 h-5 mr-3" />
                {language === 'pt' ? 'Partilhar' : 'Share'}

                {showShareMenu && (
                  <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 shadow-xl rounded-xl p-3 z-50 flex gap-2 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                    <a 
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} 
                      target="_blank" rel="noopener noreferrer"
                      className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all transform hover:scale-105"
                    >
                      <Facebook className="w-6 h-6" />
                    </a>
                    <a 
                      href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(property.title[language])}`} 
                      target="_blank" rel="noopener noreferrer"
                      className="w-12 h-12 flex items-center justify-center rounded-full bg-sky-50 text-sky-500 hover:bg-sky-500 hover:text-white transition-all transform hover:scale-105"
                    >
                      <Twitter className="w-6 h-6" />
                    </a>
                    <a 
                      href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`} 
                      target="_blank" rel="noopener noreferrer"
                      className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-100 text-blue-800 hover:bg-blue-800 hover:text-white transition-all transform hover:scale-105"
                    >
                      <Linkedin className="w-6 h-6" />
                    </a>
                  </div>
                )}
              </button>
              
              <button
                onClick={(e) => {
                  e.preventDefault();
                  if (property) toggleCompare(property.id);
                }}
                className={`flex items-center justify-center border-2 font-bold px-8 py-3 rounded-lg transition-all shadow-sm
                  ${property && isCompared(property.id)
                    ? 'border-brand-blue bg-brand-blue text-white hover:bg-brand-blue/90' 
                    : 'border-gray-200 bg-white text-gray-700 hover:border-brand-blue hover:text-brand-blue'}`}
                title={language === 'pt' ? 'Comparar' : 'Compare'}
              >
                <Scale className="w-5 h-5 mr-3" />
                {language === 'pt' ? 'Comparar' : 'Compare'}
              </button>
              <a 
                href="#contact-form"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className="inline-flex bg-brand-red hover:bg-red-700 text-white font-bold px-8 py-3 rounded-lg transition-all shadow-md items-center shadow-brand-red/20"
              >
                {t('property.contact') || 'Contactar Consultor'}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        
        {/* Left Column (2/3 width): Details, Description, Location */}
        <div className="lg:col-span-2 space-y-16">
          
          <section>
            <h2 className="text-3xl font-serif font-bold mb-8 text-gray-900 border-b border-gray-100 pb-4">Sobre a propriedade</h2>
            <div className="prose prose-lg max-w-none prose-p:text-gray-600 prose-p:leading-loose">
              <p className="whitespace-pre-wrap">{property.description[language]}</p>
            </div>
          </section>

          {(property.condition || property.constructionDate) && (
            <section className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
              <h2 className="text-xl font-serif font-bold mb-6 text-gray-900">Detalhes do Imóvel</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-12">
                {property.condition && (
                  <div className="flex flex-col border-b border-gray-200/60 pb-3 last:border-0">
                    <span className="text-gray-500 text-sm mb-1">Condição</span>
                    <span className="text-gray-900 font-semibold">{property.condition}</span>
                  </div>
                )}
                {property.constructionDate && (
                  <div className="flex flex-col border-b border-gray-200/60 pb-3 last:border-0">
                    <span className="text-gray-500 text-sm mb-1">Ano de Construção</span>
                    <span className="text-gray-900 font-semibold">{property.constructionDate}</span>
                  </div>
                )}
              </div>
            </section>
          )}
          
          <section>
            <h2 className="text-3xl font-serif font-bold mb-8 text-gray-900 border-b border-gray-100 pb-4">{t('property.features')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
              {publicFeatures.map(feature => (
                <div key={feature.id} className="flex items-start text-gray-700 bg-gray-50 p-4 rounded-2xl">
                  <Check className="w-6 h-6 text-green-500 mr-4 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-gray-900">{feature.name[language]}</div>
                    <div className="text-gray-500 mt-1">{feature.value}</div>
                  </div>
                </div>
              ))}
              {publicFeatures.length === 0 && (
                 <p className="text-gray-500 italic">Sem características específicas registadas.</p>
              )}
            </div>
          </section>

          {/* Map display */}
          {property.gpsCoordinates && (
            <section>
              <h2 className="text-3xl font-serif font-bold mb-8 text-gray-900 border-b border-gray-100 pb-4">Localização</h2>
              <div className="rounded-3xl overflow-hidden shadow-md border border-gray-200 relative aspect-video bg-gray-100 z-10">
                {(() => {
                  const parts = property.gpsCoordinates.split(',');
                  if (parts.length >= 2) {
                    const lat = parseFloat(parts[0]);
                    const lng = parseFloat(parts[1]);
                    if (!isNaN(lat) && !isNaN(lng)) {
                      return (
                        <MapContainer center={[lat, lng]} zoom={property.approximateLocation ? 13 : 15} style={{ height: '100%', width: '100%' }}>
                          <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                          />
                          {property.approximateLocation ? (
                            <Circle center={[lat, lng]} radius={2000} pathOptions={{ color: '#2563eb', fillColor: '#3b82f6', fillOpacity: 0.2 }} />
                          ) : (
                            <Marker position={[lat, lng]} />
                          )}
                        </MapContainer>
                      );
                    }
                  }
                  return <div className="p-4 text-center text-gray-500">Coordenadas inválidas.</div>;
                })()}
              </div>
            </section>
          )}

        </div>

        {/* Right Column (1/3 width): Sticky Lead Capture Form */}
        <div className="lg:col-span-1">
          <div id="contact-form" className="bg-white border top-28 border-gray-200 rounded-3xl p-8 shadow-2xl shadow-brand-blue/5 sticky">
            <h3 className="font-serif text-2xl font-bold text-gray-900 mb-2">Gostou deste imóvel?</h3>
            <p className="text-sm text-gray-500 mb-8">Deixe o seu contacto e agende já uma visita.</p>
            
            <form className="space-y-5" onSubmit={async e => {
              e.preventDefault();
              setTouched({ name: true, email: true, phone: true });
              
              if (!isFormValid) return;

              setIsSubmitting(true);
              try {
                const { collection, addDoc } = await import('firebase/firestore');
                const { db } = await import('../lib/firebase');
                await addDoc(collection(db, 'leads'), {
                  propertyId: property.id,
                  name: formData.name,
                  email: formData.email,
                  phone: formData.phone,
                  message: formData.message,
                  createdAt: Date.now()
                });
                setSubmitSuccess(true);
                setFormData({ name: '', email: '', phone: '', message: '' });
                setTouched({ name: false, email: false, phone: false });
              } catch (error) {
                console.error(error);
                alert('Erro ao guardar pedido.');
              } finally {
                setIsSubmitting(false);
              }
            }}>
              {submitSuccess && (
                <div className="bg-green-50 text-green-800 border border-green-200 p-5 rounded-2xl flex items-start text-sm mb-6 shadow-sm">
                  <Check className="w-6 h-6 mr-3 flex-shrink-0 text-green-600" />
                  <span className="font-medium">Obrigado! O seu pedido foi registado com sucesso. Entraremos em contacto muito em breve.</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nome Completo *</label>
                <div className="relative">
                  <input 
                    name="name" 
                    type="text" 
                    value={formData.name}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={`w-full bg-gray-50/50 border rounded-xl px-4 py-3.5 focus:outline-none focus:ring-4 focus:ring-brand-blue/10 transition-all ${errors.name ? 'border-red-400 focus:border-red-500 bg-red-50/50' : touched.name ? 'border-green-400 focus:border-green-500' : 'border-gray-300 focus:border-brand-blue hover:border-gray-400'}`} 
                    placeholder="Ex: João Silva" 
                  />
                  {errors.name && <AlertCircle className="w-5 h-5 text-red-500 absolute right-4 top-3.5" />}
                  {touched.name && !errors.name && <Check className="w-5 h-5 text-green-500 absolute right-4 top-3.5" />}
                </div>
                {errors.name && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.name}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                <div className="relative">
                  <input 
                    name="email" 
                    type="email" 
                    value={formData.email}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={`w-full bg-gray-50/50 border rounded-xl px-4 py-3.5 focus:outline-none focus:ring-4 focus:ring-brand-blue/10 transition-all ${errors.email ? 'border-red-400 focus:border-red-500 bg-red-50/50' : touched.email ? 'border-green-400 focus:border-green-500' : 'border-gray-300 focus:border-brand-blue hover:border-gray-400'}`} 
                    placeholder="joao@exemplo.com" 
                  />
                  {errors.email && <AlertCircle className="w-5 h-5 text-red-500 absolute right-4 top-3.5" />}
                  {touched.email && !errors.email && <Check className="w-5 h-5 text-green-500 absolute right-4 top-3.5" />}
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Telefone *</label>
                <div className="relative">
                  <input 
                    name="phone" 
                    type="tel" 
                    value={formData.phone}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={`w-full bg-gray-50/50 border rounded-xl px-4 py-3.5 focus:outline-none focus:ring-4 focus:ring-brand-blue/10 transition-all ${errors.phone ? 'border-red-400 focus:border-red-500 bg-red-50/50' : touched.phone ? 'border-green-400 focus:border-green-500' : 'border-gray-300 focus:border-brand-blue hover:border-gray-400'}`} 
                    placeholder="+351 910 000 000" 
                  />
                  {errors.phone && <AlertCircle className="w-5 h-5 text-red-500 absolute right-4 top-3.5" />}
                  {touched.phone && !errors.phone && <Check className="w-5 h-5 text-green-500 absolute right-4 top-3.5" />}
                </div>
                {errors.phone && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Mensagem (Opcional)</label>
                <textarea 
                  name="message" 
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={4} 
                  className="w-full bg-gray-50/50 border border-gray-300 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue transition-all resize-none hover:border-gray-400" 
                  placeholder="Gostaria de obter mais informações..." 
                />
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting || (touched.name && touched.email && touched.phone && !isFormValid)}
                className="w-full bg-brand-red hover:bg-red-700 disabled:bg-brand-red/50 text-white font-bold py-4 rounded-xl transition-all shadow-md hover:shadow-lg mt-4 shadow-brand-red/20"
              >
                {isSubmitting ? 'A submeter...' : 'Agendar Visita / Pedir Contacto'}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
    </>
  );
}
