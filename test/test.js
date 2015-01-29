var assert = require('assert');
var reqCheckerModule = require('../express-request-checker');
var reqChecker = reqCheckerModule.requestChecker;

describe('main', function() {
  reqCheckerModule.DEBUG_ENABLED = true;

  var options, fakeReq, fakeRes, fakeNext
  fakeRes = {
    send: function(data) {
      console.log(data);
      return false;
    },
    status: function(status) {}
  };

  fakeNext = function() {
    return true;
  };

  /************/
  /*  v0.0.6  */
  /************/
  it('1-1 scope: default, strict: default -> No params required, Got 1 param', function() {
    options = { params: null };
    fakeReq = { query: { param1: 1 } };
    assert.equal(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
  });

  it('1-2 scope: query,   strict: default -> No params required, Got 1 param', function() {
    options = { scope:'query', params: null };
    fakeReq = { query: { param1: 1 } };
    assert.equal(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
  });

  it('1-3 scope: body,    strict: default -> No params required, Got 1 param', function() {
    options = { scope:'body', params: null };
    fakeReq = { body: { param1: 1 } };
    assert.equal(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
  });

  it('1-4 scope: default, strict: true    -> No params required, Got 1 param', function() {
    options = { strict: true, params: null };
    fakeReq = { query: { param1: 1 } };
    assert.equal(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
  });

  it('1-5 scope: default, strict: false   -> No params required, Got 1 param', function() {
    options = { strict: false, params: null };
    fakeReq = { query: { param1: 1 } };
    assert.notEqual(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
  });

  it('2-1 scope: default, strict: default -> 1 param required, Got 1 param', function() {
    options = { params: {
      param1: null
    } };
    fakeReq = { query: {
      param1: 1
    } };
    assert.notEqual(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
  });

  it('2-2 scope: default, strict: default -> 1 param required, Got 2 params', function() {
    options = { params: {
      param1: null
    } };
    fakeReq = { query: {
      param1: 1,
      param2: 2
    } };
    assert.equal(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
  });

  it('2-3 scope: default, strict: false   -> 1 param required, Got 2 params', function() {
    options = { strict: false, params: {
      param1: null
    } };
    fakeReq = { query: {
      param1: 1,
      param2: 2
    } };
    assert.notEqual(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
  });

  it('3-1 scope: default, strict: default -> 2 params required, Got 1 param', function() {
    options = { strict: false, params: {
      param1: null,
      param2: null
    } };
    fakeReq = { query: {
      param1: 1
    } };
    assert.equal(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
  });

  it('3-2 scope: default, strict: default -> 2 params required, Got 1 param, 1 unexpected param', function() {
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

  it('3-3 scope: default, strict: false   -> 2 params required, Got 2 param, 1 unexpected param', function() {
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

  it('4-1 scope: default, strict: default -> 1 param required(matchRegExp), Got 1 valid param', function() {
    options = { strict: false, params: {
      param1: { matchRegExp: /^[1]{1}$/ }
    } };
    fakeReq = { query: {
      param1: 1
    } };
    assert.notEqual(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
  });

  it('4-2 scope: default, strict: default -> 1 param required(matchRegExp), Got 1 invalid param', function() {
    options = { strict: false, params: {
      param1: { matchRegExp: /^[1]{1}$/ }
    } };
    fakeReq = { query: {
      param1: 2
    } };
    assert.equal(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
  });

  it('5-1 scope: default, strict: default -> 1 param optional, Got 1 param', function() {
    options = { strict: false, params: {
      param1: { isOptional: true }
    } };
    fakeReq = { query: {
      param1: 1
    } };
    assert.notEqual(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
  });

  it('5-2 scope: default, strict: default -> 1 param optional, Got NO param', function() {
    options = { strict: false, params: {
      param1: { isOptional: true }
    } };
    fakeReq = { query: {
    } };
    assert.notEqual(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
  });

  it('5-3 scope: default, strict: default -> 1 param optional, Got invalid param', function() {
    options = { strict: false, params: {
      param1: { isOptional: true, matchRegExp: /^[1]{1}$/ }
    } };
    fakeReq = { query: {
      param1: 2
    } };
    assert.equal(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
  });

  it('6-1 scope: default, strict: default -> 1 param required, 1 param optional, Got 1 valid param', function() {
    options = { strict: false, params: {
      param1: { matchRegExp: /^[1]{2}$/ },
      param2: { isOptional: true, matchRegExp: /^[1]{1}$/ }
    } };
    fakeReq = { query: {
      param1: 11
    } };
    assert.notEqual(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
  });

  /************/
  /*  v0.0.7  */
  /************/
  it('A-1 scope: default, strict: default -> 1 param required(assertTrue), Got 1 valid param', function() {
    options = { params: {
      param1: { assertTrue: function(v) { return v > 5; } }
    } };
    fakeReq = { query: {
      param1: 6
    } };
    assert.notEqual(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
  });

  it('A-2 scope: default, strict: default -> 1 param required(assertTrue), Got 1 invalid param', function() {
    options = { params: {
      param1: { assertTrue: function(v) { return v > 5; } }
    } };
    fakeReq = { query: {
      param1: 5
    } };
    assert.equal(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
  });

  it('B-1 scope: default, strict: default -> 1 param required(assertFalse), Got 1 valid param', function() {
    options = { params: {
      param1: { assertFalse: function(v) { return v > 5; } }
    } };
    fakeReq = { query: {
      param1: 5
    } };
    assert.notEqual(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
  });

  it('B-2 scope: default, strict: default -> 1 param required(assertFalse), Got 1 invalid param', function() {
    options = { params: {
      param1: { assertFalse: function(v) { return v > 5; } }
    } };
    fakeReq = { query: {
      param1: 6
    } };
    assert.equal(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
  });

  it('C-1 scope: default, strict: default -> 1 param required(matchRegExp), Got 1 valid param', function() {
    options = { params: {
      param1: { matchRegExp: [
        /^[012]{1}$/,
        /^[234]{1}$/
      ] }
    } };
    fakeReq = { query: {
      param1: 2
    } };
    assert.notEqual(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
  });

  it('C-2 scope: default, strict: default -> 1 param required(matchRegExp), Got 1 invalid param', function() {
    options = { params: {
      param1: { matchRegExp: [
        /^[012]{1}$/,
        /^[234]{1}$/
      ] }
    } };
    fakeReq = { query: {
      param1: 1
    } };
    assert.equal(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
  });

  it('D-1 scope: default, strict: default -> 1 param required(isIn), Got 1 valid param', function() {
    options = { params: {
      param1: { isIn: [1, 2, 3] }
    } };
    fakeReq = { query: {
      param1: 2
    } };
    assert.notEqual(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
  });

  it('D-2 scope: default, strict: default -> 1 param required(isIn), Got 1 invalid param', function() {
    options = { params: {
      param1: { isIn: [1, 2, 3] }
    } };
    fakeReq = { query: {
      param1: 4
    } };
    assert.equal(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
  });

  it('E-1 scope: default, strict: default -> 1 param required(notIn), Got 1 valid param', function() {
    options = { params: {
      param1: { notIn: [1, 2, 3] }
    } };
    fakeReq = { query: {
      param1: 4
    } };
    assert.notEqual(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
  });

  it('E-2 scope: default, strict: default -> 1 param required(notIn), Got 1 invalid param', function() {
    options = { params: {
      param1: { notIn: [1, 2, 3] }
    } };
    fakeReq = { query: {
      param1: 2
    } };
    assert.equal(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
  });

  it('F-1 scope: default, strict: default -> 1 param required(isInteger:true), Got 1 integer', function() {
    options = { params: {
      param1: { isInteger: true }
    } };
    fakeReq = { query: {
      param1: 1
    } };
    assert.notEqual(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
  });

  it('F-2 scope: default, strict: default -> 1 param required(isInteger:true), Got 1 non-integer', function() {
    options = { params: {
      param1: { isInteger: true }
    } };
    fakeReq = { query: {
      param1: 'hello'
    } };
    assert.equal(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
  });

  it('F-3 scope: default, strict: default -> 1 param required(isInteger:false), Got 1 integer', function() {
    options = { params: {
      param1: { isInteger: false }
    } };
    fakeReq = { query: {
      param1: 1
    } };
    assert.equal(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
  });

  it('F-4 scope: default, strict: default -> 1 param required(isInteger:false), Got 1 non-integer', function() {
    options = { params: {
      param1: { isInteger: false }
    } };
    fakeReq = { query: {
      param1: 'hello'
    } };
    assert.notEqual(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
  });

  it('F-5 scope: default, strict: default -> 1 param required(isEmail:true), Got 1 email', function() {
    options = { params: {
      param1: { isEmail: true }
    } };
    fakeReq = { query: {
      param1: 'abc@123.com'
    } };
    assert.notEqual(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
  });

  it('F-6 scope: default, strict: default -> 1 param required(isEmail:true), Got 1 non-email', function() {
    options = { params: {
      param1: { isEmail: true }
    } };
    fakeReq = { query: {
      param1: 'abc.123.com'
    } };
    assert.equal(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
  });

  it('F-7 scope: default, strict: default -> 1 param required(isEmail:false), Got 1 email', function() {
    options = { params: {
      param1: { isEmail: false }
    } };
    fakeReq = { query: {
      param1: 'abc@123.com'
    } };
    assert.equal(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
  });

  it('F-8 scope: default, strict: default -> 1 param required(isEmail:false), Got 1 non-email', function() {
    options = { params: {
      param1: { isEmail: false }
    } };
    fakeReq = { query: {
      param1: 'abc.123.com'
    } };
    assert.notEqual(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
  });

  it('G-1 scope: default, strict: default -> 1 param required(equal), Got 1 valid param', function() {
    options = { params: {
      param1: { equal: 5 }
    } };
    fakeReq = { query: {
      param1: 5
    } };
    assert.notEqual(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
  });

  it('G-2 scope: default, strict: default -> 1 param required(equal), Got 1 invalid param', function() {
    options = { params: {
      param1: { equal: 5 }
    } };
    fakeReq = { query: {
      param1: 6
    } };
    assert.equal(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
  });

  it('H-1 scope: default, strict: default -> 1 param required(greaterThan), Got 1 valid param', function() {
    options = { params: {
      param1: { greaterThan: 5 }
    } };
    fakeReq = { query: {
      param1: 6
    } };
    assert.notEqual(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
  });

  it('H-2 scope: default, strict: default -> 1 param required(greaterThan), Got 1 invalid param', function() {
    options = { params: {
      param1: { greaterThan: 5 }
    } };
    fakeReq = { query: {
      param1: 5
    } };
    assert.equal(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
  });

  it('H-3 scope: default, strict: default -> 1 param required(greaterEqual), Got 1 valid param', function() {
    options = { params: {
      param1: { greaterEqual: 5 }
    } };
    fakeReq = { query: {
      param1: 5
    } };
    assert.notEqual(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
  });

  it('H-4 scope: default, strict: default -> 1 param required(greaterEqual), Got 1 invalid param', function() {
    options = { params: {
      param1: { greaterEqual: 5 }
    } };
    fakeReq = { query: {
      param1: 4
    } };
    assert.equal(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
  });
<<<<<<< Updated upstream
=======

  it('I-1 scope: default, strict: default -> 1 param required(lessThan), Got 1 valid param', function() {
    options = { params: {
      param1: { lessThan: 5 }
    } };
    fakeReq = { query: {
      param1: 4
    } };
    assert.notEqual(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
  });

  it('I-2 scope: default, strict: default -> 1 param required(lessThan), Got 1 invalid param', function() {
    options = { params: {
      param1: { lessThan: 5 }
    } };
    fakeReq = { query: {
      param1: 5
    } };
    assert.equal(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
  });

  it('I-3 scope: default, strict: default -> 1 param required(lessEqual), Got 1 valid param', function() {
    options = { params: {
      param1: { lessEqual: 5 }
    } };
    fakeReq = { query: {
      param1: 5
    } };
    assert.notEqual(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
  });

  it('I-4 scope: default, strict: default -> 1 param required(lessEqual), Got 1 invalid param', function() {
    options = { params: {
      param1: { lessEqual: 5 }
    } };
    fakeReq = { query: {
      param1: 6
    } };
    assert.equal(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
  });

  it('J-1 scope: default, strict: default -> 1 param required(allowEmpty:true), Got 1 empty param', function() {
    options = { params: {
      param1: { allowEmpty: true}
    } };
    fakeReq = { query: {
      param1: ""
    } };
    assert.notEqual(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
  });

  it('J-2 scope: default, strict: default -> 1 param required(allowEmpty:true), Got 1 non-empty param', function() {
    options = { params: {
      param1: { allowEmpty: true}
    } };
    fakeReq = { query: {
      param1: "hello"
    } };
    assert.notEqual(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
  });

  it('J-3 scope: default, strict: default -> 1 param required(allowEmpty:false), Got 1 empty param', function() {
    options = { params: {
      param1: { allowEmpty: false}
    } };
    fakeReq = { query: {
      param1: ""
    } };
    assert.equal(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
  });

  it('J-4 scope: default, strict: default -> 1 param required(allowEmpty:false), Got 1 non-empty param', function() {
    options = { params: {
      param1: { allowEmpty: false}
    } };
    fakeReq = { query: {
      param1: "hello"
    } };
    assert.notEqual(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
  });

  it('K-1 scope: default, strict: default -> 1 param required(maxLength), Got 1 valid param', function() {
    options = { params: {
      param1: { maxLength: 5}
    } };
    fakeReq = { query: {
      param1: "hello"
    } };
    assert.notEqual(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
  });

  it('K-2 scope: default, strict: default -> 1 param required(maxLength), Got 1 invalid param', function() {
    options = { params: {
      param1: { maxLength: 5}
    } };
    fakeReq = { query: {
      param1: "hello "
    } };
    assert.equal(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
  });

  it('K-3 scope: default, strict: default -> 1 param required(minLength), Got 1 valid param', function() {
    options = { params: {
      param1: { minLength: 5}
    } };
    fakeReq = { query: {
      param1: "hello"
    } };
    assert.notEqual(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
  });

  it('K-4 scope: default, strict: default -> 1 param required(minLength), Got 1 invalid param', function() {
    options = { params: {
      param1: { minLength: 5}
    } };
    fakeReq = { query: {
      param1: "hell"
    } };
    assert.equal(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
  });
>>>>>>> Stashed changes
});
