var Chat = function(socket) {
  this.socket = socket;
};

// 채팅 메시지 전송 함수
Chat.prototype.sendMessage = function(room, text) {
  var message = {
    room: room,
    text: text
  };
  this.socket.emit('message', message);
};

// 채팅방 변경 함수
Chat.prototype.changeRoom = function(room) {
  this.socket.emit('join', {
    newRoom:room
  });
};

//채팅 명령어 처리
Chat.prototype.processCommand = function(command) {
  var words = command.split(' ');

  // 첫째 단어는 명령어 구문 분석
  var command = words[0]
                    .substring(1, words[0].length)
                    .toLowerCase();

  var message = false;

  switch(command) {
    case 'join' :
      words.shift();
      var room = words.join(' ');
      this.changeRoom(room);
      break;

    case 'nick' :
      words.shift();
      var name = words.join(' ');
      this.socket.emit('nameAttempt', name);
      break;

    default :
      message = 'Unrecognized command.';
      break;
  }

  return message;
};
