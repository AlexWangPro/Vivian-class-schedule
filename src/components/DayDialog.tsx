import React, { useState, useRef } from 'react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { X, Trash2, Plus, Check, ClipboardPaste } from 'lucide-react';
import { useStore, AppEvent } from '../store';

const COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', 
  '#06b6d4', '#3b82f6', '#6366f1', '#a855f7', '#ec4899', '#64748b'
];

interface DayDialogProps {
  isOpen: boolean;
  date: Date;
  onClose: () => void;
}

export default function DayDialog({ isOpen, date, onClose }: DayDialogProps) {
  const { events, copiedEvent, addEvent, updateEvent, deleteEvent, setCopiedEvent } = useStore();
  const dateStr = format(date, 'yyyy-MM-dd');
  const dayEvents = events.filter(e => e.date === dateStr).sort((a,b) => a.startTime.localeCompare(b.startTime));
  
  const [editingEvent, setEditingEvent] = useState<AppEvent | Partial<AppEvent> | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const clickTimers = useRef<{ [key: string]: NodeJS.Timeout }>({});
  
  const handleCopy = (ev: AppEvent) => {
    setCopiedEvent({
      title: ev.title,
      startTime: ev.startTime,
      endTime: ev.endTime,
      color: ev.color,
      emoji: ev.emoji,
      location: ev.location
    });
    setCopiedId(ev.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCardClick = (e: React.MouseEvent, ev: AppEvent) => {
    if (e.detail === 1) {
      clickTimers.current[ev.id] = setTimeout(() => {
        setEditingEvent(ev);
      }, 250);
    } else if (e.detail === 2) {
      clearTimeout(clickTimers.current[ev.id]);
      handleCopy(ev);
    }
  };
  
  const handlePaste = () => {
    if (copiedEvent) {
      addEvent({
        id: crypto.randomUUID(),
        date: dateStr,
        ...copiedEvent
      } as AppEvent);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white/80 dark:bg-black/60 backdrop-blur-3xl rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.2)] w-full max-w-md overflow-hidden border border-white/50 dark:border-white/10 flex flex-col max-h-[90vh] relative">
        <div className="absolute inset-0 bg-gradient-to-tr from-white/40 to-white/10 dark:from-white/5 dark:to-transparent pointer-events-none"></div>
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/50 dark:border-gray-800/50 flex justify-between items-center bg-white/40 dark:bg-gray-800/40 relative z-10">
          <div>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white">
              {format(date, 'd')}日
            </h3>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">
              {format(date, 'yyyy年MM月 EEEE', { locale: zhCN })}
            </p>
          </div>
          <div className="flex gap-2">
            {copiedEvent && !editingEvent && (
              <button 
                onClick={handlePaste} 
                className="p-2 bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400 rounded-full hover:bg-blue-200 transition-colors focus:ring focus:ring-blue-500/20"
                title="粘贴课程"
              >
                <ClipboardPaste className="w-5 h-5" />
              </button>
            )}
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 no-scrollbar relative z-10">
          {editingEvent ? (
            <EventForm 
              event={editingEvent} 
              dateStr={dateStr}
              onSave={(ev: any) => {
                if (ev.id) {
                  updateEvent(ev.id, ev as AppEvent);
                } else {
                  addEvent({ ...ev, id: crypto.randomUUID() } as AppEvent);
                }
                setEditingEvent(null);
              }}
              onCancel={() => setEditingEvent(null)}
              onDelete={editingEvent.id ? () => {
                deleteEvent(editingEvent.id as string);
                setEditingEvent(null);
              } : undefined}
            />
          ) : (
            <div className="space-y-4">
              {dayEvents.length === 0 ? (
                <div className="py-12 text-center text-gray-400">
                  <div className="text-4xl mb-4">✨</div>
                  <p className="font-medium">今天没有课程安排</p>
                  <p className="text-sm mt-1 opacity-70">点击下方按钮添加</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-gray-400 font-medium mb-2 uppercase tracking-wider text-center">双击课程可复制</p>
                  {dayEvents.map(ev => (
                    <div 
                      key={ev.id}
                      onClick={(e) => handleCardClick(e, ev)}
                      className="flex items-center gap-3 p-4 rounded-2xl cursor-pointer hover:shadow-md transition-all group border border-transparent hover:border-gray-100 dark:hover:border-gray-700 relative"
                      style={{ backgroundColor: ev.color + '15' }}
                    >
                      <div className="w-1.5 h-12 rounded-full hidden md:block" style={{ backgroundColor: ev.color }}></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-gray-900 dark:text-white truncate text-lg" style={{ color: ev.color }}>{ev.title}</h4>
                        </div>
                        <p className="text-sm font-semibold opacity-70 flex items-center gap-2" style={{ color: ev.color }}>
                          <span>{ev.startTime} - {ev.endTime}</span>
                          {ev.location && (
                            <>
                              <span className="w-1 h-1 rounded-full opacity-50" style={{ backgroundColor: ev.color }}></span>
                              <span className="truncate">{ev.location}</span>
                            </>
                          )}
                        </p>
                      </div>
                      
                      {copiedId === ev.id && (
                        <div className="absolute inset-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl flex items-center justify-center font-bold text-blue-600 dark:text-blue-400 gap-2 animate-in fade-in zoom-in duration-200">
                          <Check className="w-5 h-5" /> 已复制
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex gap-3 mt-4">
                <button 
                  onClick={() => setEditingEvent({ date: dateStr, color: COLORS[0], startTime: '09:00', endTime: '10:00' })}
                  className="flex-1 py-4 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl text-gray-500 font-bold hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" /> 添加新课程
                </button>
                {copiedEvent && (
                  <button 
                    onClick={handlePaste}
                    className="flex-1 py-4 border-2 border-dashed border-blue-200 dark:border-blue-800 rounded-2xl text-blue-500 font-bold hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all flex flex-col items-center justify-center px-2"
                    title={`粘贴: ${copiedEvent.title}`}
                  >
                    <div className="flex items-center gap-1">
                      <ClipboardPaste className="w-4 h-4" />
                      <span>一键粘贴</span>
                    </div>
                    <span className="text-xs font-medium opacity-80 mt-1 truncate w-full text-center">
                      {copiedEvent.title}
                    </span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EventForm({ event, dateStr, onSave, onCancel, onDelete }: any) {
  const [title, setTitle] = useState(event.title || '');
  const [location, setLocation] = useState(event.location || '');
  const [startTime, setStartTime] = useState(event.startTime);
  const [endTime, setEndTime] = useState(event.endTime);
  const [color, setColor] = useState(event.color);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({ ...event, title, location, startTime, endTime, color, date: dateStr });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-in slide-in-from-right-4 duration-300">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-xl font-black text-gray-800 dark:text-white">
          {event.id ? '编辑课程' : '新增课程'}
        </h4>
        {onDelete && (
          <button type="button" onClick={onDelete} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full transition-colors">
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* Title */}
        <div className="flex gap-3">
          <div className="flex-1 space-y-3">
            <input 
              type="text" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              placeholder="课程名称 (例如: 钢琴课)"
              className="w-full h-14 bg-gray-100 dark:bg-gray-800 border-none rounded-2xl px-4 font-bold text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
              autoFocus
              required
            />
            <input 
              type="text" 
              value={location} 
              onChange={e => setLocation(e.target.value)} 
              placeholder="上课地点 (选填)"
              className="w-full h-12 bg-gray-100 dark:bg-gray-800 border-none rounded-xl px-4 font-medium text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Time */}
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">开始时间</label>
            <input 
              type="time" 
              value={startTime} 
              onChange={e => setStartTime(e.target.value)} 
              className="w-full bg-gray-100 dark:bg-gray-800 border-none rounded-xl px-4 py-3 font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">结束时间</label>
            <input 
              type="time" 
              value={endTime} 
              onChange={e => setEndTime(e.target.value)} 
              className="w-full bg-gray-100 dark:bg-gray-800 border-none rounded-xl px-4 py-3 font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        {/* Colors */}
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-2 ml-1">主题颜色</label>
          <div className="flex flex-wrap gap-3 mt-1">
            {COLORS.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110 ${color === c ? 'ring-4 ring-offset-2 ring-gray-200 dark:ring-offset-gray-900 dark:ring-gray-700 scale-110' : ''}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button type="button" onClick={onCancel} className="flex-1 py-3.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition">
          取消
        </button>
        <button type="submit" disabled={!title.trim()} className="flex-1 py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
          保存课程
        </button>
      </div>
    </form>
  );
}
