import React, { useState, useMemo, useEffect, memo } from 'react';
import { 
  Calculator, Briefcase, HelpCircle, Plus, Trash2,
  BookOpen, UserCheck, Save, Download,
  Megaphone, AlertCircle, KeyRound,
  LayoutGrid, Copy, TrendingUp, TrendingDown,
  Globe, MapPin, Target
} from 'lucide-react';

/**
 * デザイン済み入力コンポーネント (Tooltip付き)
 */
const TooltipInput = memo(({ label, value, onChange, placeholder, explanation, multiline = false }: any) => (
  <div className="mb-4 group">
    <div className="flex items-center gap-2 mb-1.5">
      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{label}</label>
      {explanation && (
        <HelpCircle size={14} className="text-slate-300 hover:text-slate-500 cursor-help transition-colors" />
      )}
    </div>
    {multiline ? (
      <textarea
        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-orange-400 focus:ring-4 focus:ring-orange-50 transition-all text-sm outline-none resize-none shadow-inner font-medium text-slate-900"
        rows={3}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    ) : (
      <input
        type="text"
        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-orange-400 focus:ring-4 focus:ring-orange-50 transition-all text-sm font-bold outline-none shadow-inner text-slate-900"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    )}
  </div>
));

/**
 * ダイナミックリストコンポーネント
 */
const DynamicList = ({ title, icon: IconComp, items, onAdd, onRemove, onChange, colorClass, placeholder, btnColor }: any) => (
  <div className="bg-white p-6 rounded-[2rem] border border-slate-100 mb-4 shadow-sm">
    <div className="flex justify-between items-center mb-6">
      <div className={`flex items-center gap-2.5 ${colorClass}`}>
        <div className="p-2 bg-current bg-opacity-10 rounded-xl">
          <IconComp size={18} />
        </div>
        <h4 className="font-black text-xs uppercase tracking-widest">{title}</h4>
      </div>
      <button onClick={onAdd} className={`p-1.5 rounded-lg text-white ${btnColor} active:scale-90 shadow-md transition-transform`}>
        <Plus size={16} />
      </button>
    </div>
    <div className="space-y-3">
      {(items || []).map((item: any, idx: number) => (
        <div key={item.id || idx} className="flex gap-3 items-center animate-in slide-in-from-left-2 duration-200">
          <span className="text-[10px] font-black text-slate-300 w-4">{idx + 1}</span>
          <input 
            className="flex-1 p-3 bg-slate-50 border border-transparent rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-slate-300 shadow-inner"
            value={item.text || ''}
            onChange={(e) => onChange(item.id, e.target.value)}
            placeholder={placeholder}
          />
          <button onClick={() => onRemove(item.id)} className="text-slate-300 hover:text-rose-500 p-2 transition-colors">
            <Trash2 size={18} />
          </button>
        </div>
      ))}
      {(!items || items.length === 0) && (
        <p className="text-[10px] text-slate-300 italic text-center py-4">データが入力されていません</p>
      )}
    </div>
  </div>
);

/**
 * メイン App コンポーネント
 */
const App = () => {
  const [activeTab, setActiveTab] = useState('profile');

  // データ初期化 (localStorage から復元)
  const [businessData, setBusinessData] = useState(() => {
    try {
      const saved = localStorage.getItem('family_business_data_v3');
      return saved ? JSON.parse(saved) : {
        namaPemagang: '', namaBisnis: '', jenisKomoditas: '', lokasiBisnis: '', visiMisi: '',
        pemasaran: [{ id: 1, text: '' }],
        hambatan: [{ id: 1, text: '' }],
        kunciSukses: [{ id: 1, text: '' }],
        risikoBisnis: [{ id: 1, text: '' }],
        calendar_income: [{ id: 1, nama: '収益 A', monthly: Array(12).fill(0) }],
        calendar_expense: [{ id: 2, nama: '運営費', monthly: Array(12).fill(0) }]
      };
    } catch (e) {
      return {
        namaPemagang: '', namaBisnis: '', jenisKomoditas: '', lokasiBisnis: '', visiMisi: '',
        pemasaran: [{ id: 1, text: '' }],
        hambatan: [{ id: 1, text: '' }],
        kunciSukses: [{ id: 1, text: '' }],
        risikoBisnis: [{ id: 1, text: '' }],
        calendar_income: [{ id: 1, nama: '収益 A', monthly: Array(12).fill(0) }],
        calendar_expense: [{ id: 2, nama: '運営費', monthly: Array(12).fill(0) }]
      };
    }
  });

  // 自動保存
  useEffect(() => {
    localStorage.setItem('family_business_data_v3', JSON.stringify(businessData));
  }, [businessData]);

  // 統計計算
  const monthlyStats = useMemo(() => {
    return Array(12).fill(0).map((_, i) => {
      const inc = (businessData.calendar_income || []).reduce((a: number, c: any) => a + (Number(c.monthly?.[i]) || 0), 0);
      const exp = (businessData.calendar_expense || []).reduce((a: number, c: any) => a + (Number(c.monthly?.[i]) || 0), 0);
      return { income: inc, expense: exp, profit: inc - exp };
    });
  }, [businessData.calendar_income, businessData.calendar_expense]);

  const totalIncome = monthlyStats.reduce((a, c) => a + c.income, 0);
  const totalExpense = monthlyStats.reduce((a, c) => a + c.expense, 0);
  const avgProfit = (totalIncome - totalExpense) / 12;

  // ハンドラー
  const handleInputChange = (f: string, v: string) => setBusinessData((p: any) => ({ ...p, [f]: v }));
  const addRow = (f: string) => setBusinessData((p: any) => ({ ...p, [f]: [...(p[f] || []), { id: Date.now(), text: '', nama: '', monthly: Array(12).fill(0) }] }));
  const removeRow = (f: string, id: number) => setBusinessData((p: any) => ({ ...p, [f]: (p[f] || []).filter((i: any) => i.id !== id) }));
  const updateRowText = (field: string, id: number, txt: string) => {
    setBusinessData((p: any) => ({
      ...p,
      [field]: p[field].map((i: any) => i.id === id ? { ...i, text: txt } : i)
    }));
  };

  const formatCurrency = (n: number) => {
    return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(n);
  };

  return (
    <div className="flex flex-col h-screen bg-[#F8FAFC] text-slate-900 font-sans">
      <header className="bg-slate-900 border-b px-6 py-4 flex justify-between items-center z-40 shrink-0 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="bg-orange-500 p-2.5 rounded-2xl text-white shadow-lg shadow-orange-500/20">
            <Briefcase size={22} />
          </div>
          <div>
            <h1 className="text-white font-black text-base uppercase tracking-tighter leading-none">Strategy App</h1>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-1.5">Business Research Tool</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden md:inline text-[9px] font-bold text-slate-500 uppercase tracking-widest">
            自動保存有効
          </span>
          <button 
            onClick={() => {localStorage.clear(); window.location.reload();}} 
            className="text-[10px] text-slate-500 font-bold uppercase hover:text-rose-400 transition-colors"
          >
            リセット
          </button>
        </div>
      </header>

      <nav className="bg-white border-b px-6 flex gap-1 shrink-0 sticky top-0 z-30 shadow-sm overflow-x-auto whitespace-nowrap scrollbar-hide">
        <button 
          onClick={() => setActiveTab('profile')} 
          className={`flex items-center gap-2.5 px-8 py-5 text-[11px] font-black transition-all relative ${
            activeTab === 'profile' ? 'text-orange-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <BookOpen size={18} /> 1. プロフィール & 戦略
          {activeTab === 'profile' && <div className="absolute bottom-0 left-4 right-4 h-1 bg-orange-500 rounded-t-full shadow-lg shadow-orange-200"></div>}
        </button>
        <button 
          onClick={() => setActiveTab('finance')} 
          className={`flex items-center gap-2.5 px-8 py-5 text-[11px] font-black transition-all relative ${
            activeTab === 'finance' ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Calculator size={18} /> 2. 収支カレンダー
          {activeTab === 'finance' && <div className="absolute bottom-0 left-4 right-4 h-1 bg-emerald-500 rounded-t-full shadow-lg shadow-emerald-200"></div>}
        </button>
      </nav>

      <main className="flex-1 overflow-y-auto p-4 md:p-10 bg-[#FBFDFF]">
        <div className="max-w-6xl mx-auto">
          {activeTab === 'profile' ? (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-sm border border-slate-100">
                <h2 className="font-black text-sm uppercase tracking-[0.2em] text-slate-800 mb-10 flex items-center gap-3">
                  <UserCheck size={24} className="text-slate-300"/>
                  基本情報
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                  <TooltipInput label="氏名 / 担当者" value={businessData.namaPemagang} onChange={(v: string) => handleInputChange('namaPemagang', v)} placeholder="お名前を入力" />
                  <TooltipInput label="屋号 / ビジネス名" value={businessData.namaBisnis} onChange={(v: string) => handleInputChange('namaBisnis', v)} placeholder="ビジネス名を入力" />
                  <TooltipInput label="品目 / カテゴリ" value={businessData.jenisKomoditas} onChange={(v: string) => handleInputChange('jenisKomoditas', v)} placeholder="例：野菜、米、ITサービス" />
                  <TooltipInput label="拠点 / 住所" value={businessData.lokasiBisnis} onChange={(v: string) => handleInputChange('lokasiBisnis', v)} placeholder="所在地を入力" />
                </div>
                <TooltipInput label="ビジョン & ミッション" value={businessData.visiMisi} onChange={(v: string) => handleInputChange('visiMisi', v)} multiline placeholder="将来の目標や提供したい価値について" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <DynamicList title="販路 / マーケティング" icon={Megaphone} items={businessData.pemasaran} onAdd={() => addRow('pemasaran')} onRemove={(id: number) => removeRow('pemasaran', id)} onChange={(id: number, t: string) => updateRowText('pemasaran', id, t)} colorClass="text-blue-600" btnColor="bg-blue-600" placeholder="例：直売所、ECサイト、SNS広告" />
                <DynamicList title="課題 / 障壁" icon={AlertCircle} items={businessData.hambatan} onAdd={() => addRow('hambatan')} onRemove={(id: number) => removeRow('hambatan', id)} onChange={(id: number, t: string) => updateRowText('hambatan', id, t)} colorClass="text-rose-600" btnColor="bg-rose-600" placeholder="解決すべき問題点" />
              </div>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
                  <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">平均月収予測</span>
                  <div className="text-3xl font-mono font-black mt-3 text-emerald-400 tracking-tighter">{formatCurrency(totalIncome/12)}</div>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">平均純利益予測</span>
                  <div className={`text-3xl font-mono font-black mt-3 tracking-tighter ${avgProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {formatCurrency(avgProfit)}
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden overflow-x-auto scrollbar-hide">
                <table className="w-full min-w-[1000px] border-separate border-spacing-y-2">
                  <thead>
                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                      <th className="text-left px-4">カテゴリ</th>
                      <th className="bg-slate-50/50 rounded-l-xl">平均</th>
                      {['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'].map(m => (
                        <th key={m}>{m}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="text-sm font-bold">
                    <tr className="bg-emerald-500 text-white shadow-lg shadow-emerald-500/10">
                      <td colSpan={14} className="p-3 px-6 rounded-xl text-[10px] uppercase font-black tracking-widest">収益予測 (Income)</td>
                    </tr>
                    {(businessData.calendar_income || []).map((item: any, idx: number) => (
                      <tr key={item.id} className="group hover:bg-slate-50 transition-colors">
                        <td className="p-4 flex items-center gap-2 min-w-[200px]">
                          <button onClick={() => removeRow('calendar_income', item.id)} className="text-slate-200 hover:text-rose-500 transition-colors"><Trash2 size={16}/></button>
                          <input className="w-full bg-transparent outline-none border-b border-transparent focus:border-emerald-300" value={item.nama || ''} onChange={e => {
                            const nl = [...businessData.calendar_income]; nl[idx].nama = e.target.value; setBusinessData((p:any)=>({...p, calendar_income: nl}));
                          }} />
                        </td>
                        <td className="p-4 text-right text-emerald-600 font-mono text-xs bg-slate-50/50 rounded-xl">
                          {Math.round(item.monthly?.reduce((a:any,b:any)=>a+b,0)/12).toLocaleString()}
                        </td>
                        {(item.monthly || Array(12).fill(0)).map((v: number, mi: number) => (
                          <td key={mi} className="p-2 text-center">
                            <div className="flex items-center gap-1 justify-center">
                              <input type="number" className="w-14 h-10 px-2 text-right font-mono text-xs font-bold bg-white border border-slate-100 rounded-xl focus:border-emerald-500 outline-none" value={v} onChange={e => {
                                const nl = [...businessData.calendar_income]; nl[idx].monthly[mi] = Number(e.target.value); setBusinessData((p:any)=>({...p, calendar_income: nl}));
                              }} />
                              {mi === 0 && <button onClick={() => setBusinessData((p:any)=>({...p, calendar_income: p.calendar_income.map((x:any)=>x.id===item.id?{...x,monthly:Array(12).fill(x.monthly[0])}:x)}))} className="text-slate-300 hover:text-emerald-500"><Copy size={12}/></button>}
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                    
                    <tr className="bg-slate-900 text-white shadow-xl">
                      <td colSpan={2} className="p-5 px-6 rounded-l-2xl text-[10px] uppercase font-black tracking-[0.3em]">純利益 (Laba Bersih)</td>
                      {monthlyStats.map((s, i) => (
                        <td key={i} className={`p-5 text-right font-mono font-black text-xs ${s.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {s.profit.toLocaleString()}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <footer className="p-8 text-center bg-white border-t border-slate-50 shrink-0">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em]">Business Research Tool &copy; 2024</p>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .animate-in { animation: fadeIn 0.5s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}} />
    </div>
  );
};

export default App;
