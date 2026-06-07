import React, { useState, useRef, useEffect } from 'react';
import { 
  format, addMonths, subMonths, startOfMonth, endOfMonth, 
  eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isToday 
} from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Printer, Moon, Sun, CalendarDays } from 'lucide-react';
import { useStore } from '../store';
import DayDialog from './DayDialog';

export default function CalendarMain() {
  const { events, theme, setTheme, fetchEvents } = useStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  const printRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    fetchEvents();
    const intervalId = setInterval(fetchEvents, 3000);
    return () => clearInterval(intervalId);
  }, [fetchEvents]);

  const handlePrint = () => {
    window.print();
  };

  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const today = () => setCurrentDate(new Date());

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  const startDate = startOfMonth(currentDate);
  const endDate = endOfMonth(currentDate);
  const days = eachDayOfInterval({ 
    start: startOfWeek(startDate, { weekStartsOn: 0 }), 
    end: endOfWeek(endDate, { weekStartsOn: 0 }) 
  });

  return (
    <div className="min-h-screen flex flex-col font-sans transition-colors duration-500 relative overflow-hidden bg-slate-50 dark:bg-[#050505]">
      {/* Liquid Glass Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] rounded-full bg-blue-500/20 dark:bg-blue-600/30 blur-[100px] md:blur-[140px] animate-pulse"></div>
        <div className="absolute top-[20%] -right-[10%] w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] rounded-full bg-purple-500/20 dark:bg-purple-600/30 blur-[100px] md:blur-[140px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-[20%] left-[20%] w-[60vw] h-[60vw] max-w-[700px] max-h-[700px] rounded-full bg-teal-500/15 dark:bg-teal-500/20 blur-[100px] md:blur-[140px] animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <header className="px-4 md:px-8 py-5 w-full max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden mt-4 bg-white/40 dark:bg-black/40 backdrop-blur-3xl border border-white/60 dark:border-white/10 rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.04)] z-10 relative">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 font-bold shrink-0">
            <CalendarDays className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-gray-900 dark:text-white">Vivian Class Schedule</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-1 bg-white/50 dark:bg-black/30 backdrop-blur-xl rounded-full border border-white/80 dark:border-white/10 p-1 shadow-sm shrink-0">
            <button onClick={prevMonth} className="p-1.5 text-gray-500 hover:text-gray-900 dark:hover:text-white rounded-full transition-colors"><ChevronLeft className="w-4 h-4" /></button>
            <div className="px-3 text-sm font-bold text-gray-700 dark:text-gray-200 cursor-pointer select-none" onClick={today}>
              {format(currentDate, 'yyyy年 M月')}
            </div>
            <button onClick={nextMonth} className="p-1.5 text-gray-500 hover:text-gray-900 dark:hover:text-white rounded-full transition-colors"><ChevronRight className="w-4 h-4" /></button>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={toggleTheme} className="p-2 bg-white/50 dark:bg-black/30 backdrop-blur-xl border border-white/80 dark:border-white/10 rounded-full hover:bg-white/80 dark:hover:bg-black/50 transition shadow-sm text-gray-600 dark:text-gray-300" title="切换主题">
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button onClick={handlePrint} className="p-2 bg-white/50 dark:bg-black/30 backdrop-blur-xl border border-white/80 dark:border-white/10 rounded-full hover:bg-white/80 dark:hover:bg-black/50 transition shadow-sm text-gray-600 dark:text-gray-300" title="导出PDF / 打印">
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full pt-4 md:pt-6 z-10 relative">
        <div ref={printRef} className="print:p-0 print:bg-white print:text-black w-full">
          <div className="hidden print:block mb-6">
            <div className="flex flex-col">
              <h1 className="text-2xl font-black tracking-tight text-black">Vivian Class Schedule</h1>
              <h2 className="text-lg font-bold text-gray-600">
                {format(currentDate, 'yyyy年 M月')}
              </h2>
            </div>
          </div>

          <div className="animate-in fade-in duration-500 slide-in-from-bottom-2">
            <div className="bg-white/40 dark:bg-black/30 backdrop-blur-3xl border border-white/60 dark:border-white/10 rounded-[2rem] overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.04)]">
              <div className="grid grid-cols-7 border-b border-white/50 dark:border-gray-800/50 bg-white/20 dark:bg-white/5 backdrop-blur-md">
                {['日', '一', '二', '三', '四', '五', '六'].map(d => (
                  <div key={d} className="py-3 text-center text-[10px] md:text-sm font-bold text-gray-500 dark:text-gray-400">
                    <span className="hidden md:inline">周</span>{d}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-px bg-white/40 dark:bg-white/5 backdrop-blur-md">
                {days.map((day, i) => {
                  const dateStr = format(day, 'yyyy-MM-dd');
                  const dayEvents = events.filter(e => e.date === dateStr).sort((a,b) => a.startTime.localeCompare(b.startTime));
                  const isCurrMonth = isSameMonth(day, currentDate);
                  
                  return (
                    <div 
                      key={i} 
                      onClick={() => setSelectedDate(day)}
                      className={`min-h-[100px] md:min-h-[140px] p-2 transition-all duration-300 relative group cursor-pointer hover:bg-white/60 dark:hover:bg-white/10 bg-white/40 dark:bg-black/20 backdrop-blur-sm
                        ${isCurrMonth ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-600 opacity-60'}
                        ${isToday(day) ? 'ring-2 ring-inset ring-blue-500/50 dark:ring-blue-400/50 bg-blue-50/30 dark:bg-blue-900/10' : ''}
                      `}
                    >
                      <div className="flex justify-between items-start mb-1 md:mb-2">
                        <span className={`text-xs md:text-sm font-bold w-6 h-6 md:w-7 md:h-7 flex items-center justify-center rounded-full transition-colors ${
                          isToday(day) ? 'bg-blue-500/90 text-white shadow-[0_2px_10px_rgba(59,130,246,0.3)]' : 'group-hover:bg-black/5 dark:group-hover:bg-white/10'
                        }`}>
                          {format(day, 'd')}
                        </span>
                      </div>
                      
                      <div className="space-y-1">
                        {dayEvents.map((event) => (
                          <div 
                            key={event.id}
                            style={{ backgroundColor: event.color + '25', borderLeftColor: event.color }}
                            className="px-1.5 py-1 md:px-2.5 md:py-1.5 text-[10px] md:text-xs rounded-r block truncate border-l-4 border-l-solid text-gray-800 dark:text-gray-100 shadow-sm backdrop-blur-md"
                          >
                            <span className="font-semibold block opacity-90 truncate">{event.title}</span>
                            <span className="opacity-80 font-mono block text-[8px] md:text-[10px] leading-tight mt-0.5">
                              {event.startTime}-{event.endTime}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>

      {selectedDate && (
        <DayDialog 
          isOpen={true} 
          date={selectedDate} 
          onClose={() => setSelectedDate(null)} 
        />
      )}
    </div>
  );
}
