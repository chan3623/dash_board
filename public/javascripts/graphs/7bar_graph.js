function barGraph7(sketch, containerId, yLabels, step, unit) {
    console.log('sketch : ', sketch)
    let data;
    let canvasWidth, canvasHeight;

    sketch.setup = function () {
        const barArea = document.getElementById(containerId);
        canvasWidth = barArea.offsetWidth;
        canvasHeight = barArea.offsetHeight;

        sketch.createCanvas(canvasWidth, canvasHeight).parent(containerId);
        fetchData(); // 초기 데이터 가져오기
    }

    sketch.draw = function () {
        sketch.clear();
        fetchData(); // 실시간으로 데이터 업데이트

        drawBarGraph(data, canvasWidth, canvasHeight, yLabels, step, unit, sketch);
    }

    // 막대 그래프 그리는 함수
    function drawBarGraph(data, canvasWidth, canvasHeight, yLabels, step, unit, sketch) {
        const categories = data.categories;
        const values = data.values;
        const barWidth = canvasWidth * 0.43 / categories.length;
        const spacing = 16;
        const maxY = Math.max(...yLabels);
        for (let i = 0; i < categories.length; i++) {
            let x = (i * (barWidth + spacing)) + (canvasWidth * 0.125) + 20;
            let h = sketch.map(values[i], 0, maxY, 0, canvasHeight - 60);
            let y = canvasHeight - 30 - h;
            let w = barWidth - 1;

            sketch.noStroke();
            sketch.fill(219);
            sketch.rect(x, y, w, h, 6, 6, 0, 0);

            sketch.fill(255);
            sketch.textAlign(sketch.CENTER);
            sketch.text(values[i], x + barWidth / 2, y - 5);

            sketch.fill(255);
            sketch.textAlign(sketch.CENTER);
            sketch.text(categories[i], x + barWidth / 2, canvasHeight - 10);
        }
        // 세로축 눈금 텍스트 표시
        sketch.textAlign(sketch.RIGHT);
        for (let i = 0; i < yLabels.length; i++) {
            let y = sketch.map(yLabels[i], 0, maxY, canvasHeight - 30, 30);
            sketch.text(yLabels[i].toFixed(2), canvasWidth * 0.12, y + 3);
        }

        // 세로축 눈금선 그리기
        for (let i = 0; i < yLabels.length; i++) {
            let y = sketch.map(yLabels[i], 0, maxY, canvasHeight - 30, 30);
            sketch.stroke(237);
            sketch.line(canvasWidth * 0.13, y, canvasWidth - 20, y);
        }
    }

    // 데이터를 가져오는 함수
    function fetchData() {
        let count = 0;
        let countList = [];

        if (containerId === "month_ele_graph") {
            count = 0;
            data = {
                "categories": [],
                "values": []
            };
            let eleDayList = [];
            let ele7DayList = [];
            for (let i = 0; i < homeData.electricityResultList.length; i += 40) {
                eleDayList.push(homeData.electricityResultList.slice(i, i + 40));
            }
            let temp = 0;
            for (let i of eleDayList) {
                if (i.length === 40) {
                    count++;
                    countList.push(count);
                    if (count === 30) {
                        count = 0;
                    }
                    for (let j of i) {
                        temp += j;
                    }
                    ele7DayList.push(Number(temp.toFixed(2)));
                    temp = 0;
                }
            }
            for (let i = countList.length - 1; i >= countList.length - 7; i--) {
                if (countList[i] !== undefined) {
                    data["categories"].unshift(String(countList[i]));
                }
            }
            data["values"] = ele7DayList.slice(0, ele7DayList.length);
            yLabels = [0, 4.4, 8.8, 13.2];
        } else if (containerId === "month_gas_graph") {
            count = 0;
            data = {
                "categories": [],
                "values": []
            };
            let gasDayList = [];
            let gas7DayList = [];
            for (let i = 0; i < homeData.gasResultList.length; i += 40) {
                gasDayList.push(homeData.gasResultList.slice(i, i + 40));
            }
            let temp = 0;
            for (let i of gasDayList) {
                if (i.length === 40) {
                    count++;
                    // console.log("i : ", i)
                    countList.push(count);
                    if (count === 30) {
                        count = 0;
                    }
                    for (let j of i) {
                        temp += j;
                    }
                    gas7DayList.push(Number(temp.toFixed(2)));
                    temp = 0;
                }
            }
            // console.log('countList : ', countList)
            for (let i = countList.length - 1; i >= countList.length - 7; i--) {
                data["categories"].unshift(String(countList[i]));
            }
            data["values"] = gas7DayList.slice(0, gas7DayList.length);
            yLabels = [0, 35, 70, 105, 140];
        } else if (containerId === "month_water_graph") {
            count = 0;
            data = {
                "categories": [],
                "values": []
            };
            let waterDayList = [];
            let water7DayList = [];
            for (let i = 0; i < homeData.waterResultList.length; i += 16) {
                waterDayList.push(homeData.waterResultList.slice(i, i + 16));
            }
            let temp = 0;
            for (let i of waterDayList) {
                if (i.length === 16) {
                    count++;
                    countList.push(count);
                    if (count === 30) {
                        count = 0;
                    }
                    for (let j of i) {
                        temp += j;
                    }
                    water7DayList.push(Number((temp / 1000).toFixed(2)));
                    temp = 0;
                }
            }
            for (let i = countList.length - 1; i >= countList.length - 7; i--) {
                data["categories"].unshift(String(countList[i]));
            }
            data["values"] = water7DayList.slice(0, water7DayList.length);
            yLabels = [0, 0.08, 0.16, 0.24];
        }
    }
};
new p5(function (sketch) {
    barGraph7(sketch, "month_ele_graph", 3, "kWh");
});
// 가스 그래프 
new p5(function (sketch) {
    barGraph7(sketch, "month_gas_graph", 30, "MJ");
});
// 수도 그래프
new p5(function (sketch) {
    barGraph7(sketch, "month_water_graph", 0.08, "m3");
});