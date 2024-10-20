// Replace with your actual Finnhub API key
const API_KEY = 'VSG9L5IX4MEOO1Q8';

// Initialize the chart and mode
let chart;
let currentChartMode = '1D';  // Default chart mode is '1D'

// Function to search for stock and update the chart with historical data
function searchStock() {

    const stockSymbol = document.getElementById('stock-search').value.toUpperCase();
    const timeRange = currentChartMode;  // Use the global chart mode for time range
    let startDate = '';
    let interval = '';
    let monthRange = '';

    if (getStartDateForTimeRange(timeRange) === 'TIME_SERIES_INTRADAY') {

        startDate = 'TIME_SERIES_INTRADAY';
        interval = '&interval=5min';
    }
    else if (getStartDateForTimeRange(timeRange) === 'TIME_SERIES_INTRADAY-') {

        startDate = 'TIME_SERIES_INTRADAY';
        interval = '&interval=60min&outputsize=full';
    }
    else if (getStartDateForTimeRange(timeRange) === 'TIME_SERIES_MONTHLY') {

        const today = new Date();  // Current timestamp in seconds
        const month = today.getMonth() - 1 === -1 ? 12 : today.getMonth();
        const year = today.getMonth() - 1 === -1 ? today.getFullYear() - 1 : today.getFullYear();
        const monthText = month < 10 ? `0${month}` : month;
        
        startDate = 'TIME_SERIES_MONTHLY';
        monthRange = `&month=${year}-${monthText}`;
    }
    if (stockSymbol) {

        const url = `https://www.alphavantage.co/query?function=${startDate}&symbol=${stockSymbol}${interval}${monthRange}&apikey=${API_KEY}`;

        fetch(url)
        .then(response => response.json())
        .then(data => {

            if (data) {

                const labels = [];
                const prices = [];
                let index = 0;

                for (const fields in data) {

                    if (index < 1) {

                        index++;
                    }
                    else if (index === 1) {

                        for (const field in data[fields]) {

                            labels.push(field);
                            prices.push(data[fields][field]['4. close']);
                        }

                        break;
                    }
                }
                // Update the chart with the historical stock data
                chart.data.labels = labels;
                chart.data.datasets[0].data = prices;
                chart.data.datasets[0].label = `Stock Price of ${stockSymbol} (${timeRange})`;
                chart.update();
            }
            else {

                alert(`Error: Stock data not found for ${stockSymbol}.`);
            }
        })
        .catch(error => console.error('Error fetching historical stock data:', error));
    }
    else {

        alert('Error: Please enter a stock symbol.');
    }
}

// Helper function to calculate the start date for each time range
function getStartDateForTimeRange(timeRange) {

    switch (timeRange) {
        case '1D':
            return 'TIME_SERIES_INTRADAY';  // 1 day ago
        case '1M':
            return 'TIME_SERIES_INTRADAY-';  // 1 month ago
        case 'Max':
            return 'TIME_SERIES_MONTHLY';  // 10 years ago (Max)
        default:
            return 'TIME_SERIES_INTRADAY';  // Default to 1 year ago
    }
}

// Function to initialize the chart
function initializeChart() {

    const ctx = document.getElementById('portfolioGraph').getContext('2d');

    chart = new Chart(ctx, {

        type: 'line',
        data: {

            labels: [],  // Empty labels for now, will be populated when stock data is fetched
            datasets: [{

                label: 'Stock Price',
                data: [],
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2,
                fill: false,
                pointRadius: 4,
                pointBackgroundColor: 'rgba(75, 192, 192, 1)'
            }]
        },
        options: {

            responsive: true,
            scales: {

                y: {

                    beginAtZero: false  // Start y-axis at a dynamic value based on stock prices
                }
            }
        }
    });
}

// Function to update the chart data based on time range
function updateChart(timeRange) {

    currentChartMode = timeRange;  // Set the global chart mode
    searchStock();
}

// On page load, initialize the chart
window.onload = function () {

    initializeChart();  // Initialize an empty chart when the page loads
};

