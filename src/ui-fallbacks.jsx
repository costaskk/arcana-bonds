export const Button = ({ children, variant="default", size="base", className="", ...props }) => {
  const v = variant === "secondary" ? "border bg-white/70 hover:bg-white" :
            variant === "destructive" ? "bg-rose-600 text-white hover:bg-rose-700" :
            "bg-slate-900 text-white hover:bg-slate-800"
  const s = size === "sm" ? "text-sm px-2 py-1" : "px-3 py-2"
  return <button className={`rounded-xl ${v} ${s} transition ${className}`} {...props}>{children}</button>
}
export const Card = ({ className="", children }) =>
  <div className={`rounded-2xl border bg-white/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 ${className}`}>{children}</div>
export const CardHeader = ({ children }) => <div className="p-4 border-b border-slate-200 dark:border-slate-800">{children}</div>
export const CardTitle = ({ children, className="" }) => <div className={`text-lg font-semibold ${className}`}>{children}</div>
export const CardContent = ({ children, className="" }) => <div className={`p-4 ${className}`}>{children}</div>
export const Badge = ({ children, className="" }) => <span className={`px-2 py-0.5 rounded-full text-xs bg-slate-900/5 dark:bg-white/10 ${className}`}>{children}</span>

export const Tabs = ({ value, onValueChange, children }) => <div data-value={value}>{children}</div>
export const TabsList = ({ children, className="" }) => <div className={`mt-2 ${className}`}>{children}</div>
export const TabsTrigger = ({ value, children, onClick }) =>
  <button onClick={() => onClick ? onClick() : null}
    className="px-3 py-2 text-sm rounded-xl border mr-1 mb-1 hover:bg-slate-100 dark:hover:bg-slate-800">{children}</button>
export const TabsContent = ({ value, children, className="" }) => <div className={className}>{children}</div>

export const Progress = ({ value=0 }) =>
  <div className="h-2 rounded bg-slate-200 dark:bg-slate-800">
    <div className="h-2 bg-emerald-500 rounded" style={{width:`${value}%`}}/>
  </div>

export const Input = (props) => <input {...props} className={`px-3 py-2 rounded-xl border bg-white/70 dark:bg-slate-900/40 ${props.className||""}`}/>
