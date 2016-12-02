'use strict';
var base = require('../plugin-wp-base');
var chalk = require('chalk');
var yosay = require('yosay');
var fs = require('fs');
var request = require( 'request' );
var async = require( 'async' );

module.exports = base.extend({
  constructor: function () {
    base.apply(this, arguments);
  },

  initializing: function () {
    this.pkg = require('../package.json');

    // set the initial value
    this.currentVersionWP = '4.4';

    // get the latest WP version
    this.getLatestWPVersion();
  },

  prompting: function () {
    var done = this.async();

    // Have Yeoman greet the user.
    this.log(yosay(
      'Welcome to the neat ' + chalk.red('Plugin WP') + ' generator!'
    ));

    var prompts = [{
      type   : 'input',
      name   : 'name',
      message: 'Name',
      default: 'WDS Client Plugin Name'
    }, {
      type   : 'input',
      name   : 'homepage',
      message: 'Homepage',
      default: 'http://webdevstudios.com'
    }, {
      type   : 'input',
      name   : 'description',
      message: 'Description',
      default: 'A radical new plugin for WordPress!'
    }, {
      type   : 'input',
      name   : 'version',
      message: 'Version',
      default: '0.0.0'
    }, {
      type   : 'input',
      name   : 'author',
      message: 'Author',
      default: 'WebDevStudios',
      save   : true
    }, {
      type   : 'input',
      name   : 'authoremail',
      message: 'Author Email',
      default: 'contact@webdevstudios.com',
      save   : true
    }, {
      type   : 'input',
      name   : 'authorurl',
      message: 'Author URL',
      default: 'http://webdevstudios.com',
      save   : true
    }, {
      type   : 'input',
      name   : 'license',
      message: 'License',
      default: 'GPLv2'
    }, {
      type   : 'input',
      name   : 'slug',
      message: 'Plugin Slug',
      default: function( p ) {
        return this._.slugify( p.name );
      }.bind(this)
    }, {
      type   : 'input',
      name   : 'classname',
      message: 'Plugin Class Name',
      default: function( p ) {
        return this._wpClassify( p.name );
      }.bind(this)
    }, {
      type   : 'input',
      name   : 'prefix',
      message: 'Plugin Prefix',
      default: function( p ) {
        return this._.underscored( this._.slugify( p.slug ) );
      }.bind(this)
    }, {
      type   : 'list',
      name   : 'namespace',
      message: 'Use Namespaces?',
      choices: ['No', 'Yes']
    }, {
      type   : 'list',
      name   : 'autoloader',
      message: 'Use Autoloader',
      choices: ['Basic', 'Composer', 'None']
    }];

    this.prompt(prompts, function (props) {
      // Sanitize inputs
      this.name        = this._.clean( props.name );
      this.homepage    = this._.clean( props.homepage );
      this.description = this._.clean( props.description );
      this.descriptionEscaped = this._escapeDoubleQuotes( this.description );
      this.version     = this._.clean( props.version );
      this.author      = this._.clean( props.author );
      this.authoremail = this._.clean( props.authoremail );
      this.authorurl   = this._.clean( props.authorurl );
      this.license     = this._.clean( props.license );
      this.slug        = this._.slugify( props.slug );
      this.classname   = this._wpClassify( props.classname );
      this.classprefix = this._wpClassPrefix( this.classname );
      this.prefix      = this._.underscored( props.prefix );
      this.year        = new Date().getFullYear();
      this.autoloader  = props.autoloader;
      this.namespace   = props.namespace;

      done();
    }.bind(this));
  },

  writing: {
    folder: function() {
      var done = this.async();
      fs.lstat( this.destinationPath( this.slug ), function(err, stats) {
        if (!err && stats.isDirectory()) {
          this.log( chalk.red( 'A plugin already exists with this folder name, exiting...' ) );
          process.exit();
        }

        this.destinationRoot( this.slug );
        done();
      }.bind(this));
    },

    dotfiles: function() {
      this.fs.copy(
        this.templatePath('_bowerrc'),
        this.destinationPath('/.bowerrc')
      );
      this.fs.copyTpl(
        this.templatePath('_gitignore'),
        this.destinationPath('/.gitignore'),
        this
      );
    },

    configs: function() {
      this.fs.copyTpl(
        this.templatePath('bower.json'),
        this.destinationPath('/bower.json'),
        this
      );
      this.fs.copyTpl(
        this.templatePath('package.json'),
        this.destinationPath('/package.json'),
        this
      );
      if ( this.autoloader === 'Composer' ) {
        this.fs.copyTpl(
          this.templatePath('composer.json'),
          this.destinationPath('/composer.json'),
          this
        );
      }
      this.fs.copy(
        this.templatePath('Gruntfile.js'),
        this.destinationPath('/Gruntfile.js')
      );
    },

    php: function() {
      if ( this.namespace === 'Yes' ) {
        this.fs.copyTpl(
          this.templatePath('plugin.php'),
          this.destinationPath('/pluginnamespace.php'),
          this
        );
      } else {
        this.fs.copyTpl(
          this.templatePath('plugin.php'),
          this.destinationPath('/' + this.slug + '.php'),
          this
        );
      }
    },

    readme: function() {
      this.fs.copyTpl(
        this.templatePath('README.md'),
        this.destinationPath('/README.md'),
        this
      );
    },


      this.fs.copyTpl(
        this
      );
    },

    folders: function() {
      this.fs.copyTpl(
        this.templatePath('assets/README.md'),
        this.destinationPath('assets/README.md'),
        this
      );

      this.fs.copyTpl(
        this.templatePath('assets/repo/README.md'),
        this.destinationPath('assets/repo/README.md'),
        this
      );

      this.fs.copyTpl(
        this.templatePath('includes/README.md'),
        this.destinationPath('includes/README.md'),
        this
      );
    },

    saveConfig: function() {
      this.config.set( 'name', this.name );
      this.config.set( 'homepage', this.homepage );
      this.config.set( 'description', this.description );
      this.config.set( 'version', this.version );
      this.config.set( 'author', this.author );
      this.config.set( 'authoremail', this.authoremail );
      this.config.set( 'authorurl', this.authorurl );
      this.config.set( 'license', this.license );
      this.config.set( 'slug', this.slug );
      this.config.set( 'classname', this.classname );
      this.config.set( 'classprefix', this.classprefix );
      this.config.set( 'prefix', this.prefix );
      this.config.set( 'year', this.year );
      this.config.set( 'namespace', this.namespace );

      this.config.set( 'currentVersionWP', this.currentVersionWP );

      this.config.save();
    }
  },

  getLatestWPVersion: function() {
    request.get({
      url: 'https://api.wordpress.org/core/version-check/1.7/',
      json: true,
      headers: { 'User-Agent': 'request' }
    }, (err, res, data) => {
      // check for status code
      if ( ! err && ( 200 === res.statusCode ) ) {
        // loop through results to find only the "upgrade" version
        for ( var i in data.offers ) {
          if ( 'upgrade' === data.offers[i].response ) {
            this.currentVersionWP = data.offers[i].current;
          }
        }
      }
    });
  },

  install: function () {
    this.installDependencies({
      skipInstall: this.options['skip-install']
    });

    if ( this.autoloader === 'Composer' && !this.options['skip-install'] ) {
      this.spawnCommand('composer', ['install']);
    }
  }
});
