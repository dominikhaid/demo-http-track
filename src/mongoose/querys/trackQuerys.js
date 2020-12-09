const mongoose = require('mongoose');
const crawl = require('../../includes/httpTrack/crawl').crawl;

/**
 * GET PROHECTS
 */

module.exports.getWebsites = async (con, req) => {
  const Website = con.models.Website;

  //all porjects /websites
  let porjects = await Website.find()
    .populate(
      'logs',
      'statusCode statusMessage server date contentType httpVersion body url',
    )
    .populate('users', 'name email')
    .exec()
    .catch(err => {
      return {error: err};
    });

  let returnArr = [];

  //filterlast crawl from log for each url
  for (let index = 0; index < porjects.length; index++) {
    const project = porjects[index];
    let projectArr = [];

    for (let index = 0; index < project.urls.length; index++) {
      const url = project.urls[index];
      let lastCrawl = [];

      if (project.logs) lastCrawl = project.logs.filter(e => e.url === url);

      if (lastCrawl[0])
        projectArr.push(JSON.parse(JSON.stringify(lastCrawl.pop()._doc)));
    }

    returnArr.push(
      JSON.parse(JSON.stringify({...project._doc, lastCrawl: projectArr})),
    );
  }

  return returnArr;
};

/**
 * GET WEBSITE
 */

module.exports.getWebsiteById = async (con, req, id) => {
  const Website = con.models.Website;

  //all porjects /websites
  let porject = await Website.findById({_id: id})
    .populate(
      'logs',
      'statusCode statusMessage server date contentType httpVersion body url',
    )
    .populate('users', 'name email')
    .exec()
    .catch(err => {
      return {error: err};
    });

  return porject;
};

/**
 * CREATE NEW PWEBSITE
 */

module.exports.createWebsite = async (con, req) => {
  const Website = con.models.Website;
  const WebsitesId = mongoose.Types.ObjectId();

  if (!req.body.name) return {error: 'missing params'};

  let website = new Website({
    _id: WebsitesId,
    name: req.body.name,
  });

  let resWeb = await website
    .save()
    .then(e => {
      return {site: e};
    })
    .catch(e => {
      return {error: e};
    });

  return resWeb;
};

/**
 * CREATE NEW LOG
 */

module.exports.createLog = async (con, req) => {
  const Log = con.models.Log;
  const Website = con.models.Website;

  if (!req.body.name) return {error: 'missing params'};

  //get project by name
  let project = await Website.findOne({
    name: req.body.name,
  })
    .exec()
    .catch(err => {
      return {error: err};
    });

  let newLogs = [];

  //create logs for all project urls
  if (!req.body.url)
    for (let index = 0; index < project.urls.length; index++) {
      const url = project.urls[index];
      const LogsId = mongoose.Types.ObjectId();

      //crawl url
      let crawled = await crawl(url)
        .then(log => log)
        .catch(e => {
          console.log(e);
        });

      //update log ids in project
      await Website.findOneAndUpdate(
        {
          name: req.body.name,
        },
        {$push: {logs: LogsId}},
      ).catch(err => {
        return err;
      });

      //creat new log
      let log = new Log({
        _id: LogsId,
        statusCode: crawled.statusCode,
        statusMessage: crawled.statusMessage,
        server: crawled.server,
        date: crawled.date,
        contentType: crawled.contentType,
        httpVersion: crawled.httpVersion,
        body: crawled.body,
        url: url,
        // timingPhases: { type: Object},
        // url: { type: String, index: true, unique: true, required: true },
      });

      let resLog = await log
        .save()
        .then(e => {
          return {log: e};
        })
        .catch(e => {
          return {error: e};
        });

      newLogs.push(resLog);
    }

  //create logs for single
  if (req.body.url) {
    let crawled = await crawl(req.body.url)
      .then(log => log)
      .catch(e => {
        console.log(e);
      });

    const LogsId = mongoose.Types.ObjectId();

    //update log ids in project
    await Website.findOneAndUpdate(
      {
        name: req.body.name,
      },
      {$push: {logs: LogsId}},
    ).catch(err => {
      return err;
    });

    //creat new log
    let log = new Log({
      _id: LogsId,
      statusCode: crawled.statusCode,
      statusMessage: crawled.statusMessage,
      server: crawled.server,
      date: crawled.date,
      contentType: crawled.contentType,
      httpVersion: crawled.httpVersion,
      body: crawled.body,
      url: req.body.url,
      // timingPhases: { type: Object},
      // url: { type: String, index: true, unique: true, required: true },
    });

    let resLog = await log
      .save()
      .then(e => {
        return {log: e};
      })
      .catch(e => {
        return {error: e};
      });

    newLogs.push(resLog);
  }
  return newLogs;
};

