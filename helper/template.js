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
    console.log('file.path: ' + file.path)
    logWritingTemplate(file.path, destPath)
    return writeTemplate(file.path, destPath);
  }

  function writeTemplate (srcPath, destPath) {
    console.log('srcPath: ' + srcPath);
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
              .pipe(foreach(function (stream, file) {
                // const phtmlPath = path.basename(file.path, '.twig') + '.phtml';
                // /Users/Envoy/repositories/the-honest-kitchen-m2/app/code/Envoy/StatBlocksWidget/view/frontend/templates/stat-blocks.twig
                // test.indexOf('World') >= 0
                const isSrcDir = (file.path.indexOf('/src/') >= 0);
                const filename = path.basename(file.path)
                // console.log('filename: ' + filename);
                if (filename === 'test.phtml' || filename === 'test.twig') { // TEMP: For deubgging purposes
                  console.log('isSrcDir: ' + isSrcDir);
                  if (!isSrcDir) {
                    // const writePath = file.path.replace(config.projectPath + 'var/view_preprocessed/frontools/', '');
                    // frontend/Envoy/thehonestkitchen/Magento_Catalog/templates/product/test.phtml' hmmm
                    const writePath = config.projectPath + file.path.replace(config.projectPath + 'var/view_preprocessed/frontools/', 'app/design/');
                    console.log('writePath: ' + writePath);

                    fs.access(file.path, function (err) {
                      if (err) {
                        if (err.code === 'ENOENT') {
                          console.log('PHTML file does not exist...');
                          // Create empty file with data from original file
                          fs.readFile(srcPath, 'utf8', function (err, data) {
                            fs.writeFile(writePath, data, { flags: 'wx' }, function (err) {
                              if (err) throw err;
                              console.log("The file was succesfully created!");
                            });
                          });
                        }
                      }
                    });
                  }

                }


                return stream;
              }))
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
