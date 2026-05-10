import React from 'react';

/**
 * BasicProfile コンポーネント
 * ビジネスの基本プロフィール（名前、ビジネス名、品目）を入力するフォームを提供します。
 * data が undefined や null の場合でもクラッシュしないようにガードを設けています。
 */
export const BasicProfile = ({ data, onChange }: any) => {
  // data が存在しない場合に備えて、空のオブジェクトをデフォルト値として使用します
  const profile = data || {};

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <h2 className="text-lg font-bold text-slate-800">Profil Bisnis</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nama Pemagang</label>
          <input 
            placeholder="Masukkan nama"
            value={profile.namaPemagang || ''} 
            onChange={(e) => onChange('namaPemagang', e.target.value)}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-orange-400 transition-colors"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nama Bisnis</label>
          <input 
            placeholder="Masukkan nama bisnis"
            value={profile.namaBisnis || ''} 
            onChange={(e) => onChange('namaBisnis', e.target.value)}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-orange-400 transition-colors"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Jenis Komoditas</label>
          <input 
            placeholder="Contoh: Ayam Broiler"
            value={profile.jenisKomoditas || ''} 
            onChange={(e) => onChange('jenisKomoditas', e.target.value)}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-orange-400 transition-colors"
          />
        </div>
      </div>
    </div>
  );
};

// App.tsx 側で import BasicProfile from ... と import { BasicProfile } from ... 
// どちらの形式でも読み込めるようにデフォルトエクスポートも追加します。
export default BasicProfile;
