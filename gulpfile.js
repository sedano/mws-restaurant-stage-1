'use strict';

const gulp = require('gulp');
const workboxBuild = require('workbox-build');
const responsive = require('gulp-responsive-images');
const browserSync = require('browser-sync').create();
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

gulp.task('serve', () => {
    browserSync.init({
        server: {
            baseDir: "./public"
        },
        open: false
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

gulp.task('default', ['serve']);