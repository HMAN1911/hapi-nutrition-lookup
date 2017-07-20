'use strict';

const Hapi = require('hapi');
const axios = require('axios');

const server = new Hapi.Server();
server.connection({
  port: 3003,
  host: 'localhost'
});

const loggingOptions = {
  ops: {
    interval: 1000
  },
  reporters: {
    myConsoleReporter: [{
      module: 'good-squeeze',
      name: 'Squeeze',
      args: [{
        log: '*',
        response: '*'
      }]
    }, {
      module: 'good-console'
    }, 'stdout'],
    myFileReporter: [{
      module: 'good-squeeze',
      name: 'Squeeze',
      args: [{
        ops: '*'
      }]
    }, {
      module: 'good-squeeze',
      name: 'SafeJson'
    }, {
      module: 'good-file',
      args: ['./test/fixtures/awesome_log']
    }],
    myHTTPReporter: [{
      module: 'good-squeeze',
      name: 'Squeeze',
      args: [{
        error: '*'
      }]
    }, {
      module: 'good-http',
      args: ['http://prod.logs:3000', {
        wreck: {
          headers: {
            'x-api-key': 12345
          }
        }
      }]
    }]
  }
};

server.register({
  register: require('good'),
  loggingOptions,
}, (err) => {

  if (err) {
    return console.error(err);
  }
  server.start(() => {
    console.info(`Server started at ${ server.info.uri }`);
  });

});

server.route({
  method: 'GET',
  path: '/foodSearch',
  handler: function (request, reply) {
    axios.get(`https://api.nal.usda.gov/ndb/search/?format=json&q=${request.query.query}&sort=n&max=15&offset=0&api_key=4ogC8BfNhzW5MlNPD2ZFpBP5sKDQu8Q7ZCj5JtlU`)
      .then(res => res.data.list.item)
      .then(items => items.map(item => axios.get(`https://api.nal.usda.gov/ndb/V2/reports?ndbno=${item.ndbno}&type=f&format=json&api_key=4ogC8BfNhzW5MlNPD2ZFpBP5sKDQu8Q7ZCj5JtlU`)))
      .then(promises => Promise.all(promises)
      .then(res => reply({items: res.map(res => res.data.foods)})))
      .catch(function (error) {
        console.log(error);
      });
  }
});
