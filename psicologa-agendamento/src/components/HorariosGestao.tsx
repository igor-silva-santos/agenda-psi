'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { showToast } from '../lib/toast';
import { Clock, Save, ToggleRight, ToggleLeft, Trash2, Plus } from 'lucide-react';

interface TimeSlot {
  start: string;
  end: string;
}

interface WorkingHours {
  [key: string]: {
    enabled: boolean;
    slots: TimeSlot[];
  };
}

const daysOfWeek = [
  { key: 'monday', label: 'Segunda-feira' },
  { key: 'tuesday', label: 'Terça-feira' },
  { key: 'wednesday', label: 'Quarta-feira' },
  { key: 'thursday', label: 'Quinta-feira' },
  { key: 'friday', label: 'Sexta-feira' },
  { key: 'saturday', label: 'Sábado' },
  { key: 'sunday', label: 'Domingo' },
];

export default function HorariosGestao() {
  const [workingHours, setWorkingHours] = useState<WorkingHours>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadWorkingHours();
  }, []);

  const loadWorkingHours = async () => {
    try {
      const docRef = doc(db, 'settings', 'working-hours');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setWorkingHours(docSnap.data().hours || {});
      } else {
        const defaultHours: WorkingHours = {};
        daysOfWeek.forEach(day => {
          defaultHours[day.key] = {
            enabled: day.key !== 'saturday' && day.key !== 'sunday',
            slots: day.key !== 'saturday' && day.key !== 'sunday' 
              ? [{ start: '09:00', end: '12:00' }, { start: '14:00', end: '18:00' }]
              : []
          };
        });
        setWorkingHours(defaultHours);
      }
    } catch (error) {
      console.error('Erro ao carregar horários:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveWorkingHours = async () => {
    setSaving(true);
    try {
      const docRef = doc(db, 'settings', 'working-hours');
      await setDoc(docRef, { hours: workingHours });
      showToast('Horários salvos com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao salvar horários:', error);
      showToast('Erro ao salvar horários!', 'error');
    } finally {
      setSaving(false);
    }
  };

  const toggleDay = (dayKey: string) => {
    setWorkingHours(prev => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        enabled: !prev[dayKey]?.enabled,
        slots: !prev[dayKey]?.enabled ? [{ start: '09:00', end: '18:00' }] : []
      }
    }));
  };

  const addTimeSlot = (dayKey: string) => {
    setWorkingHours(prev => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        slots: [...(prev[dayKey]?.slots || []), { start: '09:00', end: '18:00' }]
      }
    }));
  };

  const removeTimeSlot = (dayKey: string, slotIndex: number) => {
    setWorkingHours(prev => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        slots: prev[dayKey]?.slots.filter((_, index) => index !== slotIndex) || []
      }
    }));
  };

  const updateTimeSlot = (dayKey: string, slotIndex: number, field: 'start' | 'end', value: string) => {
    setWorkingHours(prev => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        slots: prev[dayKey]?.slots.map((slot, index) => 
          index === slotIndex ? { ...slot, [field]: value } : slot
        ) || []
      }
    }));
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-200 rounded"></div>)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
          <Clock className="h-6 w-6 mr-3 text-blue-600" />
          Meus Horários de Atendimento
        </h2>
        <button 
          onClick={saveWorkingHours} 
          disabled={saving} 
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center space-x-2 disabled:opacity-50 shadow-md font-semibold"
        >
          <Save className="h-5 w-5" />
          <span>{saving ? 'Salvando...' : 'Salvar Alterações'}</span>
        </button>
      </div>

      <div className="space-y-6">
        {daysOfWeek.map(day => {
          const dayData = workingHours[day.key] || { enabled: false, slots: [] };
          return (
            <div key={day.key} className={`border rounded-lg p-6 transition-all ${dayData.enabled ? 'bg-white shadow-sm' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">{day.label}</h3>
                <button onClick={() => toggleDay(day.key)} className="flex items-center space-x-3 group">
                  <span className={`text-sm font-medium ${dayData.enabled ? 'text-blue-600' : 'text-gray-500'}`}>{dayData.enabled ? 'Ativo' : 'Inativo'}</span>
                  {dayData.enabled ? <ToggleRight className="h-8 w-8 text-blue-500 group-hover:text-blue-600 transition-colors" /> : <ToggleLeft className="h-8 w-8 text-gray-300 group-hover:text-gray-400 transition-colors" />}
                </button>
              </div>
              {dayData.enabled && (
                <div className="space-y-4">
                  {dayData.slots.map((slot, slotIndex) => (
                    <div key={slotIndex} className="flex items-center space-x-3">
                      <input type="time" value={slot.start} onChange={(e) => updateTimeSlot(day.key, slotIndex, 'start', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900" />
                      <span className="text-gray-500">até</span>
                      <input type="time" value={slot.end} onChange={(e) => updateTimeSlot(day.key, slotIndex, 'end', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900" />
                      <button onClick={() => removeTimeSlot(day.key, slotIndex)} className="text-red-500 hover:text-red-700 p-2 rounded-md hover:bg-red-50 transition-colors"><Trash2 className="h-5 w-5" /></button>
                    </div>
                  ))}
                  <button onClick={() => addTimeSlot(day.key)} className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors pt-2">
                    <Plus className="h-4 w-4" />
                    <span>Adicionar intervalo</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}