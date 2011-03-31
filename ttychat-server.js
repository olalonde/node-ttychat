#!/usr/local/bin/node

var util = require('util'),
    net = require('net'),
    exec = require('child_process').exec; 

Array.prototype.remove = function(e) {
  for (var i = 0; i < this.length; i++) {
    if (e == this[i]) { return this.splice(i, 1); }
  }
};

var socket_path = "/tmp/ttychat.sock";
var clients = []

function Client(socket) {
  this.name = null;
  this.socket = socket;
}

var broadcast = function(message, except) {
  clients.forEach(function(c) {
    if(c != except) c.socket.write(message);
  });
}

var is_name_taken = function(name) {
  var taken = false;
  clients.forEach(function(c) {
    if(c.name == name) taken = true;
  });
  return taken;
}

var server = net.createServer(function (socket) {
  var client = new Client(socket);
  clients.push(client);
  
  socket.setTimeout(0);
  socket.write("Welcome on HN's unofficial chat server!\nEnter your username:\n");
  socket.on('data', function(data) {
    if(client.name == null) {
      var name = data.toString().match(/\w+/).toString();
      if(is_name_taken(name)) {
        socket.write("Name already taken, please try another one.\n");
      }
      else {
        client.name = name;
        util.log(client.name + " connected.");
        broadcast(client.name + " connected.\n", client);
      }
      return;
    }
    var message = '<' + client.name + '> ' + data;
    broadcast(message);
  });
  socket.on('end', function() {
    clients.remove(client);
    if(!client.name) return;
    util.log(client.name + " disconnected.");
    broadcast(client.name + " disconnected.\n");
  });
});

// Create socket file
exec('nc -U ' + socket_path, function () {
  // Start server
  server.listen(socket_path, function() {
    util.log('Server started. Waiting for connections on ' + socket_path);
  });
});
