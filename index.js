const app = require('./app'); // app.js를 가져옴
const port = process.env.PORT || 33050;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
