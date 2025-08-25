function lineGraph(sketch, containerId, step, unit, color) {
    let data;
    let yLabels;
    sketch.setup = function () {
        const lineArea = document.getElementById(containerId);
        const canvasWidth = lineArea.offsetWidth;
        const canvasHeight = lineArea.offsetHeight;
        initData(containerId);
        sketch.createCanvas = sketch.createCanvas(canvasWidth, canvasHeight).parent(containerId);
    };
    sketch.draw = function () {
        const lineArea = document.getElementById(containerId);
        const canvasWidth = lineArea.offsetWidth;
        const canvasHeight = lineArea.offsetHeight;
        drawLineGraph(data, canvasWidth, canvasHeight, yLabels, step, unit, color, sketch);
    };
    function initData(containerId) {
        if (containerId === "day_ele_graph") {
            data = {
                "categories": ["00", "03", "06", "09", "12", "15", "18", "21"],
                "values": []
            };
            yLabels = [0, 0.55, 1.1, 1.65];

        } else if (containerId === "day_gas_graph") {
            data = {
                "categories": ["00", "03", "06", "09", "12", "15", "18", "21"],
                "values": []
            };
            yLabels = [0, 4.5, 9, 13.5, 18];
        } else if (containerId === "day_water_graph") {
            data = {
                "categories": ["00", "03", "06", "09", "12", "15", "18", "21"],
                "values": []
            };
            yLabels = [0.0, 0.01, 0.02, 0.03];
        }
        // 초기 데이터 설정 (예시로 랜덤값 사용)
        updateData(containerId);

        // 데이터 업데이트를 위한 setInterval 사용
        setInterval(function () {
            updateData(containerId);
        }, 1000);
    }

    function updateData(containerId) {
        if (containerId === "day_ele_graph") {
            let eleDayList = [];
            for (let i = 0; i < homeData.electricityResultList.length; i += 40) {
                eleDayList.push(homeData.electricityResultList.slice(i, i + 40));
            }
            let temp = 0;
            eleDayList[eleDayList.length - 1].forEach((v, i, a) => {
                temp += v;
                if ((i + 1) % 5 === 0 || i === a.length - 1) {
                    data["values"].push(Number(temp.toFixed(2)));
                    temp = 0;
                }
            });
        } else if (containerId === "day_gas_graph") {
            let gasDayList = [];
            for (let i = 0; i < homeData.gasResultList.length; i += 40) {
                gasDayList.push(homeData.gasResultList.slice(i, i + 40));
            }
            let temp = 0;
            gasDayList[gasDayList.length - 1].forEach((v, i, a) => {
                temp += v;
                if ((i + 1) % 5 === 0 || i === a.length - 1) {
                    data["values"].push(Number(temp.toFixed(2)));
                    temp = 0;
                }
            });
        } else if (containerId === "day_water_graph") {
            let waterDayList = [];
            for (let i = 0; i < homeData.waterResultList.length; i += 16) {
                waterDayList.push(homeData.waterResultList.slice(i, i + 16));
            }
            let temp = 0;
            waterDayList[waterDayList.length - 1].forEach((v, i, a) => {
                temp += v;
                if ((i + 1) % 2 === 0 || i === a.length - 1) {
                    data["values"].push(Number((temp / 1000).toFixed(3)));
                    temp = 0;
                }
            });
        }
        redraw();
    }
    function redraw() {
        // p5.js의 redraw 함수를 호출하여 draw 함수를 다시 실행
        // 이렇게 하면 실시간으로 그래프가 업데이트됩니다.
        sketch.redraw();
    }

    // drawLineGraph 함수 정의
    function drawLineGraph(data, canvasWidth, canvasHeight, yLabels, step, unit, color, sketch) {
        const categories = data.categories;
        const values = data.values;
        const spacing = (canvasWidth - 110) / (categories.length - 1);
        const maxY = Math.max(...yLabels);
        const minY = Math.min(...yLabels);
        const maxYline = Math.ceil(maxY / step) * step;

        // 캔버스 초기화
        sketch.clear();

        // 세로축 눈금선 그리기
        for (let i = 0; i < yLabels.length; i++) {
            let y = sketch.map(yLabels[i], minY, maxY, canvasHeight - 30, 30);
            sketch.strokeWeight(1);
            sketch.stroke(237);
            sketch.fill(237);
            sketch.line(canvasWidth * 0.1, y, canvasWidth - 20, y);

            // 세로축 눈금선 단위 텍스트
            sketch.textAlign(sketch.RIGHT);
            sketch.noStroke();
            sketch.fill(237);
            sketch.text(yLabels[i], canvasWidth * 0.08, y + 5);
        }

        // 라인 그래프 그리기 시작
        sketch.beginShape();
        // 각 카테고리당 데이터 포인트 찍고 연결하여 라인 그리기
        for (let i = 0; i < categories.length; i++) {
            let x = i * spacing + 62; // 데이터 포인트의 x 좌표
            // console.log("values[i] : ", values[i])
            let y = sketch.map(values[i], minY, maxY, canvasHeight - 30, 30); // 데이터 포인트의 y 좌표
            sketch.vertex(x, y); // 라인 그래프의 점 추가

            // 데이터 포인트 위에 텍스트 표시
            sketch.noStroke();
            sketch.fill(237);
            sketch.text(values[i], x, y - 10);

            // 가로축 단위 텍스트 표시
            sketch.noStroke();
            sketch.fill(237);
            sketch.textAlign(sketch.CENTER);
            sketch.text(unit, canvasWidth * 0.06, canvasHeight - 185);
            sketch.text(categories[i], x, canvasHeight - 10);
        }

        // 그래프 라인 속성
        sketch.stroke(color);
        sketch.strokeWeight(5);
        sketch.noFill();

        // 라인 그래프 그리기 종료
        sketch.endShape();
    }
}
//전기 그래프
new p5(function (sketch) {
    lineGraph(sketch, "day_ele_graph", 1.65, "kWh", "rgb(111, 255, 155)");
});

// 가스 그래프
new p5(function (sketch) {
    lineGraph(sketch, "day_gas_graph", 1, "MJ", "rgb(98, 170, 255)");
});

// 수도 그래프
new p5(function (sketch) {
    lineGraph(sketch, "day_water_graph", 0.03, "m3", "rgb(37, 49, 159)");
});
