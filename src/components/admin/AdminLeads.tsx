import React, { useState } from 'react';
import { Mail, Phone, Calendar, User, Search, Filter, MoreVertical, Plus, Users, Search as SearchIcon, CheckCircle, Settings, FileText, ChevronLeft, ExternalLink, MapPin, Briefcase, Upload } from 'lucide-react';
import { useCrmLeads, CrmLead } from '../../lib/useCrmLeads';

type CRMTap = 'contato' | 'procura' | 'qualificacao' | 'gestao' | 'documentos';
type Lead = { id: number | string; name: string; email: string; phone: string; source: string; status: string; date: string; rawData?: any };

export default function AdminLeads({ prefillInfo, clearPrefill }: { prefillInfo?: {name: string, email: string, phone: string, source: string} | null, clearPrefill?: () => void }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<CRMTap>('contato');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const { crmLeads, loading, addCrmLead, updateCrmLead, deleteCrmLead } = useCrmLeads();

  React.useEffect(() => {
    if (prefillInfo) {
      setSelectedLead({ 
        id: 'new', 
        name: prefillInfo.name, 
        email: prefillInfo.email, 
        phone: prefillInfo.phone, 
        source: prefillInfo.source, 
        status: 'Novo', 
        date: new Date().toISOString().split('T')[0],
        rawData: {}
      });
      setActiveTab('contato');
      if (clearPrefill) clearPrefill();
    }
  }, [prefillInfo, clearPrefill]);

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showExitPrompt, setShowExitPrompt] = useState(false);
  const [pendingExitAction, setPendingExitAction] = useState<(() => void) | null>(null);
  const formRef = React.useRef<HTMLFormElement>(null);

  React.useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const [saved, setSaved] = useState(false);

  const handleGlobalSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (formRef.current) {
      const formData = new FormData(formRef.current);
      const rawData: any = Object.fromEntries(formData.entries());
      Array.from(formRef.current.elements).forEach((el: any) => {
         if (el.name && (el.type === 'checkbox' || el.type === 'radio')) {
             rawData[el.name] = el.checked;
         }
      });
      const updatedName = (formData.get('field_input_19') as string) || (formData.get('name') as string) || selectedLead?.name || '';
      const updatedPhone = (formData.get('field_input_20') as string) || (formData.get('phone') as string) || selectedLead?.phone || '';
      const updatedEmail = (formData.get('field_input_21') as string) || (formData.get('email') as string) || selectedLead?.email || '';
      const updatedSource = selectedLead?.source || 'Manual';
      const updatedStatus = (formData.get('field_select_83') as string) || selectedLead?.status || 'Novo';

      if (selectedLead) {
        const newLead = { ...selectedLead, name: updatedName, phone: updatedPhone, email: updatedEmail, status: updatedStatus, source: updatedSource, rawData };
        if (selectedLead.id === 'new') {
          const newId = await addCrmLead({
            name: updatedName,
            email: updatedEmail,
            phone: updatedPhone,
            source: updatedSource,
            status: updatedStatus,
            date: new Date().toISOString().split('T')[0],
            ...rawData
          });
          if (newId) newLead.id = newId;
          setSelectedLead(newLead);
        } else {
          await updateCrmLead(selectedLead.id as string, {
            name: updatedName,
            email: updatedEmail,
            phone: updatedPhone,
            status: updatedStatus,
            source: updatedSource,
            ...rawData
          });
          setSelectedLead(newLead);
        }
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      setHasUnsavedChanges(false);
      if (pendingExitAction) {
        pendingExitAction();
        setPendingExitAction(null);
        setShowExitPrompt(false);
      }
    }
  };

  const handleExitAttempt = (action: () => void) => {
    if (hasUnsavedChanges) {
      setPendingExitAction(() => action);
      setShowExitPrompt(true);
    } else {
      action();
    }
  };

  React.useEffect(() => {
    if (selectedLead && formRef.current) {
      const data = selectedLead.rawData || {};
      Array.from(formRef.current.elements).forEach((el: any) => {
        if (el.name && data[el.name] !== undefined) {
          if (el.type === 'checkbox' || el.type === 'radio') {
            el.checked = data[el.name] === 'on' || data[el.name] === true;
          } else {
            el.value = data[el.name];
          }
        }
      });
    }
  }, [selectedLead?.id, activeTab]);

  const handleSaveContact = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const updatedName = (formData.get('name') as string) || selectedLead?.name || '';
    const updatedPhone = (formData.get('phone') as string) || selectedLead?.phone || '';
    const updatedEmail = (formData.get('email') as string) || selectedLead?.email || '';
    
    if (selectedLead) {
      const newLead = { ...selectedLead, name: updatedName, phone: updatedPhone, email: updatedEmail };
      if (selectedLead.id === 'new') {
        const id = Date.now();
        newLead.id = id;
        setLeadsList([newLead, ...leadsList]);
        setSelectedLead(newLead);
      } else {
        setLeadsList(leadsList.map(l => l.id === selectedLead.id ? newLead : l));
        setSelectedLead(newLead);
      }
      alert('Alterações guardadas com sucesso!');
    }
  };

  const handleSavePreferences = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedLead?.id === 'new') {
       alert('Por favor guarde os dados na aba "Contato" primeiro!');
       setActiveTab('contato');
       return;
    }
    alert('Preferências guardadas com sucesso!');
  };

  const handleAddLead = () => {
    setSelectedLead({ id: 'new', name: 'Nova Lead', email: '', phone: '', source: '', status: 'Novo', date: new Date().toISOString().split('T')[0] });
    setActiveTab('contato');
  };

  const handleSelectLead = (lead: Lead) => {
    setSelectedLead(lead);
    setActiveTab('contato');
  };

  if (loading) {
    return <div className="flex items-center justify-center p-12 text-gray-400">A carregar leads...</div>;
  }

  if (selectedLead) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 border-b border-gray-200 pb-4">
          <button 
            type="button"
            onClick={() => handleExitAttempt(() => setSelectedLead(null))}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-serif font-bold text-gray-900">
              {selectedLead.id === 'new' ? 'Nova Lead' : selectedLead.name}
            </h2>
            <p className="text-sm text-gray-500">{selectedLead.id === 'new' ? 'Adicionar nova oportunidade' : 'Gestão de Lead'}</p>
          </div>
        </div>

        {/* Internal Tabs and Save Button */}
        <div className="flex border-b border-gray-200 justify-between items-end">
          <div className="flex overflow-x-auto gap-1 pb-px flex-grow">
            <button
              type="button"
              onClick={() => setActiveTab('contato')}
            className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'contato' ? 'border-brand-blue text-brand-blue' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Users className="w-4 h-4" />
            Contato
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('procura')}
            className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'procura' ? 'border-brand-blue text-brand-blue' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <SearchIcon className="w-4 h-4" />
            Procura
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('qualificacao')}
            className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'qualificacao' ? 'border-brand-blue text-brand-blue' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            Qualificação
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('gestao')}
            className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'gestao' ? 'border-brand-blue text-brand-blue' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Settings className="w-4 h-4" />
            Gestão
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('documentos')}
            className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'documentos' ? 'border-brand-blue text-brand-blue' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FileText className="w-4 h-4" />
            Documentos
          </button>
        </div>
          
          <button
            type="button"
            onClick={handleGlobalSave}
            className={`flex ml-4 px-6 gap-2 text-white rounded-t-xl font-medium text-sm flex-col items-center justify-center shrink-0 leading-tight border-b-0 pb-3 pt-3 transition-colors ${saved ? 'bg-green-600 hover:bg-green-700' : 'bg-brand-blue hover:bg-brand-blue/90'}`}
            style={{ width: '180px', height: '60px' }}
          >
             {saved ? (
               <div className="flex items-center gap-2">
                 <CheckCircle className="w-5 h-5 mb-0.5" />
                 <span>Guardado!</span>
               </div>
             ) : (
               <>
                 <span>Guardar</span>
                 <span>Alterações</span>
               </>
             )}
          </button>
        </div>

        <form ref={formRef} onChange={() => setHasUnsavedChanges(true)} onSubmit={handleGlobalSave}>
          <div className={activeTab === 'contato' ? 'block' : 'hidden'}>
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 uppercase mb-1 tracking-wider">Nome Completo <span className="text-red-500">*</span></label>
                  <input type="text" name="name" defaultValue={selectedLead.name === 'Nova Lead' ? '' : selectedLead.name} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 text-sm" required />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 uppercase mb-1 tracking-wider">Telefone</label>
                  <input type="text" name="phone" defaultValue={selectedLead.phone} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 text-sm" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 uppercase mb-1 tracking-wider">Email</label>
                  <input type="email" name="email" defaultValue={selectedLead.email} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 uppercase mb-1 tracking-wider">NIF</label>
                  <input name="field_input_1" type="text" defaultValue="" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 text-sm" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 uppercase mb-1 tracking-wider">Nacionalidade</label>
                  <input name="field_input_2" type="text" defaultValue="" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 uppercase mb-1 tracking-wider">Idioma Preferido</label>
                  <select name="field_select_3" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 bg-white text-sm">
                    <option value="pt">PT</option>
                    <option value="en">EN</option>
                    <option value="es">ES</option>
                    <option value="fr">FR</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 uppercase mb-1 tracking-wider">Contacto Preferido</label>
                  <select name="field_select_4" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 bg-white text-sm">
                    <option value="telefone">Telefone</option>
                    <option value="email">Email</option>
                    <option value="whatsapp">WhatsApp</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 uppercase mb-1 tracking-wider">Profissão</label>
                  <input name="field_input_5" type="text" defaultValue="" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 text-sm" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 uppercase mb-1 tracking-wider">Estado Civil</label>
                  <select name="field_select_6" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 bg-white text-sm">
                    <option value="solteiro">Solteiro(a)</option>
                    <option value="casado">Casado(a) / União de facto</option>
                    <option value="divorciado">Divorciado(a)</option>
                    <option value="viuvo">Viúvo(a)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 uppercase mb-1 tracking-wider">Nº de Dependentes</label>
                  <input name="field_input_7" type="number" defaultValue="" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 text-sm" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 uppercase mb-1 tracking-wider">Situação Atual</label>
                  <select name="field_select_8" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 bg-white text-sm">
                    <option value="sozinho">Sozinho</option>
                    <option value="com_familia">Com a família</option>
                    <option value="partilhado">Casa partilhada</option>
                  </select>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6">
                <h4 className="text-[11px] font-semibold text-gray-700 uppercase mb-3 tracking-wider">RGPD</h4>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input name="field_input_9" type="checkbox" defaultChecked className="w-4 h-4 text-brand-blue rounded border-gray-300 focus:ring-brand-blue" />
                    <span className="text-sm text-gray-700">Consentimento para tratamento de dados pessoais</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input name="field_input_10" type="checkbox" defaultChecked className="w-4 h-4 text-brand-blue rounded border-gray-300 focus:ring-brand-blue" />
                    <span className="text-sm text-gray-700">Aceita receber comunicações de marketing</span>
                  </label>
                </div>
                <p className="text-xs text-gray-400 mt-3">
                  Consentimento dado em {new Date().toLocaleDateString('pt-PT')}
                </p>
              </div>
              
                <div className="flex justify-end pt-4 border-t border-gray-100 md:hidden">
                  <button type="button" onClick={handleGlobalSave} className={`flex items-center gap-2 px-6 py-2 text-white text-sm font-medium rounded-lg transition-colors ${saved ? 'bg-green-600 hover:bg-green-700' : 'bg-brand-blue hover:bg-brand-blue/90'}`}>
                    {saved ? <CheckCircle className="w-4 h-4" /> : null}
                    {saved ? 'Guardado!' : 'Guardar Alterações'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className={activeTab === 'procura' ? 'block' : 'hidden'}>
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 uppercase mb-1 tracking-wider">Tipo de Transação</label>
                  <select name="field_select_11" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 bg-white text-sm">
                    <option value="comprar">Comprar</option>
                    <option value="arrendar">Arrendar</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 uppercase mb-1 tracking-wider">Estado Preferido</label>
                  <select name="field_select_12" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 bg-white text-sm">
                    <option value="novo">Novo</option>
                    <option value="bom_estado">Bom estado</option>
                    <option value="renovado">Renovado</option>
                    <option value="para_recuperar">Para recuperar</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 uppercase mb-1 tracking-wider">Tipos de Imóvel (Vírgula)</label>
                  <input name="field_input_13" type="text" placeholder="Apartamento" defaultValue="Apartamento" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 text-sm" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 uppercase mb-1 tracking-wider">Tipologias (Vírgula)</label>
                  <input name="field_input_14" type="text" placeholder="T2, T3" defaultValue="T2, T3" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 uppercase mb-1 tracking-wider">Quartos Mín.</label>
                  <input name="field_input_15" type="number" defaultValue={2} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 text-sm" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 uppercase mb-1 tracking-wider">Área Útil Mín. (m²)</label>
                  <input name="field_input_16" type="number" defaultValue={80} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 uppercase mb-1 tracking-wider">Localizações (Vírgula)</label>
                  <input name="field_input_17" type="text" placeholder="Ponta Delgada" defaultValue="Ponta Delgada" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 text-sm" />
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6">
                <h4 className="text-[11px] font-semibold text-gray-700 uppercase mb-4 tracking-wider">Características Essenciais</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6">
                  {['Elevador', 'Garagem', 'Estacionamento', 'Varanda', 'Terraço', 'Jardim', 'Piscina', 'Vista', 'AC', 'Lareira', 'Suite', 'Mobilado', 'Equipado', 'Acessível'].map((feature, i) => (
                    <label key={i} className="flex items-center gap-3 cursor-pointer">
                      <input name="field_input_18" type="checkbox" defaultChecked={['Elevador', 'Varanda'].includes(feature)} className="w-4 h-4 text-brand-blue rounded border-gray-300 focus:ring-brand-blue" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </label>
                  ))}
                </div>
                <div className="mt-4">
                  <input name="field_input_19" type="text" placeholder="Outros — escreve aqui características adicionais..." className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 text-sm text-gray-500 placeholder:text-gray-400" />
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 uppercase mb-1 tracking-wider">Orçamento Mín. (€)</label>
                  <input name="field_input_20" type="number" defaultValue={250000} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 text-sm" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 uppercase mb-1 tracking-wider">Orçamento Máx. (€)</label>
                  <input name="field_input_21" type="number" defaultValue={320000} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 text-sm" />
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6">
                <h4 className="text-[11px] font-semibold text-gray-700 uppercase mb-4 tracking-wider">Motivação e Timing</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 uppercase mb-1 tracking-wider">Razão da Compra/Arrendamento</label>
                    <select name="field_select_22" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 bg-white text-sm">
                      <option value="primeira_habitacao">Primeira habitação</option>
                      <option value="investimento">Investimento</option>
                      <option value="ferias">Casa de férias</option>
                      <option value="secundaria">Habitação secundária</option>
                      <option value="outra">Outra</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 uppercase mb-1 tracking-wider">Urgência</label>
                    <select name="field_select_23" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 bg-white text-sm">
                      <option value="alta">Alta</option>
                      <option value="media">Média</option>
                      <option value="baixa">Baixa</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 uppercase mb-1 tracking-wider">Prazo Previsto</label>
                    <input name="field_input_24" type="date" defaultValue="2026-08-01" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 text-sm" />
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6">
                <h4 className="text-[11px] font-semibold text-gray-700 uppercase mb-4 tracking-wider">Imóveis a Apresentar</h4>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5, 6].map((row) => (
                    <div key={row} className="flex flex-col lg:flex-row items-start gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="flex flex-row lg:flex-col gap-4 lg:gap-2 shrink-0 mt-6 lg:mt-0">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input name="field_input_25" type="checkbox" className="w-4 h-4 text-brand-blue rounded border-gray-300 focus:ring-brand-blue" />
                          <span className="text-sm font-medium text-gray-700">Gostou</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input name="field_input_26" type="checkbox" className="w-4 h-4 text-brand-blue rounded border-gray-300 focus:ring-brand-blue" />
                          <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Visita Agendada</span>
                        </label>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 w-full">
                        <div className="col-span-12 md:col-span-3">
                          <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Link do Imóvel</label>
                          <div className="flex gap-2">
                            <input name="field_input_27" type="url" placeholder="https://" className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 text-sm" />
                            <button 
                              type="button" 
                              onClick={(e) => {
                                const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                                if (input?.value) window.open(input.value, '_blank', 'noopener,noreferrer');
                              }}
                              className="p-1.5 border border-gray-300 rounded bg-white text-gray-600 hover:bg-gray-100 transition-colors shrink-0"
                              title="Abrir link numa nova aba"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="col-span-12 md:col-span-6">
                          <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Nome do Imóvel</label>
                          <input name="field_input_28" type="text" maxLength={100} className="w-full px-3 py-1.5 border border-gray-300 rounded bg-white focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 text-sm" />
                        </div>
                        <div className="col-span-12 md:col-span-3">
                          <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Preço</label>
                          <div className="relative">
                            <input name="field_input_29" type="number" step="0.01" className="w-full pl-3 pr-7 py-1.5 border border-gray-300 rounded bg-white focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 text-sm" />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500 text-sm">
                              €
                            </div>
                          </div>
                        </div>
                        <div className="col-span-12 md:col-span-4">
                          <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Comercial</label>
                          <input name="field_input_30" type="text" className="w-full px-3 py-1.5 border border-gray-300 rounded bg-white focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 text-sm" />
                        </div>
                        <div className="col-span-12 md:col-span-4">
                          <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Contato Comercial</label>
                          <input name="field_input_31" type="text" className="w-full px-3 py-1.5 border border-gray-300 rounded bg-white focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 text-sm" />
                        </div>
                        <div className="col-span-12 md:col-span-4">
                          <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Data da Visita</label>
                          <input name="field_input_32" type="date" className="w-full px-3 py-1.5 border border-gray-300 rounded bg-white focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 text-sm" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6">
                <h4 className="text-[11px] font-semibold text-gray-700 uppercase mb-4 tracking-wider">Imóveis Visitados</h4>
                <div className="space-y-4">
                  {[1, 2, 3].map((row) => (
                    <div key={row} className="flex flex-col gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 w-full">
                        <div className="col-span-12 md:col-span-4">
                          <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Link do Imóvel</label>
                          <div className="flex gap-2">
                            <input name="field_input_33" type="url" placeholder="https://" className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 text-sm" />
                            <button 
                              type="button" 
                              onClick={(e) => {
                                const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                                if (input?.value) window.open(input.value, '_blank', 'noopener,noreferrer');
                              }}
                              className="p-1.5 border border-gray-300 rounded bg-white text-gray-600 hover:bg-gray-100 transition-colors shrink-0"
                              title="Abrir link numa nova aba"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="col-span-12 md:col-span-8">
                          <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Nome do Imóvel</label>
                          <input name="field_input_34" type="text" className="w-full px-3 py-1.5 border border-gray-300 rounded bg-white focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 text-sm" />
                        </div>
                        <div className="col-span-12 md:col-span-4">
                          <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Preço Proposto pelo Comprador</label>
                          <div className="relative">
                            <input name="field_input_35" type="number" step="0.01" className="w-full pl-3 pr-7 py-1.5 border border-gray-300 rounded bg-white focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 text-sm" />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500 text-sm">
                              €
                            </div>
                          </div>
                        </div>
                        <div className="col-span-12 md:col-span-4">
                          <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Data da Visita</label>
                          <input name="field_input_36" type="date" className="w-full px-3 py-1.5 border border-gray-300 rounded bg-white focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 text-sm" />
                        </div>
                        <div className="col-span-12">
                          <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Observações Comprador</label>
                          <textarea name="field_textarea_37" rows={2} maxLength={300} placeholder="Até 300 caracteres..." className="w-full px-3 py-1.5 border border-gray-300 rounded bg-white focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 text-sm resize-none"></textarea>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
                <div className="flex justify-end pt-4 border-t border-gray-100 md:hidden">
                  <button type="button" onClick={handleGlobalSave} className={`flex items-center gap-2 px-6 py-2 text-white text-sm font-medium rounded-lg transition-colors ${saved ? 'bg-green-600 hover:bg-green-700' : 'bg-brand-blue hover:bg-brand-blue/90'}`}>
                    {saved ? <CheckCircle className="w-4 h-4" /> : null}
                    {saved ? 'Guardado!' : 'Guardar Preferências'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className={activeTab === 'qualificacao' ? 'block' : 'hidden'}>
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="space-y-8">
              
              {/* FINANCIAMENTO */}
              <div>
                <h4 className="text-[11px] font-semibold text-gray-700 uppercase mb-4 tracking-wider flex items-center gap-2">Financiamento</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Tipo de Financiamento</label>
                    <select name="field_select_38" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 bg-white text-sm">
                      <option value="misto">Misto</option>
                      <option value="proprio">Pronto Pagamento</option>
                      <option value="bancario">Crédito Habitação</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Banco (Se Aplicável)</label>
                    <input name="field_input_39" type="text" defaultValue="Millennium BCP" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 text-sm" />
                  </div>
                </div>
                <div className="flex gap-6 mt-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input name="field_input_40" type="checkbox" defaultChecked className="w-4 h-4 text-brand-blue rounded border-gray-300 focus:ring-brand-blue" />
                    <span className="text-sm font-medium text-gray-700">Tem pré-aprovação bancária</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input name="field_input_41" type="checkbox" className="w-4 h-4 text-brand-blue rounded border-gray-300 focus:ring-brand-blue" />
                    <span className="text-sm font-medium text-gray-700">Tem imóvel para vender</span>
                  </label>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-8 mt-8">
                 <h4 className="text-[11px] font-semibold text-gray-700 uppercase mb-4 tracking-wider">Dados Pessoais</h4>
                 
                 <div className="bg-emerald-50 rounded-lg p-3 mb-6">
                   <div className="flex items-center gap-3">
                     <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">1</div>
                     <span className="text-sm font-semibold text-gray-800">1º TITULAR</span>
                   </div>
                 </div>

                 <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Nome Completo</label>
                      <input name="field_input_42" type="text" placeholder="Nome completo conforme documento de identificação" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 text-sm" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">NIF</label>
                        <input name="field_input_43" type="text" placeholder="9 dígitos" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 text-sm" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">CC / BI / PASSAPORTE</label>
                        <input name="field_input_44" type="text" placeholder="Nº do documento" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 text-sm" />
                      </div>
                    </div>

                    <div>
                      <h5 className="flex items-center gap-2 text-xs font-semibold text-gray-700 mb-4 mt-6">
                        <MapPin className="w-4 h-4" /> Morada
                      </h5>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Rua</label>
                          <input name="field_input_45" type="text" placeholder="Rua, nº, andar, porta" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 text-sm" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Localidade</label>
                            <input name="field_input_46" type="text" placeholder="Cidade" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 text-sm" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Código Postal</label>
                            <input name="field_input_47" type="text" placeholder="0000-000" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 text-sm" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">País</label>
                          <input name="field_input_48" type="text" placeholder="Portugal" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 text-sm" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h5 className="flex items-center gap-2 text-xs font-semibold text-gray-700 mb-4 mt-6">
                        <FileText className="w-4 h-4" /> Documentos
                      </h5>
                      <div className="space-y-3">
                        <div className="flex flex-col md:flex-row md:items-center gap-3">
                          <span className="text-sm text-gray-600 md:w-1/3">Cartão de Cidadão / BI / Passaporte</span>
                          <div className="flex flex-1 gap-2">
                            <input name="field_input_49" type="url" placeholder="Colar link (Drive, Dropbox...)" className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 text-sm" />
                            <label className="flex items-center justify-center p-1.5 border border-gray-300 rounded bg-white text-gray-600 hover:bg-gray-100 transition-colors shrink-0 cursor-pointer" title="Fazer upload">
                              <Upload className="w-4 h-4" />
                              <input name="field_input_50" type="file" className="hidden" />
                            </label>
                          </div>
                          <label className="flex items-center gap-2 cursor-pointer border border-gray-300 rounded px-3 py-1.5 shrink-0 bg-white">
                            <input name="field_input_51" type="checkbox" className="w-4 h-4 text-brand-blue rounded border-gray-300 focus:ring-brand-blue" />
                            <span className="text-sm text-gray-700">Recebido</span>
                          </label>
                        </div>
                        <div className="flex flex-col md:flex-row md:items-center gap-3">
                          <span className="text-sm text-gray-600 md:w-1/3">Declaração de IRS</span>
                          <div className="flex flex-1 gap-2">
                            <input name="field_input_52" type="url" placeholder="Colar link (Drive, Dropbox...)" className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 text-sm" />
                            <label className="flex items-center justify-center p-1.5 border border-gray-300 rounded bg-white text-gray-600 hover:bg-gray-100 transition-colors shrink-0 cursor-pointer" title="Fazer upload">
                              <Upload className="w-4 h-4" />
                              <input name="field_input_53" type="file" className="hidden" />
                            </label>
                          </div>
                          <label className="flex items-center gap-2 cursor-pointer border border-gray-300 rounded px-3 py-1.5 shrink-0 bg-white">
                            <input name="field_input_54" type="checkbox" className="w-4 h-4 text-brand-blue rounded border-gray-300 focus:ring-brand-blue" />
                            <span className="text-sm text-gray-700">Recebido</span>
                          </label>
                        </div>
                        <div className="flex flex-col md:flex-row md:items-center gap-3">
                          <span className="text-sm text-gray-600 md:w-1/3">Recibos de Vencimento</span>
                          <div className="flex flex-1 gap-2">
                            <input name="field_input_55" type="url" placeholder="Colar link (Drive, Dropbox...)" className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 text-sm" />
                            <label className="flex items-center justify-center p-1.5 border border-gray-300 rounded bg-white text-gray-600 hover:bg-gray-100 transition-colors shrink-0 cursor-pointer" title="Fazer upload">
                              <Upload className="w-4 h-4" />
                              <input name="field_input_56" type="file" className="hidden" />
                            </label>
                          </div>
                          <label className="flex items-center gap-2 cursor-pointer border border-gray-300 rounded px-3 py-1.5 shrink-0 bg-white">
                            <input name="field_input_57" type="checkbox" className="w-4 h-4 text-brand-blue rounded border-gray-300 focus:ring-brand-blue" />
                            <span className="text-sm text-gray-700">Recebido</span>
                          </label>
                        </div>
                        <div className="flex flex-col md:flex-row md:items-center gap-3">
                          <span className="text-sm text-gray-600 md:w-1/3">Comprovativo de Morada</span>
                          <div className="flex flex-1 gap-2">
                            <input name="field_input_58" type="url" placeholder="Colar link (Drive, Dropbox...)" className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 text-sm" />
                            <label className="flex items-center justify-center p-1.5 border border-gray-300 rounded bg-white text-gray-600 hover:bg-gray-100 transition-colors shrink-0 cursor-pointer" title="Fazer upload">
                              <Upload className="w-4 h-4" />
                              <input name="field_input_59" type="file" className="hidden" />
                            </label>
                          </div>
                          <label className="flex items-center gap-2 cursor-pointer border border-gray-300 rounded px-3 py-1.5 shrink-0 bg-white">
                            <input name="field_input_60" type="checkbox" className="w-4 h-4 text-brand-blue rounded border-gray-300 focus:ring-brand-blue" />
                            <span className="text-sm text-gray-700">Recebido</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h5 className="flex items-center gap-2 text-xs font-semibold text-gray-700 mb-4 mt-6">
                        <Briefcase className="w-4 h-4" /> Dados Profissionais
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Profissão</label>
                          <input name="field_input_61" type="text" placeholder="Ex: Engenheiro, Médico..." className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 text-sm" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Entidade Patronal</label>
                          <input name="field_input_62" type="text" placeholder="Nome da empresa / entidade" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 text-sm" />
                        </div>
                      </div>
                    </div>

                 </div>

                 {/* 2º TITULAR */}
                 <div className="border-t border-gray-100 pt-8 mt-8">
                   <div className="bg-orange-50 rounded-lg p-3 mb-6 flex justify-between items-center">
                     <div className="flex items-center gap-3">
                       <div className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold">2</div>
                       <span className="text-sm font-semibold text-gray-800">2º TITULAR</span>
                     </div>
                     <span className="text-xs text-gray-500 font-medium">Opcional</span>
                   </div>

                   <div className="space-y-6">
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Nome Completo</label>
                        <input name="field_input_63" type="text" placeholder="Nome completo conforme documento de identificação" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 text-sm" />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">NIF</label>
                          <input name="field_input_64" type="text" placeholder="9 dígitos" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 text-sm" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">CC / BI / PASSAPORTE</label>
                          <input name="field_input_65" type="text" placeholder="Nº do documento" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 text-sm" />
                        </div>
                      </div>

                      <div>
                        <h5 className="flex items-center gap-2 text-xs font-semibold text-gray-700 mb-4 mt-6">
                          <MapPin className="w-4 h-4" /> Morada
                        </h5>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Rua</label>
                            <input name="field_input_66" type="text" placeholder="Rua, nº, andar, porta" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 text-sm" />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Localidade</label>
                              <input name="field_input_67" type="text" placeholder="Cidade" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 text-sm" />
                            </div>
                            <div>
                              <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Código Postal</label>
                              <input name="field_input_68" type="text" placeholder="0000-000" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 text-sm" />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">País</label>
                            <input name="field_input_69" type="text" placeholder="Portugal" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 text-sm" />
                          </div>
                        </div>
                      </div>

                      <div>
                        <h5 className="flex items-center gap-2 text-xs font-semibold text-gray-700 mb-4 mt-6">
                          <FileText className="w-4 h-4" /> Documentos
                        </h5>
                        <div className="space-y-3">
                          <div className="flex flex-col md:flex-row md:items-center gap-3">
                            <span className="text-sm text-gray-600 md:w-1/3">Cartão de Cidadão / BI / Passaporte</span>
                            <div className="flex flex-1 gap-2">
                              <input name="field_input_70" type="url" placeholder="Colar link (Drive, Dropbox...)" className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 text-sm" />
                              <label className="flex items-center justify-center p-1.5 border border-gray-300 rounded bg-white text-gray-600 hover:bg-gray-100 transition-colors shrink-0 cursor-pointer" title="Fazer upload">
                                <Upload className="w-4 h-4" />
                                <input name="field_input_71" type="file" className="hidden" />
                              </label>
                            </div>
                            <label className="flex items-center gap-2 cursor-pointer border border-gray-300 rounded px-3 py-1.5 shrink-0 bg-white">
                              <input name="field_input_72" type="checkbox" className="w-4 h-4 text-brand-blue rounded border-gray-300 focus:ring-brand-blue" />
                              <span className="text-sm text-gray-700">Recebido</span>
                            </label>
                          </div>
                          <div className="flex flex-col md:flex-row md:items-center gap-3">
                            <span className="text-sm text-gray-600 md:w-1/3">Declaração de IRS</span>
                            <div className="flex flex-1 gap-2">
                              <input name="field_input_73" type="url" placeholder="Colar link (Drive, Dropbox...)" className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 text-sm" />
                              <label className="flex items-center justify-center p-1.5 border border-gray-300 rounded bg-white text-gray-600 hover:bg-gray-100 transition-colors shrink-0 cursor-pointer" title="Fazer upload">
                                <Upload className="w-4 h-4" />
                                <input name="field_input_74" type="file" className="hidden" />
                              </label>
                            </div>
                            <label className="flex items-center gap-2 cursor-pointer border border-gray-300 rounded px-3 py-1.5 shrink-0 bg-white">
                              <input name="field_input_75" type="checkbox" className="w-4 h-4 text-brand-blue rounded border-gray-300 focus:ring-brand-blue" />
                              <span className="text-sm text-gray-700">Recebido</span>
                            </label>
                          </div>
                          <div className="flex flex-col md:flex-row md:items-center gap-3">
                            <span className="text-sm text-gray-600 md:w-1/3">Recibos de Vencimento</span>
                            <div className="flex flex-1 gap-2">
                              <input name="field_input_76" type="url" placeholder="Colar link (Drive, Dropbox...)" className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 text-sm" />
                              <label className="flex items-center justify-center p-1.5 border border-gray-300 rounded bg-white text-gray-600 hover:bg-gray-100 transition-colors shrink-0 cursor-pointer" title="Fazer upload">
                                <Upload className="w-4 h-4" />
                                <input name="field_input_77" type="file" className="hidden" />
                              </label>
                            </div>
                            <label className="flex items-center gap-2 cursor-pointer border border-gray-300 rounded px-3 py-1.5 shrink-0 bg-white">
                              <input name="field_input_78" type="checkbox" className="w-4 h-4 text-brand-blue rounded border-gray-300 focus:ring-brand-blue" />
                              <span className="text-sm text-gray-700">Recebido</span>
                            </label>
                          </div>
                          <div className="flex flex-col md:flex-row md:items-center gap-3">
                            <span className="text-sm text-gray-600 md:w-1/3">Comprovativo de Morada</span>
                            <div className="flex flex-1 gap-2">
                              <input name="field_input_79" type="url" placeholder="Colar link (Drive, Dropbox...)" className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 text-sm" />
                              <label className="flex items-center justify-center p-1.5 border border-gray-300 rounded bg-white text-gray-600 hover:bg-gray-100 transition-colors shrink-0 cursor-pointer" title="Fazer upload">
                                <Upload className="w-4 h-4" />
                                <input name="field_input_80" type="file" className="hidden" />
                              </label>
                            </div>
                            <label className="flex items-center gap-2 cursor-pointer border border-gray-300 rounded px-3 py-1.5 shrink-0 bg-white">
                              <input name="field_input_81" type="checkbox" className="w-4 h-4 text-brand-blue rounded border-gray-300 focus:ring-brand-blue" />
                              <span className="text-sm text-gray-700">Recebido</span>
                            </label>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h5 className="flex items-center gap-2 text-xs font-semibold text-gray-700 mb-4 mt-6">
                          <Briefcase className="w-4 h-4" /> Dados Profissionais
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Profissão</label>
                            <input name="field_input_82" type="text" placeholder="Ex: Engenheiro, Médico..." className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 text-sm" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Entidade Patronal</label>
                            <input name="field_input_83" type="text" placeholder="Nome da empresa / entidade" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 text-sm" />
                          </div>
                        </div>
                      </div>

                   </div>
                 </div>

              </div>
              
                <div className="flex justify-end pt-4 border-t border-gray-100 mt-6 md:hidden">
                  <button type="button" onClick={handleGlobalSave} className={`flex items-center gap-2 px-6 py-2 text-white text-sm font-medium rounded-lg transition-colors ${saved ? 'bg-green-600 hover:bg-green-700' : 'bg-brand-blue hover:bg-brand-blue/90'}`}>
                    {saved ? <CheckCircle className="w-4 h-4" /> : null}
                    {saved ? 'Guardado!' : 'Guardar Qualificação'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className={activeTab === 'gestao' ? 'block' : 'hidden'}>
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 uppercase mb-1 tracking-wider">Estado</label>
                  <select name="field_select_84" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 bg-white text-sm">
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                    <option value="fechado">Fechado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 uppercase mb-1 tracking-wider">Origem</label>
                  <select name="field_select_85" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 bg-white text-sm">
                    <option value="idealista">Idealista</option>
                    <option value="supercasa">Supercasa</option>
                    <option value="site">Site</option>
                    <option value="referencia">Referência</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 uppercase mb-1 tracking-wider">Temperatura</label>
                  <select name="field_select_86" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 bg-white text-sm">
                    <option value="quente">Quente</option>
                    <option value="morna">Morna</option>
                    <option value="fria">Fria</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 uppercase mb-1 tracking-wider">Atribuída a</label>
                  <input name="field_input_87" type="text" list="comerciais-list" defaultValue="Eu" placeholder="Escolha ou digite..." className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 text-sm" />
                  <datalist id="comerciais-list">
                    <option value="Eu"></option>
                    <option value="Fernanda"></option>
                    <option value="Silvia"></option>
                  </datalist>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 uppercase mb-1 tracking-wider">Próximo Seguimento</label>
                  <input name="field_input_88" type="date" defaultValue="2026-05-06" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 text-sm" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 uppercase mb-1 tracking-wider">Tags (Vírgula)</label>
                  <input name="field_input_89" type="text" defaultValue="primeira habitação, pré-aprovada" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 uppercase mb-1 tracking-wider">Notas</label>
                <textarea name="field_textarea_90" rows={4} defaultValue="Primeira habitação. Prazo: até final do ano. Tem pré-aprovação bancária do Millennium BCP até 320k." className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 text-sm resize-none"></textarea>
              </div>
              
                <div className="flex justify-end pt-4 border-t border-gray-100 md:hidden">
                  <button type="button" onClick={handleGlobalSave} className={`flex items-center gap-2 px-6 py-2 text-white text-sm font-medium rounded-lg transition-colors ${saved ? 'bg-green-600 hover:bg-green-700' : 'bg-brand-blue hover:bg-brand-blue/90'}`}>
                    {saved ? <CheckCircle className="w-4 h-4" /> : null}
                    {saved ? 'Guardado!' : 'Guardar Gestão'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className={activeTab === 'documentos' ? 'block' : 'hidden'}>
            <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Documentos</h3>
              <p>Gestor documental de leads. Funcionalidades em desenvolvimento.</p>
            </div>
          </div>
        </form>

        {/* Exit Prompt Modal */}
        {showExitPrompt && (
          <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Alterações não guardadas</h3>
                <p className="text-gray-600">Quer sair sem guardar alterações?</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                <button 
                  type="button"
                  onClick={() => {
                    setHasUnsavedChanges(false);
                    setShowExitPrompt(false);
                    if (pendingExitAction) {
                      pendingExitAction();
                      setPendingExitAction(null);
                    }
                  }}
                  className="px-6 py-2.5 border-2 border-red-100 text-red-600 font-medium rounded-lg hover:bg-red-50 hover:border-red-200 transition-colors"
                >
                  Sim
                </button>
                <button 
                  type="button"
                  onClick={handleGlobalSave}
                  className="px-6 py-2.5 bg-brand-blue text-white font-medium rounded-lg hover:bg-brand-blue/90 transition-colors shadow-sm"
                >
                  Não
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-serif font-bold text-gray-900">CRM & Leads</h2>
        <button 
          onClick={handleAddLead}
          className="flex items-center gap-2 bg-brand-blue text-white px-4 py-2 rounded-lg font-medium hover:bg-brand-blue/90 transition-colors"
        >
          <Plus className="w-5 h-5" /> Adicionar Lead
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 pt-2">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input name="field_input_91"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar leads por nome, email ou telefone..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue sm:text-sm"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium bg-white hover:bg-gray-50 transition-colors">
          <Filter className="w-4 h-4" /> Filtros
        </button>
      </div>

      {/* Leads Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden text-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500">
                <th className="py-3 px-4 font-semibold">Nome</th>
                <th className="py-3 px-4 font-semibold">Contacto</th>
                <th className="py-3 px-4 font-semibold">Origem</th>
                <th className="py-3 px-4 font-semibold">Estado</th>
                <th className="py-3 px-4 font-semibold">Data</th>
                <th className="py-3 px-4 font-semibold text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {crmLeads.map(lead => (
                <tr 
                  key={lead.id} 
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => handleSelectLead(lead)}
                >
                  <td className="py-3 px-4 font-medium text-gray-900 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-blue/10 text-brand-blue flex items-center justify-center font-bold">
                      {lead.name.charAt(0)}
                    </div>
                    {lead.name}
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    <div className="flex flex-col gap-1">
                      <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {lead.email}</span>
                      <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {lead.phone}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{lead.source}</td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold
                      ${lead.status === 'Novo' ? 'bg-blue-100 text-blue-700' : ''}
                      ${lead.status === 'Em Contacto' ? 'bg-orange-100 text-orange-700' : ''}
                      ${lead.status === 'Agendamento' ? 'bg-purple-100 text-purple-700' : ''}
                      ${lead.status === 'Fechado' ? 'bg-green-100 text-green-700' : ''}
                    `}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{lead.date}</td>
                  <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                    <button className="text-gray-400 hover:text-brand-blue p-1 rounded transition-colors">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
