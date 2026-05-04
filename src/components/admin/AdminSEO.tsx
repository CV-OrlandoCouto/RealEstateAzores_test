import React, { useState, useEffect } from 'react';
import { Save, Loader2, Search } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { handleFirestoreError, OperationType } from '../../lib/useProperties';

export default function AdminSEO() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [titlePt, setTitlePt] = useState('');
  const [descriptionPt, setDescriptionPt] = useState('');
  const [keywordsPt, setKeywordsPt] = useState('');
  
  const [titleEn, setTitleEn] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [keywordsEn, setKeywordsEn] = useState('');

  useEffect(() => {
    let isMounted = true;
    const fetchSEO = async () => {
      try {
        const docRef = doc(db, 'settings', 'seo');
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists() && isMounted) {
          const data = docSnap.data();
          setTitlePt(data.titlePt || '');
          setDescriptionPt(data.descriptionPt || '');
          setKeywordsPt(data.keywordsPt || '');
          setTitleEn(data.titleEn || '');
          setDescriptionEn(data.descriptionEn || '');
          setKeywordsEn(data.keywordsEn || '');
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'settings/seo');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    fetchSEO();
    return () => { isMounted = false; };
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'seo'), {
        titlePt,
        descriptionPt,
        keywordsPt,
        titleEn,
        descriptionEn,
        keywordsEn,
        updatedAt: Date.now()
      });
      alert('Configurações de SEO guardadas com sucesso!');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'settings/seo');
      alert('Erro ao guardar configurações. Verifique as permissões.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Loader2 className="w-8 h-8 text-brand-blue animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-gray-900">SEO & Otimização de Pesquisa</h2>
          <p className="text-gray-500 text-sm mt-1">
            Conteúdo otimizado para motores de busca. Melhore o ranking nos resultados da pesquisa.
          </p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-brand-blue text-white px-4 py-2 rounded-lg font-medium hover:bg-brand-blue/90 transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          Guardar Alterações
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Português */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 mb-6 pb-2 border-b border-gray-100">
            <span className="w-6 h-4 block bg-green-600 rounded-sm overflow-hidden relative">
              <span className="absolute inset-0 bg-red-600 w-1/3"></span>
            </span>
            <h3 className="font-semibold text-gray-900">Configurações Base - Português</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Título do Site</label>
              <input
                type="text"
                value={titlePt}
                onChange={(e) => setTitlePt(e.target.value)}
                placeholder="Ex: Real Estate Azores | Imóveis de Luxo"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-blue outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">Primeira coisa que os utilizadores vêem no Google.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição Meta</label>
              <textarea
                value={descriptionPt}
                onChange={(e) => setDescriptionPt(e.target.value)}
                rows={3}
                placeholder="Ex: Encontre as melhores propriedades..."
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-blue outline-none resize-none"
              />
              <p className={`text-xs mt-1 ${descriptionPt.length > 160 ? 'text-red-500' : 'text-gray-500'}`}>
                {descriptionPt.length}/160 caracteres (ideal entre 150-160)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Palavras-chave</label>
              <textarea
                value={keywordsPt}
                onChange={(e) => setKeywordsPt(e.target.value)}
                rows={2}
                placeholder="Ex: imobiliaria açores, moradia luxo..."
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-blue outline-none resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">Separe por vírgulas.</p>
            </div>
          </div>
        </div>

        {/* English */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 mb-6 pb-2 border-b border-gray-100">
            <span className="w-6 h-4 block bg-blue-800 rounded-sm overflow-hidden relative">
               <span className="absolute inset-0 flex items-center justify-center text-white text-[8px] font-bold">EN</span>
            </span>
            <h3 className="font-semibold text-gray-900">Configurações Base - English</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Site Title</label>
              <input
                type="text"
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                placeholder="Ex: Real Estate Azores | Luxury Properties"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-blue outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
              <textarea
                value={descriptionEn}
                onChange={(e) => setDescriptionEn(e.target.value)}
                rows={3}
                placeholder="Ex: Find the best properties..."
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-blue outline-none resize-none"
              />
               <p className={`text-xs mt-1 ${descriptionEn.length > 160 ? 'text-red-500' : 'text-gray-500'}`}>
                {descriptionEn.length}/160 characters (ideal 150-160)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Keywords</label>
              <textarea
                value={keywordsEn}
                onChange={(e) => setKeywordsEn(e.target.value)}
                rows={2}
                placeholder="Ex: azores real estate, buy house..."
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-blue outline-none resize-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* SEO Preview Box */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mt-8">
        <div className="flex items-center gap-2 mb-4">
          <Search className="w-5 h-5 text-gray-400" />
          <h3 className="font-semibold text-gray-900">Pré-visualização no Google (PT)</h3>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-800 flex items-center gap-2 mb-1">
            <span className="w-6 h-6 bg-gray-200 rounded-full inline-block"></span>
            https://www.realestateazores.com
          </p>
          <p className="text-xl text-blue-800 hover:underline cursor-pointer mb-1 truncate">
            {titlePt || "Real Estate Azores | Imóveis de Luxo"}
          </p>
          <p className="text-sm text-gray-600 line-clamp-2">
            {descriptionPt || "Encontre as melhores propriedades e moradias de luxo na Ilha de São Miguel, Açores. Ajudamos a encontrar a casa dos seus sonhos."}
          </p>
        </div>
      </div>
    </div>
  );
}
