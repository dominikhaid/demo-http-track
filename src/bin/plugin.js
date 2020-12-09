const util = require('util');
const fs = require('fs');
const exec = util.promisify(require('child_process').exec);
const writeFile = util.promisify(fs.writeFile);
const readFile = util.promisify(fs.readFile);
const appendFile = util.promisify(fs.appendFile);
const plugFld = 'tmpPlug';
let plugNm = process.argv.filter(element => {
  return element.indexOf('p=') > -1;
});

if (plugNm.length === 0) process.exit();
plugNm = plugNm[0].replace('p=', '');

let plugInf,
  plugFiles = [];

async function gitClone() {
  console.info(`\nClone %s from GitHub\n`, plugNm);

  await exec(`git clone ${plugNm} ${plugFld}`);
  return true;
}

async function instDep() {
  if (
    plugFiles.findIndex(e => {
      e.name === 'package.json';
    }) === -1
  )
    plugInf = require(`../../${plugFld}/package.json`);

  if (plugInf.dependencies) {
    let depInst = Object.keys(plugInf.dependencies);
    console.info(`\nInstall Dependencies %O\n`, depInst);
    await exec(`npm remove ${depInst.join(' ')}`);
    await exec(`npm i ${depInst.join(' ')} -P`);
  }
  if (plugInf.devDependencies) {
    let depDev = Object.keys(plugInf.devDependencies);
    console.info(`\nInstall Dependencies %O\n`, depDev);
    await exec(`npm remove ${depDev.join(' ')}`);
    await exec(`npm i ${depDev.join(' ')} -D`);
  }

  return true;
}

async function copyFiles() {
  console.info(`\nCopy files to prject root\n`);
  await exec(`cp -r -n ./tmpPlug/* .`);
  return true;
}

async function getFiles(path) {
  const dir = await fs.promises.opendir(`./${plugFld}`);
  for await (const dirent of dir) {
    plugFiles.push({
      folder: dirent.isDirectory(),
      file: dirent.isFile(),
      name: dirent.name,
    });
  }
}

async function upgradeConf() {
  if (
    plugFiles.findIndex(e => {
      return e.name === 'config';
    }) !== -1
  ) {
    let newConf = false;
    let oldConf = false;
    try {
      newConf = require(`../../${plugFld}/config/server-conf.js`);
      oldConf = require('../../config/server-conf.js');
    } catch (e) {
      console.info('no server-config');
    }
    if (newConf && oldConf) {
      for (const key in newConf) {
        if (newConf.hasOwnProperty(key)) {
          oldConf[key] = newConf[key];
        }
      }
      console.info('\nUpgrade server-conf.js\n');
      await writeFile(
        './config/server-conf.js',
        'module.exports = ' + JSON.stringify(oldConf),
      );
    }
    if (plugInf && plugInf.scripts) {
      if (plugInf && plugInf.scripts) {
        const oldConf = require('../../package.json');

        for (const key in plugInf.scripts) {
          if (plugInf.scripts.hasOwnProperty(key)) {
            oldConf.scripts[key] = plugInf.scripts[key];
          }
        }

        console.info('\nUpgrade scripts\n');
        await writeFile('./package.json', JSON.stringify(oldConf));
      }
    }
  }

  //TODO SEARCH FOR EXTING OF BUFFER
  if (
    plugFiles.findIndex(e => {
      return e.name === 'server.js';
    }) !== -1
  ) {
    let addSrvOut = await readFile(`./${plugFld}/server.js`, 'utf8');
    console.info('\nUpgrade server.js\n');
    await appendFile(`./server.js`, addSrvOut);
  }
}

async function cleanUp() {
  console.info('\nCleaning up\n');
  await exec(`rm -r ./${plugFld}`);
}

async function upgradeFiles() {
  if (
    plugFiles.findIndex(e => {
      return e.name === 'inst' && e.folder === true;
    }) !== -1
  ) {
    const addIns = require(`../../${plugFld}/inst/addin.json`);

    let oldFiles = [];
    console.info('\nUpgrade bin files\n');
    let replace;
    let newReg;
    for (const file of addIns) {
      /plugins:/.test(file.selector)
        ? (replace = `(.*${file.selector})`)
        : file.selector
        ? (replace = `(func.*${file.selector}.*{)`)
        : (replace = `(^.*|^\n)`);
      file.selector
        ? (newReg = new RegExp(replace, 'gm'))
        : (newReg = new RegExp(replace, 'u'));
      let tmpFile = await readFile(`./${file.file}`, 'utf8');
      tmpFile = tmpFile.replace(newReg, `$1\n${file.replacemant}`);

      oldFiles.push({file: file.file, content: tmpFile});
    }

    for (const file of oldFiles) {
      await writeFile(`./${file.file}`, file.content);
    }

    await exec(`rm -r ./${plugFld}/inst`);
  }
}

gitClone()
  .then(() => {
    getFiles()
      .then(() => {
        instDep()
          .then(() => {
            upgradeConf()
              .then(() => {
                upgradeFiles()
                  .then(() => {
                    copyFiles()
                      .then(() => {
                        cleanUp();
                      })
                      .catch(err => {
                        if (typeof err === 'object');
                        // throw err;
                        console.error('ERR:	', err);
                      });
                  })
                  .catch(err => {
                    if (typeof err === 'object');
                    // throw err;
                    console.error('ERR:	', err);
                  });
              })
              .catch(err => {
                if (typeof err === 'object');
                // throw err;
                console.error('ERR:	', err);
              });
          })
          .catch(err => {
            if (typeof err === 'object');
            // throw err;
            console.error('ERR:	', err);
          });
      })
      .catch(err => {
        if (typeof err === 'object');
        // throw err;
        console.error('ERR:	', err);
      });
  })
  .catch(err => {
    cleanUp()
      .then(() => {
        if (typeof err === 'object');
        // throw err;
        console.error('ERR:	', err);
      })
      .catch(err => {
        if (typeof err === 'object');
        // throw err;
        console.error('ERR:	', err);
      });
  });
