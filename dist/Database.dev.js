"use strict";

var _require = require('pg'),
    Client = _require.Client;

var connectionString;
var idNum = 1;

if (SERVER === 'localhost') {
  connectionString = 'postgres://osonqhwewiurod:d63dd1bbb1d7d873e072deb5428138534c07cc2dd86e6925a9c2d159c2c91d0a@ec2-52-207-124-89.compute-1.amazonaws.com:5432/deptf3pe77lr9f';
} else {
  connectionString = process.env.DATABASE_URL;
}

var client = new Client({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});
client.connect();

var updateDatabase = function updateDatabase() {
  client.query('SELECT * FROM account;', function (err, res) {
    if (err) {
      throw err;
    }

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = res.rows[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var row = _step.value;

        if (JSON.parse(JSON.stringify(row)).id >= idNum) {
          idNum = JSON.parse(JSON.stringify(row)).id + 1;
        } else {
          return;
        }
      } //client.end();

    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator["return"] != null) {
          _iterator["return"]();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  });
};

storeDatabase = function storeDatabase() {
  var data = {};

  for (var i in Player.list) {
    data[Player.list[i].username] = {
      inventory: Player.list[i].inventory
    };
  }

  client.query('INSERT INTO progress(id, qusername, qprogress) VALUES (', function (err, res) {
    if (err) {
      throw err;
    }

    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = res.rows[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var row = _step2.value;

        if (JSON.parse(JSON.stringify(row)).id >= idNum) {
          idNum = JSON.parse(JSON.stringify(row)).id + 1;
        } else {
          return;
        }
      } //client.end();

    } catch (err) {
      _didIteratorError2 = true;
      _iteratorError2 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
          _iterator2["return"]();
        }
      } finally {
        if (_didIteratorError2) {
          throw _iteratorError2;
        }
      }
    }
  });
};

updateDatabase();
var USE_DB = true;
Database = {};

Database.isValidPassword = function (data, cb) {
  if (!USE_DB) return cb(3);
  client.query('SELECT * FROM account WHERE qusername=\'' + data.username + '\';', function (err, res) {
    if (err) {
      throw err;
    }

    if (res.rows[0]) {
      var row = JSON.parse(JSON.stringify(res.rows[0]));

      if (row.qpassword === data.password) {
        for (var i in Player.list) {
          if (Player.list[i].username === data.username) {
            return cb(2);
          }
        }

        return cb(3);
      } else {
        return cb(1);
      }
    } else {
      return cb(0);
    }
  });
};

Database.isUsernameTaken = function (data, cb) {
  if (!USE_DB) return cb(1);
  client.query('SELECT * FROM account WHERE qusername=\'' + data.username + '\';', function (err, res) {
    if (err) {
      throw err;
    }

    if (res.rows[0]) {
      return cb(0);
    } else {
      return cb(1);
    }
  });
};

Database.addUser = function (data, cb) {
  if (!USE_DB) return cb();
  client.query('INSERT INTO account(id, qusername, qpassword) VALUES (' + idNum + ', \'' + data.username + '\', \'' + data.password + '\');', function (err, res) {
    if (err) {
      throw err;
    }

    updateDatabase();
    return cb();
  });
};

Database.removeUser = function (data, cb) {
  if (!USE_DB) return cb();
  client.query('DELETE FROM account WHERE qusername=\'' + data.username + '\';', function (err, res) {
    if (err) {
      throw err;
    }

    updateDatabase();
    return cb();
  });
};