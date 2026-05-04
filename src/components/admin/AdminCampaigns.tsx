import React from 'react';
import { Target, Megaphone, Play, Pause, BarChart, Plus } from 'lucide-react';

export default function AdminCampaigns() {
  const campaigns = [
    { id: 1, name: 'Google Search - Moradias Ilha de São Miguel', platform: 'Google Ads', status: 'Ativa', spent: '€345.50', leads: 42, ctr: '3.4%' },
    { id: 2, name: 'Meta Ads - Retargeting Website', platform: 'Facebook / Instagram', status: 'Ativa', spent: '€120.00', leads: 15, ctr: '1.2%' },
    { id: 3, name: 'Email Marketing - Newsletter Maio', platform: 'Mailchimp', status: 'Concluída', spent: '€0.00', leads: 12, ctr: '24.5% (Open Rate)' },
    { id: 4, name: 'Google Performance Max - US/CA Expats', platform: 'Google Ads', status: 'Pausada', spent: '€450.25', leads: 8, ctr: '0.8%' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
        <h2 className="text-2xl font-serif font-bold text-gray-900">Gestão de Campanhas</h2>
        <button className="flex items-center gap-2 bg-brand-blue text-white px-4 py-2 rounded-lg font-medium hover:bg-brand-blue/90 transition-colors">
          <Plus className="w-5 h-5" /> Nova Campanha
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-gray-100 p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-semibold text-gray-700">Gasto Total</h3>
            <div className="bg-gray-100 p-2 rounded-lg text-gray-500"><Target className="w-5 h-5" /></div>
          </div>
          <p className="text-3xl font-bold text-gray-900">€915.75</p>
          <p className="text-sm text-gray-500 mt-2">Últimos 30 dias</p>
        </div>
        <div className="bg-white border border-gray-100 p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-semibold text-gray-700">Leads Geradas</h3>
            <div className="bg-brand-blue/10 p-2 rounded-lg text-brand-blue"><Megaphone className="w-5 h-5" /></div>
          </div>
          <p className="text-3xl font-bold text-gray-900">77</p>
          <p className="text-sm text-green-600 mt-2 font-medium">Custo por Lead: €11.89</p>
        </div>
        <div className="bg-white border border-gray-100 p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-semibold text-gray-700">Conversão Global</h3>
            <div className="bg-green-100 p-2 rounded-lg text-green-600"><BarChart className="w-5 h-5" /></div>
          </div>
          <p className="text-3xl font-bold text-gray-900">2.4%</p>
          <p className="text-sm text-gray-500 mt-2">Variação: +0.3% vs mês anterior</p>
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden text-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500">
                <th className="py-3 px-4 font-semibold">Campanha</th>
                <th className="py-3 px-4 font-semibold">Plataforma</th>
                <th className="py-3 px-4 font-semibold">Estado</th>
                <th className="py-3 px-4 font-semibold">Gasto</th>
                <th className="py-3 px-4 font-semibold">Leads</th>
                <th className="py-3 px-4 font-semibold">Performance</th>
                <th className="py-3 px-4 font-semibold text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {campaigns.map(camp => (
                <tr key={camp.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 font-medium text-gray-900">{camp.name}</td>
                  <td className="py-3 px-4 text-gray-600">{camp.platform}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-[11px] font-bold uppercase
                      ${camp.status === 'Ativa' ? 'bg-green-100 text-green-700' : ''}
                      ${camp.status === 'Pausada' ? 'bg-yellow-100 text-yellow-700' : ''}
                      ${camp.status === 'Concluída' ? 'bg-gray-100 text-gray-600' : ''}
                    `}>
                      {camp.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{camp.spent}</td>
                  <td className="py-3 px-4 text-brand-blue font-semibold">{camp.leads}</td>
                  <td className="py-3 px-4 text-gray-600 font-mono text-xs">{camp.ctr}</td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                       {camp.status === 'Ativa' ? (
                         <button className="text-gray-400 hover:text-yellow-600 transition-colors" title="Pausar"><Pause className="w-4 h-4" /></button>
                       ) : camp.status === 'Pausada' ? (
                         <button className="text-gray-400 hover:text-green-600 transition-colors" title="Retomar"><Play className="w-4 h-4" /></button>
                       ) : null}
                       <button className="text-brand-blue hover:text-brand-blue/80 transition-colors text-xs font-semibold">Detalhes</button>
                    </div>
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
