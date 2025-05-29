import { ChartJSNodeCanvas } from 'chartjs-node-canvas';

const width = 800;
const height = 400;

const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });

/**
 * Generates a dual-line chart for LeetCode contest history.
 *
 * @param {Array} history - Array of contest objects from userContestRankingHistory
 * @returns {Promise<Buffer>} - Chart image buffer
 */
export const generateLeetCodeChart = async (history) => {
  // Filter attended contests
  const attendedContests = history.filter((entry) => entry.attended);

  // Extract labels, ratings, and rankings
  const labels = attendedContests.map((entry, idx) => `#${idx + 1}`);
  const ratings = attendedContests.map((entry) => entry.rating);
  const rankings = attendedContests.map((entry) => entry.ranking);

  const configuration = {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'LeetCode Rating',
          data: ratings,
          borderColor: 'rgba(54, 162, 235, 1)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          fill: true,
          tension: 0.1,
          yAxisID: 'y1',
        },
        {
          label: 'LeetCode Ranking',
          data: rankings,
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          fill: true,
          tension: 0.1,
          yAxisID: 'y2',
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'LeetCode Rating & Ranking History',
        },
        legend: {
          display: true,
        },
      },
      scales: {
        y1: {
          type: 'linear',
          position: 'left',
          title: {
            display: true,
            text: 'Rating',
          },
        },
        y2: {
          type: 'linear',
          position: 'right',
          reverse: true,
          title: {
            display: true,
            text: 'Ranking (lower is better)',
          },
          grid: {
            drawOnChartArea: false,
          },
        },
      },
    },
  };

  return await chartJSNodeCanvas.renderToBuffer(configuration);
};
