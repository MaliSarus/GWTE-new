let fileswatch = 'html,htm,txt,json,md,woff2,php,twig' // List of files extensions for watching & hard reload

const {src, dest, parallel, series, watch} = require('gulp')
const browserSync = require('browser-sync').create()
const webpack = require('webpack-stream')
const sass = require('gulp-sass')
const autoprefixer = require('gulp-autoprefixer')
const gcmq = require('gulp-group-css-media-queries')
const rename = require('gulp-rename')
const imagemin = require('gulp-imagemin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const del = require('del')
const sassGlob = require('gulp-sass-glob')
const dataForTwig = require('./src/data/data');
const twig = require('gulp-twig');
const plumber = require('gulp-plumber');
const nodemon = require('gulp-nodemon');
const flatmap = require('gulp-flatmap')
const cleanCSS = require('gulp-clean-css');

var paths = {
  src: './src',
  build: './dist',
  data: './src/data/',
  sass: './src/assets/scss',
  css: './src/assets/css',
  js: './src/assets/js',
  images: './src/assets/images',
  img: './src/assets/img',
};

function express(cb) {
  let start = false
  return nodemon({
    script: 'server.js',
    ext: 'twig',
    env: {'NODE_ENV': 'development'},
  })
    .on('start', function () {
      if (!start) {
        start = true;
        cb()
      }
    })
    .on('restart', function () {
      setTimeout(function () {
        browserSync.reload();
      }, 1000);
    });
}

function browsersync(cb) {
  const port = require('./server')
  browserSync.init({
    proxy: 'localhost:' + port,
    startPath: '/',
    // proxy: "twig",
    host: 'localhost',
    port: 5000,
    notify: false,
    online: true,
    logPrefix: 'Proxy to localhost:' + port
  })
  cb()
}

function twigBuild(fileName, twigData) {
  return src([paths.src + '/templates/*.twig'])
    .pipe(flatmap(function (stream, file) {
      const fileName = file.stem
      const twigData = {
        ...dataForTwig[fileName],
        url: fileName === 'index' ? '/' : `/${fileName}`
      }
      return stream
        .pipe(plumber({
          handleError: function (err) {
            console.log(err);
            this.emit('end');
          }
        }))
        .pipe(twig({
          extname: '.php',
          data: twigData,
        }))
        .on('error', function (err) {
          process.stderr.write(err.message + '\n');
          this.emit('end');
        });
    }))
    .pipe(dest(paths.build));
};


function scripts() {
  del(paths.js + '/chunks/*', {force: true})
  return src(paths.js + '/app.js', {allowEmpty: true})
    .pipe(webpack(require('./webpack.config'))).on('error', function handleError() {
      this.emit('end')
    })
    .pipe(dest(paths.js))
    .pipe(browserSync.stream())
}

function styles() {
  return src(paths.sass + '/**/*.scss')
    .pipe(sassGlob())
    .pipe(sass({
      outputStyle: 'compact'
    }))
    .pipe(autoprefixer({
      overrideBrowserslist: ['last 10 versions'],
      grid: true,
      cascade: false
    }))
    .pipe(gcmq())
    .pipe(cleanCSS())
    // .pipe(rename('app.min.css'))
    .pipe(dest(paths.css))
    .pipe(browserSync.stream())
}

function minChunks() {
  return src(paths.css + '/**/chunks.css')
    .pipe(gcmq())
    .pipe(cleanCSS())
    .pipe(rename('chunks.min.css'))
    .pipe(dest(paths.css))
    .pipe(browserSync.stream())
}

function images() {
  return src(paths.images + '/**/*')
    .pipe(imagemin([
      imagemin.gifsicle({interlaced: true}),
      imagemin.mozjpeg({quality: 75, progressive: true}),
      imagemin.optipng({optimizationLevel: 3, interlaced: true}),
    ]))
    .pipe(dest(paths.img))
}

function cleanimg() {
  return del(paths.img + '/**/*', {force: true})
}

function clearDist() {
  return del(paths.build, {force: true})
}

function createBuild() {
  return src(paths.src + '/assets/**/*.*')
    .pipe(dest(paths.build + '/assets'))
}

function startwatch() {
  // watch(paths.src + '/**/*.twig', {usePolling: true}).on('change', browserSync.reload);
  watch(paths.sass + '/**/*', {usePolling: true}, styles);
  watch([paths.js + '/**/*.js', '!' + paths.js + '**/app.min.js', '!' + paths.js + '/chunks/*.js'], {usePolling: true}, scripts)
  watch(paths.images + '/**/*.{jpg,jpeg,png,webp,svg,gif}', {usePolling: true}, images)
  watch(paths.css + '/**/chunks.css', {usePolling: true}, minChunks);
  // watch(`${paths.src}/**/*.{${fileswatch}}`, {usePolling: true}).on('change', browserSync.reload)
}

exports.assets = series(cleanimg, scripts, images)
exports.scripts = scripts
exports.styles = styles
exports.images = images
exports.cleanimg = cleanimg
exports.build = series(clearDist, styles, images, twigBuild, createBuild)
exports.default = series(scripts, minChunks, images, styles, parallel( express,browsersync, startwatch))
