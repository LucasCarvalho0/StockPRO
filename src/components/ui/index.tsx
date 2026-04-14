'use client';
import { cn } from '@/lib/utils';
import * as Lucide from 'lucide-react';
import { forwardRef, InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

// Button Premium
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost' | 'outline' | 'premium';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
}
export function Button({ variant = 'secondary', size = 'md', loading, children, className, disabled, ...props }: ButtonProps) {
  const v = { 
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 active:scale-95', 
    secondary: 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm', 
    danger: 'bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-600 hover:text-white transition-all duration-300', 
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-600 hover:text-white', 
    ghost: 'text-slate-500 hover:bg-slate-100 hover:text-slate-800', 
    outline: 'bg-transparent border-2 border-slate-200 text-slate-600 hover:border-indigo-600 hover:text-indigo-600',
    premium: 'bg-gradient-to-br from-indigo-600 to-violet-700 text-white shadow-xl shadow-indigo-200/50 hover:shadow-indigo-300/60 hover:-translate-y-0.5 active:translate-y-0'
  };
  const s = { 
    sm: 'px-3 py-1.5 text-xs rounded-xl', 
    md: 'px-5 py-2.5 text-sm rounded-2xl', 
    lg: 'px-8 py-3.5 text-sm font-bold rounded-[1.25rem]',
    xl: 'px-10 py-5 text-base font-black rounded-[1.5rem]'
  };
  return (
    <button className={cn('inline-flex items-center justify-center gap-2.5 font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed select-none', v[variant], s[size], className)} disabled={disabled || loading} {...props}>
      {loading && <Lucide.Loader2 size={16} className="animate-spin" />}{children}
    </button>
  );
}

// Badge Modern
interface BadgeProps { variant?: 'default' | 'red' | 'green' | 'amber' | 'blue' | 'gray' | 'glass'; children: React.ReactNode; className?: string; }
export function Badge({ variant = 'default', children, className }: BadgeProps) {
  const v = { 
    default: 'bg-slate-100 text-slate-600 border-slate-200', 
    red: 'bg-rose-50 text-rose-700 border-rose-100 shadow-sm shadow-rose-100/50', 
    green: 'bg-emerald-50 text-emerald-700 border-emerald-100 shadow-sm shadow-emerald-100/50', 
    amber: 'bg-amber-50 text-amber-700 border-amber-100', 
    blue: 'bg-indigo-50 text-indigo-700 border-indigo-100 shadow-sm shadow-indigo-100/50', 
    gray: 'bg-slate-50 text-slate-500 border-slate-200',
    glass: 'bg-white/40 backdrop-blur-md border border-white/20 text-slate-800 shadow-sm'
  };
  return <span className={cn('inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold rounded-full border uppercase tracking-wider font-mono-custom', v[variant], className)}>{children}</span>;
}

// Card Glass
export function Card({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('bg-white border border-slate-100 rounded-[2rem] shadow-xl shadow-slate-200/40 relative overflow-hidden', className)} {...props}>{children}</div>;
}
export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('flex items-center justify-between px-8 py-6 border-b border-slate-50 bg-slate-50/30', className)}>{children}</div>;
}
export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h3 className={cn('text-lg font-bold text-slate-800 tracking-tight font-display', className)}>{children}</h3>;
}

// Input Modern
export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string }>(
  ({ label, error, className, ...props }, ref) => (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">{label}</label>}
      <input ref={ref} className={cn('w-full px-5 py-3.5 text-sm bg-slate-50/50 border-2 border-slate-100 rounded-2xl outline-none transition-all duration-300 text-slate-800 focus:border-indigo-500 focus:bg-white focus:shadow-lg focus:shadow-indigo-500/10 placeholder:text-slate-400 font-medium', error && 'border-rose-400 focus:border-rose-500', className)} {...props} />
      {error && <p className="text-[10px] font-bold text-rose-600 ml-1">{error}</p>}
    </div>
  ),
);
Input.displayName = 'Input';

// Select Modern
export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement> & { label?: string; error?: string }>(
  ({ label, error, className, children, ...props }, ref) => (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">{label}</label>}
      <select ref={ref} className={cn('w-full px-5 py-3.5 text-sm bg-slate-50/50 border-2 border-slate-100 rounded-2xl outline-none transition-all duration-300 text-slate-800 focus:border-indigo-500 focus:bg-white focus:shadow-lg focus:shadow-indigo-500/10 font-medium appearance-none', error && 'border-rose-400 focus:border-rose-500', className)} {...props}>{children}</select>
      {error && <p className="text-[10px] font-bold text-rose-600 ml-1">{error}</p>}
    </div>
  ),
);
Select.displayName = 'Select';

// Textarea Modern
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }>(
  ({ label, className, ...props }, ref) => (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">{label}</label>}
      <textarea ref={ref} className={cn('w-full px-5 py-4 text-sm bg-slate-50/50 border-2 border-slate-100 rounded-2xl outline-none transition-all duration-300 text-slate-800 focus:border-indigo-500 focus:bg-white focus:shadow-lg focus:shadow-indigo-500/10 resize-none font-medium placeholder:text-slate-400', className)} {...props} />
    </div>
  ),
);
Textarea.displayName = 'Textarea';

