'use strict';
module.exports = function(gulp, plugins, config, name, file) { // eslint-disable-line func-names

  const theme = config.themes[name];
  const twig = require('gulp-twig');

  console.log('theme.src: ' + theme.src);

  return gulp.src(
    theme.src + '/templates/**/*.twig',
    { base: theme.src }
  )
    .pipe(
      plugins.if(
        !plugins.util.env.ci,
        plugins.plumber({
          errorHandler: plugins.notify.onError('Error: <%= error.message %>')
        })
      )
    )
    .pipe(twig())
    .pipe(gulp.dest('./app/code/Envoy/HeroWidget/view/frontend/templates'))
    .pipe(plugins.logger({
      display   : 'name',
      beforeEach: 'Theme: ' + name + ' ',
      afterEach : ' Compiled!'
    }))
    .pipe(plugins.browserSync.stream());
};
