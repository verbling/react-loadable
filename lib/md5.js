'use strict';

exports.__esModule = true;
exports.default = md5;

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

var _path = require('path');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function md5(text) {
  return _crypto2.default.createHash('md5').update(text.replace((0, _path.extname)(text), '')).digest('hex').slice(0, 8);
}