// Modal Premium
interface ModalProps { open: boolean; onClose: () => void; title: string; children: React.ReactNode; width?: string; }
export function Modal({ open, onClose, title, children, width = 'max-w-md' }: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className={cn('bg-white rounded-[2.5rem] shadow-2xl w-full relative z-10 overflow-hidden animate-in fade-in zoom-in duration-300', width)}>
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-50 bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-900 font-display tracking-tight">{title}</h2>
          <button onClick={onClose} className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-100 transition-all"><Lucide.X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}
export function ModalBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('p-8', className)}>{children}</div>;
}
export function ModalFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("flex justify-end gap-3 px-8 py-6 bg-slate-50/80 border-t border-slate-100 backdrop-blur-sm", className)}>{children}</div>;
}

// StatCard Premium
interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
  valueClass?: string;
  icon?: any;
  footer?: React.ReactNode;
}

export function StatCard({ label, value, sub, accent = '#4f46e5', valueClass, icon: Icon, footer }: StatCardProps) {
  return (
    <div className="group bg-white border border-slate-100 rounded-[2rem] p-6 shadow-xl shadow-slate-200/30 hover:shadow-2xl hover:shadow-indigo-200/40 hover:-translate-y-1.5 transition-all duration-500 relative overflow-hidden flex flex-col justify-between h-full">
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-slate-50 rounded-full transition-all duration-700 group-hover:bg-indigo-50 group-hover:scale-150" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] font-mono-custom">{label}</p>
          {Icon && (
            <div className="w-12 h-12 rounded-[1.25rem] flex items-center justify-center text-white shadow-xl shadow-indigo-200/40 group-hover:rotate-6 transition-transform duration-500" style={{ background: `linear-gradient(135deg, ${accent}, ${accent}dd)` }}>
               <Icon size={22} strokeWidth={2.5} />
            </div>
          )}
        </div>
        
        <div>
          <p className={cn('font-black leading-tight font-display tracking-tight mb-1 text-slate-900', valueClass || 'text-4xl')}>
            {value}
          </p>
          {sub && (
            <div className="flex items-center gap-1.5 mt-1.5">
               <span className="text-[11px] text-slate-500 font-semibold tracking-wide">{sub}</span>
            </div>
          )}
        </div>
      </div>

      {footer && (
        <div className="relative z-10 mt-6 pt-5 border-t border-slate-50 group-hover:border-indigo-100 transition-colors">
          {footer}
        </div>
      )}
    </div>
  );
}

// QtyBar Modern
export function QtyBar({ value, min, max }: { value: number; min: number; max: number }) {
  const pct = Math.min(100, Math.round((value / Math.max(max, 1)) * 100));
  const colors = value <= min 
    ? { bg: 'bg-rose-100', bar: 'bg-rose-500', text: 'text-rose-600' } 
    : value <= min * 1.5 
      ? { bg: 'bg-amber-100', bar: 'bg-amber-500', text: 'text-amber-600' } 
      : { bg: 'bg-emerald-100', bar: 'bg-emerald-500', text: 'text-emerald-600' };

  return (
    <div className="flex items-center gap-3 w-full max-w-[200px]">
      <div className={cn("h-2.5 flex-1 rounded-full overflow-hidden p-0.5", colors.bg)}>
        <div className={cn("h-full rounded-full transition-all duration-700 shadow-sm", colors.bar)} style={{ width: `${pct}%` }} />
      </div>
      <span className={cn("text-xs font-black min-w-[32px] text-right font-mono-custom tracking-tighter", colors.text)}>{value}</span>
    </div>
  );
}

// PageHeader Modern
export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10 pb-6 border-b border-slate-100">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight font-display">{title}</h1>
        {subtitle && <p className="text-sm font-semibold text-slate-400 mt-1.5 tracking-wide italic">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}

// PageLoading Modern
export function PageLoading() {
  return (
    <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
      <div className="relative">
         <Lucide.Loader2 size={48} className="animate-spin text-indigo-600 opacity-20" />
         <Lucide.Loader2 size={48} className="animate-spin text-indigo-600 absolute inset-0 [animation-delay:150ms]" />
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">Sincronizando Sistema</p>
    </div>
  );
}

// InfoBanner Modern
interface InfoBannerProps { type?: 'info' | 'warning' | 'success'; children: React.ReactNode; className?: string; }
export function InfoBanner({ type = 'info', children, className }: InfoBannerProps) {
  const s = { 
    info: 'bg-indigo-50 border-indigo-100 text-indigo-700', 
    warning: 'bg-amber-50 border-amber-100 text-amber-700', 
    success: 'bg-emerald-50 border-emerald-100 text-emerald-700' 
  };
  const icons = { info: Lucide.Info, warning: Lucide.AlertCircle, success: Lucide.CheckCircle2 };
  const Icon = icons[type];

  return (
    <div className={cn('px-6 py-4 rounded-2xl border flex items-start gap-3 shadow-sm', s[type], className)}>
      <Icon size={18} className="mt-0.5 shrink-0" />
      <div className="text-sm font-semibold leading-relaxed">{children}</div>
    </div>
  );
}
