// src/components/PieChart.jsx
import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

export default function PieChart({ labels, values, colors, currencySymbol }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // If a previous chart instance exists, destroy it first
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext("2d");

    chartRef.current = new Chart(ctx, {
      type: "pie",
      data: {
        // Embed label + amount into the slice label itself
        labels: labels.map((lbl, idx) => {
          const amt = values[idx] || 0;
          return `${lbl} (${currencySymbol}${amt.toFixed(2)})`;
        }),
        datasets: [
          {
            data: values,
            backgroundColor: colors,
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false, // Allow it to fill the parent’s height
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              boxWidth: 12,
              font: {
                size: 10, // shrink legend text so it doesn’t overflow on mobile
              },
            },
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const val = context.parsed;
                return `${currencySymbol}${val.toFixed(2)}`;
              },
            },
          },
        },
      },
    });
  }, [labels, values, colors, currencySymbol]);

  return (
    <div className="w-full h-64 sm:h-80">
      <canvas ref={canvasRef} />
    </div>
  );
}
