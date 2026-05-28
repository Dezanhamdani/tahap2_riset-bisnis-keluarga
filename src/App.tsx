import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Papa from "papaparse";
import React, { useState, useMemo, memo, useRef } from 'react';
import { 
  Calculator, Briefcase, HelpCircle, Plus, Trash2,
  BookOpen, UserCheck, Megaphone, AlertCircle, 
  KeyRound, LayoutGrid, Copy
} from 'lucide-react';

// --- Global Type Definitions ---
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

// Tooltip Input Component dengan Integrasi Pesan Error & Validasi Visual
const TooltipInput = memo(({ label, value, onChange, placeholder, explanation, multiline = false, numeric = false, errorMsg }: any) => (
  <div className="mb-4 group">
    <div className="flex items-center gap-2 mb-1.5">
      <label className="text-[11px] font-black text-slate-700 uppercase tracking-widest">
        {label} {errorMsg && <span className="text-rose-500 font-bold">*</span>}
      </label>
      {explanation && (
        <div className="relative group/tooltip no-print">
          <HelpCircle size={14} className="text-slate-300 hover:text-indigo-500 cursor-help transition-colors" />
          {/* Popover penjelasan saat hover ikon tanya */}
          <div className="invisible group-hover/tooltip:visible absolute z-50 w-64 p-3 bg-slate-800 text-white text-[11px] font-medium rounded-xl shadow-xl -left-2 top-5 transition-all opacity-0 group-hover/tooltip:opacity-100">
            {explanation}
          </div>
        </div>
      )}
    </div>
    {multiline ? (
      <textarea
        className={`w-full p-3 bg-white border rounded-xl focus:ring-4 focus:ring-slate-50 transition-all text-sm outline-none resize-none shadow-sm font-medium text-slate-900 ${
          errorMsg ? "border-rose-400 focus:border-rose-500 bg-rose-50/10" : "border-slate-200 focus:border-slate-400"
        }`}
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    ) : (
      <div className="relative">
        <input
          type={numeric ? "number" : "text"}
          className={`w-full p-3 bg-white border rounded-xl focus:ring-4 focus:ring-slate-50 transition-all text-sm font-bold outline-none shadow-sm text-slate-900 ${
            errorMsg ? "border-rose-400 focus:border-rose-500 bg-rose-50/10" : "border-slate-200 focus:border-slate-400"
          }`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      </div>
    )}
    {/* Pesan Error di bawah form input */}
    {errorMsg && (
      <p className="text-rose-500 text-[11px] font-semibold mt-1 flex items-center gap-1 animate-in fade-in duration-200">
        <AlertCircle size={12} /> {errorMsg}
      </p>
    )}
  </div>
));

TooltipInput.displayName = 'TooltipInput';

// Dynamic List Component
const DynamicList = ({ title, icon: IconComp, items, onAdd, onRemove, onChange, colorClass, placeholder, btnColor, explanation }: any) => (
  <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 mb-4 shadow-sm">
    <div className="flex justify-between items-center mb-1">
      <div className={`flex items-center gap-2.5 ${colorClass}`}>
        <IconComp size={16} />
        <h4 className="font-black text-[10px] uppercase tracking-widest">{title}</h4>
      </div>
      <button onClick={onAdd} className={`p-1 rounded-lg text-white ${btnColor} active:scale-90 shadow-sm no-print`}>
        <Plus size={14} />
      </button>
    </div>
    {explanation && <p className="text-[11px] text-slate-400 font-medium mb-3">{explanation}</p>}
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

  // State pencatatan error untuk validasi
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

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
    calendar_income: [{ id: 1, nama: 'Product A', monthly: Array(12).fill(0) }],
    calendar_expense: [{ id: 1, nama: 'Expense A', monthly: Array(12).fill(0) }]
  });

  // Teks penjelasan panduan pengisian form
  const fieldGuides = {
    namaPemagang: "Masukkan nama lengkap Anda sesuai dengan kartu identitas resmi magang.",
    namaBisnis: "Tuliskan nama usaha atau merk dagang yang dikelola oleh keluarga Anda.",
    jenisKomoditas: "Contoh: Padi, Peternakan Sapi, Keripik Pisang, Kebun Sawit, dll.",
    lokasiBisnis: "Alamat lengkap fisik tempat produksi atau operasional utama usaha.",
    linkMaps: "Salin link tautan lokasi dari Google Maps untuk akurasi pemetaan koordinat.",
    visiMisi: "Uraikan target jangka panjang (visi) dan langkah taktis operasional (misi) usaha.",
    pemasaran: "Bagaimana cara bisnis keluarga mencari pelanggan atau menjual produk saat ini?",
    hambatan: "Sebutkan kendala operasional terbesar (misal: cuaca, modal, hama, atau harga pakan).",
    kunciSukses: "Faktor utama yang membuat bisnis ini mampu bertahan hingga sekarang."
  };

  // Calculations
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

  // Action Handlers dengan pembersihan error otomatis saat mengetik
  const handleInputChange = (f: keyof BusinessData, v: string) => {
    setBusinessData(p => ({ ...p, [f]: v }));
    if (v.trim()) {
      setFormErrors(prev => {
        const copy = { ...prev };
        delete copy[f];
        return copy;
      });
    }
  };
  
  const addDynamicRow = (type: keyof BusinessData) => {
    if (type === 'calendar_income' || type === 'calendar_expense') {
      setBusinessData(p => ({ 
        ...p, 
        [type]: [...(p[type] as any[]), { id: Date.now(), nama: '', monthly: Array(12).fill(0) }] 
      }));
    } else {
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

  // Fungsi pemeriksaan berkas input sebelum ekspor dijalankan
  const isFormValid = (): boolean => {
    const errors: Record<string, string> = {};
    if (!businessData.namaPemagang.trim()) errors.namaPemagang = "Nama penyusun laporan tidak boleh kosong.";
    if (!businessData.namaBisnis.trim()) errors.namaBisnis = "Nama entitas bisnis keluarga wajib diisi.";
    if (!businessData.jenisKomoditas.trim()) errors.jenisKomoditas = "Jenis komoditas produk tidak boleh kosong.";
    if (!businessData.lokasiBisnis.trim()) errors.lokasiBisnis = "Lokasi alamat operasional wajib dicantumkan.";
    
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      setActiveTab('profile'); // Pindahkan tab otomatis ke tempat error berada
      alert("Gagal mengekspor. Silakan lengkapi kolom validasi yang bertanda merah terlebih dahulu.");
      return false;
    }
    return true;
  };

  const exportExcel = () => {
    if (!isFormValid()) return;
    const wb = XLSX.utils.book_new();
    
    const profilData = [
      ["PROFIL DAN STRATEGI BISNIS KELUARGA"],
      [],
      ["Nama Pemagang", businessData.namaPemagang],
      ["Nama Bisnis", businessData.namaBisnis],
      ["Jenis Komoditas", businessData.jenisKomoditas],
      ["Lokasi Bisnis", businessData.lokasiBisnis],
      ["Link Maps", businessData.linkMaps],
      ["Visi & Misi", businessData.visiMisi],
      [],
      ["Strategi Pemasaran"],
      ...businessData.pemasaran.map((item, index) => [`${index + 1}`, item.text]),
      [],
      ["Hambatan Bisnis"],
      ...businessData.hambatan.map((item, index) => [`${index + 1}`, item.text]),
      [],
      ["Kunci Sukses"],
      ...businessData.kunciSukses.map((item, index) => [`${index + 1}`, item.text]),
    ];
    const wsProfil = XLSX.utils.aoa_to_sheet(profilData);
    XLSX.utils.book_append_sheet(wb, wsProfil, "Profil & Strategi");

    const headerKeuangan = ["Item", "Rata-rata", "Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    const keuanganData: any[] = [headerKeuangan, ["PENDAPATAN (INCOME)"]];

    businessData.calendar_income.forEach(item => {
      const avg = item.monthly.reduce((a, b) => a + b, 0) / 12;
      keuanganData.push([item.nama, avg, ...item.monthly]);
    });

    keuanganData.push([], ["BIAYA BISNIS (EXPENSE)"]);
    businessData.calendar_expense.forEach(item => {
      const avg = item.monthly.reduce((a, b) => a + b, 0) / 12;
      keuanganData.push([item.nama, avg, ...item.monthly]);
    });

    keuanganData.push([], [
      "LABA BERSIH (NET PROFIT)", 
      avgProfit, 
      ...monthlyStats.map(stat => stat.profit)
    ]);

    const wsKeuangan = XLSX.utils.aoa_to_sheet(keuanganData);
    XLSX.utils.book_append_sheet(wb, wsKeuangan, "Kalender Usaha");

    XLSX.writeFile(wb, "riset-bisnis-keluarga.xlsx");
  };

  const exportPDF = async () => {
    if (!isFormValid()) return;
    const pdfContent = document.createElement("div");
    pdfContent.innerHTML = `
    <div style="padding:40px; font-family:Arial,sans-serif; background:#f8fafc; color:#0f172a;">
      <div style="background:#0f172a; padding:30px; border-radius:24px; color:white; margin-bottom:30px;">
        <div style="display:flex; align-items:center; gap:20px;">
          <div>
            <h1 style="margin:0; font-size:34px; font-weight:800;">Projek ABP Magang</h1>
            <p style="margin-top:10px; color:#34d399; font-size:16px; letter-spacing:5px; text-transform:uppercase; font-style:italic; font-weight:bold;">
              Tahap 2 : Riset Bisnis Keluarga
            </p>
          </div>
        </div>
      </div>

      <div style="background:white; padding:30px; border-radius:24px; margin-bottom:30px; box-shadow:0 4px 20px rgba(0,0,0,0.05);">
        <h2 style="color:#ea580c; margin-bottom:20px; font-size:22px;">PROFIL & STRATEGI</h2>
        <table width="100%" style="border-collapse:collapse; font-size:14px;">
          <tr><td style="padding:10px; font-weight:bold; width:200px;">Nama Pemagang</td><td>${businessData.namaPemagang}</td></tr>
          <tr><td style="padding:10px; font-weight:bold;">Nama Bisnis</td><td>${businessData.namaBisnis}</td></tr>
          <tr><td style="padding:10px; font-weight:bold;">Jenis Komoditas</td><td>${businessData.jenisKomoditas}</td></tr>
          <tr><td style="padding:10px; font-weight:bold;">Lokasi Bisnis</td><td>${businessData.lokasiBisnis}</td></tr>
          <tr><td style="padding:10px; font-weight:bold;">Link Maps</td><td>${businessData.linkMaps}</td></tr>
          <tr><td style="padding:10px; font-weight:bold;">Visi & Misi</td><td>${businessData.visiMisi}</td></tr>
        </table>

        <div style="margin-top:30px;">
          <h3 style="color:#2563eb;">Pemasaran</h3>
          <ul>${businessData.pemasaran.map(i => `<li>${i.text}</li>`).join("")}</ul>
          <h3 style="color:#dc2626;">Hambatan</h3>
          <ul>${businessData.hambatan.map(i => `<li>${i.text}</li>`).join("")}</ul>
          <h3 style="color:#ea580c;">Kunci Sukses</h3>
          <ul>${businessData.kunciSukses.map(i => `<li>${i.text}</li>`).join("")}</ul>
        </div>
      </div>

      <div style="background:white; padding:30px; border-radius:24px; box-shadow:0 4px 20px rgba(0,0,0,0.05);">
        <h2 style="color:#059669; margin-bottom:20px; font-size:22px;">KALENDER USAHA</h2>
        <table width="100%" border="1" cellspacing="0" cellpadding="4" style="border-collapse:collapse; text-align:center; font-size:12px;">
          <tr style="background:#0f172a; color:white;">
            <th>Item</th><th>Jan</th><th>Feb</th><th>Mar</th><th>Apr</th><th>Mei</th><th>Jun</th><th>Jul</th><th>Agu</th><th>Sep</th><th>Okt</th><th>Nov</th><th>Des</th>
          </tr>
          ${businessData.calendar_income.map(item => `
            <tr>
              <td style="font-weight:bold; color:#059669; text-align:left;">${item.nama}</td>
              ${item.monthly.map(v => `<td>${v.toLocaleString()}</td>`).join("")}
            </tr>
          `).join("")}
          ${businessData.calendar_expense.map(item => `
            <tr>
              <td style="font-weight:bold; color:#dc2626; text-align:left;">${item.nama}</td>
              ${item.monthly.map(v => `<td>${v.toLocaleString()}</td>`).join("")}
            </tr>
          `).join("")}
        </table>
      </div>
    </div>
    `;

    document.body.appendChild(pdfContent);
    const canvas = await html2canvas(pdfContent, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("l", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("riset-bisnis-keluarga.pdf");
    document.body.removeChild(pdfContent);
  };

  const exportCSV = () => {
    if (!isFormValid()) return;
    const rows = [
      ["Kategori", "Nama Item / Kolom", "Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"],
      ["Profil", "Nama Pemagang", businessData.namaPemagang],
      ["Profil", "Nama Bisnis", businessData.namaBisnis],
      ["Profil", "Jenis Komoditas", businessData.jenisKomoditas],
      ["Profil", "Lokasi Bisnis", businessData.lokasiBisnis],
      ["Profil", "Link Maps", businessData.linkMaps],
      ["Profil", "Visi Misi", businessData.visiMisi],
      ...businessData.pemasaran.map(item => ["Strategi Pemasaran", item.text]),
      ...businessData.hambatan.map(item => ["Hambatan", item.text]),
      ...businessData.kunciSukses.map(item => ["Kunci Sukses", item.text]),
      ...businessData.calendar_income.map(item => ["Income", item.nama, ...item.monthly]),
      ...businessData.calendar_expense.map(item => ["Expense", item.nama, ...item.monthly])
    ];

    const csvString = Papa.unparse(rows);
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "riset-bisnis-keluarga.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const importCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      
      Papa.parse(text, {
        complete: (results) => {
          const data = results.data as string[][];
          const newBusinessData: BusinessData = {
            namaPemagang: '', namaBisnis: '', jenisKomoditas: '', lokasiBisnis: '', linkMaps: '',
            ringkasan: '', latarBelakang: '', visiMisi: '', sumberDana: '', investasiAset: '',
            pemasaran: [], hambatan: [], kunciSukses: [], sumberInfo: [], risikoBisnis: [],
            calendar_income: [], calendar_expense: []
          };

          data.forEach((row) => {
            if (!row || row.length < 2) return;
            const kategori = row[0];
            const labelOrNama = row[1];

            if (kategori === "Profil") {
              if (labelOrNama === "Nama Pemagang") newBusinessData.namaPemagang = row[2] || '';
              if (labelOrNama === "Nama Bisnis") newBusinessData.namaBisnis = row[2] || '';
              if (labelOrNama === "Jenis Komoditas") newBusinessData.jenisKomoditas = row[2] || '';
              if (labelOrNama === "Lokasi Bisnis") newBusinessData.lokasiBisnis = row[2] || '';
              if (labelOrNama === "Link Maps") newBusinessData.linkMaps = row[2] || '';
              if (labelOrNama === "Visi Misi") newBusinessData.visiMisi = row[2] || '';
            } else if (kategori === "Strategi Pemasaran") {
              newBusinessData.pemasaran.push({ id: Date.now() + Math.random(), text: labelOrNama });
            } else if (kategori === "Hambatan") {
              newBusinessData.hambatan.push({ id: Date.now() + Math.random(), text: labelOrNama });
            } else if (kategori === "Kunci Sukses") {
              newBusinessData.kunciSukses.push({ id: Date.now() + Math.random(), text: labelOrNama });
            } else if (kategori === "Income" || kategori === "Expense") {
              const monthlyData = row.slice(2, 14).map(val => Number(val) || 0);
              while (monthlyData.length < 12) monthlyData.push(0);

              const targetArray = kategori === "Income" ? newBusinessData.calendar_income : newBusinessData.calendar_expense;
              targetArray.push({
                id: Date.now() + Math.random(),
                nama: labelOrNama,
                monthly: monthlyData
              });
            }
          });

          if (newBusinessData.pemasaran.length === 0) newBusinessData.pemasaran.push({ id: 1, text: '' });
          if (newBusinessData.hambatan.length === 0) newBusinessData.hambatan.push({ id: 1, text: '' });
          if (newBusinessData.kunciSukses.length === 0) newBusinessData.kunciSukses.push({ id: 1, text: '' });
          if (newBusinessData.calendar_income.length === 0) newBusinessData.calendar_income.push({ id: 1, nama: 'Product A', monthly: Array(12).fill(0) });
          if (newBusinessData.calendar_expense.length === 0) newBusinessData.calendar_expense.push({ id: 1, nama: 'Expense A', monthly: Array(12).fill(0) });

          setBusinessData(newBusinessData);
          setFormErrors({}); // Bersihkan error lama setelah import berhasil
          alert("Data CSV berhasil dimuat kembali ke dalam form!");
          e.target.value = "";
        },
        error: (error) => {
          console.error(error);
          alert("Gagal memproses parsing berkas CSV.");
        }
      });
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col h-screen bg-[#F8FAFC] overflow-hidden">
      {/* Header */}
      <header className="bg-slate-900 border-b px-6 py-4 flex justify-between items-center z-40 shrink-0 shadow-xl">
        <div className="flex items-center gap-4">
          <img
            src="/logo.svg"
            alt="Logo"
            className="h-12 w-auto bg-white/95 backdrop-blur-md p-1.5 rounded-[1rem] shadow-md object-contain border border-white/20"
          />
          <div>
            <h1 className="text-white font-black text-xl tracking-wide uppercase">
              Projek ABP Magang
            </h1>
            <p className="text-emerald-400 text-xs font-bold uppercase tracking-[0.2em] mt-1.5 antialiased">
              Tahap 2 : Riset Analisis Bisnis Keluarga
            </p>
          </div>
        </div>

        <div className="flex gap-3 items-center">
          <button
            onClick={exportPDF}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg transition-all"
          >
            Export PDF
          </button>
          <button
            onClick={exportExcel}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg transition-all"
          >
            Export Excel
          </button>
          <button
            onClick={exportCSV}
            className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg transition-all"
          >
            Export CSV
          </button>
          <label className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg transition-all cursor-pointer flex items-center">
            Import CSV
            <input type="file" accept=".csv" onChange={importCSV} className="hidden" />
          </label>
        </div>
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

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 md:p-12 custom-scrollbar bg-slate-50">
        <div className="max-w-5xl mx-auto space-y-8">
          
          {activeTab === 'profile' ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
              
              {/* 1. Reporter Section */}
              <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-200">
                <div className="flex items-center gap-3 mb-4">
                  <UserCheck size={20} className="text-slate-400"/>
                  <h2 className="font-black text-xs uppercase tracking-widest text-slate-800">Penyusun Report</h2>
                </div>
                <TooltipInput 
                  label="Nama Pemagang" 
                  value={businessData.namaPemagang} 
                  onChange={(v: string) => handleInputChange('namaPemagang', v)} 
                  placeholder="Nama Lengkap Pemagang" 
                  explanation={fieldGuides.namaPemagang}
                  errorMsg={formErrors.namaPemagang}
                />
              </div>

              {/* 2. Business Info Section */}
              <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-200">
                <div className="flex items-center gap-3 mb-6">
                  <LayoutGrid size={24} className="text-slate-400"/>
                  <h2 className="font-black text-xs uppercase tracking-widest text-slate-800">Identitas Bisnis Keluarga</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                  <TooltipInput label="Nama Bisnis" value={businessData.namaBisnis} onChange={(v: string) => handleInputChange('namaBisnis', v)} placeholder="Contoh: TayaFarm" explanation={fieldGuides.namaBisnis} errorMsg={formErrors.namaBisnis} />
                  <TooltipInput label="Jenis Komoditas" value={businessData.jenisKomoditas} onChange={(v: string) => handleInputChange('jenisKomoditas', v)} placeholder="Contoh: Peternakan (Sapi) / Pertanian (Padi)" explanation={fieldGuides.jenisKomoditas} errorMsg={formErrors.jenisKomoditas} />
                  <TooltipInput label="Lokasi Bisnis" value={businessData.lokasiBisnis} onChange={(v: string) => handleInputChange('lokasiBisnis', v)} placeholder="Masukan alamat lengkap usaha Anda meliputi, Kota / Kabupaten." explanation={fieldGuides.lokasiBisnis} errorMsg={formErrors.lokasiBisnis} />
                  <TooltipInput label="Link Maps" value={businessData.linkMaps} onChange={(v: string) => handleInputChange('linkMaps', v)} placeholder="https://maps.google.com/..." explanation={fieldGuides.linkMaps} />
                </div>
                <TooltipInput label="Visi & Misi" value={businessData.visiMisi} onChange={(v: string) => handleInputChange('visiMisi', v)} multiline placeholder="Uraikan visi dan misi usaha Anda" explanation={fieldGuides.visiMisi} />
              </div>

              {/* 3. Strategy Section */}
              <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl border border-orange-100 border-t-8 border-t-orange-500">
                <div className="flex items-center gap-3 mb-6 text-orange-600">
                  <LayoutGrid size={24} />
                  <h2 className="font-black text-xs uppercase tracking-widest">Strategi & Keberhasilan</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DynamicList title="Pemasaran" icon={Megaphone} items={businessData.pemasaran} onAdd={() => addDynamicRow('pemasaran')} onRemove={(id: number) => removeDynamicRow('pemasaran', id)} onChange={(id: number, t: string) => updateDynamicRow('pemasaran', id, t)} colorClass="text-blue-600" btnColor="bg-blue-600" placeholder="Strategi pemasaran..." explanation={fieldGuides.pemasaran} />
                  <DynamicList title="Hambatan" icon={AlertCircle} items={businessData.hambatan} onAdd={() => addDynamicRow('hambatan')} onRemove={(id: number) => removeDynamicRow('hambatan', id)} onChange={(id: number, t: string) => updateDynamicRow('hambatan', id, t)} colorClass="text-rose-600" btnColor="bg-rose-600" placeholder="Hambatan operasional..." explanation={fieldGuides.hambatan} />
                </div>
                <div className="mt-6">
                  <DynamicList title="Kunci Sukses" icon={KeyRound} items={businessData.kunciSukses} onAdd={() => addDynamicRow('kunciSukses')} onRemove={(id: number) => removeDynamicRow('kunciSukses', id)} onChange={(id: number, t: string) => updateDynamicRow('kunciSukses', id, t)} colorClass="text-orange-600" btnColor="bg-orange-600" placeholder="Faktor keberhasilan..." explanation={fieldGuides.kunciSukses} />
                </div>
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
              {/* Financial Summary */}
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

              {/* Table Area */}
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
                      {/* Income Section */}
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
                              <div className="flex items-center gap-1">
                                <input type="number" className="w-full h-8 px-2 text-right font-mono text-[11px] font-bold bg-white border border-slate-100 rounded focus:ring-2 focus:ring-emerald-100 outline-none" value={val} onChange={e => {
                                  const newList = [...businessData.calendar_income];
                                  newList[idx].monthly[mIdx] = Math.max(0, Number(e.target.value) || 0); // Proteksi nilai negatif
                                  setBusinessData(p => ({...p, calendar_income: newList}));
                                }} />
                                {mIdx === 0 && <button onClick={() => repeatFirstMonth('calendar_income', item.id)} className="p-1 text-emerald-400 hover:text-emerald-600"><Copy size={12}/></button>}
                              </div>
                            </td>
                          ))}
                        </tr>
                      ))}
                      <tr>
                        <td colSpan={14} className="p-2 border-b text-center">
                          <button onClick={() => addDynamicRow('calendar_income')} className="text-[9px] font-black text-slate-400 hover:text-emerald-500 px-4 uppercase tracking-widest">+ Add Income Item</button>
                        </td>
                      </tr>

                      {/* Expense Section */}
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
                              <div className="flex items-center gap-1">
                                <input type="number" className="w-full h-8 px-2 text-right font-mono text-[11px] font-bold bg-white border border-slate-100 rounded focus:ring-2 focus:ring-rose-100 outline-none" value={val} onChange={e => {
                                  const newList = [...businessData.calendar_expense];
                                  newList[idx].monthly[mIdx] = Math.max(0, Number(e.target.value) || 0); // Proteksi nilai negatif
                                  setBusinessData(p => ({...p, calendar_expense: newList}));
                                }} />
                                {mIdx === 0 && <button onClick={() => repeatFirstMonth('calendar_expense', item.id)} className="p-1 text-rose-400 hover:text-rose-600"><Copy size={12}/></button>}
                              </div>
                            </td>
                          ))}
                        </tr>
                      ))}
                      <tr>
                        <td colSpan={14} className="p-2 border-b text-center">
                          <button onClick={() => addDynamicRow('calendar_expense')} className="text-[9px] font-black text-slate-400 hover:text-rose-500 px-4 uppercase tracking-widest">+ Add Expense Item</button>
                        </td>
                      </tr>
                      
                      {/* Profit Row */}
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