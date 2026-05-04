import React, { useState, useEffect } from 'react';
import LocationSelector from '../components/LocationSelector';
import GalleryManager from '../components/GalleryManager';
import { LocationHierarchy, Property, PropertyFeature, PropertyArea } from '../types';
import { Eye, EyeOff, Image as ImageIcon, Save, CheckCircle, LogIn, LogOut, Shield, Search, Filter, Box, BarChart3, Users, Megaphone, Home, Share2, BookOpen, Images, Maximize, Mail } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { useProperties, handleFirestoreError, OperationType } from '../lib/useProperties';
import { doc, setDoc, collection, addDoc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { mockProperties } from '../data/mockProperties';
import { useLanguage } from '../context/LanguageContext';

import AdminMensagens from '../components/admin/AdminMensagens';
import AdminStats from '../components/admin/AdminStats';
import AdminLeads from '../components/admin/AdminLeads';
import AdminCampaigns from '../components/admin/AdminCampaigns';
import AdminTestimonials from '../components/admin/AdminTestimonials';
import AdminSEO from '../components/admin/AdminSEO';
import AdminSocial from '../components/admin/AdminSocial';
import AdminBlog from '../components/admin/AdminBlog';
import AdminGallery from '../components/admin/AdminGallery';

const PREDEFINED_FEATURES = [
  { id: 'paineis_solares', labelPt: 'Painéis solares', labelEn: 'Solar panels' },
  { id: 'bomba_calor', labelPt: 'Bomba de calor', labelEn: 'Heat pump' },
  { id: 'aquecimento_central', labelPt: 'Aquecimento Central', labelEn: 'Central Heating' },
  { id: 'ar_condicionado', labelPt: 'Ar condicionado', labelEn: 'Air conditioning' },
  { id: 'caixilharia_aluminio', labelPt: 'Caixilharia Alumínio', labelEn: 'Aluminum frames' },
  { id: 'vidros_duplos', labelPt: 'Vidros duplos', labelEn: 'Double glazing' },
  { id: 'varanda', labelPt: 'Varanda', labelEn: 'Balcony' },
  { id: 'terraco', labelPt: 'Terraço', labelEn: 'Terrace' },
  { id: 'jardim', labelPt: 'Jardim', labelEn: 'Garden' },
  { id: 'arrecadacao', labelPt: 'Arrecadação', labelEn: 'Storage room' },
  { id: 'quintal', labelPt: 'Quintal', labelEn: 'Backyard' },
  { id: 'piscina', labelPt: 'Piscina', labelEn: 'Pool' },
  { id: 'jacuzzi', labelPt: 'Jacuzzi', labelEn: 'Jacuzzi' },
  { id: 'cozinha_externa', labelPt: 'Cozinha Externa', labelEn: 'Outdoor Kitchen' },
  { id: 'gas_canalizado', labelPt: 'Gás canalizado', labelEn: 'Piped gas' },
  { id: 'perto_praia', labelPt: 'Perto da Praia', labelEn: 'Near the beach' },
  { id: 'vista_mar', labelPt: 'Vista Mar', labelEn: 'Sea view' },
];

export default function AdminDashboard() {
  const { user, loading: authLoading, login, logout } = useAuth();
  const { t } = useLanguage();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { properties, loading: propsLoading, updateProperty } = useProperties(!!user);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [saved, setSaved] = useState(false);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'imoveis' | 'crm' | 'mensagens' | 'campanhas' | 'testemunhos' | 'seo' | 'social' | 'blog' | 'galeria'>('dashboard');
  const [crmPrefillInfo, setCrmPrefillInfo] = useState<{name: string, email: string, phone: string, source: string} | null>(null);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterBusinessType, setFilterBusinessType] = useState('');

  const filteredProperties = properties.filter(p => {
    const term = searchTerm.toLowerCase();
    const matchSearch = term === '' || 
      p.id.toLowerCase().includes(term) ||
      (p.title?.pt && p.title.pt.toLowerCase().includes(term)) ||
      (p.locationHierarchy?.freguesia && p.locationHierarchy.freguesia.toLowerCase().includes(term)) ||
      (p.locationHierarchy?.concelho && p.locationHierarchy.concelho.toLowerCase().includes(term));
    
    const matchStatus = filterStatus === '' || p.status === filterStatus;
    const matchBusiness = filterBusinessType === '' || p.businessType === filterBusinessType;
    
    return matchSearch && matchStatus && matchBusiness;
  });

  useEffect(() => {
    // Keep selection in sync when data updates from Firebase
    if (selectedProperty) {
      const updated = properties.find(p => p.id === selectedProperty.id);
      if (updated) setSelectedProperty(updated);
    }
  }, [properties]);

  const toggleFeatureHas = (predefId: string, labelPt: string, labelEn: string) => {
    if (!selectedProperty) return;
    const existing = selectedProperty.features.find(f => f.id === predefId);
    let updatedFeatures = [...selectedProperty.features];
    
    if (existing) {
      updatedFeatures = updatedFeatures.filter(f => f.id !== predefId);
    } else {
      updatedFeatures.push({
        id: predefId,
        name: { pt: labelPt, en: labelEn },
        isPublic: true,
        value: 'Sim'
      });
    }
    setSelectedProperty({ ...selectedProperty, features: updatedFeatures });
    setSaved(false);
  };

  const toggleFeatureVisibility = async (featureId: string) => {
    if (!selectedProperty) return;
    const updatedFeatures = selectedProperty.features.map(f => 
      f.id === featureId ? { ...f, isPublic: !f.isPublic } : f
    );
    setSelectedProperty({ ...selectedProperty, features: updatedFeatures });
    setSaved(false);
  };

  const handleSave = async () => {
    if (!selectedProperty) return;
    
    // Create an update object by destructuring the `id` out
    const { id, ...updates } = selectedProperty;

    // Approximate size of document stringified to JSON
    const sizeApprox = JSON.stringify(updates).length;
    if (sizeApprox > 1000000) {
      alert(`As alterações não puderam ser guardadas pois o tamanho do imóvel excede o limite. (${(sizeApprox/1048576).toFixed(2)} MB de 1.00 MB permitidos).\n\nPor favor, remova algumas fotografias antes de guardar.`);
      return;
    }

    try {
      await updateProperty(id, updates);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error("Save failed:", error);
      alert("Erro ao guardar as alterações. A quantidade ou tamanho das imagens pode ter excedido o limite da base de dados. Tente remover imagens ou utilizar imagens mais pequenas.");
    }
  };

  const handleFieldChange = (field: keyof Property, value: any) => {
    if (!selectedProperty) return;
    setSelectedProperty({ ...selectedProperty, [field]: value });
    setSaved(false);
  };

  const handleAreaChange = (areaType: keyof NonNullable<Property['areas']>, prop: keyof PropertyArea, value: string | boolean) => {
    if (!selectedProperty) return;
    const currentAreas = selectedProperty.areas || {};
    const currentArea = currentAreas[areaType] || { value: '', showOnCover: false, showOnDetails: false };
    setSelectedProperty({
      ...selectedProperty,
      areas: {
        ...currentAreas,
        [areaType]: { ...currentArea, [prop]: value }
      }
    });
    setSaved(false);
  };

  const handleDivisionsChange = (field: keyof NonNullable<Property['divisions']>, value: any) => {
    if (!selectedProperty) return;
    const currentDivisions = selectedProperty.divisions || {};
    setSelectedProperty({
      ...selectedProperty,
      divisions: { ...currentDivisions, [field]: value }
    });
    setSaved(false);
  };

  const handleDivisionsArrayChange = (field: 'bedroomAreas' | 'suiteAreas' | 'bathroomAreas' | 'livingRoomAreas' | 'kitchenAreas', index: number, value: string) => {
    if (!selectedProperty) return;
    const currentDivisions = selectedProperty.divisions || {};
    const currentArray = [...(currentDivisions[field] || [])];
    
    while (currentArray.length <= index) {
      currentArray.push('');
    }
    
    currentArray[index] = value;
    
    setSelectedProperty({
      ...selectedProperty,
      divisions: { ...currentDivisions, [field]: currentArray }
    });
    setSaved(false);
  };

  const handleOtherDivisionsChange = (divisionName: string) => {
    if (!selectedProperty) return;
    const currentDivisions = selectedProperty.divisions || {};
    const currentOther = [...(currentDivisions.otherDivisions || [])];
    
    if (currentOther.includes(divisionName)) {
      currentDivisions.otherDivisions = currentOther.filter(d => d !== divisionName);
    } else {
      currentDivisions.otherDivisions = [...currentOther, divisionName];
    }
    
    setSelectedProperty({
      ...selectedProperty,
      divisions: currentDivisions
    });
    setSaved(false);
  };

  const handleNestedChange = (field: 'title' | 'description' | 'seoTitle' | 'seoDescription', nestedKey: 'pt' | 'en', value: string) => {
    if (!selectedProperty) return;
    setSelectedProperty({ 
      ...selectedProperty, 
      [field]: { ...(selectedProperty[field] || { pt: '', en: '' }), [nestedKey]: value } 
    });
    setSaved(false);
  };

  const handleAddImage = () => {
    if (!selectedProperty) return;
    const url = window.prompt("Insira o URL da imagem (Unsplash, etc.):");
    if (!url) return;
    const newImage = { url, isPublic: true, isCover: selectedProperty.images.length === 0 };
    setSelectedProperty({ ...selectedProperty, images: [...selectedProperty.images, newImage] });
    setSaved(false);
  };


  const handleSeed = async () => {
    for (const p of mockProperties) {
      const pRef = doc(db, 'properties', p.id);
      await setDoc(pRef, p);
    }
  };

  const [showNewPropertyModal, setShowNewPropertyModal] = useState(false);
  const [newPropertyCode, setNewPropertyCode] = useState('');
  const [creatingProperty, setCreatingProperty] = useState(false);
  const [createError, setCreateError] = useState('');

  const handleAddProperty = async () => {
    setShowNewPropertyModal(true);
    setNewPropertyCode('');
    setCreateError('');
  };

  const confirmAddProperty = async () => {
    const code = newPropertyCode.trim();
    if (!code) {
      setCreateError('O código não pode estar vazio.');
      return;
    }

    setCreatingProperty(true);
    setCreateError('');

    try {
      const docRef = doc(db, 'properties', code);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setCreateError(`Já existe um imóvel com o código "${code}". Por favor, escolha um código único.`);
        setCreatingProperty(false);
        return;
      }

      const newProperty: Omit<Property, 'id'> = {
        title: { pt: 'Nova Propriedade', en: 'New Property' },
        description: { pt: '', en: '' },
        price: 0,
        location: '',
        locationHierarchy: { ilha: 'São Miguel' },
        businessType: 'comprar',
        propertyType: null,
        condition: '',
        constructionDate: '',
        tags: [],
        images: [],
        features: [],
        isPublic: false,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      await setDoc(docRef, newProperty);
      setSelectedProperty({ id: code, ...newProperty } as Property);
      setShowNewPropertyModal(false);
    } catch (e) {
      console.error('Erro ao adicionar:', e);
      setCreateError('Erro ao adicionar imóvel.');
      handleFirestoreError(e, OperationType.CREATE, 'properties');
    } finally {
      setCreatingProperty(false);
    }
  };

  if (authLoading) return <div className="p-12 text-center text-gray-500">A verificar autenticação...</div>;

  if (!user) {
    return (
      <div className="max-w-md mx-auto mt-24 bg-white p-8 rounded-2xl shadow-sm text-center border border-gray-100">
        <Shield className="w-12 h-12 text-brand-blue mx-auto mb-4" />
        <h2 className="text-2xl font-serif font-bold mb-2">Acesso Restrito</h2>
        <p className="text-gray-500 mb-8">Faça login para aceder ao painel de gestão do site.</p>
        <button onClick={async () => {
          setIsLoggingIn(true);
          await login();
          setIsLoggingIn(false);
        }} disabled={isLoggingIn} className="flex items-center justify-center w-full gap-2 bg-brand-blue text-white px-6 py-3 rounded-lg font-medium hover:bg-brand-blue/90 disabled:opacity-50 transition-colors">
          <LogIn className="w-5 h-5" /> {isLoggingIn ? 'A Iniciar Sessão...' : 'Iniciar Sessão'}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col md:flex-row gap-8">
      {/* Sidebar / Tabs */}
      <div className="w-full md:w-64 flex-shrink-0">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sticky top-24">
          <div className="mb-8 text-center border-b border-gray-100 pb-4">
            <Shield className="w-10 h-10 text-brand-blue mx-auto mb-2" />
            <h2 className="font-serif font-bold text-gray-900">Portal Admin</h2>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
          
          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-brand-blue text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
            >
              <BarChart3 className="w-5 h-5" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('imoveis')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-colors ${activeTab === 'imoveis' ? 'bg-brand-blue text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
            >
              <Home className="w-5 h-5" />
              Gestão de Imóveis
            </button>
            <button
              onClick={() => setActiveTab('mensagens')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-colors ${activeTab === 'mensagens' ? 'bg-brand-blue text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
            >
              <Mail className="w-5 h-5" />
              Mensagens
            </button>
            <button
              onClick={() => setActiveTab('crm')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-colors ${activeTab === 'crm' ? 'bg-brand-blue text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
            >
              <Users className="w-5 h-5" />
              Lead & CRM
            </button>
            <button
              onClick={() => setActiveTab('campanhas')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-colors ${activeTab === 'campanhas' ? 'bg-brand-blue text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
            >
              <Megaphone className="w-5 h-5" />
              Campanhas
            </button>
            <button
              onClick={() => setActiveTab('testemunhos')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-colors ${activeTab === 'testemunhos' ? 'bg-brand-blue text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
            >
              <Users className="w-5 h-5" />
              Testemunhos
            </button>
            <button
              onClick={() => setActiveTab('seo')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-colors ${activeTab === 'seo' ? 'bg-brand-blue text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
            >
              <Search className="w-5 h-5" />
              SEO Otimizado
            </button>
            <button
              onClick={() => setActiveTab('social')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-colors ${activeTab === 'social' ? 'bg-brand-blue text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
            >
              <Share2 className="w-5 h-5" />
              Redes Sociais
            </button>
            <button
              onClick={() => setActiveTab('blog')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-colors ${activeTab === 'blog' ? 'bg-brand-blue text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
            >
              <BookOpen className="w-5 h-5" />
              Blog Açores
            </button>
            <button
              onClick={() => setActiveTab('galeria')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-colors ${activeTab === 'galeria' ? 'bg-brand-blue text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
            >
              <Images className="w-5 h-5" />
              Galeria
            </button>
          </nav>

          <div className="pt-8 mt-8 border-t border-gray-100">
            <button onClick={logout} className="w-full flex items-center justify-center gap-2 text-gray-500 hover:text-brand-red transition-colors text-sm font-medium">
              <LogOut className="w-4 h-4" /> Terminar Sessão
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-grow min-w-0">
        {activeTab === 'dashboard' && <AdminStats />}
        {activeTab === 'crm' && <AdminLeads prefillInfo={crmPrefillInfo} clearPrefill={() => setCrmPrefillInfo(null)} />}
        {activeTab === 'mensagens' && <AdminMensagens onCriarLead={(info) => { setCrmPrefillInfo(info); setActiveTab('crm'); }} />}
        {activeTab === 'campanhas' && <AdminCampaigns />}
        {activeTab === 'testemunhos' && <AdminTestimonials />}
        {activeTab === 'seo' && <AdminSEO />}
        {activeTab === 'social' && <AdminSocial />}
        {activeTab === 'blog' && <AdminBlog />}
        {activeTab === 'galeria' && <AdminGallery />}
        
        {activeTab === 'imoveis' && (
          <div className="space-y-6">
            {/* Modal Novo Imóvel */}
            {showNewPropertyModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Adicionar Novo Imóvel</h3>
            <p className="text-sm text-gray-500 mb-4">Insira um código único para identificar este imóvel.</p>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Código do Imóvel</label>
              <input
                type="text"
                autoFocus
                value={newPropertyCode}
                onChange={e => setNewPropertyCode(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') confirmAddProperty();
                  if (e.key === 'Escape') setShowNewPropertyModal(false);
                }}
                className="w-full bg-white border border-gray-400 hover:border-gray-500 shadow-sm rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all font-mono"
                placeholder="Ex: REF-001"
              />
              {createError && <p className="text-red-500 text-sm mt-2">{createError}</p>}
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowNewPropertyModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={creatingProperty}
              >
                Cancelar
              </button>
              <button
                onClick={confirmAddProperty}
                disabled={creatingProperty || !newPropertyCode.trim()}
                className="px-4 py-2 text-sm font-medium bg-brand-blue text-white rounded-lg hover:bg-brand-blue/90 disabled:opacity-50 transition-colors"
              >
                {creatingProperty ? 'A Criar...' : 'Criar Imóvel'}
              </button>
            </div>
          </div>
        </div>
      )}

            {!selectedProperty ? (
              // Painel de Controlo (Listagem)
              <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
                <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
                    <h1 className="text-2xl font-serif font-bold text-gray-900">Gestão de Imóveis</h1>
                    <div className="flex items-center gap-4">
                      <button onClick={handleAddProperty} className="flex items-center gap-2 bg-brand-blue/10 hover:bg-brand-blue/20 text-brand-blue px-4 py-2 rounded-lg font-medium transition-colors" title="Adicionar Imóvel">
                        + Adicionar Imóvel
                      </button>
                    </div>
                </div>

           {/* Filtros e Busca */}
           {properties.length > 0 && (
             <div className="mb-6 space-y-4">
               <div className="flex flex-col sm:flex-row gap-4">
                 <div className="relative flex-grow">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                     <Search className="h-5 w-5 text-gray-400" />
                   </div>
                   <input
                     type="text"
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     placeholder="Pesquisar por Código, Descrição ou Freguesia..."
                     className="block w-full pl-10 pr-3 py-2 border border-gray-400 hover:border-gray-500 shadow-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue sm:text-sm transition-all"
                   />
                 </div>
                 <button
                   onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                   className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${showAdvancedSearch ? 'bg-brand-blue text-white border-brand-blue' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
                 >
                   <Filter className="w-4 h-4" /> Busca Avançada
                 </button>
               </div>
               
               {/* Advanced Filters */}
               {showAdvancedSearch && (
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                   <div>
                     <label className="block text-xs font-medium text-gray-500 mb-1">Situação</label>
                     <select
                       value={filterStatus}
                       onChange={(e) => setFilterStatus(e.target.value)}
                       className="w-full bg-white border border-gray-400 hover:border-gray-500 shadow-sm rounded px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all"
                     >
                       <option value="">Todas</option>
                       <option value="novidade">Novidade</option>
                       <option value="baixa_preco">Baixa de Preço</option>
                       <option value="reservado">Reservado</option>
                       <option value="vendido">Vendido</option>
                     </select>
                   </div>
                   <div>
                     <label className="block text-xs font-medium text-gray-500 mb-1">Tipo de Negócio</label>
                     <select
                       value={filterBusinessType}
                       onChange={(e) => setFilterBusinessType(e.target.value)}
                       className="w-full bg-white border border-gray-400 hover:border-gray-500 shadow-sm rounded px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all"
                     >
                       <option value="">Todos</option>
                       <option value="comprar">Comprar</option>
                       <option value="arrendar">Arrendar</option>
                       <option value="vender">Vender</option>
                     </select>
                   </div>
                 </div>
               )}
             </div>
           )}
           
           {propsLoading ? (
             <div className="text-center py-12 text-gray-500">A carregar imóveis...</div>
           ) : properties.length === 0 ? (
             <div className="text-center py-12">
               <p className="text-gray-500 mb-4">Nenhum imóvel encontrado.</p>
               <button onClick={handleSeed} className="bg-brand-blue text-white px-6 py-2 rounded-lg font-medium hover:bg-brand-blue/90">
                 Gerar Dados de Teste
               </button>
             </div>
           ) : (
             <div className="overflow-x-auto">
               {filteredProperties.length === 0 ? (
                 <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg mt-4 border border-gray-100">
                   Nenhum imóvel corresponde à pesquisa.
                 </div>
               ) : (
                 <table className="w-full text-left border-collapse min-w-[800px]">
                   <thead>
                     <tr className="border-b border-gray-200 text-gray-500 text-sm">
                       <th className="py-3 px-4 font-semibold text-gray-700">Código</th>
                       <th className="py-3 px-4 font-semibold text-gray-700">Data de Criação</th>
                       <th className="py-3 px-4 font-semibold text-gray-700">Data de Modificação</th>
                       <th className="py-3 px-4 font-semibold text-gray-700">Descrição</th>
                       <th className="py-3 px-4 font-semibold text-gray-700">Freguesia</th>
                       <th className="py-3 px-4 font-semibold text-gray-700">Preço</th>
                       <th className="py-3 px-4 font-semibold text-gray-700">Situação</th>
                       <th className="py-3 px-4 font-semibold text-gray-700">Ação</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100">
                     {filteredProperties.map(p => (
                       <tr key={p.id} className="hover:bg-gray-50 transition-colors text-sm">
                         <td className="py-3 px-4 font-mono text-brand-blue">{p.id}</td>
                         <td className="py-3 px-4 text-gray-600">
                           {p.createdAt ? new Date(p.createdAt).toLocaleString('pt-PT', { dateStyle: 'short', timeStyle: 'short' }) : '-'}
                         </td>
                         <td className="py-3 px-4 text-gray-600">
                           {p.updatedAt ? new Date(p.updatedAt).toLocaleString('pt-PT', { dateStyle: 'short', timeStyle: 'short' }) : '-'}
                         </td>
                         <td className="py-3 px-4 font-medium text-gray-900">{p.title?.pt || 'Sem Título'}</td>
                         <td className="py-3 px-4 text-gray-600">{p.locationHierarchy?.freguesia || p.locationHierarchy?.concelho || p.location || '-'}</td>
                         <td className="py-3 px-4 text-gray-900 font-semibold">{p.price?.toLocaleString('pt-PT')} €</td>
                         <td className="py-3 px-4 text-gray-600">{p.status ? t(`status.${p.status}`) : '-'}</td>
                         <td className="py-3 px-4">
                           <button onClick={() => { setSelectedProperty(p); setSaved(false); }} className="font-medium text-brand-blue border border-brand-blue/30 rounded px-3 py-1.5 hover:bg-brand-blue/5">
                             Editar
                           </button>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               )}
             </div>
           )}
        </div>
      ) : (
        // Main Content: CMS Editor
        <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
          <button 
            onClick={() => setSelectedProperty(null)}
            className="mb-8 flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-brand-blue transition-colors"
          >
            &larr; Voltar ao Painel
          </button>
          
          <div>
            <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
              <h1 className="text-2xl font-serif font-bold text-gray-900">
                Editar: {selectedProperty.title.pt || 'Sem Título'}
              </h1>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={selectedProperty.isPublic}
                    onChange={(e) => handleFieldChange('isPublic', e.target.checked)}
                    className="w-4 h-4 text-brand-blue border-gray-400 hover:border-gray-500 rounded focus:ring-brand-blue" 
                  />
                  Tornar Público
                </label>
                <button 
                  onClick={handleSave}
                  className="flex items-center gap-2 bg-brand-blue hover:bg-brand-blue/90 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  {saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                  {saved ? 'Guardado' : 'Guardar Alterações'}
                </button>
              </div>
            </div>

            {/* General Info */}
            <section className="mb-12 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data de Criação</label>
                  <input 
                    type="text" 
                    value={selectedProperty.createdAt ? new Date(selectedProperty.createdAt).toLocaleString('pt-PT') : 'Desconhecida'} 
                    disabled
                    className="w-full bg-gray-100 border border-gray-300 text-gray-500 rounded-lg px-4 py-2.5 outline-none cursor-not-allowed" 
                  />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Referência Imóvel</label>
                  <input 
                    type="text" 
                    value={selectedProperty.reference || ''} 
                    onChange={e => setSelectedProperty(prev => prev ? { ...prev, reference: e.target.value } : null)}
                    className="w-full bg-white border border-gray-400 hover:border-gray-500 shadow-sm rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all"
                    placeholder="Ex: RE-12345"
                  />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data de Modificação</label>
                  <input 
                    type="text" 
                    value={selectedProperty.updatedAt ? new Date(selectedProperty.updatedAt).toLocaleString('pt-PT') : 'Desconhecida'} 
                    disabled
                    className="w-full bg-gray-100 border border-gray-300 text-gray-500 rounded-lg px-4 py-2.5 outline-none cursor-not-allowed" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título (PT)</label>
                  <input 
                    type="text" 
                    value={selectedProperty.title.pt} 
                    onChange={e => handleNestedChange('title', 'pt', e.target.value)}
                    className="w-full bg-white border border-gray-400 hover:border-gray-500 shadow-sm rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título (EN)</label>
                  <input 
                    type="text" 
                    value={selectedProperty.title.en} 
                    onChange={e => handleNestedChange('title', 'en', e.target.value)}
                    className="w-full bg-white border border-gray-400 hover:border-gray-500 shadow-sm rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all" 
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição (PT)</label>
                  <textarea 
                    rows={3}
                    value={selectedProperty.description.pt} 
                    onChange={e => handleNestedChange('description', 'pt', e.target.value)}
                    className="w-full bg-white border border-gray-400 hover:border-gray-500 shadow-sm rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all resize-none" 
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição (EN)</label>
                  <textarea 
                    rows={3}
                    value={selectedProperty.description.en} 
                    onChange={e => handleNestedChange('description', 'en', e.target.value)}
                    className="w-full bg-white border border-gray-400 hover:border-gray-500 shadow-sm rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all resize-none" 
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Localização (Hierarquia)</label>
                  <LocationSelector 
                    value={selectedProperty.locationHierarchy} 
                    allProperties={properties}
                    onChange={(hierarchy, fullString) => {
                      setSelectedProperty(prev => {
                        if (!prev) return prev;
                        return { ...prev, locationHierarchy: hierarchy, location: fullString };
                      });
                      setSaved(false);
                    }} 
                  />
                  <div className="mt-2 text-xs text-gray-500">
                    Sendo exibido como: <span className="font-semibold text-gray-700">{selectedProperty.location || '(Vazio)'}</span>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Coordenadas GPS (Opcional)</label>
                  <input
                    type="text"
                    value={selectedProperty.gpsCoordinates || ''}
                    onChange={e => handleFieldChange('gpsCoordinates', e.target.value)}
                    placeholder="Ex: 37.7749, -122.4194"
                    className="w-full bg-white border border-gray-400 hover:border-gray-500 shadow-sm rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all"
                  />
                  <div className="mt-2 flex items-center">
                    <input 
                      type="checkbox" 
                      id="approximateLocation"
                      checked={selectedProperty.approximateLocation || false}
                      onChange={(e) => handleFieldChange('approximateLocation', e.target.checked)}
                      className="w-4 h-4 text-brand-blue border-gray-400 rounded focus:ring-brand-blue cursor-pointer"
                    />
                    <label htmlFor="approximateLocation" className="ml-2 text-sm text-gray-700 cursor-pointer">Localização Aproximada</label>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Insira as coordenadas separadas por vírgula para mostrar o mapa na ficha do imóvel. Assinale "Localização Aproximada" se deseja que o mapa da página pública apresente a zona num raio de 2km em vez do ponto exato.</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Negócio</label>
                  <select 
                    value={selectedProperty.businessType || 'comprar'} 
                    onChange={e => handleFieldChange('businessType', e.target.value)}
                    className="w-full bg-white border border-gray-400 hover:border-gray-500 shadow-sm rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all cursor-pointer appearance-none mb-4" 
                  >
                    <option value="comprar">Comprar</option>
                    <option value="arrendar">Arrendar</option>
                    <option value="vender">Vender</option>
                  </select>

                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Imóvel</label>
                  <select 
                    value={selectedProperty.propertyType || ''} 
                    onChange={e => handleFieldChange('propertyType', e.target.value === '' ? null : e.target.value)}
                    className="w-full bg-white border border-gray-400 hover:border-gray-500 shadow-sm rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all cursor-pointer appearance-none mb-4" 
                  >
                    <option value="">Nenhum</option>
                    <option value="casa">Casa</option>
                    <option value="apartamento">Apartamento</option>
                    <option value="terreno_urbano">Terreno urbano</option>
                    <option value="terreno_rustico">Terreno Rustico</option>
                    <option value="terreno_misto">Terreno Misto</option>
                    <option value="terreno_industrial">Terreno Industrial</option>
                    <option value="lote_urbano">Lote Urbano</option>
                    <option value="lote_industrial">Lote Industrial</option>
                    <option value="loja">Loja</option>
                    <option value="escritorio">Escritório</option>
                  </select>

                  <label className="block text-sm font-medium text-gray-700 mb-1">Situação / Etiqueta</label>
                  <select 
                    value={selectedProperty.status || ''} 
                    onChange={e => handleFieldChange('status', e.target.value === '' ? null : e.target.value)}
                    className="w-full bg-white border border-gray-400 hover:border-gray-500 shadow-sm rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all cursor-pointer appearance-none" 
                  >
                    <option value="">Nenhuma</option>
                    <option value="novidade">Novidade</option>
                    <option value="baixa_preco">Baixa de Preço</option>
                    <option value="reservado">Reservado</option>
                    <option value="vendido">Vendido</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preço Atual (€)</label>
                  <input 
                    type="number" 
                    value={selectedProperty.price || ''} 
                    onChange={e => handleFieldChange('price', Number(e.target.value))}
                    className="w-full bg-white border border-gray-400 hover:border-gray-500 shadow-sm rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preço Antigo (€) (Opcional)</label>
                  <input 
                    type="number" 
                    value={selectedProperty.oldPrice || ''} 
                    onChange={e => handleFieldChange('oldPrice', Number(e.target.value))}
                    className="w-full bg-white border border-gray-400 hover:border-gray-500 shadow-sm rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Condição do Imóvel</label>
                  <select
                    value={selectedProperty.condition || ''}
                    onChange={e => handleFieldChange('condition', e.target.value)}
                    className="w-full bg-white border border-gray-400 hover:border-gray-500 shadow-sm rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all"
                  >
                    <option value="">Selecione...</option>
                    <option value="Novo">Novo</option>
                    <option value="Quase novo">Quase novo</option>
                    <option value="Usado">Usado</option>
                    <option value="Renovado">Renovado</option>
                    <option value="Em construção">Em construção</option>
                    <option value="Pré-construção">Pré-construção</option>
                    <option value="Em renovação">Em renovação</option>
                    <option value="Para recuperar">Para recuperar</option>
                    <option value="Ruína">Ruína</option>
                    <option value="Projeto aprovado">Projeto aprovado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data de Construção</label>
                  <input 
                    type="text" 
                    value={selectedProperty.constructionDate || ''} 
                    onChange={e => handleFieldChange('constructionDate', e.target.value)}
                    className="w-full bg-white border border-gray-400 hover:border-gray-500 shadow-sm rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all"
                    placeholder="Ex: 2023, Dezembro 1990..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipologia</label>
                  <select
                    value={selectedProperty.typology || ''}
                    onChange={e => handleFieldChange('typology', e.target.value)}
                    className="w-full bg-white border border-gray-400 hover:border-gray-500 shadow-sm rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all"
                  >
                    <option value="">Selecione...</option>
                    <option value="T1">T1</option>
                    <option value="T2">T2</option>
                    <option value="T3">T3</option>
                    <option value="T4">T4</option>
                    <option value="T5">T5</option>
                    <option value="T6">T6</option>
                    <option value="T7">T7</option>
                    <option value="T8">T8</option>
                    <option value="V1">V1</option>
                    <option value="V2">V2</option>
                    <option value="V3">V3</option>
                    <option value="V4">V4</option>
                    <option value="V5">V5</option>
                    <option value="V6">V6</option>
                    <option value="V7">V7</option>
                    <option value="V8">V8</option>
                    <option value="V9">V9</option>
                    <option value="V10">V10</option>
                    <option value="V11">V11</option>
                    <option value="V12">V12</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Áreas */}
            <section className="mb-12">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Maximize className="w-5 h-5 text-gray-400" />
                Áreas
              </h3>
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                  {([
                    { key: 'util', label: 'Área Útil' },
                    { key: 'bruta', label: 'Área Bruta' },
                    { key: 'brutaConstrucao', label: 'Área Bruta de Construção' },
                    { key: 'brutaPrivativa', label: 'Área Bruta Privativa' },
                    { key: 'terrenoTotal', label: 'Área Total do Terreno' },
                    { key: 'brutaDependente', label: 'Área Bruta Dependente' },
                    { key: 'edificavel', label: 'Área Edificável' },
                  ] as const).map(({ key, label }) => {
                    const areaData = selectedProperty.areas?.[key] || { value: '', showOnCover: false, showOnDetails: false };
                    return (
                      <div key={key} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex flex-col gap-3">
                        <label className="block text-sm font-semibold text-gray-800">{label}</label>
                        <div className="relative">
                          <input 
                            type="number" 
                            step="0.01"
                            value={areaData.value} 
                            onChange={e => handleAreaChange(key, 'value', e.target.value)}
                            className="w-full bg-white border border-gray-300 hover:border-gray-400 shadow-sm rounded-lg pl-3 pr-10 py-2 outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all font-mono text-right" 
                            placeholder="0.00"
                          />
                          <span className="absolute right-3 top-2 text-gray-500 pointer-events-none text-sm">M2</span>
                        </div>
                        <div className="flex flex-col gap-2 mt-1">
                          <label className="flex items-center space-x-2 cursor-pointer text-sm">
                            <input 
                              type="checkbox" 
                              checked={areaData.showOnCover}
                              onChange={e => handleAreaChange(key, 'showOnCover', e.target.checked)}
                              className="w-4 h-4 text-brand-blue border-gray-300 rounded focus:ring-brand-blue"
                            />
                            <span className="text-gray-600">Visível na capa</span>
                          </label>
                          <label className="flex items-center space-x-2 cursor-pointer text-sm">
                            <input 
                              type="checkbox" 
                              checked={areaData.showOnDetails}
                              onChange={e => handleAreaChange(key, 'showOnDetails', e.target.checked)}
                              className="w-4 h-4 text-brand-blue border-gray-300 rounded focus:ring-brand-blue"
                            />
                            <span className="text-gray-600">Visível ficha do Imóvel</span>
                          </label>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Divisions */}
            <section className="mb-12">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Box className="w-5 h-5 text-gray-400" />
                Divisões
              </h3>
              <p className="text-sm text-gray-500 mb-4">Indique as áreas e quantidades dos quartos e suites.</p>

              <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">Quartos</h4>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Número de Quartos</label>
                    <input 
                      type="number" 
                      value={selectedProperty.divisions?.bedroomsCount || ''} 
                      onChange={e => handleDivisionsChange('bedroomsCount', e.target.value)}
                      className="w-full max-w-[200px] bg-white border border-gray-400 hover:border-gray-500 shadow-sm rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all" 
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {Array.from({ length: 10 }).map((_, idx) => (
                      <div key={`bedroom-${idx}`}>
                        <label className="block text-sm text-gray-600 mb-1">Quarto #{idx + 1}</label>
                        <div className="relative">
                          <input 
                            type="number" 
                            value={selectedProperty.divisions?.bedroomAreas?.[idx] || ''} 
                            onChange={e => handleDivisionsArrayChange('bedroomAreas', idx, e.target.value)}
                            className="w-full bg-white border border-gray-400 hover:border-gray-500 shadow-sm rounded-lg pl-3 pr-10 py-2 outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all font-mono" 
                          />
                          <span className="absolute right-3 top-2 text-gray-500 pointer-events-none text-sm">M2</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">Suites</h4>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Número de Suites</label>
                    <input 
                      type="number" 
                      value={selectedProperty.divisions?.suitesCount || ''} 
                      onChange={e => handleDivisionsChange('suitesCount', e.target.value)}
                      className="w-full max-w-[200px] bg-white border border-gray-400 hover:border-gray-500 shadow-sm rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all" 
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <div key={`suite-${idx}`}>
                        <label className="block text-sm text-gray-600 mb-1">Suite #{idx + 1}</label>
                        <div className="relative">
                          <input 
                            type="number" 
                            value={selectedProperty.divisions?.suiteAreas?.[idx] || ''} 
                            onChange={e => handleDivisionsArrayChange('suiteAreas', idx, e.target.value)}
                            className="w-full bg-white border border-gray-400 hover:border-gray-500 shadow-sm rounded-lg pl-3 pr-10 py-2 outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all font-mono" 
                          />
                          <span className="absolute right-3 top-2 text-gray-500 pointer-events-none text-sm">M2</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">Casas de Banho</h4>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Número de Casas de Banho</label>
                    <input 
                      type="number" 
                      value={selectedProperty.divisions?.bathroomsCount || ''} 
                      onChange={e => handleDivisionsChange('bathroomsCount', e.target.value)}
                      className="w-full max-w-[200px] bg-white border border-gray-400 hover:border-gray-500 shadow-sm rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all" 
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {Array.from({ length: 10 }).map((_, idx) => (
                      <div key={`bathroom-${idx}`}>
                        <label className="block text-sm text-gray-600 mb-1">Casas de Banho #{idx + 1}</label>
                        <div className="relative">
                          <input 
                            type="number" 
                            value={selectedProperty.divisions?.bathroomAreas?.[idx] || ''} 
                            onChange={e => handleDivisionsArrayChange('bathroomAreas', idx, e.target.value)}
                            className="w-full bg-white border border-gray-400 hover:border-gray-500 shadow-sm rounded-lg pl-3 pr-10 py-2 outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all font-mono" 
                          />
                          <span className="absolute right-3 top-2 text-gray-500 pointer-events-none text-sm">M2</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">Salas Estar/Jantar</h4>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Número de Salas</label>
                    <input 
                      type="number" 
                      value={selectedProperty.divisions?.livingRoomsCount || ''} 
                      onChange={e => handleDivisionsChange('livingRoomsCount', e.target.value)}
                      className="w-full max-w-[200px] bg-white border border-gray-400 hover:border-gray-500 shadow-sm rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all" 
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <div key={`livingroom-${idx}`}>
                        <label className="block text-sm text-gray-600 mb-1">Sala #{idx + 1}</label>
                        <div className="relative">
                          <input 
                            type="number" 
                            value={selectedProperty.divisions?.livingRoomAreas?.[idx] || ''} 
                            onChange={e => handleDivisionsArrayChange('livingRoomAreas', idx, e.target.value)}
                            className="w-full bg-white border border-gray-400 hover:border-gray-500 shadow-sm rounded-lg pl-3 pr-10 py-2 outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all font-mono" 
                          />
                          <span className="absolute right-3 top-2 text-gray-500 pointer-events-none text-sm">M2</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">Cozinhas</h4>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Número de Cozinhas</label>
                    <input 
                      type="number" 
                      value={selectedProperty.divisions?.kitchensCount || ''} 
                      onChange={e => handleDivisionsChange('kitchensCount', e.target.value)}
                      className="w-full max-w-[200px] bg-white border border-gray-400 hover:border-gray-500 shadow-sm rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all" 
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, idx) => (
                      <div key={`kitchen-${idx}`}>
                        <label className="block text-sm text-gray-600 mb-1">Cozinha #{idx + 1}</label>
                        <div className="relative">
                          <input 
                            type="number" 
                            value={selectedProperty.divisions?.kitchenAreas?.[idx] || ''} 
                            onChange={e => handleDivisionsArrayChange('kitchenAreas', idx, e.target.value)}
                            className="w-full bg-white border border-gray-400 hover:border-gray-500 shadow-sm rounded-lg pl-3 pr-10 py-2 outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all font-mono" 
                          />
                          <span className="absolute right-3 top-2 text-gray-500 pointer-events-none text-sm">M2</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">Outras divisões</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {['Escritório', 'Arrecadação', 'Marquize', 'Lavandaria', 'Garagem', 'Varanda', 'Terraço', 'Alpendre'].map(divName => (
                      <label key={divName} className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <input 
                          type="checkbox" 
                          checked={selectedProperty.divisions?.otherDivisions?.includes(divName) || false}
                          onChange={() => handleOtherDivisionsChange(divName)}
                          className="w-5 h-5 text-brand-blue border-gray-300 rounded focus:ring-brand-blue"
                        />
                        <span className="text-gray-700 font-medium">{divName}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Feature Visibility Management */}
            <section className="mb-12">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5 text-gray-400" />
                Visibilidade de Características
              </h3>
              <p className="text-sm text-gray-500 mb-4">Escolha quais as características públicas (visíveis no site) e privadas (só para consultores).</p>
              
              <div className="bg-gray-50 rounded-xl rounded-b-none border border-gray-200 grid grid-cols-12 gap-4 p-4 font-semibold text-sm text-gray-600">
                <div className="col-span-6">Característica</div>
                <div className="col-span-3 text-center">Tem</div>
                <div className="col-span-3 text-center">Mostrar</div>
              </div>
              <div className="bg-white border text-sm border-t-0 border-gray-200 rounded-b-xl flex flex-col divide-y divide-gray-100">
                {PREDEFINED_FEATURES.map(predef => {
                  const existingFeature = selectedProperty.features.find(f => f.id === predef.id);
                  const hasFeature = !!existingFeature;
                  const isPublic = existingFeature ? existingFeature.isPublic : false;

                  return (
                    <div key={predef.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-gray-50 transition-colors">
                      <div className="col-span-6 font-medium text-gray-900">{predef.labelPt}</div>
                      <div className="col-span-3 flex justify-center">
                        <input 
                          type="checkbox" 
                          checked={hasFeature}
                          onChange={() => toggleFeatureHas(predef.id, predef.labelPt, predef.labelEn)}
                          className="w-5 h-5 text-brand-blue border-gray-300 rounded focus:ring-brand-blue cursor-pointer"
                        />
                      </div>
                      <div className="col-span-3 flex justify-center">
                        <input 
                          type="checkbox" 
                          checked={isPublic}
                          disabled={!hasFeature}
                          onChange={() => toggleFeatureVisibility(predef.id)}
                          className={`w-5 h-5 text-brand-blue border-gray-300 rounded focus:ring-brand-blue ${!hasFeature ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* SEO section */}
            <section className="mb-12">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Search className="w-5 h-5 text-gray-400" />
                SEO (Meta Tags)
              </h3>
              <p className="text-sm text-gray-500 mb-6">Otimize as meta tags (título e descrição) em português e inglês para o imóvel.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Português */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-800 border-b border-gray-200 pb-2">Português</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title (PT)</label>
                    <input 
                      type="text" 
                      value={selectedProperty.seoTitle?.pt || ''} 
                      onChange={e => handleNestedChange('seoTitle', 'pt', e.target.value)}
                      className="w-full bg-white border border-gray-400 hover:border-gray-500 shadow-sm rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-brand-blue transition-all"
                      placeholder="Ex: T3 Luxo vista mar em Ponta Delgada"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex justify-between">
                      <span>Meta Description (PT)</span>
                      <span className={`text-xs ${(selectedProperty.seoDescription?.pt?.length || 0) > 160 ? 'text-brand-red font-bold' : 'text-gray-500'}`}>
                        {(selectedProperty.seoDescription?.pt?.length || 0)} / 160
                      </span>
                    </label>
                    <textarea 
                      rows={3}
                      value={selectedProperty.seoDescription?.pt || ''} 
                      onChange={e => handleNestedChange('seoDescription', 'pt', e.target.value)}
                      className={`w-full bg-white border shadow-sm rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-brand-blue resize-none transition-all ${(selectedProperty.seoDescription?.pt?.length || 0) > 160 ? 'border-brand-red focus:border-brand-red' : 'border-gray-400 hover:border-gray-500 focus:border-brand-blue'}`}
                      placeholder="Descrição atrativa da propriedade..."
                    />
                  </div>
                </div>

                {/* English */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-800 border-b border-gray-200 pb-2">Inglês (English)</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title (EN)</label>
                    <input 
                      type="text" 
                      value={selectedProperty.seoTitle?.en || ''} 
                      onChange={e => handleNestedChange('seoTitle', 'en', e.target.value)}
                      className="w-full bg-white border border-gray-400 hover:border-gray-500 shadow-sm rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-brand-blue transition-all"
                      placeholder="Ex: Luxury 3-bed with sea view in Ponta Delgada"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex justify-between">
                      <span>Meta Description (EN)</span>
                      <span className={`text-xs ${(selectedProperty.seoDescription?.en?.length || 0) > 160 ? 'text-brand-red font-bold' : 'text-gray-500'}`}>
                        {(selectedProperty.seoDescription?.en?.length || 0)} / 160
                      </span>
                    </label>
                    <textarea 
                      rows={3}
                      value={selectedProperty.seoDescription?.en || ''} 
                      onChange={e => handleNestedChange('seoDescription', 'en', e.target.value)}
                      className={`w-full bg-white border shadow-sm rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-brand-blue resize-none transition-all ${(selectedProperty.seoDescription?.en?.length || 0) > 160 ? 'border-brand-red focus:border-brand-red' : 'border-gray-400 hover:border-gray-500 focus:border-brand-blue'}`}
                      placeholder="Attractive property description..."
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Gallery Management */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-gray-400" />
                  Gestão da Galeria (<span className="text-brand-blue">{selectedProperty.images.length}/30</span>)
                </h3>
              </div>
              <p className="text-sm text-gray-500 mb-6">Defina a imagem de capa e escolha quais as fotografias visíveis na ficha pública do imóvel.</p>
              
              <GalleryManager 
                images={selectedProperty.images} 
                onChange={(newImages) => {
                  setSelectedProperty({...selectedProperty, images: newImages});
                  setSaved(false);
                }} 
              />
            </section>

          </div>
        </div>
      )}
          </div>
        )}
      </div>
    </div>
  );
}
