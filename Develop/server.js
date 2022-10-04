const express = require('express');
const path = require('path');
const util = require('util');
const fs = require('fs');
// Promise version of fs.readFile
const readFromFile = util.promisify(fs.readFile);

// Helper method for generating unique ids
const uuid = require('./helpers/uuid');
const { get } = require('http');
//const 
//const api = require('server.js')

const PORT = 3001;

const app = express();

// Middleware for parsing JSON and urlencoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//app.use('/api', api);

/**
 *  Function to write data to the JSON file given a destination and some content
 *  @param {string} destination The file you want to write to.
 *  @param {object} content The content you want to write to the file.
 *  @returns {void} Nothing
 */
 const writeToFile = (destination, content) =>
 fs.writeFile(destination, JSON.stringify(content, null, 4), (err) =>
   err ? console.error(err) : console.info(`\nData written to ${destination}`)
 );
 
/**
 *  Function to read data from a given a file and append some content
 *  @param {object} content The content you want to append to the file.
 *  @param {string} file The path to the file you want to save to.
 *  @returns {void} Nothing
 */
 const readAndAppend = (content, file) => {
  fs.readFile(file, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
    } else {
      const parsedData = JSON.parse(data);
      parsedData.push(content);
      writeToFile(file, parsedData);
    }
  });
};

app.use(express.static('public'));



// GET Route for notes page
app.get('/notes', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/notes.html'))
);



app.delete('/api/notes/:id', (req, res) => {
  console.info(`${req.method} request received for tips`);
  readFromFile('./db/notes.json').then((data) => {
    //console.log( JSON.parse(data));
    let allNotes = JSON.parse(data);
    let postToDelete = req.params.id;
    for (i=0; i< allNotes.length; i++) {
      console.info(i);
      console.info(allNotes[i]);
      if(postToDelete === allNotes[i].id) {
        allNotes.splice(i,1);
        writeToFile('./db/notes.json', allNotes);
      } 
    }
    res.json(allNotes);
  });
});

app.get('/api/notes', (req, res) => {
  console.info(`${req.method} request received for notes`);
  readFromFile('./db/notes.json').then((data) => res.json(JSON.parse(data)));
});

// POST Route for a new note
app.post('/api/notes', (req, res) => {
  console.info(`${req.method} request received to add a note`);

  const { title, text } = req.body;

  if (req.body) {
    const newNote = {
      title,
      text,
      id: uuid(),
    };

    readAndAppend(newNote, './db/notes.json');
    res.json(`Note added successfully 🚀`);
  } else {
    res.error('Error in adding note');
  }
});



app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT} 🚀`)
);



