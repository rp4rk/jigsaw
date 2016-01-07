var gulp = require('gulp');
var babel = require('gulp-babel');
var sass = require('gulp-sass');
var jade = require('gulp-jade');
var autoprefixer = require('gulp-autoprefixer');

// Basic Tasks
gulp.task('css', function() {
  return gulp.src('src/scss/*.scss')
    .pipe(
      sass({
        includePaths: ['src/assets/stylesheets'],
        errLogToConsole: true
      }))
    .pipe(autoprefixer({
      browsers: ['> 1%', 'IE 8'], 
      cascade: false
    }))
    .pipe(gulp.dest('dist/css/'));
});

gulp.task('js', function() {
  return gulp.src('src/js/*.js')
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(gulp.dest('dist/js/'));
});

gulp.task('jade', function() {
  return gulp.src('src/*.jade')
    .pipe(jade({
      pretty: true
    }))
    .pipe(gulp.dest('dist'))
})

// Task builder
gulp.task('default', ['css', 'js', 'jade']);
