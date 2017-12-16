'use strict';
module.exports = function(gulp, plugins, config, name, file) { // eslint-disable-line func-names
  const fs = require('fs');
  const path = require('path');
  const foreach = require('gulp-foreach');
  const theme = config.themes[name];
  const srcBase = config.projectPath + 'var/view_preprocessed/frontools' + theme.dest.replace('pub/static', '');
  const twig = require('gulp-twig');
  const insert = require('gulp-insert');

  function processTemplate (file) {
    const destPath = path.dirname(file.path);
    logWritingTemplate(file.path, destPath)
    return writeTemplate(file.path, destPath);
  }

  function writeTemplate (srcPath, destPath) {
    return gulp.src(srcPath)
              .pipe(twig())
              .pipe(insert.prepend(`
<?php
  /* ------------------------------------------------------------------
   * ------------------------------------------------------------------
   * * * * CAUTION: DO NOT EDIT - COMPILED FILE * * * * * * * * * * * *
   * ------------------------------------------------------------------
   * ------------------------------------------------------------------ */
?>`))
              .pipe(plugins.rename({ extname: '.phtml' }))
              .pipe(gulp.dest(destPath));
  }

  function logWritingTemplate (filePath, destPath) {
    console.log('-- writing template for: ' + path.basename(filePath));
  }

  const themeSrcGlob = srcBase + '/**/*.twig';
  const widgetSrcGlob = config.projectPath + 'app/code/**/*.twig';

  return gulp.src([
    themeSrcGlob,
    widgetSrcGlob
  ])
    .pipe(
      plugins.if(
        !plugins.util.env.ci,
        plugins.plumber({
          errorHandler: plugins.notify.onError('Error: <%= error.message %>')
        })
      )
    )
    .pipe(foreach(function (stream, file) {
      processTemplate(file);
      return stream;
    }))
    .pipe(plugins.logger({
      display   : 'name',
      beforeEach: 'Theme: ' + name + ' ',
      afterEach : ' Compiled!'
    }))
    .pipe(plugins.browserSync.stream());
};
