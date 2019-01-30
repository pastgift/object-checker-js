var assert        = require('assert');
var objectChecker = require('../object-checker');

describe('main', function() {
  /* Config */
  var options = {
    messageTemplate: {
      invalid   : "Value of Field `{{fieldName}}` is not valid. Got `{{fieldValue}}`, but require {{checkerName}} = {{checkerOption}}",
      missing   : "Missing {{fieldName}}",
      unexpected: "Not support {{fieldName}}"
    }
  };

  var checker = objectChecker.createObjectChecker(options);

  /* Complicated objects */
  var complicatedValidObj = {
    users: [
      {
        id  : 1,
        name:"a@a.com",
        additional: {
          age   : 20,
          height: 180,
          score : [80, 90, 100]
        }
      },
      {
        id  : 2,
        name:"123@b.com"
      },
      {
        id  : 3,
        name:"123@a.com",
        additional: {
          age   : 100,
          height: 200,
          score : [60, 70, 80, 90]
        }
      }
    ]
  };

  var complicatedInvalidObj = {
    users: [
      {
        id  : 'a1',
        name:"a@a.com",
        additional: {
          age   : 20,
          height: 180,
          score : [80, 90, 100]
        }
      },
      {
        id  : 2,
        name:"123@b.com"
      },
      {
        id  : 3,
        name:"123@a.com",
        additional: {
          age   : 500,
          height: 300,
          score : [30]
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
          $isEmail  : true,
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
            $type     : 'array',
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
    assert.equal(false,  checker.isValid(complicatedInvalidObj, complicatedOptions));
  });

  /* Simple objects */
  var obj;
  var opt = {
    username: {
      $minLength: 6,
      $maxLength: 10
    },
    age: {
      $minValue: 1,
      $maxValue: 100
    },
    email: {
      $isEmail   : true,
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
      $in: [1,2,3]
    },
    range2: {
      $notIn: [1,2,3]
    }
  };

  /* Valid objects */
  it('valid object ', function() {
    var obj = {
      username: 'abcdef',
      age     : 1,
      email   : 'a@e.com',
      score1  : 1,
      score2  : 0,
      score3  : 1,
      score4  : 0,
      score5  : -1,
      fix1    : 12345,
      fix2    : '11111',
      range1  : 1,
      range2  : 0
    };
    assert.equal(true,  checker.isValid(obj, opt));
  });

  it('valid object ', function() {
    var obj = {
      username: 'abcdef1234',
      age     : 100,
      score1  : 100,
      score2  : 1,
      score3  : 1,
      score4  : -1,
      score5  : -1,
      fix1    : 12345,
      fix2    : '12345',
      range1  : 2,
      range2  : 4
    };
    assert.equal(true,  checker.isValid(obj, opt));
  });

  /* Invalid objects */
  it('invalid object ', function() {
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

  it('invalid object ', function() {
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

  it('invalid object ', function() {
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

  it('invalid object ', function() {
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

  it('invalid object ', function() {
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

  it('invalid object ', function() {
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

  it('invalid object ', function() {
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

  it('invalid object ', function() {
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

  it('invalid object ', function() {
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

  it('invalid object ', function() {
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

  it('invalid object ', function() {
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

  it('invalid object ', function() {
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

  it('invalid object ', function() {
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

  it('invalid object ', function() {
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

  it('invalid object ', function() {
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

  it('invalid object ', function() {
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

  it('invalid object ', function() {
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

  it('invalid object ', function() {
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

  it('invalid object ', function() {
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

  it('null field ', function() {
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

  it('null field ', function() {
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

  it('null field ', function() {
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

  it('with validator ', function() {
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

  it('with validator ', function() {
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

  it('Additional Test - Additional member in Array ', function() {
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

  it('Skip option ', function() {
    var opt = {
      foo: {
        $skip: true
      }
    };
    var obj = {
      foo: {
        bar: [1, 2, 3, 4, 5]
      }
    };
    assert.equal(true,  checker.isValid(obj, opt));
  });

  it('RegExp in string ', function() {
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

  it('RegExp in string ', function() {
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

  it('Type string ', function() {
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

  it('Type string ', function() {
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

  it('Type number ', function() {
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

  it('Type number ', function() {
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

  it('Type int ', function() {
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

  it('Type int ', function() {
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

  it('Type array ', function() {
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

  it('Type array ', function() {
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

  it('defaultRequired = false ', function() {
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

  it('defaultRequired = false ', function() {
    var checker = new objectChecker.ObjectChecker({
      defaultRequired: false,
    });

    var opt = {
      foo: {
        $isRequired: true,
        $minValue  : 0,
      }
    };
    var obj = {
      foo: 123
    };
    assert.equal(true,  checker.isValid(obj, opt));
  });

  it('defaultRequired = false ', function() {
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

  it('defaultRequired = false ', function() {
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

  it('defaultRequired = false ', function() {
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

  it('Type any ', function() {
    var checker = new objectChecker.ObjectChecker({
      defaultRequired: false,
    });

    var opt = {
      foo: {
        $type      : 'any',
        $isRequired: true
      }
    };
    var obj = {
      foo: -1
    };
    assert.equal(true,  checker.isValid(obj, opt));
  });

  it('Type any, Not existed ', function() {
    var checker = new objectChecker.ObjectChecker({
      defaultRequired: false,
    });

    var opt = {
      foo: {
        $type      : 'any',
        $isRequired: true
      }
    };
    var obj = {
    };
    assert.equal(false,  checker.isValid(obj, opt));
  });

  it('$commaArrayIn ', function() {
    var opt = {
      foo: {
        $type        : 'string',
        $commaArrayIn: ['a', 'b', 'c']
      }
    };
    var obj = {
      foo: 'a,b'
    };
    assert.equal(true,  checker.isValid(obj, opt));
  });

  it('$commaArrayIn ', function() {
    var opt = {
      foo: {
        $type        : 'string',
        $commaArrayIn: ['a', 'b', 'c']
      }
    };
    var obj = {
      foo: 'a,x'
    };
    assert.equal(false,  checker.isValid(obj, opt));
  });

  it('Additional ', function() {
    var checker = objectChecker.createObjectChecker({
      defaultRequired: false,
      customDirectives: {
        '$desc'   : null,
        '$name'   : null,
        '$example': null,
      },
    });

    var opt = {
      "data": {
          "$isRequired": true,
          "namespace": {
              "$desc": "命名空间",
              "$isRequired": true,
              "$type": "string",
              "$notEmptyString": true,
              "$example": "default",
              "$notIn": [
                  "ldap"
              ]
          },
          "name": {
              "$desc": "名称（操作人姓名）",
              "$isRequired": true,
              "$type": "string",
              "$notEmptyString": true,
              "$example": "张三"
          },
          "password": {
              "$desc": "密码",
              "$allowNull": true,
              "$type": "string",
              "$notEmptyString": true,
              "$example": "zhang3password"
          },
          "email": {
              "$desc": "邮箱（可用于登录）",
              "$allowNull": true,
              "$type": "string",
              "$isEmail": true,
              "$example": "zhang3@jiagouyun.com"
          },
          "mobile": {
              "$desc": "手机号（可用于登录）",
              "$allowNull": true,
              "$type": "string",
              "$example": "18000000000"
          },
          "username": {
              "$desc": "用户名（可用于登录）",
              "$allowNull": true,
              "$type": "string",
              "$example": "zhang3"
          },
          "status": {
              "$desc": "状态（预留字段，暂时无用）",
              "$type": "enum",
              "$in": [
                  "normal"
              ]
          }
      },
      "teams": {
          "$desc": "创建同时添加至团队",
          "$": {
              "id": {
                  "$desc": "团队ID",
                  "$isRequired": true,
                  "$type": "string"
              },
              "isDefault": {
                  "$desc": "是否为默认团队",
                  "$type": "boolean",
                  "$example": true
              },
              "isAdmin": {
                  "$desc": "是否为管理员",
                  "$type": "boolean",
                  "$example": false
              }
          }
      }
    };
    var body = {
      "data": {
        "namespace": "default",
        "name": "666",
        "password": "666",
        "email": "666@jiagouyun.com"
      },
      "teams": [
        {
          "id": "team-vLc7r2EMx7TRxCkVn13Fez",
          "isDefault": false,
          "isAdmin": false
        }
      ]
    };
    var ret = checker.check(body, opt);
    assert.equal(true, ret.isValid);
  });

  it('Additional 2', function() {
    var checker = objectChecker.createObjectChecker({
      defaultRequired: false,
      customDirectives: {
        '$desc'   : null,
        '$name'   : null,
        '$example': null,
      },
    });

    var opt = {
        "task": {
            "$isRequired": true,
            "kwargs": {
                "$desc": "字典参数（**kwargs）",
                "$isRequired": true,
                "$type": "json",
                "issueSourceIds": {
                    "$desc": "情报源ID列表",
                    "$isRequired": true,
                    "$": {
                        "$desc": "情报源ID",
                        "$type": "string",
                        "$example": []
                    }
                }
            }
        }
    };
    var body = {
      "task": {
        "kwargs": {
          "issueSourceIds": []
        }
      }
    };
    var ret = checker.check(body, opt);
    assert.equal(true, ret.isValid);
  });

});