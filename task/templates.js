'use strict';
module.exports = function() { // eslint-disable-line func-names
  // Global variables
  const gulp    = this.gulp,
        plugins = this.opts.plugins,
        config  = this.opts.configs,
        themes  = plugins.getThemes(),
        streams = plugins.mergeStream();

  // Generate all necessary symlinks before templates compilation, but ony if not a part of tasks pipeline
  if (!plugins.util.env.pipeline) {
    plugins.runSequence('inheritance');
  }

  // Loop through themes to compile templates or less depending on your config.json
  themes.forEach(name => {
    streams.add(require('../helper/template')(gulp, plugins, config, name));
  });

  return streams;
};
