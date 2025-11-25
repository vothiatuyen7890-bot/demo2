var express = require('express');
var app = express();
var cookieParser = require('cookie-parser');
var fileUpload = require('express-fileupload');
var json2xls = require('json2xls');
var http = require('http');

// tạo server cho HTTP + WebSocket
var serverWS = http.createServer(app);

// tạm folder
var tempFileDir = "/public/data";
if (process.platform === "darwin") {
  tempFileDir = "." + tempFileDir;
}

// middleware
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: tempFileDir,
  limits: { fileSize: 50 * 1024 * 1024 },
  createParentPath: true,
  debug: true
}));

app.use(json2xls.middleware);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// routes
const authRouter = require('./routers/auth');
const userRouter = require('./routers/user');
const registerRouter = require('./routers/register');
const classRouter = require('./routers/class');
const chatRouter = require('./routers/chat');
const uploadRouter = require('./routers/upload');
const publicRoute = require('./routers/public');
const subjectRouter = require('./routers/subject');
const scoreRouter = require('./routers/score');
const semesterRouter = require('./routers/semester');
const adminRouter = require('./routers/admin');

const DBConnection = require('./module/DBModule/DBConnection');
const IOConnection = require('./module/IOModule/IOConnection');

// log request
app.use((req, res, next) => {
  var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
  console.log(`New request 
    TYPE: ${req.method} 
    URL: ${fullUrl} 
    Param: ${JSON.stringify(req.params)} 
    Body: ${JSON.stringify(req.body)} 
    Cookies: ${JSON.stringify(req.cookies)}
  `);
  next();
});

// use routes
app.use(userRouter);
app.use(authRouter);
app.use(registerRouter);
app.use(classRouter);
app.use(chatRouter);
app.use(uploadRouter);
app.use(publicRoute);
app.use(scoreRouter);
app.use(subjectRouter);
app.use(semesterRouter);
app.use(adminRouter);

// ---------- SERVER START ----------
(async () => {
  await DBConnection.Init();

  // Railway cấp PORT động
  const PORT = process.env.PORT || 8081;

  // chạy HTTP + WebSocket chung một PORT
  var server = serverWS.listen(PORT, () => {
    console.log("Server đang chạy tại PORT:", PORT);
  });

  // khởi tạo socket trên server
  var chatConnection = new IOConnection(server);
})();
