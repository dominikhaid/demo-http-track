const auth = require('../../mongoose/db/db');
const createLog = require('../../mongoose/querys/trackQuerys').createLog;
const getWebsites = require('../../mongoose/querys/trackQuerys').getWebsites;
const crawl = require('./crawl').crawl;
const moment = require('moment');
const CronJob = require('cron').CronJob;
const timing = require('./cron.config').timing;
const sendEmail = require('./sendgrid').sendEmail;

/**
Timeing
    Seconds: 0-59
    Minutes: 0-59
    Hours: 0-23
    Day of Month: 1-31
    Months: 0-11 (Jan-Dec)
    Day of Week: 0-6 (Sun-Sat)
*/

var job = new CronJob(
  timing.join(' '),
  function () {
    //load projects / websites
    function getProjects() {
      auth().then(con => {
        getWebsites(con)
          .then(projects => {
            if (projects.length < 1) return;
            for (let index = 0; index < projects.length; index++) {
              const project = projects[index];
              getNewDatas(project);
            }
          })
          .catch(e => {
            console.log(e);
          });
      });
    }

    //forEach Project and Url
    async function getNewDatas(project) {
      for (let index = 0; index < project.urls.length; index++) {
        const url = project.urls[index];
        console.log('CHECKING URL', url);
        let compare = await crawl(url)
          .then(log => {
            let changes = [];
            let statusCompare = [];
            let newlog = false;
            let lastlog = false;

            let logs = project.logs.filter(e => e.url === url);
            if (logs.length < 1) return console.log('No Logs');

            newlog = logs.pop();
            lastlog = logs.pop();

            let newStatus = [
              {httpVersion: newlog.httpVersion},
              {url: newlog.url},
              {statusCode: newlog.statusCode},
              {statusMessage: newlog.statusMessage},
              {server: newlog.server},
              {contentType: newlog.contentType},
            ];

            let oldStatus = [
              {httpVersion: lastlog.httpVersion},
              {url: lastlog.url},
              {statusCode: lastlog.statusCode},
              {statusMessage: lastlog.statusMessage},
              {server: lastlog.server},
              {contentType: lastlog.contentType},
            ];

            newStatus.forEach((x, ind) => {
              if (JSON.stringify(x) !== JSON.stringify(oldStatus[ind]))
                statusCompare.push({old: oldStatus[ind], new: x});
            });

            lastlog.body.split(' ').forEach((x, ind) => {
              if (!newlog.body.split(' ').includes(x)) {
                let wordsNew = newlog.body.split(' ');
                let wordsOld = lastlog.body.split(' ');
                let count = 0;
                let valOld = '';
                let valNew = '';

                if (
                  wordsNew[ind - 2] &&
                  wordsNew[ind + 2] &&
                  wordsOld[ind - 2] &&
                  wordsOld[ind + 2]
                )
                  count = {neg: -2, pos: 2};
                if (
                  wordsNew[ind - 5] &&
                  wordsNew[ind + 5] &&
                  wordsOld[ind - 5] &&
                  wordsOld[ind + 5]
                )
                  count = {neg: -5, pos: 5};
                if (
                  wordsNew[ind - 10] &&
                  wordsNew[ind + 10] &&
                  wordsOld[ind - 10] &&
                  wordsOld[ind + 10]
                )
                  count = {neg: -10, pos: 10};

                for (let index = count.neg; index <= count.pos; index++) {
                  if (index === count.neg) {
                    valOld += '...>>>' + wordsOld[ind + index];
                    valNew += '...>>>' + wordsNew[ind + index];
                  }
                  if (index === count.pos) {
                    valOld += ' ' + wordsOld[ind + index] + '<<<...';
                    valNew += ' ' + wordsNew[ind + index] + '<<<...';
                  }
                  if (index === 0) {
                    valOld += '>>CHANGE>>>' + wordsOld[ind + index];
                    valNew += ' ' + wordsNew[ind + index];
                  }
                  if (
                    index !== 0 &&
                    index !== count.neg &&
                    index !== count.pos
                  ) {
                    valOld += ' ' + wordsOld[ind + index];
                    valNew += ' ' + wordsNew[ind + index];
                  }
                }

                let lastChange = changes.filter(t => t.word === ind - 1);
                if (lastChange.length > 0)
                  if (lastChange.length > 0) {
                    let testStr = valNew.split(' ');
                    testStr.pop();
                    let reg = new RegExp(testStr.join(' '));
                    if (reg) return;
                  }

                changes.push({
                  word: ind,
                  old: valOld,
                  new: valNew,
                });
              }
            });

            return {
              status: statusCompare,
              body: changes,
              log: log,
            };
          })
          .catch(e => {
            console.log(e);
          });

        if (
          (compare && compare.status.length > 0) ||
          (compare && compare.body.length > 0)
        ) {
          auth()
            .then(con => {
              let req = {body: {name: 'www.dominikhaid.de'}};
              console.log('Changed detecetd:', url, 'sending email');
                let body, status;

                if (compare.body.length > 1)
                  body = compare.body.map(e => {
                    return `WORD: ${e.word}\n NEW: ${e.new}\n OLD: ${e.old}`;
                  });

                if (compare.status.length > 1)
                  status = compare.status.map(e => {
                    return `OLD STATUS: ${e.new.statusCode} ${e.new.statusMessage}\n HTTP: ${e.new.httpVersion} ${e.new.server} ${e.new.contentType}\n URL: ${e.new.url} \nNEW STATUS: ${e.old.statusCode} ${e.old.statusMessage}\n HTTP: ${e.old.httpVersion} ${e.old.server} ${e.old.contentType}\n URL: ${e.old.url}`;
                  });
                body += status;
                sendEmail(`Website changed ${url}`, body, project.users.map(e=> e.email).join(','));
                return log;
            })
            .catch(err => {
              console.log(err);
              return err;
            });
        }

        if (!compare || (compare.status.length < 1 && compare.body.length < 1))
          console.log('Nothing Changed: ',url);
      }
    }

    getProjects();
  },
  function () {
    console.debug('Job Stopped !');
  },
  true,
  'Europe/London',
  null,
  true,
);

job.addCallback(function () {
  console.debug(
    `${moment(job.lastDate()).format(
      'DD.MM.YYYY hh:mm:ss',
    )} finshed: next ${moment(job.nextDates()).fromNow()}`,
  );
});

job.start();
