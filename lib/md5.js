'use strict';

var crypto = require('crypto');

module.exports = function md5(text) {
  return crypto.createHash('md5').update(text).digest('hex').slice(0, 8);
};