import React, { useState } from 'react';
import { useBlog } from '../../lib/useBlog';
import { Plus, Trash2, Edit2, Loader2, Save, X, Image as ImageIcon, Eye, EyeOff } from 'lucide-react';
import { collection, addDoc, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { handleFirestoreError, OperationType } from '../../lib/useProperties';
import { BlogPost } from '../../types';

export default function AdminBlog() {
  const { posts, loading } = useBlog();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form state
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [content, setContent] = useState('');
  const [date, setDate] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setTitle('');
    setAuthor('');
    setImageUrl('');
    setContent('');
    setDate('');
    setIsPublished(true);
    setIsAdding(false);
    setEditingId(null);
  };

  const handleEdit = (post: BlogPost) => {
    setTitle(post.title);
    setAuthor(post.author);
    setImageUrl(post.imageUrl);
    setContent(post.content);
    setDate(post.date);
    setIsPublished(post.isPublished);
    setEditingId(post.id);
    setIsAdding(true);
  };

  const handleSave = async () => {
    if (!title || !content || !author || !date) {
      alert("O título, autor, data e texto são obrigatórios.");
      return;
    }

    setSaving(true);
    try {
      const postData = {
        title,
        author,
        imageUrl,
        content,
        date,
        isPublished,
      };

      if (editingId) {
        await updateDoc(doc(db, 'blogPosts', editingId), postData);
      } else {
        await addDoc(collection(db, 'blogPosts'), {
          ...postData,
          createdAt: Date.now()
        });
      }
      resetForm();
    } catch (error) {
      handleFirestoreError(error, editingId ? OperationType.UPDATE : OperationType.CREATE, 'blogPosts');
      alert("Ocorreu um erro ao guardar. Verifique as permissões do Firestore.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem a certeza que deseja eliminar este artigo?")) {
      try {
        await deleteDoc(doc(db, 'blogPosts', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `blogPosts/${id}`);
        alert("Ocorreu um erro ao eliminar.");
      }
    }
  };

  const togglePublish = async (post: BlogPost) => {
    try {
      await updateDoc(doc(db, 'blogPosts', post.id), {
        isPublished: !post.isPublished
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `blogPosts/${post.id}`);
      alert("Ocorreu um erro ao atualizar o estado.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
        <h2 className="text-2xl font-serif font-bold text-gray-900">Blog Açores</h2>
        {!isAdding && (
          <button 
            onClick={() => {
              const today = new Date().toISOString().split('T')[0];
              setDate(today);
              setIsAdding(true);
            }}
            className="flex items-center gap-2 bg-brand-blue text-white px-4 py-2 rounded-lg font-medium hover:bg-brand-blue/90 transition-colors"
          >
            <Plus className="w-5 h-5" /> Novo Artigo
          </button>
        )}
      </div>

      {isAdding && (
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8 max-w-4xl animate-in fade-in slide-in-from-top-4">
          <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
            <h3 className="text-lg font-semibold text-gray-900">{editingId ? 'Editar Artigo' : 'Novo Artigo'}</h3>
            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Título do artigo"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-blue outline-none"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Autor *</label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Nome do autor"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-blue outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data *</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-blue outline-none"
                />
              </div>
            </div>

            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">URL da Imagem</label>
               <input
                 type="text"
                 value={imageUrl}
                 onChange={(e) => setImageUrl(e.target.value)}
                 placeholder="Cole um link de imagem..."
                 className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-blue outline-none mb-2"
               />
               {imageUrl && (
                 <div className="mt-2 text-sm text-gray-500">
                   <p className="mb-2">Pré-visualização:</p>
                   <img src={imageUrl} alt="Pré-visualização" className="h-32 object-contain border border-gray-200 rounded-lg" />
                 </div>
               )}
            </div>

            <div className="flex items-center gap-2 py-2">
              <input
                type="checkbox"
                id="isPublished"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="w-4 h-4 text-brand-blue rounded border-gray-300 focus:ring-brand-blue"
              />
              <label htmlFor="isPublished" className="text-sm text-gray-700 font-medium">Publicar Artigo (Mostrar no site)</label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Texto / Conteúdo Livre *</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Escreva o conteúdo do artigo..."
                rows={12}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 resize-y focus:ring-2 focus:ring-brand-blue outline-none font-sans"
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
        ) : posts.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-500 bg-gray-50 rounded-xl border border-gray-100">
            Ainda não há artigos no blog.
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className={`bg-white border ${post.isPublished ? 'border-gray-200' : 'border-dashed border-gray-300'} rounded-xl overflow-hidden shadow-sm flex flex-col`}>
              <div className="h-48 bg-gray-100 flex items-center justify-center relative">
                {post.imageUrl ? (
                  <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                )}
                {!post.isPublished && (
                   <div className="absolute top-2 left-2 bg-gray-800 text-white text-xs font-bold px-2 py-1 rounded">Rascunho</div>
                )}
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{post.title}</h3>
                <div className="text-xs text-gray-500 mb-4">
                  {post.author} • {post.date}
                </div>
                <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                  <button 
                    onClick={() => togglePublish(post)} 
                    className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors ${post.isPublished ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    {post.isPublished ? (
                      <><Eye className="w-3.5 h-3.5" /> Público</>
                    ) : (
                      <><EyeOff className="w-3.5 h-3.5" /> Oculto</>
                    )}
                  </button>
                  <div className="flex gap-1">
                    <button onClick={() => handleEdit(post)} className="p-1.5 text-gray-400 hover:text-brand-blue transition-colors rounded-lg hover:bg-gray-100" title="Editar">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(post.id)} className="p-1.5 text-gray-400 hover:text-brand-red transition-colors rounded-lg hover:bg-gray-100" title="Eliminar">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
