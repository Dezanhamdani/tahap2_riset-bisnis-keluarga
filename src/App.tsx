import React, { useState } from 'react';
import { Briefcase, Calculator } from 'lucide-react';
import { BasicProfile } from './components/BasicProfile';
import { BusinessStrategy } from './components/BusinessStrategy';
import { FinanceCalendar } from './components/FinanceCalendar';

/**
 * App コンポーネント
 * * エラー解消のポイント:
 * 1. "export default function App" とすることで main.tsx から読み込めるようにします。
 * 2. 初期データに空の配列をセットし、コンポーネントがクラッシュするのを防ぎます。
 */
export default function App() {
  const [activeTab, setActiveTab] = useState('profile');
  
  // 初期データ構造をプレビューの状態に合わせます
  const [businessData, setBusinessData] = useState({
    namaPemagang: '',
    namaBisnis: '',
    jenisKomoditas: '',
    pemasaran: [{ id: 1, text: '' }],
    risikoBisnis: [{ id: 1, text: '' }],
    calendar_income: [{ id: 1, nama: '', monthly: Array(12).fill(0) }],
    calendar_expense: [{ id: 1, nama: '', monthly: Array(12).fill(0) }]
  });

  // データ更新用のヘルパー関数
  const handleProfileChange = (field: string, value: any) => {
    setBusinessData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC]">
      {/* ヘッダー */}
      <header className="bg-slate-900 text-white p-4 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-2">
          <div className="bg-orange-500 p-1.5 rounded-lg">
            <Briefcase size={20} className="text-white" />
          </div>
          <h1 className="font-bold tracking-tight">Business Strategy App</h1>
        </div>
      </header>

      {/* タブナビゲーション */}
      <div className="bg-white border-b flex px-4 sticky top-0 z-10">
        <button 
          onClick={() => setActiveTab('profile')} 
          className={`p-4 text-xs font-black uppercase tracking-widest transition-all ${
            activeTab === 'profile' 
            ? 'border-b-2 border-orange-500 text-slate-900' 
            : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          1. Profil & Strategi
        </button>
        <button 
          onClick={() => setActiveTab('finance')} 
          className={`p-4 text-xs font-black uppercase tracking-widest transition-all ${
            activeTab === 'finance' 
            ? 'border-b-2 border-green-500 text-slate-900' 
            : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          2. Finance Calendar
        </button>
      </div>

      {/* メインコンテンツ */}
      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          {activeTab === 'profile' ? (
            <div className="space-y-6 animate-in fade-in duration-500">
              <BasicProfile 
                data={businessData} 
                onChange={handleProfileChange} 
              />
              <BusinessStrategy 
                data={businessData} 
                onAdd={(field: string) => {
                  const newId = Date.now();
                  setBusinessData(prev => ({
                    ...prev,
                    [field]: [...(prev as any)[field], { id: newId, text: '' }]
                  }));
                }}
                onRemove={(field: string, id: number) => {
                  setBusinessData(prev => ({
                    ...prev,
                    [field]: (prev as any)[field].filter((item: any) => item.id !== id)
                  }));
                }}
                onUpdate={(field: string, id: number, text: string) => {
                  setBusinessData(prev => ({
                    ...prev,
                    [field]: (prev as any)[field].map((item: any) => 
                      item.id === id ? { ...item, text } : item
                    )
                  }));
                }}
              />
            </div>
          ) : (
            <div className="animate-in fade-in duration-500">
              <FinanceCalendar 
                data={businessData} 
                setBusinessData={setBusinessData} 
              />
            </div>
          )}
        </div>
      </main>

      {/* フッター */}
      <footer className="p-8 text-center text-slate-400 text-[10px] font-medium uppercase tracking-[0.2em]">
        Family Business Strategic Planning Tool &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
