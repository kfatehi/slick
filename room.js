var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var Watcher = require('./watcher');
var _ = require('lodash');

var ChatEvent = require('./chat_event');

module.exports = Room;
function Room(dir){
  this.dir = dir;
  this.name = path.basename(dir)
  this.watcher = new Watcher()
};

Room.prototype.setup = function(cb) {
  if ( ! fs.existsSync(this.dir)) {
    mkdirp(this.dir, cb);
  } else cb();
}

/* Most recent event is last in the array */
Room.prototype.getRecentEvents = function(count, cb) {
  var dir = this.dir;
  return fs.readdir(dir, function(err, res) {
    if (err) return cb(err);
    var out = _(res).map(function(v) { 
      var filePath = path.join(dir,v);
      var modTime = fs.statSync(filePath).mtime.getTime();
      return { path:filePath, time: modTime }; 
    }).sort(function(a, b) { return a.time - b.time; });
    if (count > 0) out = out.takeRight(count);
    out = out.map(function(e) { return new ChatEvent(e.path, e.time) });
    return cb(err, out.value());
  })
}

Room.prototype.addTextEvent = function(username, msg) {
  var date = new Date().toJSON();
  var fname = date+'|'+username+".txt"
  this.addEvent(fname, msg);
}

Room.prototype.addEvent = function(fname, content) {
  var fpath = path.join(this.dir, fname);
  fs.writeFile(fpath, content, function(err) {
    if (err) throw err;
  })
}
