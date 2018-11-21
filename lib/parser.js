module.exports = instParser;

const request = require('node-fetch');
const fs = require('fs');

function instParser(name, photoQuality, cookie) {
  /** @type {String} user nickname */
  this.name = name;
  /** @type {String} random hash for requests, dunno how it works, lol */
  this.hash = '472f257a40c653c64c666ce877d59d2b';
  /** @type {String} photos quality */
  this.quality = photoQuality.toLowerCase();
  /** @type {String} Your account cookie */
  this.cookie = cookie;
}

/**
 * Request instagram and get info about user
 * @return {(Object|String)} Promise
 */
instParser.prototype.getUser = function () {
  return new Promise((resolve, reject) => {
    request(`http://instagram.com/${this.name}`).then(res => res.text()).then(body => {
      /** @type {Object} parse html to get object from script */
      let data = body.match(/<script type="text\/javascript">(.*)<\/script>/g);
      if (data) data = JSON.parse(data[0].slice(52,-10));
      else reject('User not found');
      data.entry_data !== 'undefined' ? resolve(data.entry_data.ProfilePage[0].graphql.user) : reject('User not found');
    }).catch(e => reject(e));
  });
};

/**
 * Option for save data about user to file (bio, subs, etc.)
 * @param  {Object} data
 * @param  {String} path
 * @return {(Object|Boolean)} Promise
 */
instParser.prototype.saveProfileData = function (data, path) {
  return new Promise((resolve, reject) => {
    /** @type {Array} Clear useless info, yeah it hardcoded, but who cares,
    * anyway there will be no errors on delete not existing elements if inst change it
    */
    let toClear = ['edge_felix_video_timeline', 'edge_owner_to_timeline_media', 'edge_saved_media', 'edge_media_collections'];
    for (edge of toClear) delete data[edge];
    /** @type {Object} json beautify */
    data = JSON.stringify(data, null, 4);
    fs.writeFile(path + '/data.json', data, 'utf8', (err, res) => {
      if (err) reject(err)
      else resolve(true);
    });
  });
};

/**
 * parse content and get links
 * @param  {Number} id
 * @param  {Number} limit
 * @param  {?Number} [end_cursor]
 * @return {(Object|String)} Promise
 */
instParser.prototype.parse = function (id, limit, end_cursor) {
  return new Promise((resolve, reject) => {
    request(`https://www.instagram.com/graphql/query/?query_hash=${this.hash}&variables={"id":"${id}","first":${limit}${end_cursor ? `,"after":"${end_cursor}"` : ''}}`, {
      'headers' : {
        'cookie' : `sessionid=${this.cookie};`
      }
    }).then(res => res.json()).then(body => {
      if (body.data.user.edge_owner_to_timeline_media.count) {
        let links = [];
        for (let item of body.data.user.edge_owner_to_timeline_media.edges) {
          if (item.node.__typename == 'GraphImage' || item.node.__typename == 'GraphSidecar') { // TODO add support for videos and full sidecars
            let photo = {'id' : item.node.id};
            switch (this.quality) {
              case 'low':
                photo.url = item.node.thumbnail_resources[0].src;
                break;
              case 'high':
                photo.url = item.node.thumbnail_resources[item.node.thumbnail_resources.length-1].src;
                break;
              default:
                photo.url = item.node.display_url;
            }
            links.push(photo);
          }
        }
        let page_info = body.data.user.edge_owner_to_timeline_media.page_info;
        let result = {'has_next_page' : page_info.has_next_page, 'body' : links};
        if (page_info.has_next_page) result.end_cursor = page_info.end_cursor;
        resolve(result);
      } else reject('No content found');
    }).catch(e => reject(e));
  });
};
