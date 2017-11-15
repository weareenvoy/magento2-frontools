'use strict';
module.exports = function(gulp, plugins, config, name, file) { // eslint-disable-line func-names
  const fs = require('fs');
  const path = require('path');
  const foreach = require('gulp-foreach');
  const theme = config.themes[name];
  const srcBase = config.projectPath + 'var/view_preprocessed/frontools' + theme.dest.replace('pub/static', '');
  const twig = require('gulp-twig');

  function processTemplate (stream, file) {
    const relativePath = path.relative(srcBase, file.path);
    const isWidgetTemplate = relativePath.startsWith('templates/widgets');
    const isThemeTemplate = relativePath.startsWith('templates/theme');

    if (isWidgetTemplate) {
      const destPath = config.projectPath + 'app/code/' + path.dirname(path.relative('templates/widgets', relativePath)) + '/view/frontend/templates/';
      logWritingTemplate(file, destPath, 'widget');
      return writeTemplate(file, destPath);
    }
    else if (isThemeTemplate) {
      const destPath = config.projectPath + theme.src + '/' + path.dirname(path.relative('templates/theme', relativePath)) + '/';;
      logWritingTemplate(file, destPath, 'theme');
      return writeTemplate(file, destPath);
    }
  }

  function writeTemplate (file, destPath) {
    return gulp.src(file.path)
              .pipe(twig())
              .pipe(plugins.rename({ extname: '.phtml' }))
              .pipe(gulp.dest(destPath));
  }

  function logWritingTemplate (file, destPath, type) {
    console.log('-- writing ' + type + ' template: ' + path.relative(config.projectPath, destPath) + '/' + path.basename(file.path));
  }

  return gulp.src(
    file || srcBase + '/templates/**/*.twig',
    { base: srcBase + '/templates' }
  )
    .pipe(
      plugins.if(
        !plugins.util.env.ci,
        plugins.plumber({
          errorHandler: plugins.notify.onError('Error: <%= error.message %>')
        })
      )
    )
    .pipe(foreach(function (stream, file) {
      processTemplate(stream, file);
      return stream;
    }))
    .pipe(plugins.logger({
      display   : 'name',
      beforeEach: 'Theme: ' + name + ' ',
      afterEach : ' Compiled!'
    }))
    .pipe(plugins.browserSync.stream());
};
