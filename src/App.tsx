import React, { useState, useMemo, useCallback, memo, useRef } from 'react';
import { 
  Calculator, Briefcase, HelpCircle, Plus, Trash2,
  BookOpen, UserCheck, Upload, Save, Download,
  Megaphone, Info, AlertCircle, ShieldAlert, KeyRound,
  LayoutGrid, Copy
} from 'lucide-react';

// --- 型定義 (TypeScriptエラー防止) ---
declare global {
  interface Window { jspdf: any; }
}

interface DynamicItem {
  id: number;
  text: string;
}

interface CalendarItem {
  id: number;
  nama: string;
  monthly: number[];
}

interface BusinessData {
  namaPemagang: string;
  namaBisnis: string;
  jenisKomoditas: string;
  lokasiBisnis: string;
  linkMaps: string;
  ringkasan: string;
  latarBelakang: string;
  visiMisi: string;
  sumberDana: string;
  investasiAset: string;
  pemasaran: DynamicItem[];
  sumberInfo: DynamicItem[];
  hambatan: DynamicItem[];
  risikoBisnis: DynamicItem[];
  kunciSukses: DynamicItem[];
  calendar_income: CalendarItem[];
  calendar_expense: CalendarItem[];
}

// デザイン済み入力コンポーネント
const TooltipInput = memo(({ label, value, onChange, placeholder, explanation, multiline = false, numeric = false }: any) => (
  <div className="mb-4 group">
    <div className="flex items-center gap-2 mb-1.5">
      <label className="text-[11px] font-black text-slate-700 uppercase tracking-widest">{label}</label>
      {explanation && (
        <div className="relative group/tooltip no-print">
          <HelpCircle size={14} className="text-slate-300 hover:text-slate-500 cursor-help transition-colors" />
        </div>
      )}
    </div>
    {multiline ? (
      <textarea
        className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:border-slate-400 focus:ring-4 focus:ring-slate-50 transition-all text-sm outline-none resize-none shadow-sm font-medium text-slate-900"
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    ) : (
      <div className="relative">
        <input
          type={numeric ? "number" : "text"}
          className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:border-slate-400 focus:ring-4 focus:ring-slate-50 transition-all text-sm font-bold outline-none shadow-sm text-slate-900"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      </div>
    )}
  </div>
));

/**
 * ダイナミックリストコンポーネント
 */
const DynamicList = ({ title, icon: IconComp, items, onAdd, onRemove, onChange, colorClass, placeholder, btnColor }: any) => (
  <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 mb-4 shadow-sm">
    <div className="flex justify-between items-center mb-4">
      <div className={`flex items-center gap-2.5 ${colorClass}`}>
        <IconComp size={16} />
        <h4 className="font-black text-[10px] uppercase tracking-widest">{title}</h4>
      </div>
      <button onClick={onAdd} className={`p-1 rounded-lg text-white ${btnColor} active:scale-90 shadow-sm no-print`}>
        <Plus size={14} />
      </button>
    </div>
    <div className="space-y-2">
      {items.map((item: any, idx: number) => (
        <div key={item.id} className="flex gap-2 items-center">
          <span className="text-[9px] font-black text-slate-300 w-3">{idx + 1}</span>
          <input 
            className="flex-1 p-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-slate-400 shadow-sm"
            value={item.text}
            onChange={(e) => onChange(item.id, e.target.value)}
            placeholder={placeholder}
          />
          <button onClick={() => onRemove(item.id)} className="text-slate-300 hover:text-rose-500 p-1.5 no-print">
            <Trash2 size={16} />
          </button>
        </div>
      ))}
    </div>
  </div>
);

