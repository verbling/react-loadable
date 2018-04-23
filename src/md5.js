import crypto from 'crypto';
import {extname} from 'path';

export default function md5(text) {
  return crypto
    .createHash('md5')
    .update(text.replace(extname(text), ''))
    .digest('hex')
    .slice(0, 8);
}
