var gulp = require('gulp'),
    sass = require('gulp-ruby-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    imageopt = require('gulp-image-optimization'),
    plumber = require('gulp-plumber'),
    svgSprite = require("gulp-svg-sprites"),
    rename = require('gulp-rename'),
    sourcemaps = require('gulp-sourcemaps'),
    del = require('del');

var EXPRESS_PORT = 5000;
var EXPRESS_ROOT = __dirname;
var LIVERELOAD_PORT = 35729;

function startExpress() {
  var express = require('express');
  var app = express();
  app.use(require('connect-livereload')());
  app.use(express.static(EXPRESS_ROOT));
  app.listen(EXPRESS_PORT);
}

// We'll need a reference to the tinylr
// object to send notifications of file changes
// further down
var lr;
function startLiveReload() {
  lr = require('tiny-lr')();
  lr.listen(LIVERELOAD_PORT);
}

function notifyLiveReload(event) {
  // `gulp.watch()` events provide an absolute path
  // so we need to make it relative to the server root
  var fileName = require('path').relative(EXPRESS_ROOT, event.path);
  console.log(fileName + " was changed.")
  lr.changed({
    body: {
      files: [fileName]
    }
  });
}

gulp.task('default',['express', 'livereload'],function () {
  gulp.watch('src/sass/**/*.scss', ['css']);
  gulp.watch('src/svg/*.svg', ['svg']);
  gulp.watch('src/images/**/*', ['image']);
  gulp.watch('*.html', notifyLiveReload);
  gulp.watch('dist/css/*.css', notifyLiveReload);
  gulp.watch('dist/images/*', notifyLiveReload);
});

gulp.task('express',function(){
  startExpress();
})

gulp.task('livereload',function(){
  startLiveReload();
})

gulp.task('css', function() {
  return gulp.src('src/sass/global.scss')
    .pipe(plumber())
    .pipe(sass({style: 'expanded'}))
    .pipe(autoprefixer('last 2 version'))
    .pipe(gulp.dest('dist/css'))
    .pipe(rename({suffix: '.min'}))
    .pipe(minifycss())
    .pipe(gulp.dest('dist/css'));
});

gulp.task('svg', function () {
  return gulp.src('src/svg/*.svg')
    .pipe(svgSprite({mode: 'defs',svgId:'icon-%f',preview:false}))
    .pipe(gulp.dest('dist'));
});

gulp.task('image', function() {
  return gulp.src(['src/img/**/*'])
    .pipe(imageopt({
        optimizationLevel: 5,
        progressive: true,
        interlaced: true
    }))
    .pipe(gulp.dest('dist/img'));
});
