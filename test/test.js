var assert = require('assert');
var objectChecker = require('../object-checker');

describe('main', function() {
  /* Complicated objects */
  var complicatedValidObj = {
    users: [
      {
        name:"a@a.com",
        additional:{
          age: 20,
          height: 180,
          score: [80, 90, 100]
        }
      },
      {
        name:"123@b.com"
      },
      {
        name:"123@a.com",
        additional: {
          age: 100,
          height:200,
          score: [60, 70, 80, 90]
        }
      }
    ]
  };

  var complicatedInValidObj = {
    users: [
      {
        name:"a@a.com",
        additional:{
          age: 20,
          height: 180,
          score: [80, 90, 100]
        }
      },
      {
        name:"123@b.com"
      },
      {
        name:"123@a.com",
        additional: {
          age: 500,
          height:300,
          score: [30]
        }
      }
    ]
  };

  var complicatedOptions = {
    users: {
      $maxLength: 5,
      $: {
        name: {
          $isEmail: true,
          $minLength: 6,
          $maxLength: 10
        },
        additional: {
          $isOptional: true,
          age: {
            $minValue: 20,
            $maxValue: 100
          },
          height: {
            $minValue: 100,
            $maxValue: 200
          },
          score: {
            $minLength: 3,
            $: {
              $minValue: 60,
              $maxValue: 100
            }
          }
        }
      }
    }
  };

  it('Complicated Object - valid object', function() {
    assert.equal(true, objectChecker.isValidObject(complicatedValidObj, complicatedOptions));
  });

  it('Complicated Object - invalid object', function() {
    assert.equal(false,  objectChecker.isValidObject(complicatedInValidObj, complicatedOptions));
  });

  /* Simple objects */
  var i;
  var obj;
  var opt = {
    username: {
      $minLength: 6,
      $maxLength: 10
    },
    age: {
      $minValue:1,
      $maxValue:100
    },
    email: {
      $isEmail: true,
      $isOptional: true
    },
    score1: {
      $isInteger: true
    },
    score2: {
      $isPositiveZeroInteger: true
    },
    score3: {
      $isPositiveInteger: true
    },
    score4: {
      $isNegativeZeroInteger: true
    },
    score5: {
      $isNegativeInteger: true
    },
    fix1: {
      $isValue: 12345
    },
    fix2: {
      $isLength: 5
    },
    range1: {
      $in:[1,2,3]
    },
    range2: {
      $notIn:[1,2,3]
    }
  };

  /* Valid objects */
  i = 1;

  it('Test Checker - valid object ' + i++, function() {
    var obj = {
      username: 'abcdef',
      age: 1,
      email: 'a@e.com',
      score1: 1,
      score2: 0,
      score3: 1,
      score4: 0,
      score5: -1,
      fix1: 12345,
      fix2: '11111',
      range1: 1,
      range2: 0
    };
    assert.equal(true,  objectChecker.isValidObject(obj, opt));
  });

  it('Test Checker - valid object ' + i++, function() {
    var obj = {
      username: 'abcdef1234',
      age: 100,
      score1: 100,
      score2: 1,
      score3: 1,
      score4: -1,
      score5: -1,
      fix1: 12345,
      fix2: '12345',
      range1: 2,
      range2: 4
    };
    assert.equal(true,  objectChecker.isValidObject(obj, opt));
  });

  /* Invalid objects */
  i = 1;

  it('Test Checker - invalid object ' + i++, function() {
    var opt = {
      foo: {
        $minLength: 3
      }
    };
    var obj = {
      foo: 'ab'
    };
    assert.equal(false,  objectChecker.isValidObject(obj, opt));
  });

  it('Test Checker - invalid object ' + i++, function() {
    var opt = {
      foo: {
        $maxLength: 3
      }
    };
    var obj = {
      foo: 'abcd'
    };
    assert.equal(false,  objectChecker.isValidObject(obj, opt));
  });

  it('Test Checker - invalid object ' + i++, function() {
    var opt = {
      foo: {
        $minValue: 3
      }
    };
    var obj = {
      foo: 2
    };
    assert.equal(false,  objectChecker.isValidObject(obj, opt));
  });

  it('Test Checker - invalid object ' + i++, function() {
    var opt = {
      foo: {
        $maxValue: 3
      }
    };
    var obj = {
      foo: 4
    };
    assert.equal(false,  objectChecker.isValidObject(obj, opt));
  });

  it('Test Checker - invalid object ' + i++, function() {
    var opt = {
      foo: {
        $isEmail: true
      }
    };
    var obj = {
      foo: 'a@@.com'
    };
    assert.equal(false,  objectChecker.isValidObject(obj, opt));
  });

  it('Test Checker - invalid object ' + i++, function() {
    var opt = {
      foo: {
        $in: [1, 2]
      }
    };
    var obj = {
      foo: 0
    };
    assert.equal(false,  objectChecker.isValidObject(obj, opt));
  });

  it('Test Checker - invalid object ' + i++, function() {
    var opt = {
      foo: {
        $notIn: [1, 2]
      }
    };
    var obj = {
      foo: 1
    };
    assert.equal(false,  objectChecker.isValidObject(obj, opt));
  });

  it('Test Checker - invalid object ' + i++, function() {
    var opt = {
      foo: {
        $isValue: 9
      }
    };
    var obj = {
      foo: 8
    };
    assert.equal(false,  objectChecker.isValidObject(obj, opt));
  });

  it('Test Checker - invalid object ' + i++, function() {
    var opt = {
      foo: {
        $isInteger: true
      }
    };
    var obj = {
      foo: 'a'
    };
    assert.equal(false,  objectChecker.isValidObject(obj, opt));
  });

  it('Test Checker - invalid object ' + i++, function() {
    vopt = {
      foo: {
        $isPositiveZeroInteger: true
      }
    };
    var obj = {
      foo: -1
    };
    assert.equal(false,  objectChecker.isValidObject(obj, opt));
  });

  it('Test Checker - invalid object ' + i++, function() {
    var opt = {
      foo: {
        $isPositiveInteger: true
      }
    };
    var obj = {
      foo: 0
    };
    assert.equal(false,  objectChecker.isValidObject(obj, opt));
  });

  it('Test Checker - invalid object ' + i++, function() {
    var opt = {
      foo: {
        $isNegativeZeroInteger: true
      }
    };
    var obj = {
      foo: 1
    };
    assert.equal(false,  objectChecker.isValidObject(obj, opt));
  });

  it('Test Checker - invalid object ' + i++, function() {
    var opt = {
      foo: {
        $isNegativeInteger: true
      }
    };
    var obj = {
      foo: 0
    };
    assert.equal(false,  objectChecker.isValidObject(obj, opt));
  });

  it('Test Checker - invalid object ' + i++, function() {
    var opt = {
      foo: {
        $notEmptyString: true
      }
    };
    var obj = {
      foo: ''
    };
    assert.equal(false,  objectChecker.isValidObject(obj, opt));
  });

  it('Test Checker - invalid object ' + i++, function() {
    var opt = {
      foo: {
        $assertTrue: function(v) {return (v == 'assertTrue')}
      }
    };
    var obj = {
      foo: 'xxx'
    };
    assert.equal(false,  objectChecker.isValidObject(obj, opt));
  });

  it('Test Checker - invalid object ' + i++, function() {
    var opt = {
      foo: {
        $assertFalse: function(v) {return (v == 'xxx')}
      }
    };
    var obj = {
      foo: 'xxx'
    };
    assert.equal(false,  objectChecker.isValidObject(obj, opt));
  });
});
