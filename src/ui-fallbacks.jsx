import React, { createContext, useContext } from "react";

// ----- Buttons -----
export function Button({ children, variant = "default", size = "md", className = "", ...props }) {
  const variants = {
    default: "bg-indigo-600 hover:bg-indigo-700 text-white",
    secondary: "bg-slate-200 hover:bg-slate-300 text-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100",
    destructive: "bg-rose-600 hover:bg-rose-700 text-white",
    ghost: "bg-transparent hover:bg-slate-200/60 dark:hover:bg-slate-800/60 text-inherit",
  };
  const sizes = {
    sm: "px-3 py-1.5 text-sm rounded-lg",
    md: "px-4 py-2 text-sm rounded-xl",
    lg: "px-5 py-3 text-base rounded-2xl",
  };
  return (
    <button
      className={`transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

// ----- Cards -----
export function Card({ className = "", children }) {
  return <div className={`rounded-2xl border bg-white/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 shadow-sm ${className}`}>{children}</div>;
}
export function CardHeader({ children, className = "" }) {
  return <div className={`px-4 pt-4 ${className}`}>{children}</div>;
}
export function CardTitle({ children, className = "" }) {
  return <div className={`text-lg font-semibold ${className}`}>{children}</div>;
}
export function CardContent({ children, className = "" }) {
  return <div className={`px-4 pb-4 ${className}`}>{children}</div>;
}

// ----- Tabs -----
const TabsCtx = createContext({ value: "home", onChange: () => {} });

export function Tabs({ value, onValueChange, children, className = "" }) {
  return (
    <TabsCtx.Provider value={{ value, onChange: onValueChange }}>
      <div className={className}>{children}</div>
    </TabsCtx.Provider>
  );
}
export function TabsList({ children, className = "" }) {
  return (
    <div className={`rounded-2xl bg-white/60 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-1 ${className}`}>
      {children}
    </div>
  );
}
export function TabsTrigger({ value, children, className = "", ...props }) {
  const { value: active, onChange } = useContext(TabsCtx);
  const isActive = active === value;
  return (
    <button
      onClick={() => onChange?.(value)}
      className={`text-sm w-full px-3 py-2 rounded-xl transition-colors
        ${isActive ? "bg-indigo-600 text-white" : "hover:bg-slate-200/60 dark:hover:bg-slate-800/60" } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
export function TabsContent({ value, children, className = "" }) {
  const { value: active } = useContext(TabsCtx);
  if (active !== value) return null;
  return <div className={className}>{children}</div>;
}

// ----- Simple Inputs (if you need them later) -----
export function Input({ className = "", ...props }) {
  return (
    <input
      className={`px-3 py-2 rounded-xl bg-white/70 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 outline-none focus:ring-2 focus:ring-indigo-400 ${className}`}
      {...props}
    />
  );
}
export function Badge({ children, className = "" }) {
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-slate-900/5 dark:bg-white/10 ${className}`}>{children}</span>;
}
export function Progress({ value = 0, className = "" }) {
  return (
    <div className={`h-3 rounded-xl bg-slate-200 dark:bg-slate-800 overflow-hidden ${className}`}>
      <div className="h-3 bg-emerald-500" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}
