// App.tsx の useState の中身をこのように書き換えてください
const [businessData, setBusinessData] = useState({
  namaPemagang: '', 
  namaBisnis: '', 
  jenisKomoditas: '',
  pemasaran: [{ id: 1, text: '' }],
  risikoBisnis: [{ id: 1, text: '' }], // ★これが重要
  calendar_income: [{ id: Date.now(), nama: '', monthly: Array(12).fill(0) }],
  calendar_expense: [{ id: Date.now() + 1, nama: '', monthly: Array(12).fill(0) }]
});
