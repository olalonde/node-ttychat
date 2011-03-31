#!/usr/local/bin/node

var util = require('util'),
  net = require('net'),
  tty = require('tty');
  
var socket_path = "/tmp/ttychat.sock";

//tty.setRawMode(true); // disable tty echo 

var socket = new net.Socket({type: 'unix'});

socket.on('data', function(data) {
  process.stdin.write(data);
});

socket.on('connect', function(data) {
  process.stdin.resume();
  process.stdin.setEncoding('utf8');
  process.stdin.pipe(socket);
});

socket.on('error', function(data) {
  process.stdin.write("Server is offline.");
});

socket.on('end', function(data) {
  process.stdin.write("Disconnected from server.");
  process.exit();
});

socket.connect(socket_path, function() {});
