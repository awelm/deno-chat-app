function askForName() {
  const person = prompt("Please enter your name");
  return person || "Anonymous";
}

function escaped(s) {
  return $('<div></div>').html(s).html();
}

const myUsername = askForName();
let usernames = {};

$('#data').attr('placeholder', 'send message as ' + myUsername);

const socket = new WebSocket("ws://localhost:8080/ws_endpoint");

function addMessage(username, message, boldPrefix = false) {
  let prefix = escaped(username)
  if (boldPrefix) {
    prefix = '<b>' + prefix + '</b>'
  }
  $('#conversation').append( `${prefix}: ${escaped(message)} <br/>`);
}

// on connection to server, ask for user's name with an anonymous callback
socket.onopen = () => {
  // call the server-side function 'adduser' and send one parameter (value of prompt)
  socket.send(JSON.stringify({
    'event': 'add-user',
    'username': myUsername,
  }));
};

socket.onmessage = (m) => {
  const data = JSON.parse(m.data);

  switch(data.event) {
    case 'update-users':
      newUsernames = data.usernames;
      $('#users').empty();
      $.each(newUsernames, function (username, _) {
        if(username == myUsername) {
          $('#users').append('<div><b>' + username + '</b></div>');
        } else {
          $('#users').append('<div>' + username + '</div>');
        }
      });
      // update chat
      for (const [username, _] of Object.entries(newUsernames)) {
        if (username in usernames == false) {
          addMessage('connected', username);
        }
      }
      usernames = newUsernames;
      break;

    case 'update-chat':
      addMessage(data.username, data.message, boldPrefix=true);
  }
};

// on load of page
$(function () {
  // when the client hits ENTER on their keyboard
  $('#data').keypress(function (e) {
    if (e.which == 13) {
      var message = $('#data').val();
      $('#data').val('');
      // tell server to execute 'sendchat' and send along one parameter
      socket.send(JSON.stringify({
        'event': 'send-chat',
        'message': message,
      }))
    }
  });
});
