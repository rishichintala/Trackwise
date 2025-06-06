// src/components/BarChart.jsx
import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

export default function BarChart({ labels, values, color, currencySymbol }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Destroy previous instance if it exists
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext("2d");

    chartRef.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Total Spent",
            data: values,
            backgroundColor: color,
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false, // fill the parent’s height
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (val) => `${currencySymbol}${val}`, // prepend symbol
              font: {
                size: 11, // slightly smaller so numbers don’t crowd
              },
            },
          },
          x: {
            ticks: {
              font: {
                size: 10, // shrink x-axis labels on small screens
              },
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const v = context.parsed.y;
                return `${currencySymbol}${v.toFixed(2)}`;
              },
            },
          },
        },
      },
    });
  }, [labels, values, color, currencySymbol]);

  return (
    <div className="w-full h-64 sm:h-80">
      <canvas ref={canvasRef} />
    </div>
  );
}

