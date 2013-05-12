// Node modules
var http = require('http');
var url = require('url');
var path = require('path');
var fs = require('fs');

// Third party modules
var browserify = require('browserify');
var dnode = require('dnode');
var shoe = require('shoe');

// Constants
var basePath = path.join(__dirname, 'files');


// Handle incoming requests
var serve = function(req, res) {
  var parsed = url.parse(req.url);

  // Browserify client.js
  if (parsed.pathname === '/client.js') {
    // Create browserify bundle
    var bfy = browserify(path.join(__dirname, 'client.js'));

    // Set content headers
    res.statusCode = 200;
    res.setHeader('content-type', 'text/javascript');

    // Pipe finished bundle to the response
    bfy.bundle({debug: true}).pipe(res);
    return;
  }

  // Serve index.html
  if (parsed.pathname === '/index.html' || parsed.pathname === '/') {
    // Set content headers
    res.statusCode = 200;
    res.setHeader('content-type', 'text/html');

    // Pipe the file to the response
    fs.createReadStream(path.join(__dirname, 'index.html')).pipe(res);

    return;
  }

  // Serve 404
  res.statusCode = 400;
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.write('404 Not Found\n');
  res.end();
  return;
};


// Setup rpc with dnode
var sock = shoe(function (stream) {

  // Publish available methods
  // We just mirror some basic fs methods from Node
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

  // Pipe dnode to the shoe stream for setup
  d.pipe(stream).pipe(d);
});




// Startup the server
var server = http.createServer(serve);
server.listen(9999);
console.log('Server started at port 9999');

// Install dnode
sock.install(server, '/dnode');
console.log('Installed dnode');
