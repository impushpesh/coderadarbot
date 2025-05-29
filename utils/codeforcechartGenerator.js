import { ChartJSNodeCanvas } from "chartjs-node-canvas";

const width = 800; // px
const height = 400;

const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });

export const generateRatingChartCodeforces = async (ratingHistory) => {
  const labels = ratingHistory.map((entry, index) => `#${index + 1}`);
  const ratings = ratingHistory.map((entry) => entry.newRating);

  const configuration = {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Codeforces Rating",
          data: ratings,
          borderColor: "rgba(75,192,192,1)",
          backgroundColor: "rgba(75,192,192,0.2)",
          fill: true,
          tension: 0.1,
        },
      ],
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: "Codeforces Rating History",
        },
        legend: {
          display: true,
        },
      },
      scales: {
        y: {
          beginAtZero: false,
        },
      },
    },
  };

  // Return image buffer
  return await chartJSNodeCanvas.renderToBuffer(configuration);
};
