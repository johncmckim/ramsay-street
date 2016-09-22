'use strict';

const reservedWords = require('./reserved-words');

const isReservedWord = (word) => {
  if(!word) throw new Error('Word is required');

  return reservedWords.indexOf(word.toUpperCase()) != -1;
}

module.exports = {
  isReservedWord: isReservedWord,
};
