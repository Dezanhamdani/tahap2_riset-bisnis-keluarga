import React from 'react';

/**
 * BusinessStrategy コンポーネント
 * * エラーを回避するため、名前付きエクスポート (named export) と
 * デフォルトエクスポート (default export) の両方を提供します。
 */
export const BusinessStrategy = ({ data }: any) => {
  return (
    <div className="p-4 bg-slate-100 rounded-2xl border border-dashed border-slate-200">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-2 h-2 bg-slate-300 rounded-full animate-pulse"></div>
        <h3 className="text-slate-500 font-bold text-xs uppercase tracking-widest">
          Strategi Bisnis
        </h3>
      </div>
      <p className="text-slate-400 text-[10px] italic">
        Bagian strategi sedang dalam pengembangan. Data profil dan kalender tetap dapat diisi.
      </p>
    </div>
  );
};

// デフォルトエクスポートも追加しておくことで、インポート時のミスを防ぎます
export default BusinessStrategy;
