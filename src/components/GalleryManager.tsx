import React, { useState, useRef } from 'react';
import { PropertyImage, PropertyImageCategory } from '../types';
import { Eye, EyeOff, GripVertical, Trash2, Import, Loader2, Check, Upload, Wand2, Image as ImageIcon } from 'lucide-react';

const LazyAdminImage = ({ src, className, alt }: { src: string, className: string, alt: string }) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
        </div>
      )}
      <img 
        src={src} 
        alt={alt} 
        loading="lazy"
        onLoad={() => setLoaded(true)}
        className={`${className} transition-opacity duration-300 ${!loaded ? 'opacity-0' : ''}`} 
      />
    </>
  );
};

interface GalleryManagerProps {
  images: PropertyImage[];
  onChange: (images: PropertyImage[]) => void;
}

export default function GalleryManager({ images, onChange }: GalleryManagerProps) {
  const [importUrl, setImportUrl] = useState('');
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError] = useState('');
  const [importedUrls, setImportedUrls] = useState<string[]>([]);
  const [selectedUrlsToImport, setSelectedUrlsToImport] = useState<Set<string>>(new Set());
  
  // Drag and drop state
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  const [activeAdminTab, setActiveAdminTab] = useState<PropertyImageCategory | 'todas'>('todas');
  
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
  const categoryKeys = Object.keys(categoriesMap) as Array<PropertyImageCategory | 'todas'>;

  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const optimizeAllImages = async () => {
    setIsOptimizing(true);
    const optimized = await Promise.all(images.map(async (img) => {
      return new Promise<PropertyImage>((resolve) => {
        const image = new Image();
        image.crossOrigin = 'anonymous'; // For external urls
        image.onload = () => {
          const canvas = document.createElement('canvas');
          let width = image.width;
          let height = image.height;
          const max = 800; // Resize to max 800px width/height

          if (width > height) {
            if (width > max) {
              height = Math.round((height * max) / width);
              width = max;
            }
          } else {
            if (height > max) {
              width = Math.round((width * max) / height);
              height = max;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(image, 0, 0, width, height);

          // Compress as WebP at 60% quality
          const dataUrl = canvas.toDataURL('image/webp', 0.6);
          resolve({ ...img, url: dataUrl });
        };
        image.onerror = () => {
          resolve(img); // if fails (CORS), keep original
        }
        image.src = img.url;
      });
    }));
    onChange(optimized);
    setIsOptimizing(false);
  };

  const urlToBase64 = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
       if (url.startsWith('data:')) {
         resolve(url);
         return;
       }
       const img = new Image();
       img.crossOrigin = 'anonymous';
       img.onload = () => {
         const canvas = document.createElement('canvas');
         canvas.width = img.width;
         canvas.height = img.height;
         const ctx = canvas.getContext('2d');
         ctx?.drawImage(img, 0, 0);
         resolve(canvas.toDataURL('image/jpeg', 0.8));
       };
       img.onerror = () => reject(new Error('Failed to convert image'));
       img.src = url;
    });
  }

  const analyzeImages = async () => {
    setIsAnalyzing(true);
    try {
      const { GoogleGenAI, Type } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const newImages = [...images];
      
      for (let i = 0; i < newImages.length; i++) {
         const img = newImages[i];
         try {
            const dataUrl = await urlToBase64(img.url);
            const matches = dataUrl.match(/^data:(image\/[a-zA-Z]*);base64,([^"]*)$/);
            if (!matches) continue;
            
            const mimeType = matches[1];
            const base64Data = matches[2];

            const response = await ai.models.generateContent({
              model: "gemini-3-flash-preview",
              contents: [
                {
                   inlineData: { mimeType: mimeType, data: base64Data }
                },
                "Analyze this real estate property image. Provide a short description (max 10 words, in Portuguese) and a few relevant tags (in Portuguese)."
              ],
              config: {
                responseMimeType: "application/json",
                responseSchema: {
                  type: Type.OBJECT,
                  properties: {
                    description: { type: Type.STRING },
                    tags: { type: Type.ARRAY, items: { type: Type.STRING } }
                  },
                  required: ["description", "tags"]
                }
              }
            });

            if (response.text) {
               const parsed = JSON.parse(response.text);
               newImages[i] = {
                  ...img,
                  description: parsed.description,
                  tags: parsed.tags
               };
            }
         } catch (err) {
            console.error("Error analyzing image", i, err);
         }
      }
      
      onChange(newImages);
    } catch(err) {
      console.error("AI Analysis failed", err);
      alert("Ocorreu um erro ao analisar as imagens. Verifique se a sua chave de API do Gemini está configurada.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remainingSlots = 30 - images.length;
    const filesToProcess = Array.from(files as Iterable<File>).slice(0, remainingSlots);

    if (files.length > remainingSlots) {
       alert(`O limite total é 30 imagens. Apenas as primeiras ${remainingSlots} fotografias foram carregadas.`);
    }

    const resizeImage = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            const max = 800; // Resize to max 800px width/height to save space

            if (width > height) {
              if (width > max) {
                height = Math.round((height * max) / width);
                width = max;
              }
            } else {
              if (height > max) {
                width = Math.round((width * max) / height);
                height = max;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);

            // Compress as WebP at 40% quality to strictly avoid 1MB Firestore document limits.
            const dataUrl = canvas.toDataURL('image/webp', 0.4);
            resolve(dataUrl);
          };
          img.onerror = () => reject(new Error('Failed to load image.'));
          img.src = event.target?.result as string;
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
      });
    };

    const resizers = filesToProcess.map(file => resizeImage(file));

    Promise.all(resizers).then(results => {
       const newImages: PropertyImage[] = results.map((url, i) => ({
         url,
         isPublic: true,
         isCover: images.length === 0 && i === 0,
         category: activeAdminTab !== 'todas' ? activeAdminTab : 'principais',
       }));
       onChange([...images, ...newImages]);
    }).catch(error => {
       console.error("Erro ao carregar imagens:", error);
       alert("Ocorreu um erro ao processar as fotografias.");
    });
    
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const extractImagesFromHtml = (html: string): string[] => {
    // Regex to find Google Photos or common image URLs
    // Google Photos often uses lh3.googleusercontent.com
    const urls: Set<string> = new Set();
    
    // Find all urls starting with https://lh3.googleusercontent.com or similar
    const lh3Regex = /https:\/\/[a-zA-Z0-9.\-]*\.googleusercontent\.com\/[a-zA-Z0-9_\-\/]+/g;
    let match;
    while ((match = lh3Regex.exec(html)) !== null) {
      // Avoid tiny icons
      if (!match[0].includes('w10-h10') && !match[0].includes('w50-h50')) {
        let finalUrl = match[0];
        // Usually, the raw URL lacks size parameters, or it has them differently structured.
        // Google photos direct links without params give low resolution or error, so adding =w1200 helps.
        if (!finalUrl.includes('=')) {
          finalUrl += '=w1200';
        }
        urls.add(finalUrl);
      }
    }

    // Fallback: look for other .jpg/.png links
    const imgRegex = /https?:\/\/[^"'\s<>]+?\.(?:jpg|jpeg|png|webp)/gi;
    while ((match = imgRegex.exec(html)) !== null) {
      urls.add(match[0]);
    }
    
    return Array.from(urls);
  };

  const handleImport = async () => {
    if (!importUrl) return;
    setImportLoading(true);
    setImportError('');
    setImportedUrls([]);
    setSelectedUrlsToImport(new Set());

    try {
      // If the user pastes a raw list of URLs instead of a webpage
      if (importUrl.includes('.jpg') || importUrl.includes('.png') || importUrl.split('\n').length > 1) {
         const lines = importUrl.split(/[\n, ]+/).filter(l => l.startsWith('http'));
         if (lines.length > 0) {
            setImportedUrls(lines);
            setImportLoading(false);
            return;
         }
      }

      // Try via generic CORS proxy
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(importUrl)}`;
      const req = await fetch(proxyUrl);
      const res = await req.json();
      
      if (res.contents) {
        const extracted = extractImagesFromHtml(res.contents);
        if (extracted.length > 0) {
          setImportedUrls(extracted);
        } else {
          setImportError('Nenhuma imagem encontrada. Tente colar os links diretos das imagens.');
        }
      } else {
        setImportError('Erro ao aceder ao link. Tente colar os links diretos.');
      }
    } catch (e) {
      setImportError('Erro de ligação. Tente colar os links diretos das imagens.');
    } finally {
      setImportLoading(false);
    }
  };

  const toggleSelectImport = (url: string) => {
    const next = new Set(selectedUrlsToImport);
    if (next.has(url)) {
      next.delete(url);
    } else {
      const remainingSlots = 30 - images.length;
      if (next.size < remainingSlots) {
        next.add(url);
      } else {
        alert(`O limite total é 30 imagens. Pode adicionar mais ${remainingSlots} fotografias.`);
      }
    }
    setSelectedUrlsToImport(next);
  };

  const confirmImport = () => {
    const importedArray = Array.from(selectedUrlsToImport);
    const newImages: PropertyImage[] = importedArray.map((url: string) => ({
      url,
      isPublic: true,
      isCover: images.length === 0 && importedArray[0] === url,
      category: activeAdminTab !== 'todas' ? activeAdminTab : 'principais'
    }));
    onChange([...images, ...newImages]);
    setImportedUrls([]); // close importer
    setImportUrl('');
    setSelectedUrlsToImport(new Set());
  };

  const cancelImport = () => {
    setImportedUrls([]);
    setImportUrl('');
    setSelectedUrlsToImport(new Set());
  };

  const removeImage = (idx: number) => {
    const newImgs = [...images];
    const removed = newImgs.splice(idx, 1)[0];
    if (removed.isCover && newImgs.length > 0) {
      newImgs[0].isCover = true;
    }
    onChange(newImgs);
  };

  const toggleVisibility = (idx: number) => {
    const newImgs = [...images];
    newImgs[idx].isPublic = !newImgs[idx].isPublic;
    onChange(newImgs);
  };

  const setCover = (idx: number) => {
    const newImgs = images.map((img, i) => ({ ...img, isCover: i === idx }));
    onChange(newImgs);
  };

  const setCategory = (idx: number, category: PropertyImageCategory) => {
    const newImgs = [...images];
    newImgs[idx].category = category;
    onChange(newImgs);
  };

  // HTML5 Drag and Drop
  const handleDragStart = (e: React.DragEvent, idx: number) => {
    setDraggedIdx(idx);
    e.dataTransfer.effectAllowed = 'move';
    // Small delay to prevent the dragged element from immediately snapping
    e.dataTransfer.setData('text/html', e.currentTarget as any);
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === idx) return;

    const newImgs = [...images];
    const [movedImg] = newImgs.splice(draggedIdx, 1);
    newImgs.splice(idx, 0, movedImg);
    
    onChange(newImgs);
    setDraggedIdx(null);
  };

  const handleDragEnd = () => {
    setDraggedIdx(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-gray-100 mb-6">
        {categoryKeys.map(cat => (
          <button
            key={cat}
            onClick={(e) => { e.preventDefault(); setActiveAdminTab(cat); }}
            className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${activeAdminTab === cat ? 'bg-brand-blue text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {categoriesMap[cat]}
          </button>
        ))}
      </div>

      {/* Upload Section */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
         <div className="flex justify-between items-center mb-4">
           <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
             <Upload className="w-4 h-4 text-brand-blue" />
             Carregar do Computador
           </h4>
           <div className="flex gap-2">
             <button
                onClick={optimizeAllImages}
                disabled={isOptimizing || images.length === 0}
                className="bg-blue-100 text-blue-700 hover:bg-blue-200 font-medium px-3 py-1.5 rounded-lg text-xs flex items-center justify-center gap-1 transition-colors disabled:opacity-50"
              >
                {isOptimizing ? <Loader2 className="w-3 h-3 animate-spin" /> : <ImageIcon className="w-3 h-3" />}
                Otimizar Imagens
              </button>
              <button
                onClick={analyzeImages}
                disabled={isAnalyzing || images.length === 0}
                className="bg-purple-100 text-purple-700 hover:bg-purple-200 font-medium px-3 py-1.5 rounded-lg text-xs flex items-center justify-center gap-1 transition-colors disabled:opacity-50"
              >
                {isAnalyzing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                Analisar com IA
              </button>
           </div>
         </div>
         <div className="flex items-center gap-2">
           <input 
             type="file"
             multiple
             accept="image/*"
             ref={fileInputRef}
             onChange={handleFileUpload}
             className="hidden"
           />
           <button
             onClick={() => fileInputRef.current?.click()}
             className="bg-white border border-gray-300 hover:border-brand-blue hover:text-brand-blue text-gray-700 font-medium px-4 py-2 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors flex-grow"
           >
             <Upload className="w-4 h-4" />
             Selecionar ficheiros... (Máx. 30)
           </button>
         </div>
      </div>

      {/* Importer Section */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Import className="w-4 h-4 text-brand-blue" />
          Importar Galeria (Ex: Google Fotos)
        </h4>
        <div className="flex gap-2">
          <input
            type="text"
            value={importUrl}
            onChange={e => setImportUrl(e.target.value)}
            placeholder="Cole o link do álbum ou os links diretos das imagens..."
            className="flex-grow bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm outline-none focus:border-brand-blue"
          />
          <button 
            onClick={handleImport}
            disabled={!importUrl || importLoading}
            className="bg-brand-blue hover:bg-brand-blue/90 text-white font-medium px-4 py-2 rounded-lg text-sm disabled:opacity-50 flex items-center gap-2"
          >
            {importLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Procurar'}
          </button>
        </div>
        {importError && <p className="text-red-500 text-xs mt-2">{importError}</p>}
      </div>

      {/* Imported Images Selection Area */}
      {importedUrls.length > 0 && (
        <div className="bg-white border-2 border-brand-blue/30 rounded-xl p-4 animate-in fade-in slide-in-from-top-4">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold text-gray-900">
              Passo 2: Selecione as imagens ({selectedUrlsToImport.size} selecionadas)
            </h4>
            <div className="flex gap-2">
               <button onClick={cancelImport} className="px-4 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg">
                 Cancelar
               </button>
               <button onClick={confirmImport} className="px-4 py-1.5 text-sm font-medium bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center gap-1">
                 <Check className="w-4 h-4" /> Adicionar à Ficha
               </button>
            </div>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-96 overflow-y-auto p-1">
            {importedUrls.map((url, i) => {
              const isSelected = selectedUrlsToImport.has(url);
              return (
                <div 
                  key={i} 
                  onClick={() => toggleSelectImport(url)}
                  className={`aspect-square relative rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${isSelected ? 'border-brand-blue scale-95 opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <LazyAdminImage src={url} alt={`Import ${i}`} className="w-full h-full object-cover" />
                  {isSelected && (
                    <div className="absolute top-1 right-1 bg-brand-blue text-white rounded-full p-1 shadow-md">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Current Images List (Sortable) */}
      <div>
        <div className="flex justify-between items-end mb-4">
          <p className="text-sm text-gray-500">
            Arraste para reordenar. A primeira imagem é aconselhada a ser a capa.
          </p>
        </div>
        
        {images.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 text-sm">
            Nenhuma imagem na galeria.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {images.map((img, idx) => {
              if (activeAdminTab !== 'todas' && (img.category || 'principais') !== activeAdminTab) return null;
              return (
              <div 
                key={`${img.url}-${idx}`} 
                draggable
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDrop={(e) => handleDrop(e, idx)}
                onDragEnd={handleDragEnd}
                className={`flex flex-col bg-white rounded-xl border-2 transition-all group ${img.isCover ? 'border-brand-gold shadow-md' : 'border-gray-200'} ${draggedIdx === idx ? 'opacity-50 scale-95' : ''}`}
              >
                {/* Top Controls */}
                <div className="flex items-center justify-between p-2 bg-gray-50 border-b border-gray-100 rounded-t-xl transition-colors">
                  <div className="cursor-move text-gray-400 hover:text-brand-blue p-1 transition-colors">
                    <GripVertical className="w-4 h-4" />
                  </div>
                  <div className="flex items-center gap-2">
                    <select 
                      value={img.category || 'principais'} 
                      onChange={(e) => setCategory(idx, e.target.value as PropertyImageCategory)}
                      className="bg-white border border-gray-200 text-gray-700 rounded text-[10px] outline-none cursor-pointer py-1 px-1.5 w-24"
                    >
                      <option value="principais">Principais</option>
                      <option value="sala">Sala</option>
                      <option value="quartos">Quartos</option>
                      <option value="casas_de_banho">C. Banho</option>
                      <option value="cozinha">Cozinha</option>
                      <option value="exterior">Exterior</option>
                      <option value="plantas">Plantas</option>
                      <option value="arredores">Arredores</option>
                    </select>
                    <button onClick={() => removeImage(idx)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded p-1 transition-colors" title="Remover imagem">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="aspect-square bg-gray-100 relative">
                  <LazyAdminImage src={img.url} className={`w-full h-full object-cover select-none pointer-events-none ${!img.isPublic ? 'grayscale opacity-50' : ''}`} alt={`Img ${idx}`} />
                  
                  {/* Cover Badge Persistent */}
                  {img.isCover && (
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-brand-gold text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm pointer-events-none z-10 transition-opacity opacity-90">
                      CAPA
                    </div>
                  )}
                </div>

                {/* Bottom Controls */}
                <div className="p-2 bg-gray-50 border-t border-gray-100 rounded-b-xl flex flex-col gap-2 flex-grow">
                  <div className="flex justify-between items-center gap-1">
                    <button 
                      onClick={() => toggleVisibility(idx)}
                      className={`flex items-center gap-1.5 text-[10px] px-2 py-1 rounded transition-colors border ${img.isPublic ? 'bg-white border-gray-200 text-gray-700 hover:bg-gray-100' : 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'}`}
                      title={img.isPublic ? "Tornar Privada" : "Tornar Pública"}
                    >
                      {img.isPublic ? <><Eye className="w-3 h-3" /> Pública</> : <><EyeOff className="w-3 h-3" /> Privada</>}
                    </button>
                    <button 
                      onClick={() => setCover(idx)}
                      className={`text-[10px] font-bold px-2 py-1 rounded transition-colors border ${img.isCover ? 'bg-brand-gold border-brand-gold text-white' : 'bg-white border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-white'}`}
                    >
                      {img.isCover ? 'CAPA' : 'TORNAR CAPA'}
                    </button>
                  </div>

                  {(img.description || (img.tags && img.tags.length > 0)) && (
                    <div className="flex flex-col gap-1 mt-1">
                      {img.description && <p className="text-[10px] text-gray-600 line-clamp-2 leading-snug" title={img.description}>{img.description}</p>}
                      {img.tags && (
                        <div className="flex gap-1 flex-wrap">
                          {img.tags.slice(0, 3).map(t => (
                            <span key={t} className="bg-brand-blue/10 text-brand-blue px-1.5 py-0.5 rounded-full text-[9px] font-medium leading-none">{t}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )})}
          </div>
        )}
      </div>

    </div>
  );
}
