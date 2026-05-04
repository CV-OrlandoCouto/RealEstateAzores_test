import React from 'react';
import { Users, Calendar, Home, ArrowRight } from 'lucide-react';
import { useLeads } from '../../lib/useLeads';
import { useProperties } from '../../lib/useProperties';

export default function AdminStats() {
  const { leads, loading: leadsLoading } = useLeads();
  const { properties, loading: propsLoading } = useProperties(true);

  const unreadMessagesCount = leads.filter(l => !l.read).length;
  const recentLeadsCount = leads.filter(l => (Date.now() - l.createdAt) < 7 * 24 * 60 * 60 * 1000).length;
  
  const activePropertiesCount = properties.filter(p => p.isPublic).length;
  const totalPropertiesCount = properties.length;
  return (
    <div className="space-y-6">
      {/* Top Cards in 2 columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1 */}
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm border-l-[4px] border-l-teal-600">
          <p className="text-xs font-semibold text-gray-500 tracking-[0.05em] uppercase">Leads Ativas</p>
          <p className="text-3xl font-serif text-gray-900 mt-2 mb-1">{leadsLoading ? '-' : leads.length}</p>
          <p className="text-sm text-gray-500">{recentLeadsCount} nova(s) esta semana</p>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm border-l-[4px] border-l-blue-600">
          <p className="text-xs font-semibold text-gray-500 tracking-[0.05em] uppercase">Imóveis Ativos</p>
          <p className="text-3xl font-serif text-gray-900 mt-2 mb-1">{propsLoading ? '-' : activePropertiesCount}</p>
          <p className="text-sm text-gray-500">{totalPropertiesCount} no total</p>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm border-l-[4px] border-l-orange-500">
          <p className="text-xs font-semibold text-gray-500 tracking-[0.05em] uppercase">Mensagens não lidas</p>
          <p className="text-3xl font-serif text-gray-900 mt-2 mb-1">{leadsLoading ? '-' : unreadMessagesCount}</p>
          <p className="text-sm text-gray-500">No sistema</p>
        </div>

        {/* Card 4 */}
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm border-l-[4px] border-l-gray-600">
          <p className="text-xs font-semibold text-gray-500 tracking-[0.05em] uppercase">Visitas Próximas</p>
          <p className="text-3xl font-serif text-gray-900 mt-2 mb-1">3</p>
          <p className="text-sm text-gray-500">próximos 7 dias</p>
        </div>
      </div>

      {/* Próximas Visitas List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mt-8">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="text-xl font-serif font-medium text-gray-900">Próximas visitas</h3>
          <button className="text-sm text-teal-700 hover:text-teal-800 font-medium flex items-center gap-1 transition-colors">
            Ver todas <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="divide-y divide-gray-100">
          <div className="p-5 flex items-center gap-4">
            <div className="bg-white border border-gray-200 rounded min-w-[3.5rem] flex-col items-center flex shrink-0 shadow-sm pb-1">
              <div className="text-[10px] w-full text-center font-bold text-gray-500 uppercase border-b border-gray-100 py-1 mb-1">Mai.</div>
              <div className="text-xl font-serif text-gray-900">5</div>
            </div>
            <div className="flex-grow">
              <p className="font-semibold text-gray-900">T1 renovado no centro</p>
              <p className="text-sm text-gray-500 mt-0.5">Sofia Almeida · 11:21h</p>
            </div>
            <span className="px-3 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded-full text-xs font-medium shrink-0">
              Agendada
            </span>
          </div>

          <div className="p-5 flex items-center gap-4">
            <div className="bg-white border border-gray-200 rounded min-w-[3.5rem] flex-col items-center flex shrink-0 shadow-sm pb-1">
              <div className="text-[10px] w-full text-center font-bold text-gray-500 uppercase border-b border-gray-100 py-1 mb-1">Mai.</div>
              <div className="text-xl font-serif text-gray-900">6</div>
            </div>
            <div className="flex-grow">
              <p className="font-semibold text-gray-900">Apartamento T3 com vista rio</p>
              <p className="text-sm text-gray-500 mt-0.5">Mariana Costa · 03:21h</p>
            </div>
            <span className="px-3 py-1 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-full text-xs font-medium shrink-0">
              Confirmada
            </span>
          </div>

          <div className="p-5 flex items-center gap-4">
            <div className="bg-white border border-gray-200 rounded min-w-[3.5rem] flex-col items-center flex shrink-0 shadow-sm pb-1">
              <div className="text-[10px] w-full text-center font-bold text-gray-500 uppercase border-b border-gray-100 py-1 mb-1">Mai.</div>
              <div className="text-xl font-serif text-gray-900">9</div>
            </div>
            <div className="flex-grow">
              <p className="font-semibold text-gray-900">Moradia T4 isolada com piscina</p>
              <p className="text-sm text-gray-500 mt-0.5">João Pereira · 07:21h</p>
            </div>
            <span className="px-3 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded-full text-xs font-medium shrink-0">
              Agendada
            </span>
          </div>
        </div>
      </div>

      {/* Atividade Recente List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mt-8">
        <div className="p-5 border-b border-gray-100">
          <h3 className="text-xl font-serif font-medium text-gray-900">Atividade recente</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {leadsLoading ? (
            <div className="p-5 text-center text-gray-500">A carregar atividade...</div>
          ) : leads.slice(0, 4).map((lead) => {
             const daysAgo = Math.floor((Date.now() - lead.createdAt) / (1000 * 60 * 60 * 24));
             const timeDisplay = daysAgo === 0 ? 'Hoje' : `há ${daysAgo} dia(s)`;
             return (
              <div key={lead.id} className="p-5 flex items-start gap-4">
                <div className="bg-teal-50 text-teal-600 p-2 rounded-full shrink-0 border border-teal-100">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-gray-900">Nova mensagem: <span className="font-medium">{lead.name}</span></p>
                  <p className="text-sm text-gray-500 mt-0.5">Website · {timeDisplay}</p>
                </div>
              </div>
            );
          })}
          {!leadsLoading && leads.length === 0 && (
             <div className="p-5 text-center text-gray-500">Sem atividade recente.</div>
          )}
        </div>
      </div>
    </div>
  );
}
