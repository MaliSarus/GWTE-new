const Twig = require('twig');
const express = require('express');
const path = require('path')
const fs = require('fs')


const app = express();

const pathToChunk = './src/assets/css/chunks.css'

var paths = {
  src: './src',
  build: './dist',
  data: './src/data/',
  sass: './src/assets/scss',
  css: './src/assets/css',
  js: './src/assets/js',
  images: './src/assets/images',
  img: './src/assets/images',
};

Twig.cache(false);
app.set('view engine', 'twig');
app.set('twig options', {
  base: paths.src + '/templates',
  strict_variables: false
});
app.set('views', paths.src + '/templates');

app.use(express.static(path.join('src')));

/*, '/!**!/!*.html'*/
app.get(['/:fileName'], (req, res) => {
  const dataForTwig = require('./src/data/data')
  let chunk = false;
  try {
    if (fs.existsSync(pathToChunk)) {
      chunk = true
    }
  }
  catch(err){
    console.log('Chunks not exist')
  }

  const fileName = req.params.fileName
  res.render(
    fileName + '.twig',
    {
      ...dataForTwig[fileName],
      url: '/' + fileName,
      chunk
    }
  );
});
app.get('/', function (req, res) {
  const dataForTwig = require('./src/data/data')
  let chunk = false;
  try {
    if (fs.existsSync(pathToChunk)) {
      chunk = true
    }
  }
  catch(err){
    console.log('Chunks not exist')
  }
  res.render(
    'index.twig',
    {
      ...dataForTwig.index,
      url: '/',
      chunk
    }
  );
});

const listener = app.listen();
const port = listener.address().port;

module.exports = port;