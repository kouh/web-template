var 
  gulp        = require('gulp'),
  $           = require('gulp-load-plugins')(),
  runSequence = require('run-sequence'),
  browserSync = require('browser-sync'),
  del         = require('del'),

  AUTOPREFIXER_BROWSERS = [
    'ie >= 9',
    'ff >= 30',
    'chrome >= 40',
    'safari >= 7',
    'opera >= 29',
    'ie_mob >= 10',
    'ios >= 7',
    'android >= 4.0',
  ];
  
gulp.task('eslint', function() {
  return gulp.src('app/scripts/**/*.js')
    .pipe(browserSync.reload({stream: true, once: true}))
    .pipe($.eslint())
    .pipe($.eslint.format())
    .pipe($.if(!browserSync.active, $.eslint.failOnError()));
});

gulp.task('images', function() {
  return gulp.src('app/images/**/*')
    .pipe($.cache($.imagemin({
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest('dist/images'));
});


gulp.task('fonts', function() {
  return gulp.src(['app/fonts/**'])
    .pipe(gulp.dest('dist/fonts'));
});

gulp.task('styles', function() {

  return gulp.src([
    'app/**/*.scss',
    'app/styles/**/*.css'
  ])
    .pipe($.changed('.tmp/styles', {extension: '.css'}))
    .pipe($.sourcemaps.init())
    .pipe($.sass({
      precision: 3
    }).on('error', $.sass.logError))
    .pipe($.autoprefixer(AUTOPREFIXER_BROWSERS))
    .pipe(gulp.dest('.tmp'))
    .pipe($.if('*.css', $.minifyCss()))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest('dist'));
});

gulp.task('scripts', function() {
  return gulp.src(['app/scripts/**/*.js'])
    .pipe($.babel())
    .pipe(gulp.dest('.tmp/scripts'))
    .pipe($.uglify({preserveComments: 'some'}))
    .pipe(gulp.dest('dist/scripts'));
});

gulp.task('html', function() {
  var assets = $.useref.assets({searchPath: '{.tmp,app}'});

  return gulp.src('app/**/*.html')
    .pipe(assets)
    .pipe($.if('*.css', $.minifyCss()))
    .pipe(assets.restore())
    .pipe($.useref())
    .pipe($.if('*.html', $.minifyHtml()))
    .pipe(gulp.dest('dist'));
});

gulp.task('clean', function(){ del(['.tmp', 'dist/*', '!dist/.git'], {dot: true})});

gulp.task('watch', function() {
  browserSync({
    notify: false,
    https: false,
    server: ['.tmp', 'app']
  });

  gulp.watch(['app/**/*.html'], browserSync.reload);
  gulp.watch(['app/styles/**/*.{scss,css}'], ['styles', browserSync.reload]);
  gulp.watch(['app/scripts/**/*.js'], ['scripts', 'eslint']);
  gulp.watch(['app/images/**/*'], browserSync.reload);
});

gulp.task('build', ['clean'], function(cb) {
  runSequence(
    'styles', 
    'scripts',
    ['eslint', 'html', 'images', 'fonts'],
    cb
  );
});

gulp.task('default', ['watch']);

