var assert = require('assert');
var reqChecker = require('../index');

describe('main', function() {
  var options, fakeReq, fakeRes, fakeNext
  fakeRes = {
    send: function(data) {
      return false;
    }
  };

  fakeNext = function() {
    return true;
  };

  var index = 1;
  it((index++) + ' scope: default, strict: default -> No params required, Got 1 param', function() {
    options = { params: null };
    fakeReq = { query: { param1: 1 } };
    assert.equal(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
  });

  it((index++) + ' scope: query,   strict: default -> No params required, Got 1 param', function() {
    options = { scope:'query', params: null };
    fakeReq = { query: { param1: 1 } };
    assert.equal(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
  });

  it((index++) + ' scope: body,    strict: default -> No params required, Got 1 param', function() {
    options = { scope:'body', params: null };
    fakeReq = { body: { param1: 1 } };
    assert.equal(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
  });

  it((index++) + ' scope: default, strict: true    -> No params required, Got 1 param', function() {
    options = { strict: true, params: null };
    fakeReq = { query: { param1: 1 } };
    assert.equal(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
  });

  it((index++) + ' scope: default, strict: false   -> No params required, Got 1 param', function() {
    options = { strict: false, params: null };
    fakeReq = { query: { param1: 1 } };
    assert.notEqual(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
  });

  it((index++) + ' scope: default, strict: default -> 1 param required, Got 1 param', function() {
    options = { params: {
      param1: null
    } };
    fakeReq = { query: { 
      param1: 1
    } };
    assert.notEqual(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
  });

  it((index++) + ' scope: default, strict: default -> 1 param required, Got 2 params', function() {
    options = { params: {
      param1: null
    } };
    fakeReq = { query: { 
      param1: 1,
      param2: 2
    } };
    assert.equal(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
  });

  it((index++) + ' scope: default, strict: false   -> 1 param required, Got 2 params', function() {
    options = { strict: false, params: {
      param1: null
    } };
    fakeReq = { query: { 
      param1: 1,
      param2: 2
    } };
    assert.notEqual(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
  });

  it((index++) + ' scope: default, strict: default -> 2 params required, Got 1 param', function() {
    options = { strict: false, params: {
      param1: null,
      param2: null
    } };
    fakeReq = { query: { 
      param1: 1
    } };
    assert.equal(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
  });

  it((index++) + ' scope: default, strict: default -> 2 params required, Got 1 param, 1 unexpected param', function() {
    options = { strict: false, params: {
      param1: null,
      param2: null
    } };
    fakeReq = { query: { 
      param1: 1,
      param3: 3
    } };
    assert.equal(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
  });

  it((index++) + ' scope: default, strict: false   -> 2 params required, Got 2 param, 1 unexpected param', function() {
    options = { strict: false, params: {
      param1: null,
      param2: null
    } };
    fakeReq = { query: { 
      param1: 1,
      param2: 2,
      param3: 3
    } };
    assert.notEqual(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
  });

  it((index++) + ' scope: default, strict: default -> 1 param required(RegExp), Got 1 valid param', function() {
    options = { strict: false, params: {
      param1: { matchRegExp: /^[1]{1}$/ }
    } };
    fakeReq = { query: { 
      param1: 1
    } };
    assert.notEqual(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
  });

  it((index++) + ' scope: default, strict: default -> 1 param required(RegExp), Got 1 invalid param', function() {
    options = { strict: false, params: {
      param1: { matchRegExp: /^[1]{1}$/ }
    } };
    fakeReq = { query: { 
      param1: 2
    } };
    assert.equal(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
  });

  it((index++) + ' scope: default, strict: default -> 1 param optional, Got 1 param', function() {
    options = { strict: false, params: {
      param1: { isOptional: true }
    } };
    fakeReq = { query: { 
      param1: 1
    } };
    assert.notEqual(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
  });

  it((index++) + ' scope: default, strict: default -> 1 param optional, Got NO param', function() {
    options = { strict: false, params: {
      param1: { isOptional: true }
    } };
    fakeReq = { query: { 
    } };
    assert.notEqual(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
  });

  it((index++) + ' scope: default, strict: default -> 1 param optional, Got invalid param', function() {
    options = { strict: false, params: {
      param1: { isOptional: true, matchRegExp: /^[1]{1}$/ }
    } };
    fakeReq = { query: { 
      param1: 2
    } };
    assert.equal(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
  });

  it((index++) + ' scope: default, strict: default -> 1 param required, 1 param optional, Got 1 valid param', function() {
    options = { strict: false, params: {
      param1: { matchRegExp: /^[1]{2}$/ },
      param1: { isOptional: true, matchRegExp: /^[1]{1}$/ }
    } };
    fakeReq = { query: { 
      param1: 11
    } };
    assert.equal(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
  });

});