import React, { useState, useMemo, useEffect } from 'react'
import { 
  Briefcase, 
  Calculator, 
  Plus, 
  Trash2, 
  User, 
  Megaphone, 
  AlertTriangle, 
  Copy 
} from 'lucide-react'

/**
 * アプリケーションのメインロジック
 * Canvas環境の要件に従い、ReactDOM.createRoot() を使用せず、
 * Appコンポーネントをデフォルトエクスポートします。
 */
const App = () => {
  const [tab, setTab] = useState('profile');
  
  // データの初期化 (LocalStorageからの安全な読み込み)
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem('biz_v4');
      if (saved) {
        const parsed = JSON.parse(saved);
        // 基本的な構造チェック
        if (parsed && parsed.profile && Array.isArray(parsed.income)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Failed to load data:", e);
    }
    return {
      profile: { name: '', biz: '', item: '' },
      marketing: [{ id: 1, text: '' }],
      risks: [{ id: 1, text: '' }],
      income: [{ id: 1, name: '商品A', monthly: Array(12).fill(0) }],
      expense: [{ id: 1, name: '運営費', monthly: Array(12).fill(0) }]
    };
  });

  // 自動保存
  useEffect(() => {
    localStorage.setItem('biz_v4', JSON.stringify(data));
  }, [data]);

  // 汎用アクション：追加・削除・更新
  const act = (field: string, type: 'add' | 'del' | 'upd', id?: number, val?: any) => {
    let list = [...(data as any)[field]];
    if (type === 'add') {
      list.push({ 
        id: Date.now(), 
        text: '', 
        name: '', 
        monthly: Array(12).fill(0) 
      });
    }
    if (type === 'del') {
      list = list.filter((i: any) => i.id !== id);
    }
    if (type === 'upd') {
      list = list.map((i: any) => i.id === id ? { ...i, ...val } : i);
    }
    setData({ ...data, [field]: list });
  };

  // 統計計算ロジック
  const stats = useMemo(() => {
    const calc = (l: any[]) => Array(12).fill(0).map((_, i) => 
      l.reduce((s, item) => s + (Number(item.monthly?.[i]) || 0), 0)
    );
    const inc = calc(data.income || []);
    const exp = calc(data.expense || []);
    return inc.map((v, i) => v - (exp[i] || 0));
  }, [data.income, data.expense]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-10">
      {/* ヘッダー */}
      <header className="bg-slate-900 text-white p-4 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-2">
          <Briefcase className="text-orange-500" size={18} />
          <h1 className="font-bold text-xs uppercase tracking-widest text-white">Business Research</h1>
        </div>
        <button 
          onClick={() => { if(confirm('データをリセットしますか？')){ localStorage.clear(); window.location.reload(); } }} 
          className="text-[10px] text-slate-500 font-bold uppercase hover:text-rose-400 transition-colors"
        >
          Reset
        </button>
      </header>

      {/* タブナビゲーション */}
      <nav className="bg-white border-b flex px-4 sticky top-0 z-20 shadow-sm">
        {['profile', 'finance'].map(t => (
          <button 
            key={t} 
            onClick={() => setTab(t)} 
            className={`p-4 text-[10px] font-black uppercase tracking-widest transition-all ${
              tab === t ? 'border-b-2 border-orange-500 text-slate-900' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {t === 'profile' ? '1. プロフィール & 戦略' : '2. 収支カレンダー'}
          </button>
        ))}
      </nav>

      {/* メインコンテンツ */}
      <main className="p-4 max-w-5xl mx-auto space-y-6">
        {tab === 'profile' ? (
          <div className="space-y-6">
            {/* 基本情報セクション */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <div className="flex items-center gap-2 mb-4 text-slate-400">
                <User size={16}/><h2 className="text-[10px] font-black uppercase tracking-widest">基本情報</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { key: 'name', label: '氏名', placeholder: '氏名を入力' },
                  { key: 'biz', label: 'ビジネス名', placeholder: '屋号を入力' },
                  { key: 'item', label: '主要品目', placeholder: '品目を入力' }
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1 ml-1 uppercase">{f.label}</label>
                    <input 
                      className="w-full p-3 bg-slate-50 border border-transparent rounded-xl text-sm font-bold focus:bg-white focus:border-orange-400 outline-none transition-all shadow-inner" 
                      placeholder={f.placeholder}
                      value={(data.profile as any)[f.key] || ''} 
                      onChange={e => setData({...data, profile: {...data.profile, [f.key]: e.target.value}})} 
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* 戦略・リスクセクション */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {k:'marketing', t:'販路・戦略', i:Megaphone, c:'text-blue-500'}, 
                {k:'risks', t:'リスク・課題', i:AlertTriangle, c:'text-rose-500'}
              ].map(s => (
                <div key={s.k} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <div className={`flex items-center gap-2 ${s.c}`}>
                      <s.i size={16}/><h2 className="text-[10px] font-black uppercase tracking-widest">{s.t}</h2>
                    </div>
                    <button 
                      onClick={() => act(s.k, 'add')} 
                      className="p-1 bg-slate-100 rounded-lg text-slate-400 hover:bg-slate-200 transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  {(data as any)[s.k].map((item: any) => (
                    <div key={item.id} className="flex gap-2 mb-2">
                      <input 
                        className="flex-1 p-2 bg-slate-50 rounded-xl text-xs font-bold outline-none border border-transparent focus:border-slate-200 focus:bg-white shadow-inner" 
                        value={item.text || ''} 
                        onChange={e => act(s.k, 'upd', item.id, {text: e.target.value})} 
                      />
                      <button 
                        onClick={() => act(s.k, 'del', item.id)} 
                        className="text-slate-200 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 size={16}/>
                      </button>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-[10px] font-bold">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 uppercase tracking-widest border-b">
                    <th className="p-4 text-left sticky left-0 bg-slate-50 z-10 border-r border-slate-100">カテゴリ</th>
                    {Array.from({length:12}).map((_, i) => <th key={i} className="p-2">{i+1}月</th>)}
                  </tr>
                </thead>
                <tbody>
                  {['income', 'expense'].map(type => (
                    <React.Fragment key={type}>
                      <tr className={type === 'income' ? "bg-emerald-50/50 text-emerald-700" : "bg-rose-50/50 text-rose-700"}>
                        <td colSpan={13} className="p-2 px-6 uppercase text-[9px] tracking-widest">
                          {type === 'income' ? '収入 (Income)' : '支出 (Expense)'}
                        </td>
                      </tr>
                      {(data as any)[type].map((item: any, itemIdx: number) => (
                        <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                          <td className="p-3 px-6 flex items-center gap-2 min-w-[150px] sticky left-0 bg-white z-10 border-r border-slate-100 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                            <button 
                              onClick={() => act(type, 'del', item.id)} 
                              className="text-slate-200 hover:text-rose-400 transition-colors"
                            >
                              <Trash2 size={14}/>
                            </button>
                            <input 
                              className="outline-none bg-transparent font-bold w-full" 
                              value={item.name || ''} 
                              onChange={e => act(type, 'upd', item.id, {name: e.target.value})} 
                            />
                          </td>
                          {item.monthly.map((m: number, i: number) => (
                            <td key={i} className="p-1">
                              <div className="flex items-center gap-0.5">
                                <input 
                                  type="number" 
                                  className="w-full p-1 text-right bg-slate-50 rounded-lg outline-none focus:bg-white text-[11px] font-mono border border-transparent focus:border-slate-200" 
                                  value={m || ''} 
                                  onChange={e => {
                                    const nm = [...item.monthly];
                                    nm[i] = parseInt(e.target.value) || 0;
                                    act(type, 'upd', item.id, {monthly: nm});
                                  }} 
                                />
                                {i === 0 && (
                                  <button 
                                    onClick={() => act(type, 'upd', item.id, {monthly: Array(12).fill(item.monthly[0])})} 
                                    className="text-slate-200 hover:text-slate-400 transition-colors"
                                    title="1月の値を全月へコピー"
                                  >
                                    <Copy size={10}/>
                                  </button>
                                )}
                              </div>
                            </td>
                          ))}
                        </tr>
                      ))}
                      <tr>
                        <td colSpan={13} className="p-1">
                          <button 
                            onClick={() => act(type, 'add')} 
                            className="w-full py-2 text-slate-300 hover:text-slate-500 uppercase font-black text-[9px] tracking-widest transition-colors"
                          >
                            + 新しいカテゴリを追加
                          </button>
                        </td>
                      </tr>
                    </React.Fragment>
                  ))}
                  <tr className="bg-slate-900 text-white font-mono uppercase text-[10px] tracking-widest shadow-inner">
                    <td className="p-4 px-6 sticky left-0 bg-slate-900 z-10 border-r border-slate-800">純利益 (Net Profit)</td>
                    {stats.map((s, i) => (
                      <td key={i} className={`p-4 text-right font-bold ${s >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {s.toLocaleString()}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
      
      <style dangerouslySetInnerHTML={{ __html: `
        input[type=number]::-webkit-inner-spin-button, 
        input[type=number]::-webkit-outer-spin-button { 
          -webkit-appearance: none; 
          margin: 0; 
        }
        .animate-in { animation: fadeIn 0.3s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
      ` }} />
    </div>
  );
}

export default App;
