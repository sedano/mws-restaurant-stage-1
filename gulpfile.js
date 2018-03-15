'use strict';

const gulp = require('gulp');
const workboxBuild = require('workbox-build');
const browserSync = require('browser-sync').create();
const reload = browserSync.reload;

gulp.task('service-worker', () => {
    return workboxBuild.generateSW({
        globDirectory: './public',
        globPatterns: [
            '**\/*.{html,json,js,css,jpg}',
        ],
        swDest: 'public/sw.js',
    });
});

gulp.task('serve', function () {
    browserSync.init({
        server: {
            baseDir: "./public"
        },
        browser: "google chrome"
    });
    gulp.watch(['public/**/*'], reload);
});

gulp.task('default', ['service-worker']);