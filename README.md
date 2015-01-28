# express-request-checker
Create request checker middleware with options for Express.

with express-request-checker, checking HTTP request's `query` or `body` will be more easy and readable. All the works is just `require` express-request-checker in `router.js` which belong to an Express project and config it. So it's no need to modify any other source file.

### Quick Example(Javascript):
```javascript
// router.js

var express    = require('express');
var reqChecker = require('express-request-checker');

var router = express.Router();

var options = {
  scope: 'query', // Check scope. ('query'|'body', DEFAULT: 'query')
  strict: false,  // Allow unexpected parameter. (true|false, DEFAULT: true)
  params: {       // Paramters.
    'param1': {
      matchRegExp: /^[0-9]{1}$/
    },
    'param2': {
      matchRegExp: /^[0-9]{2}$/,
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

express    = require 'express'
reqChecker = require 'express-request-checker'

router = express.Router()

options =
  scope: 'query' # Check scope. ('query'|'body', DEFAULT: 'query')
  strict: false  # Allow unexpected parameter. (true|false, DEFAULT: true)
  params:        # Paramters.
    'param1':
      matchRegExp:/^[0-9]{1}$/
    'param2':
      matchRegExp:/^[0-9]{2}$/
      isOptional:true    # Optional parameter. (true|false, DEFAULT: false)
router.get '/path', reqChecker(options), handlerFunction

module.exports = router
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
