import minimist from 'minimist';
import compiler from './compiler';
import fs from 'fs';
import path from 'path';
import webpack from 'webpack';

const argv = minimist(process.argv.slice(2), {
  string: ['config','excel','output'],
  alias: ['c','x','o'],
  '--': true,
  stopEarly: true
});

console.log(`Compiling Excel formula to JS with options:
- config: ${argv.config}
- excel file: ${argv.excel}
- output: ${argv.output}`)

if (!fs.existsSync(path.resolve(argv.config))) {
  console.warn(`${argv.config} does not exist`);
  process.exit(1);
}
if (!fs.existsSync(path.resolve(argv.excel))) {
  console.warn(`${argv.excel} does not exist`);
  process.exit(1);
}

const excelFile = fs.openSync(path.resolve(argv.excel), 'r');
const config = JSON.parse(fs.readFileSync(path.resolve(argv.config), 'utf8'));
console.log('config', config);
const compiledJS = compiler(config, excelFile);
const outputFilepath = path.resolve(argv.output);

console.log(`Writing to file system at ${outputFilepath}...`);
fs.writeFileSync(outputFilepath, compiledJS, { flag: 'w' });

console.log('Bundling...');
webpack({
  entry: outputFilepath,
  output: {
    path: path.dirname(outputFilepath),
    filename: `${path.parse(outputFilepath).name}.bundle.js`,
    // library: 'formula',
    libraryTarget: 'commonjs2'
  },
  context: __dirname,
  resolve: {
    modules: [
      path.resolve(__dirname),
      "node_modules"
    ]
  }
}, (err, stats) => {
  if (err) {
    console.error('Could not bundle. Reason: ', err);
    return;
  } else {
    console.log('Bundle successfully.');
  }

  process.stdout.write(stats.toString() + "\n");

  console.log(`Done`);
});

