import { exec as execAsync } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const exec = promisify(execAsync);

async function main() {
  // Delete repo
  await exec('rm -rf ./toweroffantasy.info');
  
  // Clone repo
  await exec('git clone https://github.com/whotookzakum/toweroffantasy.info.git');

  // Delete .gitignore and .git directory
  await exec('rm -rf ./toweroffantasy.info/.gitignore');
  await exec('rm -rf ./toweroffantasy.info/.git');

  // rename all files with .js to .mjs recursively in ./toweroffantasy.info using javascript
  renameExtensions();

  // await exec('git add -A', { cwd: './toweroffantasy.info' });
  // await exec('git commit -m "Update"', { cwd: './toweroffantasy.info' });
  // await exec('git push', { cwd: './toweroffantasy.info' });
}

function renameExtensions() {
  // https://stackoverflow.com/questions/21194934/node-how-to-create-a-directory-if-doesnt-exist/21196961
  if (!fs.existsSync('./toweroffantasy.info')) {
    fs.mkdirSync('./toweroffantasy.info');
  }

  // https://stackoverflow.com/questions/5827612/node-js-fs-readdir-recursive-directory-search
  const walkSync = (dir, filelist = []) => {
    fs.readdirSync(dir).forEach(file => {
      filelist = fs.statSync(path.join(dir, file)).isDirectory()
        ? walkSync(path.join(dir, file), filelist)
        : filelist.concat(path.join(dir, file));
    });
    return filelist;
  };

  const files = walkSync('./toweroffantasy.info');
  files.forEach(file => {
    if (file.endsWith('.js')) {
      const newFile = file.replace('.js', '.mjs');

      const importRegex = /import (.*) from '(.*)'/g;

      // modify import to add .mjs extension
      let content = fs.readFileSync(file, 'utf8');
      content = content.replace(importRegex, `import $1 from '$2.mjs'`);
      fs.writeFileSync(file, content, 'utf8');

      fs.renameSync(file, newFile);
    }
  });
}

main();
