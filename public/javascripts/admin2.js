let jsonParsDate = []; // 날짜 -> 시간 데이터와 항상 length가 같음
let jsonParsTimeData = []; // 시간 및 로우데이터
let dayList = []; // 2024-1-1
let dayDataList = []; // 8개의 시간을 1일로 묶음
let dayAndData = {}; // option에서 매칭을 위해 날짜를 키로 잡고 내용을 value로 하는 obj
let latelyTimeList = []; // 최근 데이터 
//const jsonPath = '../../data/homeData_test.json';
const jsonPath = 'http://localhost:2010/energyData';

// 화면 로드 후, json데이터 부르기
// 필요한 내용 파싱하기
//document.addEventListener('DOMContentLoaded', ()=>{      
//const jsonPath = 'http://localhost:33201/energyData';
async function fetchJsonFile() {
  // 페이지 로드될 때, try 안에서 감지하여 일어나는 일들 모두 써주기
  try {
    const response = await fetch(jsonPath);
    if (!response.ok) {
      throw new Error('Failed to fetch JSON file');
    }
    const jsonData = await response.json(); // json 데이터 받기
    console.log(jsonData);
    //console.log(jsonParsTimeData)
    await parseData(jsonData, 8); // 파싱함수 실행
    console.log(latelyTimeList); // 가장 최근 데이터
    console.log(dayDataList); // 8음의 시간을 1일로 묶음
    console.log(dayList); // 날짜 계산해서 2024-1-1 표기
    console.log(dayAndData);
    await loadOption(dayList); // 데이터 변경에 따라 옵션날짜 변경해서 로드
    await makeRowTable(dayList[0], dayAndData); // 최근 기준으로 테이블에 데이터 표시 
    // selectOption
    await selectOption(dayAndData); // 옵션 선택한 데이터와 매칭되서 테이블에 표시
  } catch (error) {
    console.error('JSON 파일을 가져오는 중 에러 발생:', error);
  }
}
fetchJsonFile();
//});

// 파싱 로직
const parseData = (jData, rangeN) => {
  // 날짜별 데이터 만들기
  for (let i = 0; i < jData.length; i += rangeN) {
    // 가장 최근 날의 시간
    latelyTimeList.length = 0;
    latelyTimeList.push(...jData.slice(i, i + rangeN));

    // 8시간을 1일로 파싱
    const daySlice = jData.slice(i, i + rangeN);
    dayDataList.push(daySlice);
  }

  // option에 필요한 달력 만들기, 매칭 데이터 만들기
  dayDataList.forEach((v, i) => {
    const monthDayCount = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    const calcDay = i + 1; // i=0부터 시작이라서 날짜보정.
    let totalDays = 0;
    let month = 0;
    while (calcDay > totalDays + monthDayCount[month]) { // 하루가 보정되어 있는 값이라서 부등호가 >= 가 아님
      totalDays += monthDayCount[month];
      month++;
    }
    const calcMonth = month + 1 // 인덱스라서(0부터) 달 보정.
    dayList.push(`2024-${calcMonth}-${calcDay}`);

    // option과 매칭 할 obj 만들기(키:값 할당하기)
    dayAndData[dayList[i]] = v;
  });
}

