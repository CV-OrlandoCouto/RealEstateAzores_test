import React, { useState } from 'react';
import { useLeads, Lead } from '../../lib/useLeads';
import { Mail, Phone, Calendar, Search, CheckCircle, Trash2, Home, UserPlus, X } from 'lucide-react';
import { useProperties } from '../../lib/useProperties';

export default function AdminMensagens({ onCriarLead }: { onCriarLead?: (info: {name: string, email: string, phone: string, source: string}) => void }) {
  const { leads, loading, updateLead, deleteLead } = useLeads();
  const { properties } = useProperties(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<Lead | null>(null);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">A carregar mensagens...</div>;
  }

  const filteredLeads = leads.filter(lead => 
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (lead.phone && lead.phone.includes(searchTerm))
  );

  const handleToggleRead = (id: string, currentRead: boolean) => {
    updateLead(id, { read: !currentRead });
  };

  const getPropertyName = (propertyId?: string) => {
    if (!propertyId) return 'Formulário Geral';
    const prop = properties.find(p => p.id === propertyId);
    return prop ? `${prop.reference || 'S/Ref'} - ${prop.titlePt}` : 'Imóvel Eliminado';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2 border-b border-gray-100 pb-4">
        <h2 className="text-2xl font-serif font-bold text-gray-900">Mensagens</h2>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 pt-2 mb-6">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar por nome, email ou telefone..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue sm:text-sm"
          />
        </div>
      </div>

      <div className="bg-white border text-sm border-gray-200 rounded-xl flex flex-col divide-y divide-gray-100 shadow-sm overflow-hidden">
        {filteredLeads.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Nenhuma mensagem encontrada.
          </div>
        ) : (
          filteredLeads.map(lead => (
            <div key={lead.id} className={`p-5 transition-colors ${lead.read ? 'bg-white' : 'bg-blue-50/50'}`}>
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex-grow">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 
                      className={`font-medium text-lg cursor-pointer hover:text-brand-blue transition-colors ${lead.read ? 'text-gray-900' : 'text-gray-900 font-bold'}`}
                      onClick={() => setSelectedMessage(lead)}
                    >
                      {lead.name}
                    </h3>
                    {!lead.read && (
                      <span className="bg-brand-blue text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                        Nova
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                    <span className="flex items-center gap-1"><Mail className="w-4 h-4" /> {lead.email}</span>
                    {lead.phone && <span className="flex items-center gap-1"><Phone className="w-4 h-4" /> {lead.phone}</span>}
                    <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {new Date(lead.createdAt).toLocaleString('pt-PT')}</span>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-gray-700 whitespace-pre-wrap">
                    {lead.message || "Sem mensagem"}
                  </div>

                  <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 inline-flex px-2 py-1 rounded-md border border-gray-100">
                    <Home className="w-3 h-3 text-brand-blue" />
                    Origem: <span className="font-medium text-gray-700">{getPropertyName(lead.propertyId)}</span>
                  </div>
                </div>

                <div className="flex md:flex-col items-center justify-end gap-2 shrink-0">
                  <button 
                    onClick={() => handleToggleRead(lead.id, !!lead.read)}
                    className={`flex items-center justify-center w-full md:w-auto gap-2 px-4 py-2 rounded-lg font-medium transition-colors border ${lead.read ? 'border-gray-300 text-gray-600 hover:bg-gray-50' : 'border-brand-blue text-brand-blue bg-blue-50/50 hover:bg-blue-50'}`}
                  >
                    <CheckCircle className="w-4 h-4" />
                    {lead.read ? 'Marcar como Não Lida' : 'Marcar como Lida'}
                  </button>
                  {onCriarLead && (
                    <button 
                      onClick={() => onCriarLead({
                        name: lead.name,
                        email: lead.email,
                        phone: lead.phone || '',
                        source: lead.propertyId ? getPropertyName(lead.propertyId) : 'Website - Formulário Geral'
                      })}
                      className="flex items-center justify-center w-full md:w-auto gap-2 px-4 py-2 rounded-lg font-medium text-brand-blue border border-brand-blue hover:bg-blue-50 transition-colors"
                    >
                      <UserPlus className="w-4 h-4" />
                      Criar Lead
                    </button>
                  )}
                  <button 
                    onClick={() => {
                      if (window.confirm('Tem a certeza que deseja eliminar esta mensagem?')) {
                        deleteLead(lead.id);
                      }
                    }}
                    className="flex items-center justify-center w-full md:w-auto gap-2 px-4 py-2 rounded-lg font-medium text-red-600 border border-red-200 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedMessage && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-xl font-serif font-bold text-gray-900">Mensagem de {selectedMessage.name}</h3>
              <button onClick={() => setSelectedMessage(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Nome</label>
                  <p className="text-gray-900 font-medium">{selectedMessage.name}</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Data / Hora</label>
                  <p className="text-gray-900">{new Date(selectedMessage.createdAt).toLocaleString('pt-PT')}</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Email</label>
                  <a href={`mailto:${selectedMessage.email}`} className="text-brand-blue hover:underline">{selectedMessage.email}</a>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Telefone</label>
                  <a href={`tel:${selectedMessage.phone}`} className="text-brand-blue hover:underline">{selectedMessage.phone || 'Não fornecido'}</a>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-100">
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Origem</label>
                <p className="text-gray-900 bg-gray-50 inline-block px-3 py-1.5 rounded-lg border border-gray-200">
                  {getPropertyName(selectedMessage.propertyId)}
                </p>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-3">Conteúdo da Mensagem</label>
                <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {selectedMessage.message || "Sem mensagem"}
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-100 flex items-center justify-end gap-3 bg-gray-50 sticky bottom-0">
               {onCriarLead && (
                  <button 
                    onClick={() => {
                      onCriarLead({
                        name: selectedMessage.name,
                        email: selectedMessage.email,
                        phone: selectedMessage.phone || '',
                        source: selectedMessage.propertyId ? getPropertyName(selectedMessage.propertyId) : 'Website - Formulário Geral'
                      });
                      setSelectedMessage(null);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-blue text-white rounded-lg font-medium hover:bg-brand-blue/90 transition-colors"
                  >
                    <UserPlus className="w-4 h-4" />
                    Criar Lead
                  </button>
               )}
              <button 
                onClick={() => setSelectedMessage(null)}
                className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
