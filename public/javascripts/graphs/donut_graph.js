function donutSketch(sketch) {
    let eleList = [];
    let waterList = [];
    let gasList = [];
    let donutColors;

    sketch.setup = function() {
        let canvasArea = document.getElementById("donut_graph");
        let canvasWidth = canvasArea.offsetWidth;
        let canvasHeight = canvasArea.offsetHeight;

        sketch.createCanvas(canvasWidth, canvasHeight).parent('donut_graph');
        donutColors = [sketch.color('#62AAFF'), sketch.color('#25319F'), sketch.color('#6EFF9B')];
        // 처음에 데이터 가져오기
        fetchData();
    };

    sketch.draw = function() {
        //console.log(sketch.frameCount)
        // 일정 주기로 데이터 업데이트 및 그래프 다시 그리기
        if (sketch.frameCount % (60) === 0) {
            fetchData();
        }
        // 그래프 다시 그리기       
        drawDonutGraph();
    };

    function fetchData() {

        for (let i = 0; i < homeData.electricityResultList.length; i += 1200) {
            let slicedEach = homeData.electricityResultList.slice(i, i + 1200);
            eleList = slicedEach;
        }
        for (let i = 0; i < homeData.gasResultList.length; i += 1200) {
            let slicedEach = homeData.gasResultList.slice(i, i + 1200);
            gasList = slicedEach;
        }
        for (let i = 0; i < homeData.waterResultList.length; i += 480) {
            let slicedEach = homeData.waterResultList.slice(i, i + 480);
            waterList = slicedEach;
        }

        // 데이터 리스트를 일정 길이로 유지
        // if (eleList.length > 1200) {
        //     eleList.shift();
        // }
        // if (waterList.length > 480) {
        //     waterList.shift();
        // }
        // if (gasList.length > 1200) {
        //     gasList.shift();
        // }
    }

    function drawDonutGraph() {
        sketch.clear(); // 기존 그래프 지우기
        let canvasWidth = sketch.width;
        let canvasHeight = sketch.height;

        let temp = 0;
        let eleAddValue = 0;
        let gasAddValue = 0;
        let waterAddValue = 0;

        for (let i = 0; i < eleList.length; i++) {
            temp += eleList[i];
        }
        eleAddValue = Math.floor(temp * 202);
        temp = 0;

        for (let i = 0; i < waterList.length; i++) {
            temp += waterList[i];
        }
        waterAddValue = Math.floor((temp * 1110) / 1000);
        temp = 0;

        for (let i = 0; i < gasList.length; i++) {
            temp += gasList[i];
        }
        gasAddValue = Math.floor(temp * 20);

        resultDataValue = eleAddValue + waterAddValue + gasAddValue;
        let donutData = [eleAddValue, gasAddValue, waterAddValue];

        // 그래프 다시 그리기
        sketch.noStroke();
        drawDonut(canvasWidth / 2, canvasHeight / 2, 200, donutData, donutColors, canvasWidth, canvasHeight);

        // 데이터 금액 표시
        sketch.fill(255);
        sketch.textAlign(sketch.CENTER, sketch.CENTER);
        sketch.textSize(14);
    }

    function drawDonut(x, y, diameter, donutData, donutColors, canvasWidth, canvasHeight) {
        let total = donutData.reduce((acc, curr) => acc + curr, 0); // 데이터의 총합 계산

        let startAngle = 0;
        for (let i = 0; i < donutData.length; i++) {
            let angle = sketch.map(donutData[i], 0, total, 0, sketch.TWO_PI); // 데이터 비율에 따른 호의 각도 계산
            let midAngle = startAngle + (angle / 2);
            let endAngle = startAngle + angle; // 호의 끝 각도 계산

            // 부분 호 그리기
            sketch.fill(donutColors[i]);
            sketch.arc(x, y, diameter, diameter, startAngle, endAngle, sketch.PIE);

            // 데이터 비율 표시
            let dataPercent = sketch.nf((donutData[i] / total) * 100, 0); // 데이터의 비율을 백분율로 변환
            dataPercent = Number(dataPercent).toFixed(2);
            let textRadius = diameter / 2 * 0.73;
            let dataX = x + textRadius * sketch.cos(midAngle); // 데이터 텍스트의 x 좌표 계산
            let dataY = y + textRadius * sketch.sin(midAngle); // 데이터 텍스트의 y 좌표 계산
            sketch.textAlign(sketch.CENTER, sketch.CENTER);
            sketch.fill(255);
            sketch.textSize(14);
            sketch.text(dataPercent + "%", dataX, dataY);

            // 도넛 형태 만들기
            // 도넛 가운데 원
            sketch.fill(162, 158, 155);
            sketch.ellipse(x, y, diameter * 0.5, diameter * 0.5);
            startAngle = endAngle; // 시작 각도 업데이트
        }
    }
};

// p5.js 스케치 생성
new p5(donutSketch);
