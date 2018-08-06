var assert        = require('assert');
var objectChecker = require('../object-checker');

describe('main', function() {
  /* Config */
  objectChecker.messageTemplate = {
    invalid   : "Value of Field `{{fieldName}}` is not valid. Got `{{fieldValue}}`, but require {{checkerName}} = {{checkerOption}}",
    missing   : "Missing {{fieldName}}",
    unexpected: "Not support {{fieldName}}"
  };

  var checker = objectChecker.createObjectChecker();

  /* Complicated objects */
  var complicatedValidObj = {
    users: [
      {
        id: 1,
        name:"a@a.com",
        additional:{
          age: 20,
          height: 180,
          score: [80, 90, 100]
        }
      },
      {
        id: 2,
        name:"123@b.com"
      },
      {
        id: 3,
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
        id: 'a1',
        name:"a@a.com",
        additional:{
          age: 20,
          height: 180,
          score: [80, 90, 100]
        }
      },
      {
        id: 2,
        name:"123@b.com"
      },
      {
        id: 3,
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
        id: {
          $matchRegExp: '^\\d$',
        },
        name: {
          $isEmail: true,
          $minLength: 6,
          $maxLength: 10
        },
        additional: {
          $isOptional: true,
          $type: 'json',
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
            $type: 'array',
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
    assert.equal(true, checker.isValid(complicatedValidObj, complicatedOptions));
  });

  it('Complicated Object - invalid object', function() {
    assert.equal(false,  checker.isValid(complicatedInValidObj, complicatedOptions));
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
    assert.equal(true,  checker.isValid(obj, opt));
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
    assert.equal(true,  checker.isValid(obj, opt));
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
    assert.equal(false,  checker.isValid(obj, opt));
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
    assert.equal(false,  checker.isValid(obj, opt));
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
    assert.equal(false,  checker.isValid(obj, opt));
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
    assert.equal(false,  checker.isValid(obj, opt));
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
    assert.equal(false,  checker.isValid(obj, opt));
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
    assert.equal(false,  checker.isValid(obj, opt));
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
    assert.equal(false,  checker.isValid(obj, opt));
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
    assert.equal(false,  checker.isValid(obj, opt));
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
    assert.equal(false,  checker.isValid(obj, opt));
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
    assert.equal(false,  checker.isValid(obj, opt));
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
    assert.equal(false,  checker.isValid(obj, opt));
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
    assert.equal(false,  checker.isValid(obj, opt));
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
    assert.equal(false,  checker.isValid(obj, opt));
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
    assert.equal(false,  checker.isValid(obj, opt));
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
    assert.equal(false,  checker.isValid(obj, opt));
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
    assert.equal(false,  checker.isValid(obj, opt));
  });

  it('Test Checker - invalid object ' + i++, function() {
    var opt = {
      foo: {
        $matchRegExp: /^[12]$/
      }
    };
    var obj = {
      foo: '3'
    };
    assert.equal(false,  checker.isValid(obj, opt));
  });

  it('Test Checker - invalid object ' + i++, function() {
    var opt = {
      foo: {
        $notMatchRegExp: /^[12]$/
      }
    };
    var obj = {
      foo: '1'
    };
    assert.equal(false,  checker.isValid(obj, opt));
  });

  it('Test Checker - invalid object ' + i++, function() {
    var opt = {
      foo: {
        $isInteger: true
      }
    };
    var obj = {
      bar: 2
    };
    assert.equal(false,  checker.isValid(obj, opt));
  });

  it('Test Checker - null field ' + i++, function() {
    var opt = {
      foo: {
        $allowNull: true,
        $isInteger: true
      }
    };
    var obj = {
      foo: 2
    };
    assert.equal(true,  checker.isValid(obj, opt));
  });

  it('Test Checker - null field ' + i++, function() {
    var opt = {
      foo: {
        $allowNull: true,
        $isInteger: true
      }
    };
    var obj = {
      foo: null
    };
    assert.equal(true,  checker.isValid(obj, opt));
  });

  it('Test Checker - null field ' + i++, function() {
    var opt = {
      foo: {
        $allowNull: true,
        $isInteger: true
      }
    };
    var obj = {
      foo: 'abc'
    };
    assert.equal(false,  checker.isValid(obj, opt));
  });

  it('Test Checker - with validator ' + i++, function() {
    var opt = {
      foo: {
        $validator$isURL: {
          assert: true,
          options: {protocols: ['http','https'], require_protocol: true}
        }
      }
    };
    var obj = {
      foo: 'www.google.com'
    };
    assert.equal(false,  checker.isValid(obj, opt));
  });

  it('Test Checker - with validator ' + i++, function() {
    var opt = {
      foo: {
        $validator$isURL: {
          assert: true,
          options: {protocols: ['http','https']}
        }
      }
    };
    var obj = {
      foo: 'http://www.google.com'
    };
    assert.equal(true,  checker.isValid(obj, opt));
  });

  it('Additional Test - Additional member in Array ' + i++, function() {
    var opt = {
      foo: {
        $: {
          $isPositiveInteger: true
        }
      }
    };
    var obj = {
      foo: [1,2,3,4,5]
    };
    obj.foo.xxx = 1;
    assert.equal(true,  checker.isValid(obj, opt));
  });

  it('Test Checker - Skip option ' + i++, function() {
    var opt = {
      foo: {
        $skip: true
      }
    };
    var obj = {
      foo: {
        bar: [1,2,3,4,5]
      }
    };
    assert.equal(true,  checker.isValid(obj, opt));
  });

  it('Test Checker - RegExp in string ' + i++, function() {
    var opt = {
      foo: {
        $matchRegExp: 'A[A-Z][0-9]'
      }
    };
    var obj = {
      foo: 'AB3'
    };
    assert.equal(true,  checker.isValid(obj, opt));
  });

  it('Test Checker - RegExp in string ' + i++, function() {
    var opt = {
      foo: {
        $matchRegExp: 'A[A-Z][0-9]'
      }
    };
    var obj = {
      foo: '123'
    };
    assert.equal(false,  checker.isValid(obj, opt));
  });

  it('Test Checker - Type string ' + i++, function() {
    var opt = {
      foo: {
        $type: 'string'
      }
    };
    var obj = {
      foo: 123
    };
    assert.equal(false,  checker.isValid(obj, opt));
  });

  it('Test Checker - Type string ' + i++, function() {
    var opt = {
      foo: {
        $type: 'string'
      }
    };
    var obj = {
      foo: '123'
    };
    assert.equal(true,  checker.isValid(obj, opt));
  });

  it('Test Checker - Type number ' + i++, function() {
    var opt = {
      foo: {
        $type: 'number'
      }
    };
    var obj = {
      foo: 123
    };
    assert.equal(true,  checker.isValid(obj, opt));
  });

  it('Test Checker - Type number ' + i++, function() {
    var opt = {
      foo: {
        $type: 'number'
      }
    };
    var obj = {
      foo: '123'
    };
    assert.equal(false,  checker.isValid(obj, opt));
  });

  it('Test Checker - Type int ' + i++, function() {
    var opt = {
      foo: {
        $type: 'int'
      }
    };
    var obj = {
      foo: 123
    };
    assert.equal(true,  checker.isValid(obj, opt));
  });

  it('Test Checker - Type int ' + i++, function() {
    var opt = {
      foo: {
        $type: 'int'
      }
    };
    var obj = {
      foo: '123'
    };
    assert.equal(false,  checker.isValid(obj, opt));
  });

  it('Test Checker - Type array ' + i++, function() {
    var opt = {
      foo: {
        $type: 'array',
        $: {
          $type: 'int',
        }
      }
    };
    var obj = {
      foo: [1, 2, 3]
    };
    assert.equal(true,  checker.isValid(obj, opt));
  });

  it('Test Checker - Type array ' + i++, function() {
    var opt = {
      foo: {
        $type: 'array',
        $: {
          $type: 'int',
        }
      }
    };
    var obj = {
      foo: '123'
    };
    assert.equal(false,  checker.isValid(obj, opt));
  });

  it('Test Checker - defaultRequired = false ' + i++, function() {
    var checker = new objectChecker.ObjectChecker({
      defaultRequired: false,
    });

    var opt = {
      foo: {
        $required: true,
        $minValue: 0,
      }
    };
    var obj = {
      foo: 123
    };
    assert.equal(true,  checker.isValid(obj, opt));
  });

  it('Test Checker - defaultRequired = false ' + i++, function() {
    var checker = new objectChecker.ObjectChecker({
      defaultRequired: false,
    });

    var opt = {
      foo: {
        $isRequired: true,
        $minValue: 0,
      }
    };
    var obj = {
      foo: 123
    };
    assert.equal(true,  checker.isValid(obj, opt));
  });

  it('Test Checker - defaultRequired = false ' + i++, function() {
    var checker = new objectChecker.ObjectChecker({
      defaultRequired: false,
    });

    var opt = {
      foo: {
        $minValue: 0,
      }
    };
    var obj = {
    };
    assert.equal(true,  checker.isValid(obj, opt));
  });

  it('Test Checker - defaultRequired = false ' + i++, function() {
    var checker = new objectChecker.ObjectChecker({
      defaultRequired: false,
    });

    var opt = {
      foo: {
        $minValue: 0,
      }
    };
    var obj = {
      foo: 0
    };
    assert.equal(true,  checker.isValid(obj, opt));
  });

  it('Test Checker - defaultRequired = false ' + i++, function() {
    var checker = new objectChecker.ObjectChecker({
      defaultRequired: false,
    });

    var opt = {
      foo: {
        $minValue: 0,
      }
    };
    var obj = {
      foo: -1
    };
    assert.equal(false,  checker.isValid(obj, opt));
  });

  it('Test Checker - Type any ' + i++, function() {
    var checker = new objectChecker.ObjectChecker({
      defaultRequired: false,
    });

    var opt = {
      foo: {
        $type: 'any',
        $isRequired: true
      }
    };
    var obj = {
      foo: -1
    };
    assert.equal(true,  checker.isValid(obj, opt));
  });

  it('Test Checker - Type any, Not existed' + i++, function() {
    var checker = new objectChecker.ObjectChecker({
      defaultRequired: false,
    });

    var opt = {
      foo: {
        $type: 'any',
        $isRequired: true
      }
    };
    var obj = {
    };
    assert.equal(false,  checker.isValid(obj, opt));
  });
});
