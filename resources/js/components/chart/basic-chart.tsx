import { useEffect, useState } from 'react';
import axios from 'axios';
import Chart from 'react-apexcharts';
import dayjs from 'dayjs';

const BasicChart = () => {
    const [chartSeries, setChartSeries] = useState<any[]>([]);
    const [categories, setCategories] = useState<string[]>([]);

    const fetchGraphRecords = async () => {
        try {
            const res = await axios.get('/chart/fetch');

            // Create a full array of 12 months
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const counts = Array(12).fill(0);

            res.data.forEach((item: any) => {
                counts[item.month - 1] = item.count;
            });

            setChartSeries([{ name: 'Users', data: counts }]);
            setCategories(monthNames);
        } catch (err) {
            console.error('Failed to fetch chart data:', err);
        }
    };

    useEffect(() => {
        fetchGraphRecords();
    }, []);

    const chartOptions = {
        chart: {
            id: 'user-growth-chart',
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
            categories: categories,
        },
    };

    return (
        <div className="rounded-lg p-4 shadow bg-white dark:bg-gray-800 min-h-[350px]">
            <Chart
                options={chartOptions}
                series={chartSeries}
                type="line"
                width="100%"
                height="300"
            />
        </div>
    );
};

export default BasicChart;
