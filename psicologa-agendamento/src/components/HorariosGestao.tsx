'use client';

import { useState, useEffect } from 'react';
import { Clock, Plus, Save, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

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

import { showToast } from '@/lib/toast';

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
        // Configuração padrão
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
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
          <Clock className="h-5 w-5 mr-2" />
          Meus Horários de Atendimento
        </h2>
        <button
          onClick={saveWorkingHours}
          disabled={saving}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all flex items-center space-x-2 disabled:opacity-50 shadow-lg"
        >
          <Save className="h-4 w-4" />
          <span>{saving ? 'Salvando...' : 'Salvar Alterações'}</span>
        </button>
      </div>

      <div className="space-y-6">
        {daysOfWeek.map(day => {
          const dayData = workingHours[day.key] || { enabled: false, slots: [] };
          
          return (
            <div key={day.key} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-800">{day.label}</h3>
                <button
                  onClick={() => toggleDay(day.key)}
                  className="flex items-center space-x-2 group"
                >
                  {dayData.enabled ? (
                    <ToggleRight className="h-6 w-6 text-emerald-600 group-hover:text-emerald-700 transition-colors" />
                  ) : (
                    <ToggleLeft className="h-6 w-6 text-gray-400 group-hover:text-gray-500 transition-colors" />
                  )}
                  <span className={`text-sm font-medium ${dayData.enabled ? 'text-emerald-600' : 'text-gray-500'}`}>
                    {dayData.enabled ? 'Ativo' : 'Inativo'}
                  </span>
                </button>
              </div>

              {dayData.enabled && (
                <div className="space-y-3">
                  {dayData.slots.map((slot, slotIndex) => (
                    <div key={slotIndex} className="flex items-center space-x-3">
                      <input
                        type="time"
                        value={slot.start}
                        onChange={(e) => updateTimeSlot(day.key, slotIndex, 'start', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-gray-500">até</span>
                      <input
                        type="time"
                        value={slot.end}
                        onChange={(e) => updateTimeSlot(day.key, slotIndex, 'end', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => removeTimeSlot(day.key, slotIndex)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  
                  <button
                    onClick={() => addTimeSlot(day.key)}
                    className="flex items-center space-x-2 text-emerald-600 hover:text-emerald-800 text-sm font-medium transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Adicionar intervalo</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
        <h4 className="font-medium text-gray-800 mb-2 flex items-center">
          <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
          Como funciona:
        </h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Ative/desative os dias da semana que você atende</li>
          <li>• Defina um ou mais intervalos de horário para cada dia</li>
          <li>• Os pacientes só poderão agendar nos horários que você definir</li>
          <li>• O sistema ainda verificará sua agenda do Google para evitar conflitos</li>
        </ul>
      </div>
    </div>
  );
}

