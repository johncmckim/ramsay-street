'use strict';

const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;

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

  before(() => {
    return setup.init(dynamodb);
  });

  after(function() {
    return setup.cleanup(dynamodb);
  });

  it('should get item', (done) => {
    const connector = graphqlDynamo(tables, options);

    const query = `{
      movie(year: 2013, title: "Rush") {
        year, title
      }
    }`;

    connector.query(query)
      .then((result) => {
        console.log('Query Result', result);
        expect(result).to.not.equal(null);
        expect(result.errors).to.equal(undefined);

        const data = result.data;
        expect(data).to.not.equal(null);

        const movie = result.data.movie;
        expect(movie).to.deep.equal({
          year: 2013,
          title: 'Rush'
        });
        done();
      })
      .catch((err) => {
        console.log('error');
        done(err);
      });
  });

  it('should query items', (done) => {
    const connector = graphqlDynamo(tables, options);

    const query = `{
      movies(year: 2013) {
        year, title
      }
    }`;

    connector.query(query)
      .then((result) => {
        console.log('Query Result', result);
        expect(result).to.not.equal(null);
        expect(result.errors).to.equal(undefined);

        const data = result.data;
        expect(data).to.not.equal(null);

        const movies = result.data.movies;
        expect(movies).to.not.equal(null);
        expect(movies.length).to.equal(3);
        expect(movies).to.deep.equal([
          { year: 2013, title: 'Prisoners' },
          { year: 2013, title: 'Rush' },
          { year: 2013, title: 'The Hunger Games: Catching Fire' }
        ]);
        done();
      }).catch(function (err) {
        console.error(err)
        done(err);
      });
  });
});
