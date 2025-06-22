'use client';

import { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { showToast } from '../lib/toast';
// CORREÇÃO: Removidos 'Calendar' e 'Clock' que não eram usados.
import { Save, Trash2, Plus, ChevronLeft, ChevronRight, Loader2, XCircle } from 'lucide-react';

interface TimeSlot {
  start: string;
  end: string;
}

interface DayAvailability {
  enabled: boolean;
  slots: TimeSlot[];
}

export default function GestaoCalendario() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [availability, setAvailability] = useState<DayAvailability | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const formatToYYYYMMDD = (date: Date) => date.toISOString().split('T')[0];

  const loadAvailability = useCallback(async (date: Date | null) => {
    if (!date) {
      setAvailability(null);
      return;
    }
    setLoading(true);
    const dateStr = formatToYYYYMMDD(date);
    try {
      const docRef = doc(db, 'availabilities', dateStr);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setAvailability(docSnap.data() as DayAvailability);
      } else {
        setAvailability({ enabled: false, slots: [] });
      }
    } catch (error) {
      console.error("Erro ao carregar disponibilidade:", error);
      showToast('Erro ao carregar disponibilidade!', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAvailability(selectedDate);
  }, [selectedDate, loadAvailability]);

  const handleSave = async () => {
    if (!selectedDate || !availability) return;
    setSaving(true);
    const dateStr = formatToYYYYMMDD(selectedDate);
    try {
      if (!availability.enabled && availability.slots.length === 0) {
        await deleteDoc(doc(db, 'availabilities', dateStr));
        showToast('Configuração do dia removida.', 'success');
      } else {
        await setDoc(doc(db, 'availabilities', dateStr), availability);
        showToast('Disponibilidade salva com sucesso!', 'success');
      }
    } catch (error) {
      console.error("Erro ao salvar disponibilidade:", error);
      showToast('Erro ao salvar disponibilidade!', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
  };

  const navigateMonth = (offset: number) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + offset);
      return newDate;
    });
  };

  const updateAvailability = (updates: Partial<DayAvailability>) => {
    setAvailability(prev => prev ? { ...prev, ...updates } : null);
  };
  
  const addTimeSlot = () => {
    if (!availability) return;
    const newSlots = [...availability.slots, { start: '09:00', end: '10:00' }];
    updateAvailability({ slots: newSlots, enabled: true });
  };
  
  const removeTimeSlot = (index: number) => {
    if (!availability) return;
    const newSlots = availability.slots.filter((_, i) => i !== index);
    updateAvailability({ slots: newSlots });
  };
  
  const updateTimeSlot = (index: number, field: 'start' | 'end', value: string) => {
    if (!availability) return;
    const newSlots = availability.slots.map((slot, i) => i === index ? { ...slot, [field]: value } : slot);
    updateAvailability({ slots: newSlots });
  };
  
  const renderCalendar = () => {
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="border-r border-b"></div>);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const dayDate = new Date(year, month, i);
      const isSelected = selectedDate ? formatToYYYYMMDD(dayDate) === formatToYYYYMMDD(selectedDate) : false;
      days.push(
        <button key={i} onClick={() => handleDayClick(dayDate)} className={`p-2 text-center border-r border-b transition-colors ${isSelected ? 'bg-blue-600 text-white font-bold' : 'hover:bg-blue-100'}`}>
          {i}
        </button>
      );
    }

    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigateMonth(-1)} className="p-2 rounded-full hover:bg-gray-100"><ChevronLeft/></button>
          <h3 className="text-xl font-semibold text-gray-800">{monthNames[month]} {year}</h3>
          <button onClick={() => navigateMonth(1)} className="p-2 rounded-full hover:bg-gray-100"><ChevronRight/></button>
        </div>
        <div className="grid grid-cols-7 text-center font-medium text-gray-600">
          {dayNames.map(day => <div key={day} className="py-2 border-b border-t">{day}</div>)}
        </div>
        <div className="grid grid-cols-7 h-[300px]">{days}</div>
      </div>
    );
  };

  const renderDayEditor = () => {
    if (!selectedDate) return null;

    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-4 pb-4 border-b">
          <h3 className="text-xl font-semibold text-gray-800">
            Editar dia: {selectedDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
          </h3>
          <button onClick={() => setSelectedDate(null)} className="text-gray-400 hover:text-gray-600"><XCircle/></button>
        </div>
        {loading ? (
          <div className="flex justify-center items-center h-48"><Loader2 className="animate-spin text-blue-500" size={32}/></div>
        ) : availability && (
          <div className="space-y-6">
            <div>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={availability.enabled}
                  onChange={(e) => updateAvailability({ enabled: e.target.checked })}
                  className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="font-medium text-gray-700">Atender neste dia</span>
              </label>
            </div>

            {availability.enabled && (
              <div className="space-y-4">
                <h4 className="font-medium text-gray-800">Intervalos de tempo:</h4>
                {availability.slots.map((slot, index) => (
                  <div key={index} className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
                    <input type="time" value={slot.start} onChange={e => updateTimeSlot(index, 'start', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"/>
                    <span className="text-gray-500">até</span>
                    <input type="time" value={slot.end} onChange={e => updateTimeSlot(index, 'end', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"/>
                    <button onClick={() => removeTimeSlot(index)} className="text-red-500 hover:text-red-700 p-2 rounded-md hover:bg-red-50 transition-colors"><Trash2 className="h-5 w-5" /></button>
                  </div>
                ))}
                <button onClick={addTimeSlot} className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors pt-2">
                  <Plus className="h-4 w-4" />
                  <span>Adicionar intervalo</span>
                </button>
              </div>
            )}
            
            <div className="pt-6 border-t">
              <button onClick={handleSave} disabled={saving} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 shadow-md font-semibold">
                <Save className="h-5 w-5" />
                <span>{saving ? 'A guardar...' : 'Guardar Alterações do Dia'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {renderCalendar()}
      {renderDayEditor()}
    </div>
  );
}