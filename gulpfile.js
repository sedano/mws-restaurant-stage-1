'use strict';

const gulp = require('gulp');
const workboxBuild = require('workbox-build');
const responsive = require('gulp-responsive-images');
const cleanCSS = require('gulp-clean-css');
const rename = require('gulp-rename');
const browserSync = require('browser-sync').create();
const serve = require('serve');
const reload = browserSync.reload;

gulp.task('sw', () => {
    return workboxBuild.generateSW({
        globDirectory: './public',
        globPatterns: [
            '**\/*.{html,json,js,css,xml,ico,webmanifest}',
        ],
        ignoreUrlParametersMatching: [/.*/],
        runtimeCaching: [
            {
                urlPattern: /\.(?:png|jpg|jpeg|svg)$/,
                handler: 'cacheFirst'
            }
        ],
        swDest: 'public/workbox-sw.js',
    });
});

gulp.task('serve:dev', () => {
    browserSync.init({
        server: {
            baseDir: './public'
        },
        open: false
    });
    gulp.watch(['public/**/*'], reload);
});

gulp.task('serve', () => {
    serve('./public');
});

gulp.task('img', () => {
    gulp.src('public/img/**/*')
        .pipe(responsive({
            '*.jpg': [{
                width: 400,
                suffix: '-small'
            }]
        }))
        .pipe(gulp.dest('public/img'));
});

gulp.task('minify-css', () => {
    return gulp.src('./public/css/*.css')
        .pipe(cleanCSS({ compatibility: 'ie8' }))
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('./public/css'));
});

gulp.task('default', ['serve']);