import React, { useState } from 'react';
import { useTestimonials } from '../../lib/useTestimonials';
import { Plus, Trash2, Edit2, Loader2, Save, X, Image as ImageIcon } from 'lucide-react';
import { collection, addDoc, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { handleFirestoreError, OperationType } from '../../lib/useProperties';
import { Testimonial } from '../../types';

export default function AdminTestimonials() {
  const { testimonials, loading } = useTestimonials();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setName('');
    setTitle('');
    setText('');
    setImageUrl('');
    setIsAdding(false);
    setEditingId(null);
  };

  const handleEdit = (testimonial: Testimonial) => {
    setName(testimonial.name);
    setTitle(testimonial.title);
    setText(testimonial.text);
    setImageUrl(testimonial.imageUrl);
    setEditingId(testimonial.id);
    setIsAdding(true);
  };

  const handleSave = async () => {
    if (!name || !text) {
      alert("O nome e o testemunho são obrigatórios.");
      return;
    }

    setSaving(true);
    try {
      const testimonialData = {
        name,
        title,
        text,
        imageUrl,
      };

      if (editingId) {
        await updateDoc(doc(db, 'testimonials', editingId), testimonialData);
      } else {
        await addDoc(collection(db, 'testimonials'), {
          ...testimonialData,
          createdAt: Date.now()
        });
      }
      resetForm();
    } catch (error) {
      handleFirestoreError(error, editingId ? OperationType.UPDATE : OperationType.CREATE, 'testimonials');
      alert("Ocorreu um erro ao guardar. Verifique as permissões do Firestore.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem a certeza que deseja eliminar este testemunho?")) {
      try {
        await deleteDoc(doc(db, 'testimonials', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `testimonials/${id}`);
        alert("Ocorreu um erro ao eliminar.");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
        <h2 className="text-2xl font-serif font-bold text-gray-900">Gestão de Testemunhos</h2>
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-brand-blue text-white px-4 py-2 rounded-lg font-medium hover:bg-brand-blue/90 transition-colors"
          >
            <Plus className="w-5 h-5" /> Adicionar Testemunho
          </button>
        )}
      </div>

      {isAdding && (
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8 max-w-2xl animate-in fade-in slide-in-from-top-4">
          <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
            <h3 className="text-lg font-semibold text-gray-900">{editingId ? 'Editar Testemunho' : 'Novo Testemunho'}</h3>
            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: João Silva"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cargo ou Origem</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Cliente comprador / Canadá"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none"
              />
            </div>

            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">URL da Fotografia</label>
               <input
                 type="text"
                 value={imageUrl}
                 onChange={(e) => setImageUrl(e.target.value)}
                 placeholder="Cole um link ou URL de base64..."
                 className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none mb-2"
               />
               {imageUrl && (
                 <div className="mt-2 text-sm text-gray-500 flex items-center gap-4">
                   <span>Pré-visualização:</span>
                   <img src={imageUrl} alt="Pré-visualização" className="w-12 h-12 rounded-full object-cover border border-gray-200" />
                 </div>
               )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Testemunho *</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Escreva o testemunho aqui..."
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 resize-none focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button 
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-brand-blue/90 transition-colors flex items-center gap-2 font-medium disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 flex justify-center">
            <Loader2 className="w-8 h-8 text-brand-blue animate-spin" />
          </div>
        ) : testimonials.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-500 bg-gray-50 rounded-xl border border-gray-100">
            Ainda não há testemunhos.
          </div>
        ) : (
          testimonials.map((test) => (
            <div key={test.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    {test.imageUrl ? (
                      <img src={test.imageUrl} alt={test.name} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                       <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                         <ImageIcon className="w-6 h-6" />
                       </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900">{test.name}</h3>
                      {test.title && <p className="text-xs text-gray-500">{test.title}</p>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => handleEdit(test)} className="p-1.5 text-gray-400 hover:text-brand-blue transition-colors rounded-lg hover:bg-gray-100" title="Editar">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(test.id)} className="p-1.5 text-gray-400 hover:text-brand-red transition-colors rounded-lg hover:bg-gray-100" title="Eliminar">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-4 italic line-clamp-4">"{test.text}"</p>
              </div>
              <div className="text-[10px] text-gray-400">
                Adicionado a: {new Date(test.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
