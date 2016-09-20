'use strict';

const expect = require('chai').expect;

const setup = require('./setup');

const graphqlDynamo = require('../../src');

const AWS = require('aws-sdk');

describe('#query()', () => {

  const dynamodb = new AWS.DynamoDB();

  const tables = [{
    typeName: 'movie',
    typeListName: 'movies',
    tableName: 'movies',
    hashKey: {
      name: 'year',
      type: 'int',
    },
    rangeKey: {
      name: 'title',
      type: 'string',
    },
  }];

  const options = {
    dynamodbFactory: () => dynamodb
  };

  beforeEach(() => {
    return setup.init(dynamodb);
  });

  afterEach(function() {
    return setup.cleanup(dynamodb);
  });

  it('should get item', () => {
    const connector = graphqlDynamo(tables, options);

    const query = `{
      movie(year: 2013, title: "Turn It Down, Or Else!") {
        year, title
      }
    }`;

    return connector.query(query)
      .then((data) => {
        expect(data).to.not.equal(null);
      });
  });

  it('should query items', (done) => {
    const connector = graphqlDynamo(tables, options);

    const query = `{
      movies(year: 2013) {
        year, title
      }
    }`;

    return connector.query(query)
      .then((data) => {
        expect(data).to.not.equal(null);
      });
  });
});
