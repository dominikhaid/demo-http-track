const express = require('express');
const router = express.Router();

const util = require('util');
const fs = require('fs');
const writeFile = util.promisify(fs.writeFile);
const readFile = util.promisify(fs.readFile);

const auth = require('../mongoose/db/db');

const checkReqErrors = require('../includes/status').checkReqErrors;
const createLog= require('../mongoose/querys/trackQuerys').createLog;
const createUser= require('../mongoose/querys/trackQuerys').createUser;
const updateUser= require('../mongoose/querys/trackQuerys').updateUser;
const createWebsite= require('../mongoose/querys/trackQuerys').createWebsite;
const updateWebsite= require('../mongoose/querys/trackQuerys').updateWebsite;
const getWebsites= require('../mongoose/querys/trackQuerys').getWebsites;

router.get('/project', (req, res) => {

 auth().then(con => {
 getWebsites(con, res)
    .then(erg => {
      checkReqErrors(erg, res);
    })
    .catch(e => {
      checkReqErrors(e, res);
    });
  })
});

router.post('/project', (req, res) => {
  auth()
    .then(con => {
      createWebsite(con, req).then(erg => {
        checkReqErrors(erg, res);
      });
    })
    .catch(err => {
      checkReqErrors(err, res);
    });
});

router.patch('/project', (req, res) => {
  auth()
    .then(con => {
      updateWebsite(con, req).then(erg => {
      
        checkReqErrors(erg, res);
      });
    })
    .catch(err => {
    
      checkReqErrors(err, res);
    });
});

router.delete('/project', (req, res) => {
  auth()
    .then(con => {
      updateWebsite(con, req).then(erg => {    
        checkReqErrors(erg, res);
      });
    })
    .catch(err => {
    
      checkReqErrors(err, res);
    });
});

router.post('/log', (req, res) => {
  auth()
    .then(con => {
      createLog(con, req).then(erg => {
        checkReqErrors(erg, res);
      });
    })
    .catch(err => {
      checkReqErrors(err, res);
    });
});

router.post('/user', (req, res) => {
  auth()
    .then(con => {
      createUser(con, req).then(erg => {
        checkReqErrors(erg, res);
      });
    })
    .catch(err => {
      checkReqErrors(err, res);
    });
});

router.patch('/user', (req, res) => {
  auth()
    .then(con => {
      updateUser(con, req).then(erg => {
      
        checkReqErrors(erg, res);
      });
    })
    .catch(err => {
         checkReqErrors(err, res);
    });
});

router.post('/cron', (req, res) => {
 if (!req.body.timing)
 checkReqErrors({error:'missing params'}, res);

async function  write() {
  await writeFile(
    './src/includes/httpTrack/cron.config.js',
    'module.exports.timing = [' + req.body.timing.split(',').map(e=>'"'+e+'"').join(',') +']',
  );

  return {msg:"saved"}
}

 write().then(e=>{
  checkReqErrors(e, res);
 }).catch(err => {
         checkReqErrors(err, res);
    });

});



module.exports = router;