// 데이터에 따라 option 생성
const loadOption = (dayV) => {
  const selectTag = document.getElementById('selectHomeDate');

  // 데이터에 따른 option 초기화
  while (selectTag.firstChild) {
    selectTag.removeChild(selectTag.firstChild);
  }
  let reverseDayList = dayV.reverse();
  reverseDayList.forEach(option => {
    let replaceOption = option.replace(/'/g, '');

    const optionElement = document.createElement("option");
    optionElement.value = replaceOption;
    optionElement.textContent = option;
    selectTag.appendChild(optionElement);
  });
}

// option 선택 -> 선택날의 데이터
const selectOption = (jsonData) => {
  const selectTag = document.getElementById('selectHomeDate');
  selectTag.addEventListener('change', () => {
    const selectOptionValue = document.getElementById('selectHomeDate').value;
    makeRowTable(selectOptionValue, jsonData); // 선택날의 데이터 출력
  });
}


// 화면 출력
const makeRowTable = (optionV, matchingObj) => {
  const roomList = ["livingRoom", "kitchen", "bathRoom", "bedRoom1", "bedRoom2"];
  //const dayData = jsonD; // 날짜별 데이터, 배열안에 obj로 들어가 있음

  // 선택한 날짜(옵션)에 매칭되는 시간 데이터 만들기 
  let replaceKey = optionV.replace(/"/g, '');
  //console.log(replaceKey)

  const matchingData = () => {
    let selectData = {};
    for (let eachKey in matchingObj) {
      if (eachKey === replaceKey) {
        selectData[eachKey] = matchingObj[eachKey];
      }
    }
    return selectData;
  }
  const selectDayData = matchingData();
  console.log(selectDayData);

  let stringData = ""; // 한꺼번에 출력을 위한 누적변수

  const displayTable = () => {
    document.getElementById('tableScroll').innerHTML = " ";
    for (let dayKey in selectDayData) {
      // 뒤집기가 반복되지 않도록, 복제본을 만들어서 적용
      let orginArray = selectDayData[dayKey];
      let copyArray = [...orginArray];
      let reverseArray = copyArray.reverse(); // 내림차순으로 바꿔서 출력

      reverseArray.forEach((timeV, timeI) => {
        console.log(timeV.time);
        // 시간 보정
        const parseTime = timeV.time.split('_');
        const splitTime = parseTime[1];
        let calcTime = (splitTime % 8) * 3; // 0부터 순서대로 8로 나누었을때 -> 나머지는 항상 0~7 -> *3 으로 3시간씩 이라고 보정

        // create row table
        stringData = `<div class="admin_data_list">`;
        stringData += `<div class="data_txt">${calcTime}</div>`; // 각 데이터 시간 추가

        roomList.forEach((roomName, idx) => {
          stringData += `<div class="data_txt" id="${roomName}">`;
          stringData += `
        <p>전기<span id="elecV">${timeV[roomName].elecV}</span></p>
        <p>가스<span id="gasV">${timeV[roomName].gasV}</span></p>
      `;

          if (roomName === "kitchen" || roomName === "bathRoom") {
            stringData += `
          <p>수도<span id="waterV">${timeV[roomName].waterV}</span></p>
        `;
          }
          stringData += `</div>`;
        })
        stringData += `
        <div class="data_txt"> 
          <button id="changeBtn_${(calcTime / 3 + 1)}">수정</button>
        </div>
    `;
        stringData += `</div>`;
        document.getElementById('tableScroll').innerHTML += stringData;
      });
    }
  }
  displayTable();
}

const postRandomValue = () => {
  //let postRandom = {};
  const generateRandomValues = (hasWater = false) => {
    const generateRandomValue = (maxValue, minValue, decimalPlaces) => {
      const randomValue = (Math.random() * maxValue - minValue) + minValue;
      return parseFloat(randomValue.toFixed(decimalPlaces));
    };
    const values = {
      "elecV": generateRandomValue(0.33, 0.01, 2),
      "gasV": generateRandomValue(3.50, 0.3, 2),
    };
    if (hasWater) {
      values["waterV"] = generateRandomValue(15, 1);
    }
    return values;
  }

  const timeNameValue = () => {
    let count = 13;
    count++;
    const timeName = String(`t_${count}`);
    return timeName;
  };
  const postRandom = {
    "id": `d_15`,
    "time": timeNameValue(),
    "livingRoom": generateRandomValues(),
    "kitchen": generateRandomValues(true),
    "bathRoom": generateRandomValues(true),
    "bedRoom1": generateRandomValues(),
    "bedRoom2": generateRandomValues()
  };
  // console.log(this.postRandom);
  return postRandom;
}


// REST API  
// json데이터 추가
// const postHomeData = async (postId) => {
//   const postRandom = postRandomValue();
//   console.log(postRandom);
//   try {
//     const response = await fetch(`http://localhost:2010/energyData`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(postRandom),
//     });
//     if (response.status === 201) {  // 201 -> create
//       const data = await response.json();
//       console.log(data);
//     } else {
//       console.log("Error!");
//     }
//   } catch (error) {
//     console.error('Error :', error);
//   }
// };

let postId = 13;
setInterval(() => {
  postHomeData(postId);
  postId++
}, 3000);

document.addEventListener('DOMContentLoaded', () => {
  urlMove();
});

const urlMove = () => {
  document.getElementById("home_move").addEventListener("click", ()=>{
    const changedURL = "http://localhost:33045/home";
    window.location.href = changedURL;
  });
}


// PATCH
/*document.getElementById(`changeBtn_1`).addEventListener('click', async () => {
  // input으로 전환
  const roomList = ["livingRoom", "kitchen", "bathRoom", "bedRoom1", "bedRoom2"];
  roomList.forEach((roomName)=>{
  const makeRowTable = (roomName) =>{
    let stringData = "";
    if(roomName === "livingRoom" || roomName === "bedRoom"){
      stringData += `
        <div class="data_txt" id="${roomName}">
          <div class="admin_data_input">
            <label for="elecV">전기</label>
            <input type="number" id="elecV" value="${}">
          </div>
          <div class="admin_data_input">
            <label for="gasV">가스</label>
            <input type="number" id="gasV" value="${}">
          </div>
        </div>
      `;
    }else if(roomName === "kitchen" || roomName === "bathRoom"){
      stringData += `
        <div class="data_txt" id="${roomName}">
          <div class="admin_data_input">
            <label for="elecV">전기</label>
            <input type="number" id="elecV" value="${}">
          </div>
          <div class="admin_data_input">
            <label for="gasV">가스</label>
            <input type="number" id="gasV" value="${}">
          </div>
          <div class="admin_data_input">
            <label for="waterV">수도</label>
            <input type="number" id="waterV" value="${}">
          </div>
        </div>
      `;
    }
    //viewDataBox.innerHTML = `<div>찬룡아 일해라</div>`;
  }
});




  const data = {
    id: "h2",
    time: "03",
    livingRoom: {
      elecV: Number(livingRoomElecInput.value),
      gasV: Number(livingRoomGassInput.value),
    },
    kitchen: {
      elecV: 15,
      gasV: 54,
      waterV: 1,
    },
    bathRoom: {
      elecV: 3,
      gasV: 13,
      waterV: 12,
    },
    bedRoom1: {
      elecV: 29,
      gasV: 162,
    },
    bedRoom2: {
      elecV: 15,
      gasV: 39,
    },
  };

try {
  const response = await axios.post('http://localhost:33201/01_01', data, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  console.log(response.data);
} catch (error) {
  console.error('Error posting data:', error);
}
});*/

// POST -> 문제가 있는데.. 하..
/*document.getElementById('changeBtn').addEventListener('click', async () => {
  
  // 새로운 인풋창 생성

  const livingRoomElecInput = document.getElementById('livingRoomElec');
  const livingRoomGassInput = document.getElementById('livingRoomGass');

  const data = {
    id: "h2",
    time: "03",
    livingRoom: {
      elecV: Number(livingRoomElecInput.value),
      gasV: Number(livingRoomGassInput.value),
    },
    kitchen: {
      elecV: 15,
      gasV: 54,
      waterV: 1,
    },
    bathRoom: {
      elecV: 3,
      gasV: 13,
      waterV: 12,
    },
    bedRoom1: {
      elecV: 29,
      gasV: 162,
    },
    bedRoom2: {
      elecV: 15,
      gasV: 39,
    },
  };

try {
  const response = await axios.post('http://localhost:33201/01_01', data, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  console.log(response.data);
} catch (error) {
  console.error('Error posting data:', error);
}
});*/