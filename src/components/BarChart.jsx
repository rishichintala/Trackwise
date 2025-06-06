// import { Bar } from 'react-chartjs-2';
// import {
//   Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend,
// } from 'chart.js';
// ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

// export default function BarChart({ labels, totals }) {
//   return <Bar data={{ labels, datasets: [{ label: 'Total Spent', data: totals }] }} />;
// }


// import { Bar } from "react-chartjs-2";
// import {
//   Chart,
//   BarElement,
//   CategoryScale,
//   LinearScale,
//   Tooltip,
//   Legend,
// } from "chart.js";

// Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

// export default function BarChart({ labels = [], totals = [], backgroundColor = "#9CA3AF" }) {
//   const chartData = {
//     labels,
//     datasets: [
//       {
//         label: "Total Spent",
//         data: totals,
//         backgroundColor,
//         borderRadius: 4,
//         maxBarThickness: 40,
//       },
//     ],
//   };

//   const options = {
//     responsive: true,
//     scales: {
//       x: {
//         grid: { display: false },
//         ticks: { color: "#4B5563" }, // gray-700
//       },
//       y: {
//         beginAtZero: true,
//         grid: {
//           color: "#E5E7EB", // gray-200
//           borderDash: [4, 2],
//         },
//         ticks: {
//           color: "#4B5563", // gray-700
//           callback: (value) => value.toLocaleString(),
//         },
//       },
//     },
//     plugins: {
//       legend: {
//         display: true,
//         position: "bottom",
//         labels: {
//           boxWidth: 12,
//         },
//       },
//       tooltip: {
//         callbacks: {
//           label: (ctx) => {
//             const value = ctx.parsed.y;
//             return `Total: ${value.toLocaleString()}`;
//           },
//         },
//       },
//     },
//   };

//   return <Bar data={chartData} options={options} />;
// }




import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { useCurrency } from "../context/CurrencyContext";

// Register Chart.js components and the DataLabels plugin
Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, ChartDataLabels);

export default function BarChart({
  labels = [],
  totals = [],
  backgroundColor = "#9CA3AF",
}) {
  const { currencySymbol } = useCurrency();

  // Build the Chart.js data object
  const chartData = {
    labels,
    datasets: [
      {
        label: "Total Spent",
        data: totals,
        backgroundColor,
        borderRadius: 4,
        maxBarThickness: 40,
      },
    ],
  };

  // Configure options to show labels on top of bars
  const options = {
    responsive: true,
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#4B5563" }, // gray-700
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "#E5E7EB", // gray-200
          borderDash: [4, 2],
        },
        ticks: {
          color: "#4B5563", // gray-700
          callback: (value) => {
            // Format the y-axis labels with currency symbol
            return `${currencySymbol}${Number(value).toLocaleString()}`;
          },
        },
      },
    },
    plugins: {
      legend: {
        display: false, // You can toggle this on if you want a legend
      },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const value = ctx.parsed.y || 0;
            return `Total: ${currencySymbol}${value.toLocaleString()}`;
          },
        },
      },
      // DataLabels plugin configuration
      datalabels: {
        anchor: "end",
        align: "end",
        color: "#374151", // gray-700 (dark text on bar)
        formatter: (value, context) => {
          return `${currencySymbol}${value.toLocaleString()}`;
        },
        font: {
          weight: "500",
          size: 12,
        },
      },
    },
  };

  return <Bar data={chartData} options={options} />;
}
