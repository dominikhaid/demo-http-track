const mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports.Schema = Schema;

/**
 * USERS
 * populate Stories
 */
module.exports.users = Schema({
  _id: Schema.Types.ObjectId,
  name: {type: String, required: true},
  email: { type: String,
		lowercase: true,
		index: true,
		unique: true,
		required: true,
		validate: {
			validator: function (v) {
				return /^((?!\.)[\w-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/gim.test(v);
			},
			message: (props) => `${props.value} is not a validd E-mail adresss`,
		}},
  createdAt: {type: Date, default: Date.now},
});

/**
 * LOGS
 * Referenced by people populate Fans and Author
 */
module.exports.logs = Schema({
  _id: Schema.Types.ObjectId,
  statusCode: {type: Number},
  statusMessage: {type: String},
  server: {type: String},
  date: {type: String},
  contentType: {type: String},
  httpVersion: {type: String},
  timingPhases: {type: Object},
  body: {type: Object},
  url: {type: String, index: true,  required: true},
  createdAt: {type: Date, default: Date.now},
});

/**
 * WEBSITES
 * Referenced by Stories
 */
module.exports.websites = Schema({
  _id: Schema.Types.ObjectId,
  name: {type: String, index: true,  required: true},
  urls: {type: Array, required: true},
  logs: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Log',
    },
  ],
  users: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  createdAt: {type: Date, default: Date.now},
});

/**
 *
 * @param {Object} db
 * @param {Object} model
 * @param {string} name
 */
module.exports.createSchema = (db, model, name) => {
  const MyModel = db.model(name, model);
  const m = new MyModel();
  m.save();
};
