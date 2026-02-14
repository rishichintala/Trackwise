// src/routes/Reports.jsx
import { useState } from "react";
import { useData } from "../context/DataContext";
import { useCurrency } from "../context/CurrencyContext";
import PieChart from "../components/PieChart";
import BarChart from "../components/BarChart";
import dayjs from "dayjs";
import { FaFileExcel, FaFilePdf, FaDownload } from "react-icons/fa";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "react-hot-toast";

export default function Reports() {
  const { expenses } = useData();
  const { currencySymbol } = useCurrency();
  const [range, setRange] = useState({ from: "", to: "" });

  // ─── 1) Filter by date range (using dayjs for reliability) ───
  const filtered = expenses
    .filter((e) => {
      const d = dayjs(e.date);
      const fromOK = !range.from || d.isAfter(dayjs(range.from).subtract(1, "day"), "day");
      const toOK = !range.to || d.isBefore(dayjs(range.to).add(1, "day"), "day");
      return fromOK && toOK;
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  // ─── 2) Aggregate by category ───
  const byCat = filtered.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + Number(e.amount);
    return acc;
  }, {});

  // ─── 3) Aggregate by month (YYYY-MM) ───
  const byMonth = filtered.reduce((acc, e) => {
    const m = dayjs(e.date).format("YYYY-MM");
    acc[m] = (acc[m] || 0) + Number(e.amount);
    return acc;
  }, {});

  // ─── 4) Build a “Date Range” label ───
  let dateRangeLabel = "All Time";
  if (range.from && range.to) {
    const f = dayjs(range.from).format("MM/DD/YYYY");
    const t = dayjs(range.to).format("MM/DD/YYYY");
    dateRangeLabel = `From ${f} to ${t}`;
  } else if (range.from) {
    const f = dayjs(range.from).format("MM/DD/YYYY");
    dateRangeLabel = `From ${f}`;
  } else if (range.to) {
    const t = dayjs(range.to).format("MM/DD/YYYY");
    dateRangeLabel = `Up to ${t}`;
  }

  // ─── 5) Totals ───
  const totalTx = filtered.length;
  const totalSpent = filtered.reduce((sum, e) => sum + Number(e.amount), 0);

  // ─── 6) Prepare chart data ───
  const catLabels = Object.keys(byCat);
  const catValues = Object.values(byCat);

  const CAT_COLORS = [
    "#4F46E5", // indigo-600
    "#10B981", // emerald-500
    "#F59E0B", // amber-500
    "#EF4444", // red-500
    "#3B82F6", // blue-500
    "#8B5CF6", // violet-500
    "#EC4899", // rose-500
    "#14B8A6", // teal-500
    "#F43F5E", // rose-400
    "#6366F1", // slate-500
  ];
  const catColors = catLabels.map((_, idx) => CAT_COLORS[idx % CAT_COLORS.length]);

  const monthLabels = Object.keys(byMonth).sort();
  const monthValues = monthLabels.map((m) => byMonth[m] || 0);
  const barColor = "#2563EB"; // blue-600

  // ─── 7) Export Handlers ───
  const exportToExcel = () => {
    try {
      const data = filtered.map(e => ({
        Date: dayjs(e.date).format("YYYY-MM-DD"),
        Item: e.itemName || "Unnamed",
        Category: e.category,
        Amount: Number(e.amount).toFixed(2)
      }));

      // Add Total Row
      data.push({
        Date: "TOTAL",
        Item: "",
        Category: "",
        Amount: totalSpent.toFixed(2)
      });

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Expenses");

      // Basic Column Widths
      ws["!cols"] = [{ wch: 15 }, { wch: 30 }, { wch: 20 }, { wch: 15 }];

      const safeFilename = `Trackwise_Expenses_${range.from || 'start'}_to_${range.to || 'end'}.xlsx`;
      XLSX.writeFile(wb, safeFilename);
      toast.success("Excel report downloaded!");
    } catch (err) {
      console.error("Excel Export Error:", err);
      toast.error("Failed to generate Excel report.");
    }
  };

  const exportToPDF = () => {
    try {
      const doc = new jsPDF();

      // Header Styles
      doc.setFontSize(22);
      doc.setTextColor(37, 99, 235); // blue-600
      doc.text("Trackwise Financial Report", 14, 22);

      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(`Period: ${dateRangeLabel}`, 14, 32);
      doc.text(`Total Transactions: ${totalTx}`, 14, 38);
      doc.text(`Total Volume: ${currencySymbol}${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 14, 44);

      // Transaction Table
      const tableData = filtered.map(e => [
        dayjs(e.date).format("MMM DD, YYYY"),
        e.itemName || "Unnamed",
        e.category,
        `${currencySymbol}${Number(e.amount).toFixed(2)}`
      ]);

      autoTable(doc, {
        startY: 52,
        head: [["Date", "Item Name", "Category", "Amount"]],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 10, cellPadding: 3 },
        alternateRowStyles: { fillColor: [249, 250, 251] }
      });

      const safeFilename = `Trackwise_Report_${range.from || 'start'}_to_${range.to || 'end'}.pdf`;
      doc.save(safeFilename);
      toast.success("PDF report downloaded!");
    } catch (err) {
      console.error("PDF Export Error:", err);
      toast.error("Failed to generate PDF report.");
    }
  };

  return (
    <section className="space-y-8">
      <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 flex flex-col lg:flex-row justify-between items-center gap-6">
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          <label className="flex flex-col space-y-1 flex-1 min-w-[160px]">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">From Date</span>
            <input
              type="date"
              value={range.from}
              onChange={(e) => setRange((r) => ({ ...r, from: e.target.value }))}
              className="border-2 border-gray-100 rounded-xl p-2.5 focus:border-blue-500 focus:outline-none transition-all font-medium text-gray-700 bg-gray-50"
            />
          </label>
          <label className="flex flex-col space-y-1 flex-1 min-w-[160px]">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">To Date</span>
            <input
              type="date"
              value={range.to}
              onChange={(e) => setRange((r) => ({ ...r, to: e.target.value }))}
              className="border-2 border-gray-100 rounded-xl p-2.5 focus:border-blue-500 focus:outline-none transition-all font-medium text-gray-700 bg-gray-50"
            />
          </label>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          <button
            onClick={exportToExcel}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 border-2 border-emerald-100 px-5 py-2.5 rounded-xl font-bold hover:bg-emerald-100 transition-all group"
          >
            <FaFileExcel className="text-lg group-hover:scale-110 transition-transform" />
            <span>Excel</span>
          </button>
          <button
            onClick={exportToPDF}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-rose-50 text-rose-700 border-2 border-rose-100 px-5 py-2.5 rounded-xl font-bold hover:bg-rose-100 transition-all group"
          >
            <FaFilePdf className="text-lg group-hover:scale-110 transition-transform" />
            <span>PDF Export</span>
          </button>
        </div>
      </div>

      {/* ── Totals & Date‐Range Summary ── */}
      <div className="bg-white p-4 rounded-xl shadow space-y-2">
        <p className="text-gray-700 font-medium">
          Date Range:{" "}
          <span className="font-semibold">{dateRangeLabel}</span>
        </p>
        <p className="text-gray-600">
          Total Transactions:{" "}
          <span className="font-semibold">{totalTx}</span>
        </p>
        <p className="text-gray-600">
          Total Spent:{" "}
          <span className="font-semibold">
            {currencySymbol}
            {totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </p>
      </div>

      {/* ── Charts (stack on mobile, side-by-side on ≥md) ── */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="mb-2 font-medium text-gray-700">
            Spending by Category
          </h3>
          <PieChart
            labels={catLabels}
            values={catValues}
            colors={catColors}
            currencySymbol={currencySymbol}
          />
        </div>

        {/* Bar Chart */}
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="mb-2 font-medium text-gray-700">Monthly Trend</h3>
          <BarChart
            labels={monthLabels}
            values={monthValues}
            color={barColor}
            currencySymbol={currencySymbol}
          />
        </div>
      </div>
    </section>
  );
}

