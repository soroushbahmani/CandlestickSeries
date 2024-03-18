/* eslint-disable no-undef */
import { LineStyle, createChart } from 'lightweight-charts';
import React, { useRef, useState } from 'react'

export default function CustomChart2() {
    const chartContainr = useRef(null);
    const [isUpload, setIsUpload] = useState(false);

    const arryMinMax = (data, range) => {
        const startIndex = data.findIndex((candle) => candle.time === range?.from) || 0;
        const endIndex = data.findIndex((candle) => candle.time === range?.to) + 1 || undefined;

        let high = Number.MIN_SAFE_INTEGER;
        let low = Number.MAX_SAFE_INTEGER;
        let high_time = data[startIndex].time;
        let low_time = data[startIndex].time;

        data.slice(startIndex, endIndex).forEach(candle => {
            if ("high" in candle) {
                if (high <= candle.high) {
                    high = Math.max(high, candle.high)
                    high_time = candle.time
                }
                if (low >= candle.low) {
                    low = Math.min(low, candle.low)
                    low_time = candle.time
                }
            }
        });
        return { high, low, high_time, low_time }

    };

    const createCandelChart = (data) => {
        if (!chartContainr.current) return;

        const Chart = createChart(chartContainr.current, {
            layout: {
                textColor: 'block', background: { color: 'white' }
            },
            timeScale: {
                timeVisible: true,
                secondsVisible: false,
                rightOffset: 10
            },
            leftPriceScale: {
                autoScale: true
            },
            height: window.innerHeight - 50,
            width: chartContainr.current.clientWidth
        });

        const candelSeriesOptions = {
            upColor: "#26a69a",
            downColor: "#ef5335",
            borderVisible: false,
            wickUpColor: "#26a69a",
            wickDownColor: "#ef5350"
        }
        const candelSeries = Chart.addCandlestickSeries(candelSeriesOptions)
        candelSeries.setData(data)

        const createMaxMinMarkers = (props) => {
            if (props.low_time < props.high_time) {
                return [{
                    time: props.low_time,
                    position: "belowBar",
                    color: "#ef5350",
                    shape: "arrowUp",
                    text: "lowest low"
                }, {
                    time: props.high_time,
                    position: "aboveBar",
                    color: "#26a69a",
                    shape: "arrowDown",
                    text: "Heighest high"
                },
                ];
            } else {
                return [{
                    time: props.high_time,
                    position: "aboveBar",
                    color: "#26a69a",
                    shape: "arrowDown",
                    text: "Heighest high"
                },
                {
                    time: props.low_time,
                    position: "belowBar",
                    color: "#ef5350",
                    shape: "arrowUp",
                    text: "lowest low"
                },
                ];
            }
        }

        const highLine = candelSeries.createPriceLine({
            price: 0,
            color: 'green',
            lineWidth: 1,
            lineStyle: LineStyle.Solid
        })
        const lowLine = candelSeries.createPriceLine({
            price: 0,
            color: 'red',
            lineWidth: 1,
            lineStyle: LineStyle.Solid
        })

        Chart.timeScale().subscribeVisibleTimeRangeChange(handler => {
            const maxMinData = arryMinMax(candelSeries.data(), handler);
            candelSeries.priceScale().applyOptions({ autoScale: true, visible: true })
            highLine.applyOptions({
                price: maxMinData.high
            })
            lowLine.applyOptions({
                price: maxMinData.low
            })
            candelSeries.setMarkers(createMaxMinMarkers(maxMinData))
        });

        const handlerResize = () => {
            if (!chartContainr.current) return;
            Chart.applyOptions({
                width: chartContainr.current.clientWidth,
                height: chartContainr.current.clientHeight
            })
        }

        Chart.timeScale().subscribeVisibleLogicalRangeChange(logicalRange => {
            window.addEventListener('resize', handlerResize);
        })
    }

    const getInputFile = (event) => {
        if (!event.target.files?.length) return;
        setIsUpload(true);
        var file = event.target.files[0];
        var reader = new FileReader();
        reader.onload = function (progress) {
            if (!progress.target) return;
            const { result } = progress.target
            var lines = result.split("\n");
            const candelestikData = [];
            let candle = {
                time: Number(Date.now() / 1000),
                open: 0,
                high: 0,
                low: 0,
                close: 0
            }

            for (var line = 1; line < lines.length - 1; line++) {
                if (!lines[line]) return;
                const line_data = lines[line].split(", ");
                candle = {
                    time: Number(new Date(line_data[0] + " " + line_data[1]).getTime() / 1000),
                    open: Number(line_data[2]),
                    high: Number(line_data[3]),
                    low: Number(line_data[4]),
                    close: Number(line_data[5]),
                };
                candelestikData.push(candle)
            }

            createCandelChart(candelestikData);
        }
        reader.readAsText(file)


    }


    return (
        <div>
            <h1>Add file</h1>

            <div ref={chartContainr}></div>
            {
                !isUpload &&
                <input type="file" onChange={getInputFile} />
            }
        </div>
    )
}
