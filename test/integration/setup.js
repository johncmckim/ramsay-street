'use strict';

const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const BbPromise = require('bluebird');

const clientFactory = require('../../src/client');

const movieDataRaw = fs.readFileSync(path.resolve(__dirname, 'moviedata.json'), 'utf8');
const movieData = JSON.parse(movieDataRaw);

const tableName = 'movies';

const createTableParams = {
  TableName : tableName,
  KeySchema: [
    { AttributeName: 'year', KeyType: 'HASH'},  //Partition key
    { AttributeName: 'title', KeyType: 'RANGE' }  //Sort key
  ],
  AttributeDefinitions: [
    { AttributeName: 'year', AttributeType: 'N' },
    { AttributeName: 'title', AttributeType: 'S' }
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 1,
    WriteCapacityUnits: 1
  },
};

const deleteTableParams = {
  TableName : tableName,
};

const createData = function(docClient) {
  console.log('creating data');

  const addOperations = _.map(movieData, function(movie) {
    var params = {
        TableName: tableName,
        Item: {
          year:  movie.year,
          title: movie.title,
          info:  movie.info
        }
    };

    return new BbPromise(function(resolve, reject) {
      docClient.put(params, function(err, data) {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  });

  return BbPromise.all(addOperations);
}


const init = function(dynamodb) {
  const docClient = clientFactory.docClient(dynamodb);
  console.log('creating table')
  const createTable = new BbPromise(function(resolve, reject) {
    dynamodb.createTable(createTableParams, function(err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });

  return createTable
          .then(() => createData(docClient));
}

const cleanup = function(dynamodb) {
  return new BbPromise(function(resolve, reject) {
    dynamodb.deleteTable(deleteTableParams, function(err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

module.exports = {
  init: init,
  cleanup: cleanup
};
