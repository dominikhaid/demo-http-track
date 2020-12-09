const auth = require('../mongoose/db/db');

const getWebsites = require('../mongoose/querys/trackQuerys').getWebsites;
const getWebsiteById = require('../mongoose/querys/trackQuerys').getWebsiteById;
const cron= require('../includes/httpTrack/cron')

function startServer(server, serverOptions, protocol) {
  server.set('views', './src/views');
  server.set('view engine', 'pug');

  server.get('/', function (req, res) {
    auth().then(con => {
      getWebsites(con, res)
        .then(projects => {
          res.render('index', {
            title: 'Projects',
            projects: projects,
            cron: require('../includes/httpTrack/cron.config').timing,
          });
        })
        .catch(e => {
          console.log(e);
        });
    });
  });

  server.get('/log/:id', function (req, res) {
    var id = req.params.id;
    var url = req.query.url;

    let changes = [];
    let statusCompare = [];
    let newlog = false;
    let lastlog = false;

    auth().then(con => {
      getWebsiteById(con, res, id)
        .then(project => {
          let logs = project.logs.filter(e => e.url === url);

          if (logs.length > 1) {
            newlog = logs.pop();
            lastlog = logs.pop();

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
                  
                  if (index===count.neg) {
                    valOld += '...>>>' + wordsOld[ind + index];
                    valNew += '...>>>' +  wordsNew[ind + index];
                    }
                    if (index===count.pos) {
                      valOld += ' ' + wordsOld[ind + index]+'<<<...';
                      valNew += ' ' +  wordsNew[ind + index]+'<<<...';
                      }
                  if (index===0) {
                  valOld += '>>CHANGE>>>' + wordsOld[ind + index];
                  valNew += ' ' +  wordsNew[ind + index];
                  }
                  if (index!==0&&index!==count.neg&&index!==count.pos) {
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
          }

          let proj = {
            name: project.name,
            newlog: newlog._doc,
            lastlog: lastlog._doc,
            diff: changes,
          };

          res.render('log', {title: 'Log', project: proj, id: id});
        })
        .catch(e => {
          console.log(e);
        });
    });
  });

  const track = require('../routers/track');
  server.use('/api/track', track);

  const apiStatus = require('../routers/routes');
  server.use('/api', apiStatus);

  port = process.env.PORT || 5000;
  if (protocol.httpServer) protocol.httpServer.listen(port);
  if (protocol.httpsServer) protocol.httpsServer.listen(port);
  if (!protocol.httpServer && !protocol.httpsServer) server.listen(port);

  if (process.env.NODE_ENV === 'development') {
    console.debug(`Server at: ${process.env.HOST}:${port}`);
  }
}

module.exports.startServer = startServer;
