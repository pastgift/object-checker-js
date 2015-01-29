# express-request-checker

[![NPM version][npm-image]][npm-url] [![Downloads][downloads-image]][npm-url]

Create request checker middleware for Express.

with express-request-checker, checking HTTP request's `query`， `body` or url `params` will be more easy and readable. All the works is just `require` express-request-checker in `router.js` which belongs to an Express project and config it. So it's no need to modify any other source file.

Since validation codes are written in a config-like way, `router.js` file will look like an API document, I hope that the communication cost within the development team can be reduced.

- No validation codes.
- `router.js` is also an API document.
- Easy to combine with other validation package.

### Quick Example(Javascript):
```javascript
// router.js

var express          = require('express');
var reqCheckerModule = require('express-request-checker');

var reqChecker = reqCheckerModule.requestChecker;
var router = express.Router();

var options = {
  strict: false,  // Allow unexpected parameter. (true|false, DEFAULT: true)
  query: {        // Check req.query. (params|query|body)
    'param1': {
      matchRegExp: /^[0-9]{1}$/
    },
    'param2': {
      isIn: [1, 2, 3],
      isOptional: true    // Optional parameter. (true|false, DEFAULT: false)
    }
  }
};
router.get('/path', reqChecker(options), handlerFunction);

module.exports = router;
```

### Quick Example(CoffeeScript):
```coffee
# router.coffee

express          = require 'express'
reqCheckerModule = require 'express-request-checker'

reqChecker = reqCheckerModule.requestChecker
router = express.Router()

options =
  strict: false  # Allow unexpected parameter. (true|false, DEFAULT: true)
  query:         # Check req.query. (params|query|body)
    'param1':
      matchRegExp: /^[0-9]{1}$/
    'param2':
      isIn: [1, 2, 3]
      isOptional: true    # Optional parameter. (true|false, DEFAULT: false)
router.get '/path', reqChecker(options), handlerFunction

module.exports = router
```

### Play with other modules
```javascript
// router.js

var express          = require('express');
var reqCheckerModule = require('express-request-checker');

var reqChecker = reqCheckerModule.requestChecker;
var router = express.Router();

var validator = require('validator');
var options = {
  params: {
    'id': {
      assertTrue: validator.isInt
    }
  },
  body: {
    'email': {
      assertTrue: validator.isEmail
    },
    'jsonData': {
      assertTrue: validator.isJSON
    }
  }
};
router.post('/user/:id', reqChecker(options), handlerFunction);

module.exports = router;
```

### Checker Options Default Values

|Option      |Default Value|
|------------|-------------|
|strict      |`true`       |

### Parameter Options Default Values

|Option      |Default Value|
|------------|-------------|
|isOptional  |`false`      |
|assertTrue  |`[]`         |
|assertFalse |`[]`         |
|matchRegExp |`[]`         |
|isIn        |`[]`         |
|notIn       |`[]`         |
|isInteger   |`null`       |
|isEmail     |`null`       |
|equal       |`null`       |
|greaterThan |`null`       |
|greaterEqual|`null`       |
|lessThan    |`null`       |
|lessEqual   |`null`       |
|allowEmpty  |`false`      |
|minLength   |`null`       |
|maxLangth   |`null`       |

### Parameter Options
#### assertTrue
`function`, `[function, function ...]` or `[]`. (DEFAULT: `[]` - No checker)  
Using parameter in request as function(s)'s argument, if the function(s) return `true`,OK. Otherwise, NG.

Example:

```javascript
option = {
  query: {
    param1: {
      assertTrue: [function(value) { return value > 10; }]
    }
  }
}
```

#### assertFalse
Opposite to `assertTrue`.

#### matchRegExp
`RegExp`, `[RegExp, RegExp ...]` or `[]`. (DEFAULT: `[]` - Don't check)  
If the RegExp(s) test result is `true`, OK. Otherwise, NG.

Example:

```javascript
option = {
  query: {
    param1: {
      matchRegExp: [/^[012]{1}$/, /^[234]{1}$/]
    }
  }
}
```

#### isIn
`[value, value, ...]` or `[]`. (DEFAULT: `[]` - Don't check)  
Values of parameter in request which are allowed.  

Example:

```javascript
option = {
  query: {
    param1: {
      isIn: [1, 2, 3]
    }
  }
}
```

#### notIn
Opposite to `isIn`.

#### isInteger
`true` or `false`. (DEFALT:`null` - Don't care)  
when `true`, The value of parameter in request must be an `integer`.  
when `false `, The value of parameter in request must NOT be an `integer`.  

Example:

```javascript
option = {
  query: {
    param1: {
      isInteger: true
    }
  }
}
```

#### isEmail
`true` or `false`. (DEFALT:`null` - Don't care)  
when `true`, The value of parameter in request must be an correct email address.  
when `false `, The value of parameter in request must NOT be an email address.  

Example:

```javascript
option = {
  query: {
    param1: {
      isEmail: true
    }
  }
}
```

#### equal / greaterThan / greaterEqual / lessThan / lessEqual
`integer` or `null`. (DEFALT:`null` - Don't care)  
The value of parameter in request must be equal/greaterThan/greaterEqual/lessThan/lessEqual to the option value.

Example:

```javascript
option = {
  query: {
    param1: {
      equal: 100
    }
  }
}
```

#### allowEmpty
`true` or `false`. (DEFAULT: `false`)  
when setted `true`, The value of parameter in request can be `''`.  
when setted `true`, The value of parameter in request can NOT be `''`.  

Example:

```javascript
option = {
  query: {
    param1: {
      isEmpty: false
    }
  }
}
```

#### maxLength / minLength
`integer` or `null`. (DEFALT:`null` - Don't care)  
Max/Min Length of the value of parameter in request.

Example:

```javascript
option = {
  query: {
    param1: {
      minLength: 5,
      maxLength: 10
    }
  }
}
```

### Install:
```shell
npm install express-request-checker
```

### Test:
```shell
cd node_modules/express-request-checker
npm test
```

### License
[MIT](LICENSE)

[downloads-image]: http://img.shields.io/npm/dm/express-request-checker.svg

[npm-url]: https://npmjs.org/package/express-request-checker
[npm-image]: http://img.shields.io/npm/v/express-request-checker.svg