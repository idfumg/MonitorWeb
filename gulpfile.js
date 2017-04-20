"use strict";

let gulp = require('gulp');
let gulp_sass = require('gulp-sass');
let gulp_autoprefixer = require('gulp-autoprefixer');
let gulp_concat = require('gulp-concat');
let gulp_uglifyjs = require('gulp-uglifyjs');
let browser_sync = require('browser-sync');
let gulp_rename = require('gulp-rename');
let gulp_cssnano = require('gulp-cssnano');
let gulp_del = require('del');
let bourbon = require('bourbon').includePaths;
let bourbon_neat = require('bourbon-neat').includePaths;

gulp.task('sass', function() {
    return gulp.src('app/sass/**/*.sass').
        pipe(gulp_sass({includePaths: ['styles'].concat(bourbon, bourbon_neat)}).on('error', gulp_sass.logError)).
        pipe(gulp_autoprefixer(['last 15 versions', '> 1%', 'ie 7', 'ie 8'], {cascade: true})).
        pipe(gulp.dest('dist/css')).
        pipe(browser_sync.reload({stream: true}));
});

gulp.task('css-libs-min', function() {
    return gulp.src('dist/css/libs.css').
        pipe(gulp_cssnano()).
        pipe(gulp_rename({suffix: '.min'})).
        pipe(gulp.dest('dist/css'));
});

gulp.task('css-common-min', function() {
    return gulp.src('dist/css/common.css').
        pipe(gulp_cssnano()).
        pipe(gulp_rename({suffix: '.min'})).
        pipe(gulp.dest('dist/css'));
});

gulp.task('css', ['sass', 'css-libs-min', 'css-common-min'], function() {

});

gulp.task('js-libs', function() {
    return gulp.src([
        'app/libs/jquery/dist/jquery.js',
        'app/libs/perfect-scrollbar/js/perfect-scrollbar.jquery.min.js'
    ]).
        pipe(gulp_concat('libs.js')).
        pipe(gulp.dest('dist/js')).
        pipe(browser_sync.reload({stream: true}));
});

gulp.task('js-libs-min', function() {
    return gulp.src([
        'app/libs/jquery/dist/jquery.min.js',
        'app/libs/perfect-scrollbar/js/perfect-scrollbar.jquery.js'
    ]).
        pipe(gulp_concat('libs.min.js')).
        pipe(gulp_uglifyjs()).
        pipe(gulp.dest('dist/js')).
        pipe(browser_sync.reload({stream: true}));
});

gulp.task('js-common', function() {
    return gulp.src([
        'app/js/common.js',
        'app/js/ajax.js',
        'app/js/ws.js',
        'app/js/main_window.js',
        'app/js/servers.js',
        'app/js/search_fields.js']).
        pipe(gulp.dest('dist/js')).
        pipe(browser_sync.reload({stream: true}));
});

gulp.task('js-common-min', function() {
    return gulp.src('app/js/common.js').
        pipe(gulp_uglifyjs()).
        pipe(gulp_rename({suffix: '.min'})).
        pipe(gulp.dest('dist/js')).
        pipe(browser_sync.reload({stream: true}));
});

gulp.task('js', ['js-libs', 'js-libs-min', 'js-common', 'js-common-min'], function() {

});

gulp.task('html', function() {
    return gulp.src('app/*.html').
        pipe(gulp.dest('dist/')).
        pipe(browser_sync.reload({stream: true}));
});

gulp.task('fonts', function() {
    return gulp.src('app/fonts/**/*').
        pipe(gulp.dest('dist/fonts')).
        pipe(browser_sync.reload({stream: true}));
});

gulp.task('img', function() {
    return gulp.src('app/img/**/*').
        pipe(gulp.dest('dist/img')).
        pipe(browser_sync.reload({stream: true}));
});

gulp.task('libs', function() {
    return gulp.src('app/libs/**/*').
        pipe(gulp.dest('dist/libs')).
        pipe(browser_sync.reload({stream: true}));
});

gulp.task('browser-sync', function () {
    browser_sync({
        server: {
            baseDir: 'dist'
        },
        notify: false
    });
});

gulp.task('watch', ['browser-sync', 'css', 'js', 'html', 'libs', 'img'], function() {
    gulp.watch('app/sass/**/*.sass', ['css']);
    gulp.watch('app/js/**/*.js', ['js']);
    gulp.watch('app/*.html', ['html']);
    gulp.watch('app/fonts/**/*', ['fonts']);
    gulp.watch('app/img/**/*', ['img']);
    gulp.watch('app/libs/**/*', ['libs']);
});

gulp.task('clean', function() {
    return gulp_del.sync('dist');
});

gulp.task('build', ['clean', 'img', 'fonts', 'js', 'css', 'html'], function() {

});
