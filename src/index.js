import minimist from 'minimist';
import compiler from './compiler';
import fs from 'fs';
import path from 'path';

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
const outputPath = path.resolve(argv.output);

console.log(`Writing to file system at ${outputPath}...`);
fs.writeFileSync(outputPath, compiledJS, { flag: 'w' });
console.log(`Done`);
