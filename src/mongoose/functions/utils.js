/**
 *
 * @param {Object} db mongoDB database
 * @param {String} name collection name
 */

module.exports.findCollections = async (db, name) => {
  let res = await db
    .listCollections(name ? {name: name} : null, {nameOnly: true})
    .toArray();
  return res;
};
/**
 *
 * @param {Object} db mongoDB database
 * @param {String} name collection name
 */

module.exports.createCollection = async (db, name) => {
  let res = await db.createCollection(name, {
    capped: false,
  });
  return res;
};
