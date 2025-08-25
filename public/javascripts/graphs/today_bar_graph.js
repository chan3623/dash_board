// 실시간 싱글 막대(바) 그래프
function singleBarGraph(sketch, containerId, maxY, step, unit, color, category, yLabels) {
    let data;
    let elecY, gasY, waterY;

    sketch.setup = function() {
        const barArea = document.getElementById(containerId);
        const canvasWidth = barArea.offsetWidth;
        const canvasHeight = barArea.offsetHeight;

        initData(containerId);

        sketch.createCanvas(canvasWidth, canvasHeight).parent(containerId);
    }

    sketch.draw = function() {
        // draw 함수는 프레임마다 호출되므로, 여기에서 그래프를 그리고자 하는 업데이트된 데이터를 사용
        drawSingleBarGraph(data, sketch.width, sketch.height, maxY, step, unit, color, category, sketch, yLabels, elecY, gasY, waterY);
    }

    function initData(containerId) {
        if (containerId === "ele_graph") {
            data = {
                "categories": ["전기"],
                "values": []
            };
            elecY = [0.00, 0.50, 1.00, 1.50];
            yLabels = elecY;
        } else if (containerId === "gas_graph") {
            data = {
                "categories": ["가스"],
                "values": []
            };
            gasY = [0.00, 5.00, 10.00, 15.00];
            yLabels = gasY;
        } else if (containerId === "water_graph") {
            data = {
                "categories": ["수도"],
                "values": []
            };
            waterY = [0.00, 0.01, 0.02, 0.03];
            yLabels = waterY;
        }

        // 초기 데이터 설정 (예시로 랜덤값 사용)
        updateData(containerId);

        // 데이터 업데이트를 위한 setInterval 사용
        setInterval(function() {
            updateData(containerId);
        }, 500);
    }

    function updateData(containerId) {
        // 데이터 업데이트 코드 (예시로 랜덤값 사용)
        if (containerId === "ele_graph") {
            let temp = 0;
            for (let i = homeData.electricityResultList.length - 1; i >= homeData.electricityResultList.length - 5; i--) {
                temp += homeData.electricityResultList[i];
            }
            data.values = [temp];
        } else if (containerId === "gas_graph") {
            let temp = 0;
            for (let i = homeData.gasResultList.length - 1; i >= homeData.gasResultList.length - 5; i--) {
                temp += homeData.gasResultList[i];
            }
            data.values = [temp];
        } else if (containerId === "water_graph") {
            let temp = 0;
            for (let i = homeData.waterResultList.length - 1; i >= homeData.waterResultList.length - 2; i--) {
                temp += homeData.waterResultList[i];
            }
            data.values = [temp / 1000];
        }
        redraw();
    }

    function redraw() {
        // p5.js의 redraw 함수를 호출하여 draw 함수를 다시 실행
        // 이렇게 하면 실시간으로 그래프가 업데이트됩니다.
        sketch.redraw();
    }

    function drawSingleBarGraph(data, canvasWidth, canvasHeight, maxY, step, unit, color, category, sketch, yLabels, elecY, gasY, waterY) {
        // 그래프를 그리는 코드는 여기에 위치
        // 기존의 drawSingleBarGraph 함수를 사용하되, data를 전역 변수로 사용
        let categories = data.categories;
        let values = data.values;
        let barWidth = canvasWidth * 0.43 / categories.length;
        let spacing = 16;

        sketch.clear();

        // 세로축 눈금선 그리기
        for (let i = 0; i < yLabels.length; i++) {
            let y = sketch.map(yLabels[i], 0, yLabels[yLabels.length - 1], canvasHeight - 35, 33); 
            sketch.stroke(237);
            sketch.line(canvasWidth * 0.4, y, canvasWidth - 7, y);
        }

        // 세로축 눈금 텍스트 표시
        sketch.noStroke();
        sketch.fill(237);
        sketch.textSize(12);
        sketch.textAlign(sketch.RIGHT);
        for (let i = 0; i < yLabels.length; i++) {
            let y = sketch.map(yLabels[i], 0, yLabels[yLabels.length - 1], canvasHeight - 35, 30); 
            sketch.text(yLabels[i].toFixed(3), canvasWidth * 0.36, y+4);
        }

        // 싱글 막대 그리기
        for (let i = 0; i < categories.length; i++) {
            let x = (i * (barWidth + spacing)) + (canvasWidth * 0.37) + 10;
            let h = (values[i] / yLabels[yLabels.length - 1]) * (canvasHeight - 60); 
            let y = canvasHeight - 35 - h;
            let w = barWidth - 1;

            // 막대 속성
            sketch.noStroke();
            sketch.fill(color); // color 매개변수로 지정된 색상 사용
            sketch.rect(x, y, w, h, 6, 6, 0, 0);

            // 막대 위 텍스트
            sketch.stroke(195); // color 매개변수로 지정된 색상 사용
            sketch.fill(color); // color 매개변수로 지정된 색상 사용
            sketch.textSize(14);
            sketch.textAlign(sketch.CENTER);
            sketch.text(values[i].toFixed(3) + ' ' + unit, x + barWidth / 2, y - 10); // 단위 추가

            // 가로축 텍스트 (카테고리: 전기, 가스, 수도)
            sketch.noStroke();
            sketch.fill(237);
            sketch.textAlign(sketch.CENTER);
            sketch.textSize(13);
            sketch.text(category, x + barWidth / 2, canvasHeight - 15);
        }
    }
}

new p5(function (sketch) {
    singleBarGraph(sketch, "ele_graph", 1.5, 0.5, "kWh", "rgb(111, 255, 155)", "전기");
});
new p5(function (sketch) {
    singleBarGraph(sketch, "gas_graph", 1, 0.5, "MJ", "rgb(98, 170, 255)", "가스");
});
new p5(function (sketch) {
    singleBarGraph(sketch, "water_graph", 0.009, 0.030, "m3", "rgb(37, 49, 159)", "수도");
});