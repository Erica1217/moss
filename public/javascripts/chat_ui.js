// 신뢰할 수 없는 텍스트를 출력
function divEscapedContentElement(message) {
  return $('<div></div>').text(message);
}
// 시스템이 생성한 신뢰할 수 있는 내용 출력
function divSystemContentElement(message) {
  return $('<div></div>').html('<i>' + message + '</i>');
}

// 사용자 입력 처리
function processUserInput(chatApp, socket) {
  var message = $('#send-message').val();
  var systemMessage;

  if(message.charAt(0) == '/') {    // 사용자가 /로 시작하면 채팅 명령으로 처리
    systemMessage = chatApp.processCommand(message);
    if (systemMessage) {
      $('messages').append(divSystemContentElement(systemMessage));
    }
  } else {
    chatApp.sendMessage($('#room').text(), message);  // 다른 모든 사용자에게 입력한 내용을 전달
    $('#messages').append(divEscapedContentElement(message));
    $('#messages').scrollTop($('#messages').prop('scrollHeight'));
  }

  $('#send-message').val('');
}

// 클라이언트 측 애플리케이션의 초기화 로직
var socket = io.connect();

$(document).ready(function() {
  var chatApp = new Chat(socket);

  // 닉네임 변경 요청 결과 출력
  socket.on('nameResult', function(result) {
    var message;

    if (result.success) {
      message = 'You are now known as ' + result.name + '.';
    } else {
      message = result.message;
    }
    $('#messages').append(divSystemContentElement(message));
  });

  // 채팅방 변경 결과 출력
  socket.on('joinResult', function(result) {
    $('#room').text(result.room);
    $('#messages').append(divSystemContentElement('Room changed.'));
  });

  // 수신한 메시지 출력
  socket.on('message', function (message) {
    var newElement = $('<div></div>').text(message.text);
    $('#messages').append(newElement);
  });

  //입장할 수 있는 채팅방 목록 출력
  socket.on('rooms', function(rooms) {
    $('#room-list').empty();
    for(var room in rooms) {
      room = room.substring(1, room.length);
      if(room != '') {
        $('#room-list').append(divEscapedContentElement(room));
      }
    }

    //채팅방 이름 클릭해 채팅방 변경 가능하게
    $('#room-list div').click(function() {
      chatApp.processCommand('/join ' + $(this).text());
      $('#send-message').focus();
    });
  });

  // 주기적으로 채팅방 목록 요청
  setInterval(function() {
    socket.emit('rooms');
  }, 1000);

  $('#send-message').focus();

  //메시지 전송하기 위해 폼을 제출할 수 있게 한다.
  $('#send-form').submit(function() {
    processUserInput(chatApp, socket);
    return false;
  });
});
