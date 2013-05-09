// Node modules
var http = require('http');
var url = require('url');
var path = require('path');
var fs = require('fs');

// Third party modules
var browserify = require('browserify');
var ecstatic = require('ecstatic')(__dirname);
var dnode = require('dnode');
var shoe = require('shoe');



// Handle incoming requests
var serve = function(req, resp) {
  var parsed = url.parse(req.url);

  // Browserify client.js
  if (parsed.pathname === '/client.js') {
    bfy = browserify(path.join(__dirname, 'client.js'));
    // Set content headers
    resp.statusCode = 200;
    resp.setHeader('content-type', 'text/javascript');
    bfy.bundle({debug: true}).pipe(resp);
    return;
  }

  // Static files
  ecstatic(req, resp);
};

var basePath = path.join(__dirname, 'files');

// Setup dnode
var sock = shoe(function (stream) {
  var d = dnode({
    readdir: function(callback) {
      fs.readdir(basePath, callback);
    },
    readFile: function(filename, callback) {
      fs.readFile(path.join(basePath, filename), function(error, content) {
        callback(error, content.toString());
      });
    },
    writeFile: function(filename, data, callback) {
      fs.writeFile(path.join(basePath, filename), data, callback);
    }
  });

  d.pipe(stream).pipe(d);
});




// Startup the server
var server = http.createServer(serve);
server.listen(9999);
console.log('Server started at port 9999');

// Install dnode
sock.install(server, '/dnode');
console.log('Installed dnode');
