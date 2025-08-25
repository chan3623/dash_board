class OriginHomeDataExtraction {
  constructor(id) {
    this.id = id; //식별자
    this.temperatureList = []; //실내온도 데이터
    this.humidityList = []; //습도 데이터
    this.airConditionList = []; //대기질 데이터
    this.electricityResultList = []; //총 전기 데이터 리스트
    this.gasResultList = []; //총 가스 데이터 리스트
    this.waterResultList = []; //총 수도 데이터 리스트
    this.dailyWeather = []; //날씨 데이터
  }
  async timeSet() {
    setTimeout(async () => {
      await this.fetchHomeData(); // 데이터를 가져오는 부분
      await this.timeSet();
    }, 500);
  }
  //AJAX요청
  async fetchHomeData() {
    try {
      const environmentUrl = "http://localhost:33045/environment"
      const energyDataUrl = "http://localhost:33045/energyData"
      const response = await fetch(environmentUrl);
      const jsonData = await response.json();
      const response2 = await fetch(energyDataUrl);
      const jsonData2 = await response2.json();
      if (!response.ok) {
        throw new Error("데이터를 불러오는 중 에러가 발생했습니다.");
      }
      this.listClear();
      this.extractValuesCall(jsonData);
      this.extractValuesCall(jsonData2);
      this.calculateTotalCostByUsage();
      this.buttonClickEvent();
      this.averageIndoorData();
      this.weatherPrint();
      // 데이터가 정상적으로 가져와지지 않으면 에러 발생
    } catch (error) {
      console.error(error.message);
    }
  }
  //리스트 초기화 함수
  listClear() {
    this.temperatureList = [];
    this.humidityList = [];
    this.airConditionList = [];
    this.electricityResultList = [];
    this.gasResultList = [];
    this.waterResultList = [];
    this.dailyWeather = [];
  }
  //json데이터 parsing 함수
  extractValues(data, keyName, valueArray) {
    if (data) {
      for (let i in data) {
        if (Array.isArray(data[i])) {
          this.extractValues(data[i], keyName, valueArray);
        } else if (typeof data[i] === "object") {
          this.extractValues(data[i], keyName, valueArray);
        } else if (i === keyName) {
          valueArray.push(data[i]);
        }
      }
    }
  }
  //제네레이터 함수
  * extractValuesGenerator() {
    const keyNameAndList1 = [
      { keyName: "temperature", list: this.temperatureList },
      { keyName: "humidity", list: this.humidityList },
      { keyName: "homeWeather", list: this.dailyWeather },
      { keyName: "airCondition", list: this.airConditionList },
      { keyName: "elecV", list: this.electricityResultList },
      { keyName: "gasV", list: this.gasResultList },
      { keyName: "waterV", list: this.waterResultList }
    ];
    const iterKeyList = keyNameAndList1[Symbol.iterator]();
    for (const { keyName, list } of iterKeyList) {
      yield [keyName, list];
    }
  }
  //데이터 parsing 및 제네레이터 함수 호출하여 next()진행
  extractValuesCall(jsonData) {
    for (const [keyName, list] of this.extractValuesGenerator(jsonData)) {
      this.extractValues(jsonData, keyName, list);
    }
  }
  //대기질 수치의 따라 대기질 상태 표시
  averageIndoorData() {
    const sumData = array => array.reduce((acc, value) => acc + value, 0);
    const averageData = array => (sumData(array) / array.length).toFixed(1);
    const getAirConditionLabel = (value) => {
      if (value < 11) return "매우좋음";
      if (value < 21) return "좋음";
      if (value < 31) return "보통";
      if (value < 41) return "나쁨";
      return "매우나쁨";
    };
    const avgTemperature = averageData(this.temperatureList);
    const avgHumidity = averageData(this.humidityList);
    const avgAirCondition = averageData(this.airConditionList);
    const environmentAvg = [{ id: "average_temperature", avgValue: avgTemperature }, { id: "average_humidity", avgValue: avgHumidity }, { id: "average_air_condition", avgValue: getAirConditionLabel(avgAirCondition) }];
    environmentAvg.forEach(({ id, avgValue }) => {
      document.getElementById(id).innerHTML = avgValue;
    });

    const getWeatherColor = (value) => {
      if (value < 11) return "verygood";
      if (value < 21) return "good";
      if (value < 31) return "soso";
      if (value < 41) return "bad";
      return "verybad";
    };
    const weatherColor = document.getElementById("weather_color");
    weatherColor.classList.remove(weatherColor.className.split(" "));
    weatherColor.className = "txt environment_icon " + getWeatherColor(avgAirCondition);
  }
  // 오늘 날씨 이미지 출력
  weatherPrint() {
    const weatherIcon = document.getElementById("weather_icon");
    const weatherTypes = {
      "맑음": "맑음.png",
      "구름조금": "구름조금.png",
      "흐림": "흐림.png",
      "눈": "눈.png",
      "비": "비.png",
    };
    const {
      value
    } = this.dailyWeather[Symbol.iterator]().next();
    if (weatherTypes[value]) {
      const weatherIconLoad = `/images/${weatherTypes[value]}`;
      weatherIcon.style.backgroundImage = `url(${weatherIconLoad})`;
    }
  }
  //가스, 수도, 전기 및 url 변경 버튼 클릭 시 이벤트 발생 함수
  buttonClickEvent() {
    const lineButtons = [
      "month_ele_Data_btn", "month_gas_Data_btn", "month_water_Data_btn"
    ];
    const lineGraphs = [
      "month_ele_graph", "month_gas_graph", "month_water_graph"
    ];
    const barButtons = [
      "day_ele_Data_btn", "day_gas_Data_btn", "day_water_Data_btn"
    ];
    const barGraphs = [
      "day_ele_graph", "day_gas_graph", "day_water_graph"
    ];
    const startToStop = document.getElementById("homeStopStart");
    const graphBtn = (buttonArray, graphArray) => {
      buttonArray.forEach((button, index) => {
        const btn = document.getElementById(button);
        const graph = document.getElementById(graphArray[index]);
        btn.onclick = () => {
          buttonArray.forEach(b => document.getElementById(b).classList.remove("on"));
          graphArray.forEach(g => document.getElementById(g).classList.remove("graph_on"));
          btn.classList.add("on");
          graph.classList.add("graph_on");
        };
      });
    }
    graphBtn(lineButtons, lineGraphs);
    graphBtn(barButtons, barGraphs);
    document.getElementById("admin_move").addEventListener("click", () => {
      if (nowURL === "http://localhost:33050/home/updateData" || nowURL === "http://localhost:33050/home") {
        window.location.href = "http://localhost:33050/home/admin_energy";
      }
    });
    const nowURL = window.location.href;
    if (nowURL === "http://localhost:33050/home") {
      startToStop.classList.remove("start_btn");
      startToStop.classList.add("stop_btn");
    } else {
      startToStop.classList.add("start_btn");
      startToStop.classList.remove("stop_btn");
    }
    startToStop.onclick = () => {
      const startToStop_nowURL = window.location.href;
      if (startToStop_nowURL === "http://localhost:33050/home/updateData") {
        window.location.href = "http://localhost:33050/home";
      } else if (startToStop_nowURL === "http://localhost:33050/home") {
        window.location.href = "http://localhost:33050/home/updateData";
      }
    }
  }
  //전기,가스,수도 누적사용량의 따른 금액 계산
  calculateTotalCostByUsage() {
    const monthData = (list, sliceSize) => {
      const dataList = [];
      for (let i = 0; i < list.length; i += sliceSize) {
        dataList.length = 0;
        dataList.push(...list.slice(i, i + sliceSize));
      }
      return dataList;
    }
    const eleMonthData = monthData(this.electricityResultList, 1200);
    const gasMonthData = monthData(this.gasResultList, 1200);
    const waterMonthData = monthData(this.waterResultList, 480);
    const calculateAddValue = (dataList, multiplier) =>
      Math.floor(dataList.reduce((acc, curr) => acc + curr, 0) * multiplier);
    const eleValue = calculateAddValue(eleMonthData, 202);
    const waterValue = calculateAddValue(waterMonthData, 1110 / 1000);
    const gasValue = calculateAddValue(gasMonthData, 20);
    const resultDataValue = eleValue + waterValue + gasValue;
    const commaAdd = (value) => {
      let strValue = String(value);
      let count = 0;
      let resultValue = "";
      for (let i = strValue.length - 1; i >= 0; i--) {
        count++;
        resultValue = strValue[i] + resultValue;
        if (count % 3 === 0 && i !== 0) {
          resultValue = "," + resultValue;
        }
        value = resultValue;
      }
      return value;
    }
    const eleAddValue = commaAdd(eleValue);
    const waterAddValue = commaAdd(waterValue);
    const gasAddValue = commaAdd(gasValue);
    const resultAddValue = commaAdd(resultDataValue);
    let idNameAndValue = [{ idName: "money_elec", value: eleAddValue }, { idName: "money_gass", value: gasAddValue }, { idName: "money_water", value: waterAddValue }, { idName: "money_result", value: resultAddValue }];
    idNameAndValue.forEach(({ idName, value }) => {
      document.getElementById(idName).innerHTML = value;
    });
  }
}
//인스턴스 호출
const homeData = new OriginHomeDataExtraction("homeData");
homeData.fetchHomeData();
homeData.timeSet();
