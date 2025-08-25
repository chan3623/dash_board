let express = require('express');
let app = express();
let fs = require('fs'); // 파일 시스템 모듈 추가
let path = require('path');

app.locals.pretty = true;
app.set('view engine', 'pug');
app.set('views', './views');
app.use(express.static(path.join(__dirname, './public')));
app.get('/home', function (req, res) {
    // JSON 파일 읽기
    // fs.readFile('homeData.json', 'utf8', function (err, data) {
    //     if (err) {
    //         console.error(err);
    //         return res.status(500).send('Internal Server Error');
    //     }

        // JSON 데이터 파싱
        // var jsonData = JSON.parse(data);

        // 렌더링 시 JSON 데이터 전달
        res.render('home');
    // });
});
app.get('/home/admin_energy', (req, res)=>{
    res.render('admin');
})

app.get('/home/updateData', function (req, res) {
    res.render('home');
});

app.listen(33045, function () {
    console.log('Connected 33045 port!');
});