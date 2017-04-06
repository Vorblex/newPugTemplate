var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var pug = require('gulp-pug');
var useref = require('gulp-useref');
var uglify = require('gulp-uglify');
var gulpIf = require('gulp-if');
var cssnano = require('gulp-cssnano');
var sourcemaps = require('gulp-sourcemaps');
var imagemin = require('gulp-imagemin');
var cache = require('gulp-cache');
var del = require('del');
var plumber = require('gulp-plumber');
var notify = require('gulp-notify');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync').create();


var options = {
    sourcemaps: './maps',
    pug: {
        src: 'app/pug/*.pug',
        dest: 'app'
    },
    sass: {
        src: 'app/sass/**/*.sass',
        dest: 'app/css'
    },
    useref: {
        src: 'app/*.html',
        dest: 'dist'
    },
    images: {
        src: 'app/images/**/*.+(png|jpeg|jpg|gif|svg)',
        dest: 'dist/images'
    },
    fonts: {
        src: 'app/fonts/**/*',
        dest: 'dist/fonts'
    },
    browserSync: {
        baseDir: 'app'
    }
};



/* ========================================= *
 *                 T A S K S                 *
 * ========================================= */

/* Browser-sync
 * ------------ */
gulp.task('browserSync', function() {
    browserSync.init({
        server: {
            baseDir: options.browserSync.baseDir
        }
    });
});


/* ------------------------- *
 *       PREPROCESSING
 * ------------------------- */

/*     Sass
 * ------------ */
gulp.task('sass', function() {
    return gulp.src(options.sass.src)
        .pipe(plumber({
            errorHandler: notify.onError(function(err) {
                return {
                    title: 'Styles',
                    message: err.message
                }
            })
        }))
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer())
        .pipe(sourcemaps.write(options.sourcemaps))
        .pipe(gulp.dest(options.sass.dest))
        .pipe(browserSync.reload({
            stream: true
        }));
});

/* Pug (Formely known as Jade)
 * --------------------------- */
gulp.task('pug', function() {
    return gulp.src(options.pug.src)
        .pipe(plumber({
            errorHandler: notify.onError(function(err) {
                return {
                    title: 'Styles',
                    message: err.message
                }
            })
        }))
        .pipe(pug({
            pretty: true
        }))
        .pipe(gulp.dest(options.pug.dest));
});


/* ------------------------- *
 *       OPTIMIZATION
 * ------------------------- */

/* Styles and Scripts
 * ------------------- */
gulp.task('useref', function() {
    return gulp.src(options.useref.src)
        .pipe(useref())
        .pipe(gulpIf('*.js', uglify()))
        .pipe(gulpIf('*.css', cssnano()))
        .pipe(gulp.dest(options.useref.dest));
});

/* Images
 * ------ */
gulp.task('images', function() {
    return gulp.src(options.images.src)
        .pipe(cache(imagemin({
            interlaced: true
        })))
        .pipe(gulp.dest(options.images.dest));
});

/* Fonts
 * ------ */
gulp.task('fonts', function() {
    return gulp.src(options.fonts.src)
        .pipe(gulp.dest(options.fonts.dest));
});


/* ------------------------- *
 *         CLEANUP
 * ------------------------- */

gulp.task('clean:dist', function() {
    return del.sync('dist');
});

gulp.task('clean:cache', function(callback) {
    return cache.clearAll(callback);
});


/* ------------------------- *
 *          BUILD
 * ------------------------- */
gulp.task('default', function(callback) {
    runSequence(['sass', 'browserSync', 'watch'],
        callback);
});

gulp.task('build', function(callback) {
    runSequence('clean:dist', ['sass', 'useref', 'images', 'fonts'],
        callback);
});


/* ------------------------- *
 *       THE WATCHER
 * ------------------------- */
// Follow this syntax
// gulp.task('watch', ['array', 'of', 'tasks', 'to', 'complete','before', 'watch'], function (){

gulp.task('watch', ['browserSync', 'sass', 'pug'], function() {
    gulp.watch(options.pug.src, ['pug']); // Pug
    gulp.watch(options.sass.src, ['sass']); // Sass
    // Reloads the browser whenever HTML or JS files changes
    gulp.watch('app/*.html', browserSync.reload);
    gulp.watch('app/js/**/*.js', browserSync.reload);
});
