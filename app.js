const express = require('express');
//const bodyParser = require('body-parser');
const path = require('path'); // 정적 페이지에 대해서 -> 보통 파일을 직접 보냄
const fs = require('fs');
const app = express();
const port = 33050;
app.locals.pretty = true;
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'pug');
app.use(express.static(path.join(__dirname, './public')));
//app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
const jsonFilePath = path.join(__dirname, 'data', 'homeData_test.json');
// let count = 47; // id, time 값 자동 카운트

// 각 키가 가지는 값들을 랜덤으로 만들어 주는 로직
const postRandomValue = async (lastId) => {
    // const fileData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));
    // let count = fileData.energyData[fileData.energyData.length - 1].id.split("_")[1];
    let count = lastId;
    count++;
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
    const idAtimeCount = (keyName) => {
        const idCount = String(`d_${count}`);
        const timeCount = String(`t_${count}`);
        if (keyName === 'id') return idCount;
        if (keyName === 'time') return timeCount;
    };

    const postRandom = {
        "id": idAtimeCount('id'),
        "time": idAtimeCount('time'),
        "livingRoom": generateRandomValues(),
        "kitchen": generateRandomValues(true),
        "bathRoom": generateRandomValues(true),
        "bedRoom1": generateRandomValues(),
        "bedRoom2": generateRandomValues()
    };
    console.log(postRandom);
    return postRandom;
}

let isPostDataEnabled = false; // 새로운 플래그 변수 추가
let timeoutId;
// postData 함수 수정
const postData = async () => {
    const updateData = async () => {
        try {
            if (isPostDataEnabled) { // 새로운 플래그 변수 체크
                // 데이터 업데이트 로직
                const fileData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));
                let count = fileData.energyData[fileData.energyData.length - 1].id.split("_")[1];

                const postRandom = await postRandomValue(count);
                console.log('postRandom:', postRandom);
                const environmentData = [...fileData.environment];
                const energyData = [...fileData.energyData];
                energyData.shift();
                energyData.push(postRandom);
                const result = { environment: environmentData, energyData: energyData };
                await fs.writeFileSync(jsonFilePath, JSON.stringify(result, null, 2), 'utf-8');
                console.log('JSON 파일이 주기적으로 POST 되었습니다.');
                // await data.energyData.push(postRandom);
                // // 변경된 데이터를 다시 JSON 파일에 쓰기
                // await fs.promises.writeFile(jsonFilePath, JSON.stringify(data, null, 2), 'utf-8');
            }
            timeoutId = setTimeout(updateData, 2000);
        } catch (error) {
            console.error('Error reading initial data:', error);
        }
    };
    updateData();
};
app.get('/home/updateData', async (req, res) => {
    try {
        res.render('home', { pageTitle: 'home dashboard' });
        isPostDataEnabled = true; // /updateData에서만 추가적인 POST 요청을 허용하기 위해 변수를 true로 변경합니다.
        postData(); // 이 부분을 주석 처리하거나 제거하면 한 번만 실행됩니다.
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/home', (req, res) => {
    isPostDataEnabled = false;
    clearTimeout(timeoutId);
    res.render('home', { pageTitle: 'home dashboard' });
});

app.get('/home/admin_energy', async (req, res) => {
    isPostDataEnabled = false;
    clearTimeout(timeoutId);
    res.render('admin', { pageTitle: 'home dashboard - admin' }); // index.pug -> title 변수지정 
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Internal Server Error!');
});

module.exports = app;
