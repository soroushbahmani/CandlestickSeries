import { createChart } from "lightweight-charts";
import React, { useEffect, useRef } from 'react';

const Graph = () => {
    const chartRef = useRef(null);


    useEffect(() => {
        if (chartRef.current) {
            const chart = createChart(chartRef.current, {
                width: chartRef.current.clientWidth,
                height: 700,
            });
            prepareChart(chart);
        }
    }, [])

    function prepareChart(chart) {

        var candleSeries = chart.addCandlestickSeries();

        var data = [
            { time: "2018-10-19", open: 54.62, high: 55.5, low: 54.52, close: 54.9 },
            { time: "2018-10-22", open: 55.08, high: 55.27, low: 54.61, close: 54.98 },
            { time: "2018-10-23", open: 56.09, high: 57.47, low: 56.09, close: 57.21 },
            { time: "2018-10-24", open: 57.0, high: 58.44, low: 56.41, close: 57.42 },
            { time: "2018-10-25", open: 57.46, high: 57.63, low: 56.17, close: 56.43 },
        ];


        candleSeries.setData(data);
        var lastClose = data[data.length - 1].close;
        var lastIndex = data.length - 1;

        var targetIndex = lastIndex + 105 + Math.round(Math.random() + 30);
        var targetPrice = getRandomPrice();
        var currentIndex = lastIndex + 1;
        var currentBusinessDay = { day: 1, month: 1, year: 2024 };
        var ticksInCurrentBar = 0;
        var currentBar = {
            open: null,
            high: null,
            low: null,
            close: null,
            time: currentBusinessDay
        };

        function mergeTickToBar(price) {
            if (currentBar.open === null) {
                currentBar.open = price;
                currentBar.high = price;
                currentBar.low = price;
                currentBar.close = price;
            } else {
                currentBar.close = price;
                currentBar.high = Math.max(currentBar.high, price);
                currentBar.low = Math.min(currentBar.low, price);
            }
            candleSeries.update(currentBar);
        }

        function reset() {
            candleSeries.setData(data);
            lastClose = data[data.length - 1].close;
            lastIndex = data.length - 1;

            targetIndex = lastIndex + 5 + Math.round(Math.random() + 30);
            targetPrice = getRandomPrice();

            currentIndex = lastIndex + 1;
            currentBusinessDay = { day: 29, month: 5, year: 2019 };
            ticksInCurrentBar = 0;
        }

        function getRandomPrice() {
            return 10 + Math.round(Math.random() * 10000) / 100;
        }

        function nextBusinessDay(time) {
            var d = new Date();
            d.setUTCFullYear(time.year);
            d.setUTCMonth(time.month - 1);
            d.setUTCDate(time.day + 1);
            d.setUTCHours(0, 0, 0, 0);
            return {
                year: d.getUTCFullYear(),
                month: d.getUTCMonth() + 1,
                day: d.getUTCDate()
            };
        }

        setInterval(function () {
            var deltaY = targetPrice - lastClose;
            var deltaX = targetIndex - lastIndex;
            var angle = deltaY / deltaX;
            var basePrice = lastClose + (currentIndex - lastIndex) * angle;
            var noise = 0.1 - Math.random() * 0.2 + 1.0;
            var noisedPrice = basePrice * noise;
            mergeTickToBar(noisedPrice);
            if (++ticksInCurrentBar === 5) {
                currentIndex++;
                currentBusinessDay = nextBusinessDay(currentBusinessDay);
                currentBar = {
                    open: null,
                    high: null,
                    low: null,
                    close: null,
                    time: currentBusinessDay
                };
                ticksInCurrentBar = 0;
                if (currentIndex === 5000) {
                    reset();
                    return;
                }
                if (currentIndex === targetIndex) {
                    lastClose = noisedPrice;
                    lastIndex = currentIndex;
                    targetIndex = lastIndex + 5 + Math.round(Math.random() + 30);
                    targetPrice = getRandomPrice();
                }
            }
        }, 1000);

    }
    return (
        <>
            <h1>Real time</h1>

            <div ref={chartRef} />
        </>
    )
}

export default Graph;