var http = require('http'); // http 서버와 클라잉언트 기능을 제공하는 내장 http 모듈
var fs = require('fs');     // 파일시스템 관련 기능을 제공하는 내장 fs 모듈
var path = require('path'); // 파일시스템 경로 관련 기능을 제공하는 내장 path 모듈
var mime = require('mime'); // 파일명 확장자 기반의 MIME 타입 추론 기능 제공하는 외부 mime 모듈
var cache = {};             // 캣 된 내용이 저장되는 cache 객체



/* HTTP 파일 서비스에 필요한 헬퍼 함수 */
function send404(response) {
  response.writeHead(404, {'Content-Type' : 'text/plain'});
  response.write('Error 404: resource not found.');
  response.end();
}

function sendFile(response, filePath, fileContents) {
  response.writeHead(
    200,
    {"content-type" : mime.lookup(path.basename(filePath))}
  );
  response.end(fileContents);
}

// 캐시에서 읽고 서비스한다.
// 해당 path에 캐시에 저장된 내용이 없다면
// fs를 이용해 디스크에서 읽어와 서비스 한다.
// 디스크에도 없으면 404 오류를 발생한다.
function serveStatic(response, cache, absPath) {
  if (cache[absPath]) {   // 캐시에 파일이 존재
    sendFile(response, absPath, cache[absPath]);
  } else {     // 캐시에 파일이 없음
      fs.exists(absPath, function(exists) {
        if(exists) {  // 디스크에 파일이 존재
          fs.readFile(absPath, function(err, data) {
            if(err) {
              send404(response);
            } else {
              cache[absPath] = data;
              sendFile(response, absPath, data);
            }
          });
        } else {  // 디스크에도 파일이 없음
          send404(response);
        }
      });
  }
}

var server = http.createServer(function(request, response) {
  var filePath = false;
  if (request.url == '/') {
    filePath = 'public/index.html';
  } else {
    filePath = 'public' + request.url;
  }
  var absPath = './' + filePath;
  serveStatic(response, cache, absPath);
});

server.listen(3000, function() {
  console.log("Server listening on port 3000.");
});

var chatServer = require('./lib/chat_server');
chatServer.listen(server);
