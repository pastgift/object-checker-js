# express-request-checker
Create request checker middleware with options for Express.

with express-request-checker, checking HTTP request's `query` or `body` will be more easy and readable. All the works is just `require` express-request-checker in `router.js` which belong to an Express project and config it. So it's no need to modify any other source file.

### Quick Example(Javascript):
```javascript
// router.js

var express          = require('express');
var reqCheckerModule = require('express-request-checker');

var reqChecker = reqCheckerModule.requestChecker;
var router = express.Router();

var options = {
  scope: 'query', // Check scope. ('query'|'body', DEFAULT: 'query')
  strict: false,  // Allow unexpected parameter. (true|false, DEFAULT: true)
  params: {       // Paramters.
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
  scope: 'query' # Check scope. ('query'|'body', DEFAULT: 'query')
  strict: false  # Allow unexpected parameter. (true|false, DEFAULT: true)
  params:        # Paramters.
    'param1':
      matchRegExp: /^[0-9]{1}$/
    'param2':
      isIn: [1, 2, 3]
      isOptional: true    # Optional parameter. (true|false, DEFAULT: false)
router.get '/path', reqChecker(options), handlerFunction

module.exports = router
```

### Parameter Options
#### assertTrue
A `function` which use parameter in request as its argument, or an `array` of such functions.  
If the function return `true`, check OK. Otherwise, check error.

Example:

```javascript
option = {
  params: {
    param1: {
      assertTrue: [function(value) { return value > 10; }]
    }
  }
}
```

#### assertFalse
Opposite to `assertTrue`.

#### matchRegExp
A `RegExp` or an `array` of `RegExp`s.  
If the `RegExp` test result is `true`, check OK. Otherwise, check error.

Example:

```javascript
option = {
  params: {
    param1: {
      matchRegExp: [/^[012]{1}$/, /^[234]{1}$/]
    }
  }
}
```

#### isIn
A `array` which are allowed values of parameter in request.  
if the value of parameter in request equals to any element in `array`, check OK. Otherwise, check error.

Example:

```javascript
option = {
  params: {
    param1: {
      isIn: [1, 2, 3]
    }
  }
}
```

#### notIn
Opposite to `isIn`.

#### isInteger
`true` or `false`.  
when setted `true`, the parameter in request must be an `integer`.  
when setted `false `, the parameter in request must NOT be an `integer`.  

Example:

```javascript
option = {
  params: {
    param1: {
      isInteger: true
    }
  }
}
```

#### max
`integer`. the parameter in request must be equal or less then `max`.

Example:

```javascript
option = {
  params: {
    param1: {
      max: 100
    }
  }
}
```

#### min
Opposite to `max`.

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
