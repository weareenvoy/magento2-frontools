'use strict';
module.exports = function(gulp, plugins, config, name, file) { // eslint-disable-line func-names

  const theme = config.themes[name];
  const srcBase = config.projectPath + 'var/view_preprocessed/frontools' + theme.dest.replace('pub/static', '');
  const twig = require('gulp-twig');

  console.log('template.js working');

  return gulp.src(
    file || srcBase + '/**/*.twig',
    { base: srcBase }
  )
    .pipe(
      plugins.if(
        !plugins.util.env.ci,
        plugins.plumber({
          errorHandler: plugins.notify.onError('Error: <%= error.message %>')
        })
      )
    )
    // TODO: put 'dest' logic here
    .pipe(plugins.logger({
      display   : 'name',
      beforeEach: 'Theme: ' + name + ' ',
      afterEach : ' Compiled!'
    }))
    .pipe(plugins.browserSync.stream());
};
