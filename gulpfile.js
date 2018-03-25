'use strict';

const gulp = require('gulp');
const workboxBuild = require('workbox-build');
const responsive = require('gulp-responsive-images');
const browserSync = require('browser-sync').create();
const reload = browserSync.reload;

gulp.task('service-worker', () => {
    return workboxBuild.generateSW({
        globDirectory: './public',
        globPatterns: [
            '**\/*.{html,json,js,css,jpg,png,xml,ico,webmanifest}',
        ],
        ignoreUrlParametersMatching: [/.*/],
        swDest: 'public/sw.js',
    });
});

gulp.task('serve', () => {
    browserSync.init({
        server: {
            baseDir: "./public"
        },
        browser: "google chrome"
    });
    gulp.watch(['public/**/*'], reload);
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

gulp.task('default', ['service-worker']);