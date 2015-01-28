# express-request-checker
Create request checker middleware with options for Express.

### Example(Javascript):
```javascript
var express = require('express');
var router = express.Router();
var reqChecker = require('express-request-checker')

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
```

### Example(CoffeeScript):
```coffee
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
```