'use strict';

exports.__esModule = true;

exports.default = function (_ref) {
  var t = _ref.types,
      template = _ref.template;

  return {
    visitor: {
      ImportDeclaration: function ImportDeclaration(path, state) {
        var source = path.node.source.value;

        if (!source || !source.endsWith('LazyLoader')) return;

        var defaultSpecifier = path.get('specifiers').find(function (specifier) {
          return specifier.isImportDefaultSpecifier();
        });

        if (!defaultSpecifier) return;

        var bindingName = defaultSpecifier.node.local.name;
        var binding = path.scope.getBinding(bindingName);

        binding.referencePaths.forEach(function (refPath) {
          var callExpression = refPath.parentPath;

          if (callExpression.isMemberExpression() && callExpression.node.computed === false && callExpression.get('property').isIdentifier({ name: 'Map' })) {
            callExpression = callExpression.parentPath;
          }

          if (!callExpression.isCallExpression()) return;

          var args = callExpression.get('arguments');
          if (args.length !== 1) throw callExpression.error;

          var options = args[0];
          if (!options.isObjectExpression()) return;

          var properties = options.get('properties');
          var propertiesMap = {};

          properties.forEach(function (property) {
            var key = property.get('key');
            propertiesMap[key.node.name] = property;
          });

          if (propertiesMap.webpack) {
            return;
          }

          var loaderMethod = propertiesMap.loader.get('value');
          var dynamicImports = [];

          loaderMethod.traverse({
            Import: function Import(path) {
              dynamicImports.push(path.parentPath);
              var bundle = path.parentPath.get('arguments')[0];

              if (bundle.node.leadingComments || !bundle.node.leadingComments.length) {
                var chunkName = _lodash2.default.chain(bundle.node.value.split('/').slice(-2)).camelCase().upperFirst().value();

                bundle.addComment('leading', 'webpackChunkName: "' + chunkName + '"');
              }
            }
          });

          if (!dynamicImports.length) return;

          propertiesMap.loader.insertAfter(t.objectProperty(t.identifier('webpack'), t.arrowFunctionExpression([], t.arrayExpression(dynamicImports.map(function (dynamicImport) {
            console.log('[loadable-dynamic-import] ' + dynamicImport.get('arguments')[0].node.value);

            return t.callExpression(t.memberExpression(t.identifier('require'), t.identifier('resolveWeak')), [dynamicImport.get('arguments')[0].node]);
          })))));

          propertiesMap.loader.insertAfter(t.objectProperty(t.identifier('modules'), t.arrayExpression(dynamicImports.map(function (dynamicImport) {
            var path = (0, _path2.default)(state.opts.filename, resodynamicImport.get('arguments')[0].node);
            return (0, _md2.default)(path);
          }))));
        });
      }
    }
  };
};

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _md = require('./md5');

var _md2 = _interopRequireDefault(_md);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }