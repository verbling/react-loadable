'use strict';

exports.__esModule = true;
exports.ReactLoadablePlugin = undefined;
exports.getBundles = getBundles;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _md = require('./md5');

var _md2 = _interopRequireDefault(_md);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function buildManifest(compiler, compilation) {
  var context = compiler.options.context;
  var manifest = {};

  compilation.chunks.forEach(function (chunk) {
    chunk.files.forEach(function (file) {
      chunk.forEachModule(function (module) {
        var id = module.id;
        var name = typeof module.libIdent === 'function' ? module.libIdent({ context: context }) : null;
        var publicPath = _url2.default.resolve(compilation.outputOptions.publicPath || '', file);

        var currentModule = module;
        if (module.constructor.name === 'ConcatenatedModule') {
          currentModule = module.rootModule;
        } else if (module.constructor.name === 'MultiModule') {
          return;
        } else if (module.constructor.name === 'RawModule' || module.constructor.name === 'CssModule') {
          currentModule = module.issuer;
        }

        var request = (0, _md2.default)(currentModule.userRequest);

        if (!manifest[request]) {
          manifest[request] = [];
        }

        manifest[request].push({ id: id, name: name, file: file, publicPath: publicPath });
      });
    });
  });

  return manifest;
}

var ReactLoadablePlugin = exports.ReactLoadablePlugin = function () {
  function ReactLoadablePlugin() {
    var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, ReactLoadablePlugin);

    this.filename = opts.filename;
  }

  ReactLoadablePlugin.prototype.apply = function apply(compiler) {
    var _this = this;

    compiler.plugin('emit', function (compilation, callback) {
      var manifest = buildManifest(compiler, compilation);
      var json = JSON.stringify(manifest, null, 2);
      var outputDirectory = _path2.default.dirname(_this.filename);
      try {
        _fs2.default.mkdirSync(outputDirectory);
      } catch (err) {
        if (err.code !== 'EEXIST') {
          throw err;
        }
      }
      _fs2.default.writeFileSync(_this.filename, json);
      callback();
    });
  };

  return ReactLoadablePlugin;
}();

function getBundles(manifest, moduleIds) {
  return moduleIds.reduce(function (bundles, moduleId) {
    return bundles.concat(manifest[moduleId]);
  }, []);
}