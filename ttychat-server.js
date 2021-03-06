#!/usr/local/bin/node

var util = require('util'),
    net = require('net'),
    fs = require('fs'),
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
  socket.write("Welcome node-ttychat!\nEnter your username:\n");
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
        socket.write("You can now start chatting. Type !users for the list of connected users.\n");
      }
      return;
    }
    if (data.toString().match(/^!users/) == "!users") {
      clients.forEach(function(c) {
        if(c.name != null) socket.write(c.name + '\n');
      });
    }
    else {
      var message = '<' + client.name + '> ' + data;
      broadcast(message);
    }
  });
  socket.on('end', function() {
    clients.remove(client);
    if(!client.name) return;
    util.log(client.name + " disconnected.");
    broadcast(client.name + " disconnected.\n");
  });
});

// Start server
server.listen(socket_path, function() {
  util.log('Server started. Waiting for connections on ' + socket_path);
  fs.chmod(socket_path, "0777");
});

