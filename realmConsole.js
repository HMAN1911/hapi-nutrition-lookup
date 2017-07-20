'use strict';
var Realm = require('realm');

var realm = new Realm({
  schema: [{name: 'Dog', properties: {name: 'string'}}]
});

realm.write(() => {
  realm.deleteAll();
});