export default function App() {
  const [activeTab, setActiveTab] = useState('profile');
  const fileInputRef = useRef<HTMLInputElement>(null);

const [businessData, setBusinessData] = useState<BusinessData>({
    namaPemagang: '', 
    namaBisnis: '', 
    jenisKomoditas: '', 
    lokasiBisnis: '', 
    linkMaps: '', 
    ringkasan: '', 
    latarBelakang: '', 
    visiMisi: '',
    sumberDana: '', 
    investasiAset: '', 
    pemasaran: [{ id: 1, text: '' }], 
    sumberInfo: [{ id: 1, text: '' }], 
    hambatan: [{ id: 1, text: '' }], 
    risikoBisnis: [{ id: 1, text: '' }], 
    kunciSukses: [{ id: 1, text: '' }],
    calendar_income: [{ id: 1, nama: 'Produk A', monthly: Array(12).fill(0) }],
    calendar_expense: [{ id: 1, nama: 'Biaya Ops', monthly: Array(12).fill(0) }]
  });

  // --- 統計計算 ---
  const monthlyStats = useMemo(() => {
    return Array(12).fill(0).map((_, i) => {
      const inc = businessData.calendar_income.reduce((a, c) => a + (Number(c.monthly?.[i]) || 0), 0);
      const exp = businessData.calendar_expense.reduce((a, c) => a + (Number(c.monthly?.[i]) || 0), 0);
      return { income: inc, expense: exp, profit: inc - exp };
    });
  }, [businessData.calendar_income, businessData.calendar_expense]);

  const totalYearlyIncome = useMemo(() => monthlyStats.reduce((a, c) => a + c.income, 0), [monthlyStats]);
  const totalYearlyExpense = useMemo(() => monthlyStats.reduce((a, c) => a + c.expense, 0), [monthlyStats]);
  const avgProfit = useMemo(() => (totalYearlyIncome - totalYearlyExpense) / 12, [totalYearlyIncome, totalYearlyExpense]);

  // --- ハンドラー ---
  const handleInputChange = (f: keyof BusinessData, v: string) => setBusinessData(p => ({ ...p, [f]: v }));
  
  const addDynamicRow = (type: keyof BusinessData) => {
    if (type === 'calendar_income' || type === 'calendar_expense') {
      // For Calendar sections: need 'nama' and 'monthly' array
      setBusinessData(p => ({ 
        ...p, 
        [type]: [...(p[type] as any[]), { id: Date.now(), nama: '', monthly: Array(12).fill(0) }] 
      }));
    } else {
      // For Strategy sections: need only 'text'
      setBusinessData(p => ({ ...p, [type]: [...(p[type] as any[]), { id: Date.now(), text: '' }] }));
    }
  };

  const removeDynamicRow = (type: keyof BusinessData, id: number) => {
    setBusinessData(p => ({ ...p, [type]: (p[type] as any[]).filter(i => i.id !== id) }));
  };

  const updateDynamicRow = (type: keyof BusinessData, id: number, text: string) => {
    setBusinessData(p => ({ ...p, [type]: (p[type] as any[]).map(i => i.id === id ? { ...i, text } : i) }));
  };

  const repeatFirstMonth = (type: 'calendar_income' | 'calendar_expense', id: number) => {
    setBusinessData(p => ({
      ...p,
      [type]: p[type].map(item => item.id === id ? { ...item, monthly: Array(12).fill(item.monthly[0]) } : item)
    }));
  };

  const formatIDR = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

return (
    <div className="flex flex-col h-screen bg-[#F8FAFC] overflow-hidden">
      {/* Header */}
      <header className="bg-slate-900 border-b px-6 py-4 flex justify-between items-center z-40 shrink-0 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="bg-orange-500 p-2 rounded-xl text-white shadow-lg"><Briefcase size={20} /></div>
          <div>
            <h1 className="text-white font-black text-sm uppercase tracking-tighter">tahap 2</h1>
            <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest">Family Business Planner</p>
          </div>
        </div>
        {/* ← ここにあったボタンの div (flex gap-2) を削除しました */}
      </header>

      {/* Tabs */}
      <div className="bg-white border-b px-6 flex gap-2 shrink-0">
        <button onClick={() => setActiveTab('profile')} className={`flex items-center gap-2 px-6 py-4 text-[10px] font-black transition-all ${activeTab === 'profile' ? 'text-orange-600 border-b-2 border-orange-600' : 'text-slate-400'}`}>
          <BookOpen size={16} /> PROFIL & STRATEGI
        </button>
        <button onClick={() => setActiveTab('finance')} className={`flex items-center gap-2 px-6 py-4 text-[10px] font-black transition-all ${activeTab === 'finance' ? 'text-green-600 border-b-2 border-green-600' : 'text-slate-400'}`}>
          <Calculator size={16} /> KALENDER USAHA
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6 md:p-12 custom-scrollbar bg-slate-50">
        <div className="max-w-5xl mx-auto space-y-8">
          
{activeTab === 'profile' ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
              
{activeTab === 'profile' ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
              
              {/* 1. Reporter Info Section */}
              <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-200">
                <div className="flex items-center gap-3 mb-6">
                  <UserCheck size={20} className="text-slate-400"/>
                  <h2 className="font-black text-xs uppercase tracking-widest text-slate-800">Penyusun Report</h2>
                </div>
                <TooltipInput 
                  label="" 
                  value={businessData.namaPemagang} 
                  onChange={(v: string) => handleInputChange('namaPemagang', v)} 
                  placeholder="Nama Lengkap" 
                />
              </div>

              {/* 2. Business Identity Section */}
              <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-200">
                <div className="flex items-center gap-3 mb-8">
                  <LayoutGrid size={24} className="text-slate-400"/>
                  <h2 className="font-black text-xs uppercase tracking-widest text-slate-800">Identitas Bisnis Keluarga</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                  <TooltipInput 
                    label="Nama Bisnis" 
                    value={businessData.namaBisnis} 
                    onChange={(v: string) => handleInputChange('namaBisnis', v)} 
                    placeholder="Nama bisnis keluarga" 
                  />
                  <TooltipInput 
                    label="Jenis Komoditas" 
                    value={businessData.jenisKomoditas} 
                    onChange={(v: string) => handleInputChange('jenisKomoditas', v)} 
                    placeholder="komoditas" 
                  />
                  <TooltipInput 
                    label="Lokasi Bisnis" 
                    value={businessData.lokasiBisnis} 
                    onChange={(v: string) => handleInputChange('lokasiBisnis', v)} 
                    placeholder="Lokasi bisnis" 
                  />
                  <TooltipInput 
                    label="Link Maps" 
                    value={businessData.linkMaps} 
                    onChange={(v: string) => handleInputChange('linkMaps', v)} 
                    placeholder="Link Google Maps" 
                  />
                </div>
                <TooltipInput 
                  label="Visi & Misi" 
                  value={businessData.visiMisi} 
                  onChange={(v: string) => handleInputChange('visiMisi', v)} 
                  multiline 
                  placeholder="visi dan misi" 
                />
              </div>

              {/* 3. Strategy Section */}
              <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl border border-orange-100 border-t-8 border-t-orange-500">
                <div className="flex items-center gap-3 mb-8 text-orange-600"><LayoutGrid size={24} /><h2 className="font-black text-xs uppercase tracking-widest">Strategi & Keberhasilan</h2></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DynamicList title="Pemasaran" icon={Megaphone} items={businessData.pemasaran} onAdd={() => addDynamicRow('pemasaran')} onRemove={(id: number) => removeDynamicRow('pemasaran', id)} onChange={(id: number, t: string) => updateDynamicRow('pemasaran', id, t)} colorClass="text-blue-600" btnColor="bg-blue-600" placeholder="contoh: " />
                  <DynamicList title="Hambatan" icon={AlertCircle} items={businessData.hambatan} onAdd={() => addDynamicRow('hambatan')} onRemove={(id: number) => removeDynamicRow('hambatan', id)} onChange={(id: number, t: string) => updateDynamicRow('hambatan', id, t)} colorClass="text-rose-600" btnColor="bg-rose-600" placeholder="contoh: " />
                </div>
                <div className="mt-6">
                  <DynamicList title="Kunci Sukses" icon={KeyRound} items={businessData.kunciSukses} onAdd={() => addDynamicRow('kunciSukses')} onRemove={(id: number) => removeDynamicRow('kunciSukses', id)} onChange={(id: number, t: string) => updateDynamicRow('kunciSukses', id, t)} colorClass="text-orange-600" btnColor="bg-orange-600" placeholder="contoh: " />
                </div>
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
              {/* Financial Stats Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-slate-900 p-8 rounded-[2rem] text-white shadow-2xl relative overflow-hidden">
                  <div className="absolute right-[-10%] top-[-10%] text-white/5 rotate-12"><Calculator size={120} /></div>
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Avg Income / Month</span>
                  <div className="text-3xl font-mono font-black mt-2 text-emerald-400">{formatIDR(totalYearlyIncome/12)}</div>
                </div>
                <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Avg Profit / Month</span>
                  <div className={`text-3xl font-mono font-black mt-2 ${avgProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{formatIDR(avgProfit)}</div>
                </div>
              </div>

              {/* Monthly Business Calendar Table */}
              <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1000px] border-separate border-spacing-0">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="p-4 text-left text-[10px] font-black text-slate-500 uppercase border-b sticky left-0 bg-slate-50 z-10">Item Description</th>
                        <th className="p-4 text-center text-[10px] font-black text-slate-500 uppercase border-b bg-slate-100/50">Avg</th>
                        {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => <th key={m} className="p-4 text-center text-[10px] font-black text-slate-500 uppercase border-b">{m}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {/* --- Income Section --- */}
                      <tr className="bg-emerald-50/30">
                        <td className="p-2 border-b font-black text-[9px] text-emerald-700 uppercase px-4" colSpan={14}>Income (Pendapatan)</td>
                      </tr>
                      {businessData.calendar_income.map((item, idx) => (
                        <tr key={item.id} className="group hover:bg-slate-50 transition-colors">
                          <td className="p-3 border-b sticky left-0 bg-white group-hover:bg-slate-50 z-10 flex items-center gap-2 min-w-[200px]">
                            <button onClick={() => setBusinessData(p => ({...p, calendar_income: p.calendar_income.filter(i => i.id !== item.id)}))} className="text-slate-300 hover:text-rose-500"><Trash2 size={14}/></button>
                            <input className="w-full bg-transparent font-bold text-xs outline-none" value={item.nama} onChange={e => {
                              const newList = [...businessData.calendar_income];
                              newList[idx].nama = e.target.value;
                              setBusinessData(p => ({...p, calendar_income: newList}));
                            }} />
                          </td>
                          <td className="p-3 border-b bg-slate-50 font-mono text-[10px] font-bold text-right text-emerald-600">{(item.monthly.reduce((a,b)=>a+b,0)/12).toLocaleString()}</td>
                          {item.monthly.map((val, mIdx) => (
                            <td key={mIdx} className="p-2 border-b">
                              <input type="number" className="w-full h-8 px-2 text-right font-mono text-[11px] font-bold bg-white border border-slate-100 rounded focus:ring-2 focus:ring-emerald-100 outline-none" value={val} onChange={e => {
                                const newList = [...businessData.calendar_income];
                                newList[idx].monthly[mIdx] = Number(e.target.value);
                                setBusinessData(p => ({...p, calendar_income: newList}));
                              }} />
                            </td>
                          ))}
                        </tr>
                      ))}
                      <tr>
                        <td colSpan={14} className="p-2 border-b text-center">
                          <button onClick={() => addDynamicRow('calendar_income')} className="text-[9px] font-black text-slate-400 hover:text-emerald-500 px-4 uppercase tracking-widest">+ Add Income Item</button>
                        </td>
                      </tr>

                      {/* --- Expense Section (Biaya Bisnis) --- */}
                      <tr className="bg-rose-50/30">
                        <td className="p-2 border-b font-black text-[9px] text-rose-700 uppercase px-4" colSpan={14}>Biaya Bisnis (Expense)</td>
                      </tr>
                      {businessData.calendar_expense.map((item, idx) => (
                        <tr key={item.id} className="group hover:bg-slate-50 transition-colors">
                          <td className="p-3 border-b sticky left-0 bg-white group-hover:bg-slate-50 z-10 flex items-center gap-2 min-w-[200px]">
                            <button onClick={() => setBusinessData(p => ({...p, calendar_expense: p.calendar_expense.filter(i => i.id !== item.id)}))} className="text-slate-300 hover:text-rose-500"><Trash2 size={14}/></button>
                            <input className="w-full bg-transparent font-bold text-xs outline-none" value={item.nama} onChange={e => {
                              const newList = [...businessData.calendar_expense];
                              newList[idx].nama = e.target.value;
                              setBusinessData(p => ({...p, calendar_expense: newList}));
                            }} />
                          </td>
                          <td className="p-3 border-b bg-slate-50 font-mono text-[10px] font-bold text-right text-rose-600">{(item.monthly.reduce((a,b)=>a+b,0)/12).toLocaleString()}</td>
                          {item.monthly.map((val, mIdx) => (
                            <td key={mIdx} className="p-2 border-b">
                              <input type="number" className="w-full h-8 px-2 text-right font-mono text-[11px] font-bold bg-white border border-slate-100 rounded focus:ring-2 focus:ring-rose-100 outline-none" value={val} onChange={e => {
                                const newList = [...businessData.calendar_expense];
                                newList[idx].monthly[mIdx] = Number(e.target.value);
                                setBusinessData(p => ({...p, calendar_expense: newList}));
                              }} />
                            </td>
                          ))}
                        </tr>
                      ))}
                      <tr>
                        <td colSpan={14} className="p-2 border-b text-center">
                          <button onClick={() => addDynamicRow('calendar_expense')} className="text-[9px] font-black text-slate-400 hover:text-rose-500 px-4 uppercase tracking-widest">+ Add Expense Item</button>
                        </td>
                      </tr>
                      
                      {/* --- Net Profit Calculation Row --- */}
                      <tr className="bg-slate-900 text-white shadow-2xl">
                        <td className="p-4 font-black text-[10px] uppercase tracking-widest sticky left-0 bg-slate-900 z-10">Net Profit (Laba Bersih)</td>
                        <td className="p-4 text-right font-mono font-black text-emerald-400 bg-slate-800">{Math.round(avgProfit).toLocaleString()}</td>
                        {monthlyStats.map((s, i) => (
                          <td key={i} className={`p-4 text-right font-mono font-black text-[11px] ${s.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {s.profit.toLocaleString()}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
      `}} />
    </div>
  );
}
