import React from 'react'
import Chart from 'react-apexcharts';

const BasicChart = () => {
    const chartOptions = {
        chart: {
            id: 'basic-line',
            toolbar: {
                show: true,
                tools: {
                    download: true,
                    selection: false,
                    zoom: false,
                    zoomin: false,
                    zoomout: false,
                    pan: false,
                    reset: false,
                }
            }
        },
        xaxis: {
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May']
        }
    };

    const chartSeries = [
        {
            name: 'Sales',
            data: [30, 40, 45, 50, 49]
        }
    ];
    return (
        <div className="rounded-lg p-4 shadow bg-white dark:bg-gray-800">
            <Chart
                options={chartOptions}
                series={chartSeries}
                type="line"
                width="100%"
                height="300"
            />
        </div>
    )
}

export default BasicChart