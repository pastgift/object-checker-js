var assert = require('assert');
var reqCheckerModule = require('../express-request-checker');

var reqChecker = reqCheckerModule.requestChecker;

var PRINT_RESULT_FLAG = false;

describe('main', function() {
  reqCheckerModule.SEND_ERROR_DETAIL(true);

  var options, fakeReq, fakeRes, fakeNext
  fakeRes = {
    send: function(data) {
      if (PRINT_RESULT_FLAG) console.log(data);
      return false;
    },
    status: function(status) {
      if (PRINT_RESULT_FLAG) console.log('status: ' + status);
    },
    set: function(k, v) {
      if (PRINT_RESULT_FLAG) console.log('set header: ' + k + ', ' + v);
    }
  };

  fakeNext = function() { return true; };

  // ----- Basic -----

  it('1-1 scope: <none>, strict: default -> No thing required, Each scope got 1 input', function() {
    options = { } ;
    fakeReq = { params: { param1: 1 }, query: { param1: 1 }, body: { param1: 1 } };
    assert.notEqual(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
  });

  it('1-2 scope: params, strict: default -> No params required, Got 1 params input', function() {
    options = { params: {} };
    fakeReq = { params: { param1: 1 } };
    assert.equal(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
  });

  it('1-3 scope: query, strict: default -> No query required, Got 1 query input', function() {
    options = { query: {} };
    fakeReq = { query: { param1: 1 } };
    assert.equal(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
  });

  it('1-4 scope: body, strict: default -> No body required, Got 1 body input', function() {
    options = { body: {} };
    fakeReq = { body: { param1: 1 } };
    assert.equal(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
  });

  it('1-5 scope: query, strict: true -> No query required, Got 1 query input', function() {
    options = { strict: true, query: {} };
    fakeReq = { query: { param1: 1 } };
    assert.equal(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
  });

  it('1-6 scope: query, strict: false -> No query required, Got 1 query input', function() {
    options = { strict: false, query: {} };
    fakeReq = { query: { param1: 1 } };
    assert.notEqual(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
  });



  it('2-1 scope: query, strict: default -> 1 query required, Got 1 query input', function() {
    options = { query: {
      param1: {}
    } };
    fakeReq = { query: {
      param1: 1
    } };
    assert.notEqual(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
  });

  it('2-2 scope: query, strict: default -> 1 query required, Got 2 query inputs', function() {
    options = { query: {
      param1: {}
    } };
    fakeReq = { query: {
      param1: 1,
      param2: 2
    } };
    assert.equal(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
  });

  it('2-3 scope: query, strict: false -> 1 query required, Got 2 query inputs', function() {
    options = { strict: false, query: {
      param1: {}
    } };
    fakeReq = { query: {
      param1: 1,
      param2: 2
    } };
    assert.notEqual(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
  });



  it('3-1 scope: query, strict: default -> 2 query required, Got 1 query input', function() {
    options = { query: {
      param1: {},
      param2: {}
    } };
    fakeReq = { query: {
      param1: 1
    } };
    assert.equal(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
  });

  it('3-2 scope: query, strict: default -> 2 query required, Got 1 query, 1 unexpected query input', function() {
    options = { query: {
      param1: {},
      param2: {}
    } };
    fakeReq = { query: {
      param1: 1,
      param3: 3
    } };
    assert.equal(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
  });

  it('3-3 scope: query, strict: false   -> 2 query required, Got 2 query, 1 unexpected query input', function() {
    options = { strict: false, query: {
      param1: {},
      param2: {}
    } };
    fakeReq = { query: {
      param1: 1,
      param2: 2,
      param3: 3
    } };
    assert.notEqual(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
  });



  it('4-1 scope: query, strict: default -> 1 query required(matchRegExp), Got 1 valid query input', function() {
    options = { strict: false, query: {
      param1: { matchRegExp: /^[1]{1}$/ }
    } };
    fakeReq = { query: {
      param1: 1
    } };
    assert.notEqual(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
  });

  it('4-2 scope: query, strict: default -> 1 query required(matchRegExp), Got 1 invalid query input', function() {
    options = { strict: false, query: {
      param1: { matchRegExp: /^[1]{1}$/ }
    } };
    fakeReq = { query: {
      param1: 2
    } };
    assert.equal(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
  });



  it('5-1 scope: query, strict: default -> 1 query optional, Got 1 query input', function() {
    options = { strict: false, query: {
      param1: { isOptional: true }
    } };
    fakeReq = { query: {
      param1: 1
    } };
    assert.notEqual(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
  });

  it('5-2 scope: query, strict: default -> 1 query optional, Got NO query input', function() {
    options = { strict: false, query: {
      param1: { isOptional: true }
    } };
    fakeReq = { query: {
    } };
    assert.notEqual(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
  });

  it('5-3 scope: query, strict: default -> 1 query optional, Got invalid query input', function() {
    options = { strict: false, query: {
      param1: { isOptional: true, matchRegExp: /^[1]{1}$/ }
    } };
    fakeReq = { query: {
      param1: 2
    } };
    assert.equal(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
  });



  it('6-1 scope: query, strict: default -> 1 query required, 1 query optional, Got 1 valid query input', function() {
    options = { strict: false, query: {
      param1: { matchRegExp: /^[1]{2}$/ },
      param2: { isOptional: true, matchRegExp: /^[1]{1}$/ }
    } };
    fakeReq = { query: {
      param1: 11
    } };
    assert.notEqual(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
  });

  
  // ----- Value Checking -----

  var scopes = ['params', 'query', 'body'];
  for (var iScope in scopes) {
    scopeName = scopes[iScope];

    it('A-1 scope: ' + scopeName + ', strict: default -> 1 ' + scopeName + ' required(assertTrue), Got 1 valid ' + scopeName + ' input', function() {
      options = {};
      options[scopeName] = {
        param1: { assertTrue: function(v) { return v > 5; } }
      };
      fakeReq = {};
      fakeReq[scopeName] = {
        param1: 6
      };
      assert.notEqual(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
    });

    it('A-2 scope: ' + scopeName + ', strict: default -> 1 ' + scopeName + ' required(assertTrue), Got 1 invalid ' + scopeName + ' input', function() {
      options = {};
      options[scopeName] = {
        param1: { assertTrue: function(v) { return v > 5; } }
      };
      fakeReq = {};
      fakeReq[scopeName] = {
        param1: 5
      };
      assert.equal(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
    });



    it('B-1 scope: ' + scopeName + ', strict: default -> 1 ' + scopeName + ' required(assertFalse), Got 1 valid ' + scopeName + ' input', function() {
      options = {};
      options[scopeName] = {
        param1: { assertFalse: function(v) { return v > 5; } }
      };
      fakeReq = {};
      fakeReq[scopeName] = {
        param1: 5
      };
      assert.notEqual(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
    });

    it('B-2 scope: ' + scopeName + ', strict: default -> 1 ' + scopeName + ' required(assertFalse), Got 1 invalid ' + scopeName + ' input', function() {
      options = {};
      options[scopeName] = {
        param1: { assertFalse: function(v) { return v > 5; } }
      };
      fakeReq = {};
      fakeReq[scopeName] = {
        param1: 6
      };
      assert.equal(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
    });



    it('C-1 scope: ' + scopeName + ', strict: default -> 1 ' + scopeName + ' required(matchRegExp), Got 1 valid ' + scopeName + ' input', function() {
      options = {};
      options[scopeName] = {
        param1: { matchRegExp: [
          /^[012]{1}$/,
          /^[234]{1}$/
        ] }
      };
      fakeReq = {};
      fakeReq[scopeName] = {
        param1: 2
      };
      assert.notEqual(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
    });

    it('C-2 scope: ' + scopeName + ', strict: default -> 1 ' + scopeName + ' required(matchRegExp), Got 1 invalid ' + scopeName + ' input', function() {
      options = {};
      options[scopeName] = {
        param1: { matchRegExp: [
          /^[012]{1}$/,
          /^[234]{1}$/
        ] }
      };
      fakeReq = {};
      fakeReq[scopeName] = {
        param1: 1
      };
      assert.equal(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
    });


    it('D-1 scope: ' + scopeName + ', strict: default -> 1 ' + scopeName + ' required(isIn), Got 1 valid ' + scopeName + ' input', function() {
      options = {};
      options[scopeName] = {
        param1: { isIn: [1, 2, 3] }
      };
      fakeReq = {};
      fakeReq[scopeName] = {
        param1: 2
      };
      assert.notEqual(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
    });

    it('D-2 scope: ' + scopeName + ', strict: default -> 1 ' + scopeName + ' required(isIn), Got 1 invalid ' + scopeName + ' input', function() {
      options = {};
      options[scopeName] = {
        param1: { isIn: [1, 2, 3] }
      };
      fakeReq = {};
      fakeReq[scopeName] = {
        param1: 4
      };
      assert.equal(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
    });



    it('E-1 scope: ' + scopeName + ', strict: default -> 1 ' + scopeName + ' required(notIn), Got 1 valid ' + scopeName + ' input', function() {
      options = {};
      options[scopeName] = {
        param1: { notIn: [1, 2, 3] }
      };
      fakeReq = {};
      fakeReq[scopeName] = {
        param1: 4
      };
      assert.notEqual(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
    });

    it('E-2 scope: ' + scopeName + ', strict: default -> 1 ' + scopeName + ' required(notIn), Got 1 invalid ' + scopeName + ' input', function() {
      options = {};
      options[scopeName] = {
        param1: { notIn: [1, 2, 3] }
      };
      fakeReq = {};
      fakeReq[scopeName] = {
        param1: 2
      };
      assert.equal(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
    });



    it('F-1 scope: ' + scopeName + ', strict: default -> 1 ' + scopeName + ' required(isInteger:true), Got 1 integer ' + scopeName + ' input', function() {
      options = {};
      options[scopeName] = {
        param1: { isInteger: true }
      };
      fakeReq = {};
      fakeReq[scopeName] = {
        param1: 1
      };
      assert.notEqual(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
    });

    it('F-2 scope: ' + scopeName + ', strict: default -> 1 ' + scopeName + ' required(isInteger:true), Got 1 non-integer ' + scopeName + ' input', function() {
      options = {};
      options[scopeName] = {
        param1: { isInteger: true }
      };
      fakeReq = {};
      fakeReq[scopeName] = {
        param1: 'hello'
      };
      assert.equal(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
    });

    it('F-3 scope: ' + scopeName + ', strict: default -> 1 ' + scopeName + ' required(isInteger:false), Got 1 integer ' + scopeName + ' input', function() {
      options = {};
      options[scopeName] = {
        param1: { isInteger: false }
      };
      fakeReq = {};
      fakeReq[scopeName] = {
        param1: 1
      };
      assert.equal(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
    });

    it('F-4 scope: ' + scopeName + ', strict: default -> 1 ' + scopeName + ' required(isInteger:false), Got 1 non-integer ' + scopeName + ' input', function() {
      options = {};
      options[scopeName] = {
        param1: { isInteger: false }
      };
      fakeReq = {};
      fakeReq[scopeName] = {
        param1: 'hello'
      };
      assert.notEqual(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
    });

    it('F-5 scope: ' + scopeName + ', strict: default -> 1 ' + scopeName + ' required(isEmail:true), Got 1 email ' + scopeName + ' input', function() {
      options = {};
      options[scopeName] = {
        param1: { isEmail: true }
      };
      fakeReq = {};
      fakeReq[scopeName] = {
        param1: 'abc@123.com'
      };
      assert.notEqual(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
    });

    it('F-6 scope: ' + scopeName + ', strict: default -> 1 ' + scopeName + ' required(isEmail:true), Got 1 non-email ' + scopeName + ' input', function() {
      options = {};
      options[scopeName] = {
        param1: { isEmail: true }
      };
      fakeReq = {};
      fakeReq[scopeName] = {
        param1: 'abc.123.com'
      };
      assert.equal(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
    });

    it('F-7 scope: ' + scopeName + ', strict: default -> 1 ' + scopeName + ' required(isEmail:false), Got 1 email ' + scopeName + ' input', function() {
      options = {};
      options[scopeName] = {
        param1: { isEmail: false }
      };
      fakeReq = {};
      fakeReq[scopeName] = {
        param1: 'abc@123.com'
      };
      assert.equal(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
    });

    it('F-8 scope: ' + scopeName + ', strict: default -> 1 ' + scopeName + ' required(isEmail:false), Got 1 non-email ' + scopeName + ' input', function() {
      options = {};
      options[scopeName] = {
        param1: { isEmail: false }
      };
      fakeReq = {};
      fakeReq[scopeName] = {
        param1: 'abc.123.com'
      };
      assert.notEqual(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
    });



    it('G-1 scope: ' + scopeName + ', strict: default -> 1 ' + scopeName + ' required(equal), Got 1 valid ' + scopeName + ' input', function() {
      options = {};
      options[scopeName] = {
        param1: { equal: 5 }
      };
      fakeReq = {};
      fakeReq[scopeName] = {
        param1: 5
      };
      assert.notEqual(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
    });

    it('G-2 scope: ' + scopeName + ', strict: default -> 1 ' + scopeName + ' required(equal), Got 1 invalid ' + scopeName + ' input', function() {
      options = {};
      options[scopeName] = {
        param1: { equal: 5 }
      };
      fakeReq = {};
      fakeReq[scopeName] = {
        param1: 6
      };
      assert.equal(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
    });



    it('H-1 scope: ' + scopeName + ', strict: default -> 1 ' + scopeName + ' required(greaterThan), Got 1 valid ' + scopeName + ' input', function() {
      options = {};
      options[scopeName] = {
        param1: { greaterThan: 5 }
      };
      fakeReq = {};
      fakeReq[scopeName] = {
        param1: 6
      };
      assert.notEqual(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
    });

    it('H-2 scope: ' + scopeName + ', strict: default -> 1 ' + scopeName + ' required(greaterThan), Got 1 invalid ' + scopeName + ' input', function() {
      options = {};
      options[scopeName] = {
        param1: { greaterThan: 5 }
      };
      fakeReq = {};
      fakeReq[scopeName] = {
        param1: 5
      };
      assert.equal(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
    });

    it('H-3 scope: ' + scopeName + ', strict: default -> 1 ' + scopeName + ' required(greaterEqual), Got 1 valid ' + scopeName + ' input', function() {
      options = {};
      options[scopeName] = {
        param1: { greaterEqual: 5 }
      };
      fakeReq = {};
      fakeReq[scopeName] = {
        param1: 5
      };
      assert.notEqual(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
    });

    it('H-4 scope: ' + scopeName + ', strict: default -> 1 ' + scopeName + ' required(greaterEqual), Got 1 invalid ' + scopeName + ' input', function() {
      options = {};
      options[scopeName] = {
        param1: { greaterEqual: 5 }
      };
      fakeReq = {};
      fakeReq[scopeName] = {
        param1: 4
      };
      assert.equal(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
    });



    it('I-1 scope: ' + scopeName + ', strict: default -> 1 ' + scopeName + ' required(lessThan), Got 1 valid ' + scopeName + ' input', function() {
      options = {};
      options[scopeName] = {
        param1: { lessThan: 5 }
      };
      fakeReq = {};
      fakeReq[scopeName] = {
        param1: 4
      };
      assert.notEqual(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
    });

    it('I-2 scope: ' + scopeName + ', strict: default -> 1 ' + scopeName + ' required(lessThan), Got 1 invalid ' + scopeName + ' input', function() {
      options = {};
      options[scopeName] = {
        param1: { lessThan: 5 }
      };
      fakeReq = {};
      fakeReq[scopeName] = {
        param1: 5
      };
      assert.equal(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
    });

    it('I-3 scope: ' + scopeName + ', strict: default -> 1 ' + scopeName + ' required(lessEqual), Got 1 valid ' + scopeName + ' input', function() {
      options = {};
      options[scopeName] = {
        param1: { lessEqual: 5 }
      };
      fakeReq = {};
      fakeReq[scopeName] = {
        param1: 5
      };
      assert.notEqual(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
    });

    it('I-4 scope: ' + scopeName + ', strict: default -> 1 ' + scopeName + ' required(lessEqual), Got 1 invalid ' + scopeName + ' input', function() {
      options = {};
      options[scopeName] = {
        param1: { lessEqual: 5 }
      };
      fakeReq = {};
      fakeReq[scopeName] = {
        param1: 6
      };
      assert.equal(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
    });



    it('J-1 scope: ' + scopeName + ', strict: default -> 1 ' + scopeName + ' required(allowEmpty:true), Got 1 empty ' + scopeName + ' input', function() {
      options = {};
      options[scopeName] = {
        param1: { allowEmpty: true}
      };
      fakeReq = {};
      fakeReq[scopeName] = {
        param1: ""
      };
      assert.notEqual(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
    });

    it('J-2 scope: ' + scopeName + ', strict: default -> 1 ' + scopeName + ' required(allowEmpty:true), Got 1 non-empty ' + scopeName + ' input', function() {
      options = {};
      options[scopeName] = {
        param1: { allowEmpty: true}
      };
      fakeReq = {};
      fakeReq[scopeName] = {
        param1: "hello"
      };
      assert.notEqual(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
    });

    it('J-3 scope: ' + scopeName + ', strict: default -> 1 ' + scopeName + ' required(allowEmpty:false), Got 1 empty ' + scopeName + ' input', function() {
      options = {};
      options[scopeName] = {
        param1: { allowEmpty: false}
      };
      fakeReq = {};
      fakeReq[scopeName] = {
        param1: ""
      };
      assert.equal(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
    });

    it('J-4 scope: ' + scopeName + ', strict: default -> 1 ' + scopeName + ' required(allowEmpty:false), Got 1 non-empty ' + scopeName + ' input', function() {
      options = {};
      options[scopeName] = {
        param1: { allowEmpty: false}
      };
      fakeReq = {};
      fakeReq[scopeName] = {
        param1: "hello"
      };
      assert.notEqual(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
    });



    it('K-1 scope: ' + scopeName + ', strict: default -> 1 ' + scopeName + ' required(maxLength), Got 1 valid ' + scopeName + ' input', function() {
      options = {};
      options[scopeName] = {
        param1: { maxLength: 5}
      };
      fakeReq = {};
      fakeReq[scopeName] = {
        param1: "hello"
      };
      assert.notEqual(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
    });

    it('K-2 scope: ' + scopeName + ', strict: default -> 1 ' + scopeName + ' required(maxLength), Got 1 invalid ' + scopeName + ' input', function() {
      options = {};
      options[scopeName] = {
        param1: { maxLength: 5}
      };
      fakeReq = {};
      fakeReq[scopeName] = {
        param1: "hello "
      };
      assert.equal(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
    });

    it('K-3 scope: ' + scopeName + ', strict: default -> 1 ' + scopeName + ' required(minLength), Got 1 valid ' + scopeName + ' input', function() {
      options = {};
      options[scopeName] = {
        param1: { minLength: 5}
      };
      fakeReq = {};
      fakeReq[scopeName] = {
        param1: "hello"
      };
      assert.notEqual(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
    });

    it('K-4 scope: ' + scopeName + ', strict: default -> 1 ' + scopeName + ' required(minLength), Got 1 invalid ' + scopeName + ' input', function() {
      options = {};
      options[scopeName] = {
        param1: { minLength: 5}
      };
      fakeReq = {};
      fakeReq[scopeName] = {
        param1: "Oops"
      };
      assert.equal(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
    });

    /****************************/
    /* Play with other packages */
    /****************************/
    var validator = require('validator');
    it('CO-1 scope: ' + scopeName + ', strict: default -> 1 ' + scopeName + ' required(play with `validator`), Got 1 valid ' + scopeName + ' input', function() {
      options = {};
      options[scopeName] = {
        param1: { assertTrue: validator.isEmail}
      };
      fakeReq = {};
      fakeReq[scopeName] = {
        param1: "foo@bar.com"
      };
      assert.notEqual(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
    });

    it('CO-2 scope: ' + scopeName + ', strict: default -> 1 ' + scopeName + ' required(play with `validator`), Got 1 invalid ' + scopeName + ' input', function() {
      options = {};
      options[scopeName] = {
        param1: { assertTrue: validator.isEmail}
      };
      fakeReq = {};
      fakeReq[scopeName] = {
        param1: "foo@.com"
      };
      assert.equal(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
    });

    it('CO-3 scope: ' + scopeName + ', strict: default -> 1 ' + scopeName + ' required(play with `validator`), Got 1 valid ' + scopeName + ' input', function() {
      options = {};
      options[scopeName] = {
        param1: { assertTrue: validator.isJSON}
      };
      fakeReq = {};
      fakeReq[scopeName] = {
        param1: '{"foo":1, "bar":2}'
      };
      assert.notEqual(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
    });

    it('CO-4 scope: ' + scopeName + ', strict: default -> 1 ' + scopeName + ' required(play with `validator`), Got 1 invalid ' + scopeName + ' input', function() {
      options = {};
      options[scopeName] = {
        param1: { assertTrue: validator.isJSON}
      };
      fakeReq = {};
      fakeReq[scopeName] = {
        param1: '{"foo":1 "bar":2}'
      };
      assert.equal(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
    });
  }

  // ----- No Param scope -----
  it('X scope: params, strict: default -> 1 params required, NO params input', function() {
    options = { params: {
      param1: { matchRegExp: /^[1]{2}$/ },
    } };
    fakeReq = { query: {
      param1: 11
    } };
    assert.equal(false, reqChecker(options)(fakeReq, fakeRes, fakeNext));
  });
});
