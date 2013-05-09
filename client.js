var hyperglue = require('hyperglue');
var dnode = require('dnode');
var shoe = require('shoe');

var remote, editor;
var list = $('#list');
var heading = $('#title');
var safeButton = $('#save');
var currentFile = '';

var updateFile = function(filename) {
  remote.readFile(filename, function(error, content) {
    if (error) {
      return console.log(error);
    }
    // Set ACE values
    editor.setValue(content.toString());
    editor.gotoLine(1);

    // Set heading
    heading.html(filename);

    // Set current file
    currentFile = filename;
  });

};

var saveFile = function(event) {
  event.preventDefault();
  console.log('Saving: ' + currentFile);
  remote.writeFile(currentFile, editor.getValue(), function(error) {
    if (error) {
      return console.log(error);
    }
    console.log('Saved successfully');
  });
};

var updateList = function(files) {
  console.log('Updating list');


  // Clean list
  list.innerHtml = '';

  // Add new content
  files.forEach(function(file) {
    var item = '<li><a href="' + file + '">' + file + '</a></li>';
    list.append(item);
  });

  // Add event listener to file list
  $('#list a').click(function(event) {
    event.preventDefault();
    var filename = $(this).attr('href');
    console.log(event, this);
    updateFile(filename);
  });

};

$(function() {
  // Inititalize ACE
  editor = ace.edit('editor');
  editor.setTheme('ace/theme/github');
  editor.getSession().setMode('ace/mode/javascript');

  // Initialize the connection via dnode
  var stream = shoe('/dnode');
  var d = dnode();

  d.on('remote', function(r) {
    console.log('Connected on /dnode');
    remote = r;
    remote.readdir(function(error, files) {
      if (error) {
        return console.log(error);
      }
      console.log(files);
      updateList(files);
    });

    // Setup safe button
    safeButton.click(saveFile);
  });
  d.pipe(stream).pipe(d);
});







