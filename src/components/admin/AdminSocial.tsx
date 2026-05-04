import React, { useState, useEffect } from 'react';
import { Save, Loader2, Facebook, Instagram, Linkedin, Share2 } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { handleFirestoreError, OperationType } from '../../lib/useProperties';

export default function AdminSocial() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [facebookUrl, setFacebookUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');

  useEffect(() => {
    let isMounted = true;
    const fetchSocial = async () => {
      try {
        const docRef = doc(db, 'settings', 'social');
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists() && isMounted) {
          const data = docSnap.data();
          setFacebookUrl(data.facebookUrl || '');
          setInstagramUrl(data.instagramUrl || '');
          setLinkedinUrl(data.linkedinUrl || '');
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'settings/social');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    fetchSocial();
    return () => { isMounted = false; };
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'social'), {
        facebookUrl,
        instagramUrl,
        linkedinUrl,
        updatedAt: Date.now()
      });
      alert('Configurações de Redes Sociais guardadas com sucesso!');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'settings/social');
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
          <h2 className="text-2xl font-serif font-bold text-gray-900">Redes Sociais</h2>
          <p className="text-gray-500 text-sm mt-1">
            Configure os links para as suas redes sociais.
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

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm max-w-2xl">
        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
           <Share2 className="w-5 h-5 text-gray-400" />
           <h3 className="font-semibold text-gray-900">Links de Integração</h3>
        </div>

        <div className="space-y-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Facebook className="w-4 h-4 text-blue-600" /> Facebook
            </label>
            <input
              type="text"
              value={facebookUrl}
              onChange={(e) => setFacebookUrl(e.target.value)}
              placeholder="https://facebook.com/suapagina"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-blue outline-none"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Instagram className="w-4 h-4 text-pink-600" /> Instagram
            </label>
            <input
              type="text"
              value={instagramUrl}
              onChange={(e) => setInstagramUrl(e.target.value)}
              placeholder="https://instagram.com/seu.perfil"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-blue outline-none"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Linkedin className="w-4 h-4 text-blue-800" /> LinkedIn
            </label>
            <input
              type="text"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              placeholder="https://linkedin.com/company/sua-empresa"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-blue outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
