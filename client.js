// External dependencies
var dnode = require('dnode');
var shoe = require('shoe');

var remote, editor;
var list = $('#list');
var heading = $('#title input');
var safeButton = $('#save');
var newButton = $('#new');
var currentFile = 'new.js';

// Set current file
var setCurrentFile = function(name) {
  currentFile = name;

  // Set heading
  heading.val(name);
};

// Update the current file from the input
var updateCurrentFile = function() {
  setCurrentFile(heading.val());
};

// Update the displayed file given a filename
var updateFile = function(filename) {
  remote.readFile(filename, function(error, content) {
    if (error) {
      return console.log(error);
    }
    // Set ACE values
    editor.session.setValue(content.toString());
    editor.gotoLine(1);

    // Set current file
    setCurrentFile(filename);
  });
};

// Save the current file
var saveFile = function() {
  updateCurrentFile();

  if (!currentFile || currentFile === '') {
    return console.error('No file activated');
  }
  console.log('Saving: ' + currentFile);
  remote.writeFile(currentFile, editor.session.getValue(), function(error) {
    if (error) {
      return console.error(error);
    }
    console.log('Saved successfully');
    updateList();
  });
};

// Create a new file
var newFile = function() {
  editor.session.setValue('');
  setCurrentFile('');
};

// Update the displayed list of files
var updateList = function() {
  console.log('Updating list');
  remote.readdir(function(error, files) {
    if (error) {
      return console.error(error);
    }
    console.log(files);

    // Clean list
    list.html('');

    // new content
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

    updateList();

    // Setup safe button
    safeButton.click(function(event) {
      event.preventDefault();
      saveFile();
    });

    // Setup safe button
    newButton.click(function(event) {
      event.preventDefault();
      newFile();
    });
  });
  d.pipe(stream).pipe(d);
});
