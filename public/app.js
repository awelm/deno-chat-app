const myUsername = prompt("Please enter your name") || "Anonymous";
const socket = new WebSocket(
  `ws://localhost:8080/start_web_socket?username=${myUsername}`
);

socket.onopen = () => {
  socketSend({
    event: "login",
  });
};

socket.onmessage = (m) => {
  const data = JSON.parse(m.data);

  switch (data.event) {
    case "update-users":
      // refresh displayed user list
      $("#users").empty();
      for (const username of data.usernames) {
        $("#users").append("<div>" + username + "</div>");
      }
      break;

    case "send-message":
      // display new chat message
      addMessage(data.username, data.message);
      break;
  }
};

function addMessage(username, message) {
  // displays new message
  $("#conversation").append(`<b> ${username} </b>: ${message} <br/>`);
}

function socketSend(obj) {
  socket.send(JSON.stringify(obj));
}

// on page load
$(function () {
  // when the client hits the ENTER key
  $("#data").keypress(function (e) {
    if (e.which == 13) {
      var message = $("#data").val();
      $("#data").val("");
      socketSend({
        event: "send-message",
        message: message,
      });
    }
  });
});