/**
 * GET LOG
 */

module.exports.getLogById = async (con, req, id) => {
  const Log = con.models.Log;

  //all porjects /websites
  let porjects = await Log.findById({_id: id})
    .exec()
    .catch(err => {
      return {error: err};
    });

  return porjects;
};

/**
 * UPDATE PROJECT
 */

module.exports.updateWebsite = async (con, req) => {
  const Website = con.models.Website;
  const User = con.models.User;
  let projectRes;
  let update = new Object();
  let UsersId;

  if (!req.body.name && !req.body.users && !req.body.urls)
    return {error: 'missing params'};

  //DELETE PROJECT
  if (req.body.oldName && !req.body.newName)
    projectRes = await Website.findOneAndDelete({
      name: req.body.oldName,
    }).catch(err => {
      return err;
    });
  if (req.body.oldName && !req.body.newName) return projectRes;

  //PUSH UPDATE

  if (req.body.newUserEmail && req.body.newUserName) {
    UsersId = mongoose.Types.ObjectId();

    let user = await User.findOne({
      email: req.body.newUserEmail,
    })
      .exec()
      .catch(err => {
        return {error: err};
      });

    if (!user) {
      user = new User({
        _id: UsersId,
        name: req.body.newUserName,
        email: req.body.newUserEmail,
      });

      user = await user
        .save()
        .then(e => {
          return {user: e};
        })
        .catch(e => {
          return {error: e};
        });
    }

    if (user) {
      if (!update.$push) update.$push = {};
      update.$push.users = user._id ? user._id : user.user._id;
    }
  }

  if (req.body.newName) update.name = req.body.newName;

  if (req.body.newUrl) {
    if (!update.$push) update.$push = {};
    update.$push.urls = req.body.newUrl;
  }

  if (Object.keys(update).length > 0)
    projectRes = await Website.findOneAndUpdate(
      {
        name: req.body.name,
      },
      update,
    ).catch(err => {
      return {error: err};
    });

  //PULL UPDATE
  update = new Object();

  if (req.body.oldUrl) {
    if (!update.$pull) update.$pull = {};
    update.$pull.urls = req.body.oldUrl;
  }
  if (req.body.oldUser) {
    if (!update.$pull) update.$pull = {};

    update.$pull.users = mongoose.Types.ObjectId(req.body.oldUser);
  }

  if (Object.keys(update).length > 0)
    projectRes = await Website.findOneAndUpdate(
      {
        name: req.body.name,
      },
      update,
    ).catch(err => {
      return {error: err};
    });

  update = {
    $pull: {},
  };
  if (!projectRes) projectRes = {msg: 'Nothing done'};
  return projectRes;
};

/**
 * CREATE NEW USER
 */

module.exports.createUser = async (con, req) => {
  const User = con.models.User;
  const UsersId = mongoose.Types.ObjectId();

  let user = new User({
    _id: UsersId,
    name: req.body.name,
    email: req.body.email,
  });

  let resUser = await user
    .save()
    .then(e => {
      return {user: e};
    })
    .catch(e => {
      return {error: e};
    });

  return resUser;
};

/**
 * UPDATE USER
 */

module.exports.updateUser = async (con, req) => {
  const User = con.models.User;
  let projectRes;
  let update = new Object();

  if (!req.body.email) return {error: 'missing params'};

  if (req.body.uptUserEmail) update.email = req.body.uptUserEmail;

  if (req.body.uptUserName) update.name = req.body.uptUserName;

  projectRes = await User.findOneAndUpdate(
    {
      email: req.body.email,
    },
    update,
  ).catch(err => {
    return {error: err};
  });

  return projectRes;
};
