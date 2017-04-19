# object-checker

[![NPM version][npm-image]][npm-url] [![Downloads][downloads-image]][npm-url]

A tool for checking object. And also provide a middleware for express.

- No validation codes.
- Easy to combine with other validation package.
- Can make `router.js` in Express as an API document.

### Quick Example (Javascript):
```javascript
var objectChecker = require('object-checker');

var obj = {
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

var opt = {
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

if (!objectChecker.isValidObject(obj, opt)) {
  console.log('Error');
}
```

### Quick Example (coffee):
```coffee
objectChecker = require 'object-checker'

obj =
  users: [
    {
      name:"a@a.com"
      additional:
        age: 20
        height: 180
        score: [80, 90, 100]
    },
    {
      name:"123@b.com"
    },
    {
      name:"123@a.com"
      additional:
        age: 500
        height:300
        score: [30]
    }
  ]

options =
  users:
    $maxLength: 5
    $:
      name:
        $isEmail: true
        $minLength: 6
        $maxLength: 10
      additional:
        $isOptional: true
        age:
          $minValue: 20
          $maxValue: 100
        height:
          $minValue: 100
          $maxValue: 200
        score:
          $minLength: 3
          $:
            $minValue: 60
            $maxValue: 100

if not objectChecker.isValidObject obj, opt
  console.log 'Error'
```

### Use as an Express Middleware (javascript)
```javascript
// router.js

var express             = require('express');
var bodyCheckMiddleware = require('object-checker').bodyCheckMiddleware;

var router = express.Router();

var opt = {
  username: {
    $isEmail: true
  },
  password: {
    $minLength: 6,
    $maxLength: 20
  }
};
router.post('/users', bodyCheckMiddleware(opt), handlerFunction);

module.exports = router;
```

### Play with other modules (javascript)
```javascript
// router.js

var express             = require('express');
var bodyCheckMiddleware = require('object-checker').bodyCheckMiddleware;
var validator           = require('validator'); // 3rd-part validator module

var router = express.Router();

var opt = {
  username: {
    $assertTrue: validator.isEmail  // 3rd-part validator function(value){...}
  },
  password: {
    $minLength: 6,
    $maxLength: 20
  }
};
router.post('/users', bodyCheckMiddleware(opt), handlerFunction);

module.exports = router;
```

### Custom options and messageTemplate in a instance (javascript)
```javascript
var objectChecker = require('../object-checker');
var checker = objectChecker.createObjectChecker({
  customDirectives: {
    $doNotCheck: null,
    $inRange: function(value, option) { return option.min < value && value < option.max;}
  },
  messageTemplate: {
    invalid   : "Value of Field `{{fieldName}}` is not valid. Got `{{fieldValue}}`, but require {{checkerName}} = {{checkerOption}}",
    missing   : "Missing {{fieldName}}",
    unexpected: "Not support {{fieldName}}"
  }
};

checker.isValid(...);
});
```

### Custom error message and error handler in middleware (javascript)
```javascript
var objectChecker = require('../object-checker');
objectChecker.messageTemplate = {
  "invalid": "Value of Field `{{fieldName}}` is not valid. Got `{{fieldValue}}`, but require {{checkerName}} = {{checkerOption}}",
  "missing": "Missing {{fieldName}}",
  "unexpected": "Not support {{fieldName}}"
};
```

```javascript
var objectChecker = require('../object-checker');
objectChecker.errorHandler = function(err, req, res, next) {
  console.log(err);
  var template = {
    "invalid": "invalid request",
    "missing": "missing parameter",
    "unexpected": "found unexpected parameter"
  };
  res.send({
    err: 400,
    msg: objectChecker.createErrorMessage(err, template);
  });
};
```

### Option list

- $type:
  - Assert the type of value.
- $skip:
  - Do not check this field.
- $:
  - Iterate all elements in array.
- $isOptional: true
  - Can be `undefined`. (When `defaultRequired` === true)
- $optional: true
  - Alias to `$isOptional`
- $isRequired: true
  - Can be `undefined`. (When `defaultRequired` === true)
- $required: true
  - Alias to `$isRequired`
- $allowNull: true
  - Can be `null`.
- $assertTrue: `assertFunction`
  - `assertFunction(value)` should return `true`.
- $assertFalse: `assertFunction`
  - `assertFunction(value)` should return `false`.
- $notEmptyString: true
  - Should be `''`.
- $isInteger: ture
  - Should be an integer.
- $isPositiveZeroInteger: Renamed to `$isPositiveIntegerOrZero`
- $isPositiveIntegerOrZero: true
  - Should be an positive integer or `0`.
- $isPositiveInteger: ture
  - Should be an positive integer.
- $isNegativeZeroInteger: Renamed to `$isNegativeIntegerOrZero`
- $isNegativeIntegerOrZero: ture
  - Should be an negative integer or `0`.
- $isNegativeInteger: true
  - Should be an negative integer.
- $minValue: `option`
  - Min value should be `option`.
- $maxValue: `option`
  - Max value should be `option`.
- $isValue: `option`
  - Should be `option`
- $in: [`option1`, `option2`, ...]
  - Value should be in the array.
- $notIn: [`option1`, `option2`, ...]
  - Value should not be in the array.
- $minLength
  - Min length of value should be `option`.
- $maxLength
  - Max length of value should be `option`.
- $isLength: `option`
  - Length of value should be `option`.
- $isEmail: true
  - Should be email.
- $matchRegExp: `RegExp`.
  - Should match `RegExp`.
- $notMatchRegExp: `RegExp`.
  - Should not match `RegExp`.

### Install:
```shell
npm install object-checker
```

### Test:
```shell
cd node_modules/object-checker
npm test
```

### License
[MIT](LICENSE)

[downloads-image]: http://img.shields.io/npm/dm/object-checker.svg

[npm-url]: https://npmjs.org/package/object-checker
[npm-image]: http://img.shields.io/npm/v/object-checker.svg
