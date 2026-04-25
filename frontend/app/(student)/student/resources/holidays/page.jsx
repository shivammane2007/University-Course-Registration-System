'use client';
import { useState } from 'react';
import { 
  Calendar, Search, PartyPopper, ArrowLeft, 
  ChevronRight, CalendarDays, Filter, Star,
  Bell, Clock, Download
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const holidays = [
  { id: 1, title: 'Republic Day', date: '2026-01-26', month: 'January', type: 'Public' },
  { id: 2, title: 'Holi Festival', date: '2026-03-14', month: 'March', type: 'Public' },
  { id: 3, title: 'Gudi Padwa', date: '2026-03-29', month: 'March', type: 'Regional' },
  { id: 4, title: 'Ambedkar Jayanti', date: '2026-04-14', month: 'April', type: 'Public' },
  { id: 5, title: 'Eid-ul-Fitr', date: '2026-04-20', month: 'April', type: 'Gazetted' },
  { id: 6, title: 'Independence Day', date: '2026-08-15', month: 'August', type: 'Public' },
  { id: 7, title: 'Ganesh Chaturthi', date: '2026-08-27', month: 'August', type: 'Regional' },
  { id: 8, title: 'Gandhi Jayanti', date: '2026-10-02', month: 'October', type: 'Public' },
  { id: 9, title: 'Dussehra', date: '2026-10-21', month: 'October', type: 'Public' },
  { id: 10, title: 'Diwali Break', date: '2026-11-05', month: 'November', type: 'Vacation' },
  { id: 11, title: 'Christmas', date: '2026-12-25', month: 'December', type: 'Public' },
];

const months = ['All', 'January', 'March', 'April', 'August', 'October', 'November', 'December'];

export default function HolidayCalendar() {
  const [search, setSearch] = useState('');
  const [activeMonth, setActiveMonth] = useState('All');

  const filtered = holidays.filter(h => {
    const matchesSearch = h.title.toLowerCase().includes(search.toLowerCase());
    const matchesMonth = activeMonth === 'All' || h.month === activeMonth;
    return matchesSearch && matchesMonth;
  });

  const upcomingHoliday = holidays.find(h => new Date(h.date) >= new Date()) || holidays[0];

  return (
    <div className="animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-5">
          <Link href="/student/dashboard" className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm group">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </Link>
          <div>
            <h1 className="text-3xl font-display font-bold text-primary-900 leading-none mb-1.5 tracking-tight">
              Holiday Calendar
            </h1>
            <p className="text-muted font-medium text-sm">University holidays and events for the academic year</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Calendar View */}
        <div className="lg:col-span-2 space-y-8">
          {/* Filters */}
          <div className="card border-none shadow-xl shadow-slate-200/50 p-4 sm:p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-accent transition-colors" />
                <input
                  type="text"
                  placeholder="Search holiday..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="form-input pl-11 h-12 shadow-none border-slate-100 focus:border-blue-200 bg-slate-50/50"
                />
              </div>
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2 md:pb-0">
                {months.map((m) => (
                  <button
                    key={m}
                    onClick={() => setActiveMonth(m)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap border",
                      activeMonth === m 
                        ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/25" 
                        : "bg-white text-slate-500 border-slate-200 hover:border-blue-200 hover:text-blue-600"
                    )}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Grouped Holidays */}
          <div className="space-y-6">
            {filtered.length === 0 ? (
              <div className="card h-60 border-none shadow-xl shadow-slate-200/50 flex flex-col items-center justify-center text-center">
                 <p className="text-slate-400 font-medium">No holidays found for selected filters</p>
              </div>
            ) : (
              months.filter(m => m !== 'All' && (activeMonth === 'All' || activeMonth === m)).map(month => {
                const monthHolidays = filtered.filter(h => h.month === month);
                if (monthHolidays.length === 0) return null;

                return (
                  <div key={month} className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                      <div className="w-6 h-[1px] bg-slate-200" /> {month}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {monthHolidays.map((h) => (
                        <div key={h.id} className="card group hover:shadow-2xl hover:shadow-blue-500/10 border-slate-100/50 transition-all duration-500 p-5 flex items-center gap-5">
                          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex flex-col items-center justify-center text-blue-600 font-display group-hover:bg-blue-600 group-hover:text-white transition-colors duration-500">
                            <span className="text-lg font-bold leading-none">{new Date(h.date).getDate()}</span>
                            <span className="text-[8px] font-bold uppercase tracking-tighter">{month.substring(0, 3)}</span>
                          </div>
                          <div>
                            <h4 className="font-bold text-primary-900 group-hover:text-blue-600 transition-colors">{h.title}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={cn(
                                "text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-widest",
                                h.type === 'Public' ? "bg-green-50 text-green-600 border-green-100" :
                                h.type === 'Vacation' ? "bg-purple-50 text-purple-600 border-purple-100" :
                                "bg-slate-50 text-slate-500 border-slate-100"
                              )}>
                                {h.type}
                              </span>
                              <span className="text-[10px] text-muted font-medium italic">
                                {new Date(h.date).toLocaleDateString('en-US', { weekday: 'long' })}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Highlight */}
          <div className="card bg-gradient-to-br from-indigo-600 to-blue-700 text-white border-none shadow-xl shadow-blue-500/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform duration-700" />
            
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-blue-200 backdrop-blur-md">
                <Bell className="w-5 h-5 animate-float" />
              </div>
              <h4 className="font-bold tracking-wide">Next Holiday Alert</h4>
            </div>

            <div className="relative z-10">
              <p className="text-blue-100 text-[10px] font-bold uppercase tracking-widest mb-1.5 opacity-80">Happening Soon</p>
              <h3 className="text-3xl font-display font-bold leading-tight mb-4">{upcomingHoliday.title}</h3>
              <div className="flex items-center gap-4 text-xs font-bold">
                 <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-lg">
                    <Calendar className="w-3.5 h-3.5" /> {new Date(upcomingHoliday.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short' })}
                 </div>
                 <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-lg">
                    <Clock className="w-3.5 h-3.5" /> 2 Days left
                 </div>
              </div>
            </div>
          </div>

          <div className="card border-none shadow-xl shadow-slate-200/50">
            <h4 className="font-bold mb-4 text-primary-900 flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500" /> Important Note
            </h4>
            <p className="text-xs text-muted leading-relaxed font-medium">
              Academic holidays are subject to change based on government directives and university administration decisions. Students are advised to check official notifications regularly.
            </p>
            <div className="mt-6 pt-6 border-t border-slate-100">
               <button className="w-full btn-secondary h-11 rounded-xl text-xs gap-2">
                 <Download className="w-4 h-4" /> Download PDF Calendar
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
