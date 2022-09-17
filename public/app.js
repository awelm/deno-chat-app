const myUsername = prompt("Please enter your name") || "Anonymous";
let usernames = {};
const socket = new WebSocket("ws://localhost:8080/ws_endpoint");

function addMessage(username, message, boldPrefix = false) {
  if (boldPrefix) {
    username = '<b>' + username + '</b>'
  }
  $('#conversation').append( `${username}: ${message} <br/>`);
}

socket.onopen = () => {
  socket.send(JSON.stringify({
    'event': 'add-user',
    'username': myUsername,
  }));
};

socket.onmessage = (m) => {
  const data = JSON.parse(m.data);

  switch(data.event) {
    case 'update-users':
      const newUsernames = data.usernames;
      $('#users').empty();
      // update chat
      for (const [username, _] of Object.entries(newUsernames)) {
        $('#users').append('<div>' + username + '</div>');
        if (username in usernames == false) {
          addMessage('connected', username);
        }
      }
      usernames = newUsernames;
      break;

    case 'update-chat':
      addMessage(data.username, data.message, boldPrefix=true);
      break;
  }
};

// on load of page
$(function () {
  // when the client hits ENTER on their keyboard
  $('#data').keypress(function (e) {
    if (e.which == 13) {
      var message = $('#data').val();
      $('#data').val('');
      // tell server to execute 'send-chat' and send along one parameter
      socket.send(JSON.stringify({
        'event': 'send-chat',
        'message': message,
      }))
    }
  });
});
