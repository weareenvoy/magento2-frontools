'use strict';
module.exports = function(gulp, plugins, config, name, file) { // eslint-disable-line func-names
  const fs = require('fs');
  const path = require('path');
  const foreach = require('gulp-foreach');
  const theme = config.themes[name];
  const srcBase = config.projectPath + 'var/view_preprocessed/frontools' + theme.dest.replace('pub/static', '');
  const twig = require('gulp-twig');

  function processTemplate (file) {
    const relativePath = path.relative(srcBase, file.path);
    console.log('- processing template: ' + relativePath);
    const isWidgetTemplate = relativePath.startsWith('templates/widgets');
    const isThemeTemplate = relativePath.startsWith('templates/theme');

    if (isWidgetTemplate) {
      const destPath = config.projectPath + 'app/code/' + path.dirname(path.relative('templates/widgets', relativePath)) + '/view/frontend/templates/' + path.basename(relativePath, '.twig') + '.phtml';
      console.log('-- writing widget template: ' + destPath);
      fs.createReadStream(file.path).pipe(fs.createWriteStream(destPath));
    }
    else if (isThemeTemplate) {
      console.log('theme template');
    }
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
      processTemplate(file);
      return stream;
      // return stream
      //   .pipe(examineFile(stream, file));
        // .pipe(twig());
    }))
    // .pipe(gulp.dest(config.projectPath + 'app/code/Envoy/HeroWidget/view/frontend/templates'))
    .pipe(plugins.logger({
      display   : 'name',
      beforeEach: 'Theme: ' + name + ' ',
      afterEach : ' Compiled!'
    }))
    .pipe(plugins.browserSync.stream());
};
