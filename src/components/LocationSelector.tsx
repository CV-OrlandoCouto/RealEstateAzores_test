import React, { useMemo } from 'react';
import { LocationHierarchy, Property } from '../types';
import { azoresIslands, initialAzoresHierarchy } from '../data/azoresLocations';

interface LocationSelectorProps {
  value?: LocationHierarchy;
  onChange: (value: LocationHierarchy, fullLocationString: string) => void;
  allProperties?: Property[];
}

export default function LocationSelector({ value, onChange, allProperties = [] }: LocationSelectorProps) {
  const currentIlha = value?.ilha || '';
  const currentConcelho = value?.concelho || '';
  const currentFreguesia = value?.freguesia || '';
  const currentLugar = value?.lugar || '';

  // Merge static hierarchy with any dynamically added locations from the database
  const dynamicHierarchy = useMemo(() => {
    // Deep clone the initial hierarchy so we don't mutate the static import
    const merged: Record<string, Record<string, Record<string, string[]>>> = JSON.parse(JSON.stringify(initialAzoresHierarchy));
    
    // Add any island that might implicitly be handled
    azoresIslands.forEach(ilha => {
      if (!merged[ilha]) merged[ilha] = {};
    });

    allProperties.forEach(prop => {
      const loc = prop.locationHierarchy;
      if (!loc || !loc.ilha) return;
      
      const { ilha, concelho, freguesia, lugar } = loc;
      if (!merged[ilha]) merged[ilha] = {};
      if (concelho) {
        if (!merged[ilha][concelho]) merged[ilha][concelho] = {};
        if (freguesia) {
          if (!merged[ilha][concelho][freguesia]) merged[ilha][concelho][freguesia] = [];
          if (lugar && Array.isArray(merged[ilha][concelho][freguesia]) && !merged[ilha][concelho][freguesia].includes(lugar)) {
            merged[ilha][concelho][freguesia].push(lugar);
          }
        }
      }
    });

    return merged;
  }, [allProperties]);

  const ilhas = useMemo(() => {
    return Object.keys(dynamicHierarchy);
  }, [dynamicHierarchy]);

  const concelhos = useMemo(() => {
    if (!currentIlha) return [];
    return Object.keys(dynamicHierarchy[currentIlha] || {});
  }, [currentIlha, dynamicHierarchy]);

  const freguesias = useMemo(() => {
    if (!currentIlha || !currentConcelho) return [];
    const islandObj = dynamicHierarchy[currentIlha] || {};
    const concelhoObj = islandObj[currentConcelho] || {};
    return Object.keys(concelhoObj);
  }, [currentIlha, currentConcelho, dynamicHierarchy]);

  const lugares = useMemo(() => {
    if (!currentIlha || !currentConcelho || !currentFreguesia) return [];
    const islandObj = dynamicHierarchy[currentIlha] || {};
    const concelhoObj = islandObj[currentConcelho] || {};
    const lugaresArr = concelhoObj[currentFreguesia] || [];
    return Array.isArray(lugaresArr) ? lugaresArr : [];
  }, [currentIlha, currentConcelho, currentFreguesia, dynamicHierarchy]);

  const handleChange = (field: keyof LocationHierarchy, val: string) => {
    const newValue = { ...(value || {}), ilha: currentIlha, [field]: val } as LocationHierarchy;
    
    // Clear sub-fields if parent changes
    if (field === 'ilha') {
      newValue.concelho = '';
      newValue.freguesia = '';
      newValue.lugar = '';
    } else if (field === 'concelho') {
      newValue.freguesia = '';
      newValue.lugar = '';
    } else if (field === 'freguesia') {
      newValue.lugar = '';
    }

    // Build the string
    const parts = [];
    if (newValue.lugar) parts.push(newValue.lugar);
    if (newValue.freguesia) parts.push(newValue.freguesia);
    if (newValue.concelho) parts.push(newValue.concelho);
    if (newValue.ilha) parts.push(newValue.ilha);
    
    const fullString = parts.length > 0 ? parts.join(', ') : '';

    onChange(newValue, fullString);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Ilha */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Ilha</label>
        <input 
          list="ilhas-list"
          value={currentIlha}
          onChange={(e) => handleChange('ilha', e.target.value)}
          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-brand-blue transition-colors text-sm"
          placeholder="Selecione ou digite..."
        />
        <datalist id="ilhas-list">
          {ilhas.map(i => <option key={i} value={i} />)}
        </datalist>
      </div>

      {/* Concelho */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Concelho</label>
        <input 
          list="concelhos-list"
          value={currentConcelho}
          onChange={(e) => handleChange('concelho', e.target.value)}
          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-brand-blue transition-colors text-sm"
          placeholder="Selecione ou digite..."
        />
        <datalist id="concelhos-list">
          {concelhos.map(c => <option key={c} value={c} />)}
        </datalist>
      </div>

      {/* Freguesia */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Freguesia</label>
        <input 
          list="freguesias-list"
          value={currentFreguesia}
          onChange={(e) => handleChange('freguesia', e.target.value)}
          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-brand-blue transition-colors text-sm"
          placeholder="Selecione ou digite..."
        />
        <datalist id="freguesias-list">
          {freguesias.map(f => <option key={f} value={f} />)}
        </datalist>
      </div>

      {/* Lugar */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Lugar (Opcional)</label>
        <input 
          list="lugares-list"
          value={currentLugar}
          onChange={(e) => handleChange('lugar', e.target.value)}
          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-brand-blue transition-colors text-sm"
          placeholder="Selecione ou digite..."
        />
        <datalist id="lugares-list">
          {lugares.map(l => <option key={l} value={l} />)}
        </datalist>
      </div>
    </div>
  );
}
