import fs from 'fs';
import path from 'path';
import url from 'url';
import md5 from './md5';

function buildManifest(compiler, compilation) {
  let context = compiler.options.context;
  let manifest = {};

  compilation.chunks.forEach(chunk => {
    chunk.files.forEach(file => {
      chunk.forEachModule(module => {
        let id = module.id;
        let name = typeof module.libIdent === 'function' ? module.libIdent({ context }) : null;
        let publicPath = url.resolve(compilation.outputOptions.publicPath || '', file);

        let currentModule = module;
        if (module.constructor.name === 'ConcatenatedModule') {
          currentModule = module.rootModule;
        } else if (module.constructor.name === 'MultiModule') {
          return;
        } else if (module.constructor.name === 'RawModule' || module.constructor.name === 'CssModule') {
          currentModule = module.issuer;
        }

        const request = md5(currentModule.userRequest);

        if (!manifest[request]) {
          manifest[request] = [];
        }

        manifest[request].push({ id, name, file, publicPath });
      });
    });
  });

  return manifest;
}

export class ReactLoadablePlugin {
  constructor(opts = {}) {
    this.filename = opts.filename;
  }

  apply(compiler) {
    compiler.plugin('emit', (compilation, callback) => {
      const manifest = buildManifest(compiler, compilation);
      var json = JSON.stringify(manifest, null, 2);
      const outputDirectory = path.dirname(this.filename);
      try {
        fs.mkdirSync(outputDirectory);
      } catch (err) {
        if (err.code !== 'EEXIST') {
          throw err;
        }
      }
      fs.writeFileSync(this.filename, json);
      callback();
    });
  }
}

export function getBundles(manifest, moduleIds) {
  return moduleIds.reduce((bundles, moduleId) => {
    return bundles.concat(manifest[moduleId]);
  }, []);
}
