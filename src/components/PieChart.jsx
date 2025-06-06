// import { Pie } from 'react-chartjs-2';
// import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
// ChartJS.register(ArcElement, Tooltip, Legend);

// export default function PieChart({ data }) {
//   return <Pie data={{ labels: Object.keys(data), datasets: [{ data: Object.values(data) }] }} />;
// }


// import { Pie } from "react-chartjs-2";
// import { Chart, ArcElement, Tooltip, Legend } from "chart.js";

// Chart.register(ArcElement, Tooltip, Legend);

// export default function PieChart({ labels = [], data = [], backgroundColor = [] }) {
//   const chartData = {
//     labels,
//     datasets: [
//       {
//         data, 
//         backgroundColor,
//         borderColor: "#fff",
//         borderWidth: 2,
//       },
//     ],
//   };

//   const options = {
//     responsive: true,
//     plugins: {
//       legend: {
//         position: "bottom",
//         labels: {
//           boxWidth: 12,
//           padding: 16,
//         },
//       },
//       tooltip: {
//         callbacks: {
//           label: (ctx) => {
//             const value = ctx.parsed;
//             return `${ctx.label}: ${value.toLocaleString()}`;
//           },
//         },
//       },
//     },
//   };

//   return <Pie data={chartData} options={options} />;
// }




import React from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { useCurrency } from "../context/CurrencyContext";

// Register Chart.js components and the DataLabels plugin
Chart.register(ArcElement, Tooltip, Legend, ChartDataLabels);

export default function PieChart({ labels = [], data = [], backgroundColor = [] }) {
  const { currencySymbol } = useCurrency();

  // Build the Chart.js data object
  const chartData = {
    labels,
    datasets: [
      {
        data,
        backgroundColor,
        borderColor: "#ffffff",
        borderWidth: 2,
      },
    ],
  };

  // Configure options to show labels on top of slices
  const options = {
    responsive: true,
    plugins: {
      // Keep the regular tooltip on hover
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const value = ctx.parsed || 0;
            return `${ctx.label}: ${currencySymbol}${value.toLocaleString()}`;
          },
        },
      },
      legend: {
        position: "bottom",
        labels: {
          boxWidth: 12,
          padding: 16,
        },
      },
      // DataLabels plugin configuration
      datalabels: {
        color: "#ffffff",
        formatter: (value, context) => {
          // Show “₹1,234” (with your chosen currency symbol) on each slice
          return `${currencySymbol}${value.toLocaleString()}`;
        },
        font: {
          weight: "600",
        },
      },
    },
  };

  return <Pie data={chartData} options={options} />;
}
