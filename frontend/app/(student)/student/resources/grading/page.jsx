'use client';
import { 
  FileText, ArrowLeft, Download, Printer, 
  CheckCircle2, Info, GraduationCap, BarChart3,
  Award, Target, ClipboardCheck
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function GradingRubric() {
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
              Grading Rubric
            </h1>
            <p className="text-muted font-medium text-sm">Evaluation guidelines and marks distribution system</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary h-11 gap-2 shadow-sm rounded-xl">
            <Printer className="w-4 h-4" /> Print
          </button>
          <button className="btn-primary h-11 gap-2 shadow-xl shadow-blue-500/20 rounded-xl">
            <Download className="w-4 h-4" /> PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Internal Assessment */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card border-none shadow-xl shadow-slate-200/50 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            
            <div className="flex items-center gap-3 mb-8 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <ClipboardCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-display font-bold text-primary-900">Internal Assessment</h2>
                <p className="text-xs text-muted font-medium tracking-wide">Continuous Evaluation System (50 Marks Total)</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
              {[
                { label: 'Attendance', marks: 10, icon: CheckCircle2, desc: '90% above = 10 marks, 75-89% = 7 marks', color: 'blue' },
                { label: 'Assignments', marks: 10, icon: FileText, desc: 'Average of best 3 out of 5 assignments', color: 'indigo' },
                { label: 'Mid-Sem Exam', marks: 30, icon: Target, desc: 'Centralized written examination', color: 'violet' },
              ].map((item) => (
                <div key={item.label} className="p-5 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-blue-200 hover:bg-blue-50/50 transition-all duration-300">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-500",
                    item.color === 'blue' ? "bg-blue-100 text-blue-600" :
                    item.color === 'indigo' ? "bg-indigo-100 text-indigo-600" :
                    "bg-purple-100 text-purple-600"
                  )}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-primary-900 mb-1">{item.label}</h4>
                  <p className="text-3xl font-display font-bold text-slate-800 mb-2">{item.marks} <span className="text-sm font-medium text-slate-400">marks</span></p>
                  <p className="text-[10px] text-muted font-bold leading-relaxed tracking-wider uppercase">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card border-none shadow-xl shadow-slate-200/50 bg-gradient-to-br from-blue-600 to-indigo-700 text-white relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-1000" />
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
               <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-blue-200 backdrop-blur-md">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-display font-bold">End Semester Examination</h2>
                  </div>
                  <p className="text-blue-100 text-sm max-w-sm">
                    Final summative assessment covering the entire syllabus. Minimum 40% marks required for passing.
                  </p>
               </div>
               <div className="flex items-baseline gap-2">
                 <span className="text-6xl font-display font-bold">50</span>
                 <span className="text-xl font-bold text-blue-200">MARKS</span>
               </div>
             </div>
          </div>
        </div>

        {/* Grade Scale */}
        <div className="card border-none shadow-xl shadow-slate-200/50 p-0 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-primary-900">Grade Scale (10 Points)</h3>
          </div>
          
          <div className="p-2">
            {[
              { grade: 'O', range: '90 - 100', label: 'Outstanding', color: 'bg-green-500' },
              { grade: 'A+', range: '80 - 89', label: 'Excellent', color: 'bg-green-400' },
              { grade: 'A', range: '70 - 79', label: 'Very Good', color: 'bg-blue-400' },
              { grade: 'B+', range: '60 - 69', label: 'Good', color: 'bg-blue-300' },
              { grade: 'B', range: '50 - 59', label: 'Above Average', color: 'bg-yellow-400' },
              { grade: 'C', range: '40 - 49', label: 'Average', color: 'bg-orange-400' },
              { grade: 'F', range: 'Below 40', label: 'Fail', color: 'bg-red-500' },
            ].map((item) => (
              <div key={item.grade} className="flex items-center justify-between p-3.5 hover:bg-slate-50 rounded-xl transition-colors group">
                <div className="flex items-center gap-4">
                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center text-white font-display font-bold text-lg shadow-sm group-hover:scale-110 transition-transform duration-300", item.color)}>
                    {item.grade}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-primary-900 leading-tight">{item.label}</p>
                    <p className="text-[10px] font-bold text-muted uppercase tracking-widest">{item.range} %</p>
                  </div>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover:bg-blue-400 transition-colors" />
              </div>
            ))}
          </div>

          <div className="p-5 bg-slate-50 border-t border-slate-100">
            <div className="flex items-center gap-2 text-[10px] font-bold text-muted uppercase tracking-widest">
              <Info className="w-3.5 h-3.5 text-blue-500" /> CGPA Calculation
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5 font-medium leading-relaxed">
              CGPA is the weighted average of Grade Points obtained in all courses in all semesters.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
