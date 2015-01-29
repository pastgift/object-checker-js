'use strict'

var isSetted = function(obj) {
  if (typeof obj !== 'undefined' && obj !== null) {
    return true;
  }
  else {
    return false;
  }
}

var invalidValueErrorMessage = function(v) {
  return 'Invalid value: `' + v + '`';
}

var sendError = function(res, scope, paramName, errorMessage, errorDetail) {
  var response = module.exports.errorMessageFormat;
  response = response.replace('{{scope}}',        scope,        'g');
  response = response.replace('{{paramName}}',    paramName,    'g');
  response = response.replace('{{errorMessage}}', errorMessage, 'g');

  if (module.exports.DEBUG_ENABLED && isSetted(errorDetail)) {
    response = response.replace('{{errorDetail}}', errorDetail, 'g');
  }
  else {
    response = response.replace('{{errorDetail}}', ''); 
  }

  var httpStatus = module.exports.errorHttpStatus;
  if (!isInteger(httpStatus)) {
    httpStatus = 400;
  }

  res.status(httpStatus);
  res.send(response);
};

var convertToArray = function(obj, elementType) {
  if (!Array.isArray(obj)) {
    if (!isSetted(elementType)) {
      elementType = typeof obj;
    }

    if (typeof obj === elementType) {
      return [obj];
    }
    else {
      return [];
    }
  }
  else {
    var arr = [];
    for (var i = 0; i < obj.length; i++) {
      if (!isSetted(elementType)) {
        elementType = typeof obj[i];
      }

      if (typeof obj[i] === elementType) {
        arr.push(obj[i]);
      }
    }

    return arr;
  }
}

var isInteger = function(v) {
  return '' + parseInt(v) === '' + v;
}

var completeOptions = function(reqOptions) {
  if (!isSetted(reqOptions)) {
    throw new Error('reqOptions should not be `null`');
  }

  // DEFAULT request options
  var fullReqOptions = {
    scope: 'query',
    strict: true,
    params: {}
  }

  if (typeof reqOptions.scope === 'string') {
    if (reqOptions.scope === 'query' || reqOptions.scope === 'body') {
      fullReqOptions.scope = reqOptions.scope;
    }
  }

  if (typeof reqOptions.strict === 'boolean') {
    fullReqOptions.strict = reqOptions.strict;
  }

  if (typeof reqOptions.params === 'object' && isSetted(reqOptions.params)) {
    for (var k in reqOptions.params) {
      // DEFAULT parameter options
      var fullParamOptions = {
        isOptional:   false,

        assertTrue:   [],
        assertFalse:  [],

        matchRegExp:  [],

        isIn:         [],
        notIn:        [],

        isInteger:    null,
        isEmail:      null,

        equal:        null,
        greaterThan:  null,
        greaterEqual: null,
        lessThan:     null,
        lessEqual:    null,

        allowEmpty:   false,

        minLength:    null,
        maxLangth:    null
      };

      var paramOptions = reqOptions.params[k];
      if (typeof paramOptions === 'object' && isSetted(paramOptions)) {
        var optionArray, optionName;

        // (true|false) isOptional, allowEmpty
        optionArray = ['isOptional', 'allowEmpty'];
        for (var i in optionArray) {
          optionName = optionArray[i];
          if (typeof paramOptions[optionName] == 'boolean') {
            fullParamOptions[optionName] = paramOptions[optionName];
          }
        }

        // (true|false|null) isInteger
        optionArray = ['isInteger', 'isEmail'];
        for (var i in optionArray) {
          optionName = optionArray[i];
          if (isSetted(paramOptions[optionName])) {
            fullParamOptions[optionName] = paramOptions[optionName];
          }          
        }

        // (array#function) assertTrue, assertFalse
        optionArray = ['assertTrue', 'assertFalse'];
        for (var i in optionArray) {
          optionName = optionArray[i];
          if (isSetted(paramOptions[optionName])) {
            fullParamOptions[optionName] = convertToArray(paramOptions[optionName], 'function');
          }          
        }

        // (array) matchRegExp, isIn, notIn
        optionArray = ['matchRegExp', 'isIn', 'notIn'];
        for (var i in optionArray) {
          optionName = optionArray[i];
          if (isSetted(paramOptions[optionName])) {
            fullParamOptions[optionName] = convertToArray(paramOptions[optionName]);
          }
        }

        // (number|null) equal, greaterThan, greaterEqual, lessThan, lessEqual
        optionArray = ['equal', 'greaterThan', 'greaterEqual', 'lessThan', 'lessEqual'];
        for (var i in optionArray) {
          optionName = optionArray[i];
          if (isSetted(paramOptions[optionName]) && typeof paramOptions[optionName] === 'number') {
            fullParamOptions[optionName] = paramOptions[optionName];
          }
        }

        // (integer|null) maxLength, minLength
        optionArray = ['maxLength', 'minLength'];
        for (var i in optionArray) {
          optionName = optionArray[i];
          if (isSetted(paramOptions[optionName]) && isInteger(paramOptions[optionName])) {
            fullParamOptions[optionName] = paramOptions[optionName];
          }
        }
      }

      fullReqOptions.params[k] = fullParamOptions;
    }
  }

  return fullReqOptions;
}

var requestChecker = function(reqOptions) {
  var middleware = function(req, res, next) {
    var opt = completeOptions(reqOptions);

    // Strict check
    if (opt.strict) {
      for (var k in req[opt.scope]) {
        if (!isSetted(opt.params[k])) {
          sendError(res, opt.scope, k, 'Unexpected parameter');
          return false;
        }
      }
    }

    // General check
    for (var k in opt.params) {
      var paramOpt = opt.params[k];
      var input = req[opt.scope][k];

      // Check existing.
      if(!isSetted(input)) {
        if (paramOpt.isOptional) {
          continue;
        }
        else {
          sendError(res, opt.scope, k, 'Missing parameter.');
          return false;
        }
      }

      // Check value - assertTrue
      for (var i = 0; i < paramOpt.assertTrue.length; i++) {
        if (paramOpt.assertTrue[i](input) !== true) {
          sendError(res, opt.scope, k, invalidValueErrorMessage(input), 'AssertTrue: #' + i);
          return false;
        }
      }

      // Check value - assertFalse
      for (var i = 0; i < paramOpt.assertFalse.length; i++) {
        if (paramOpt.assertFalse[i](input) !== false) {
          sendError(res, opt.scope, k, invalidValueErrorMessage(input), 'AssertFalse: #' + i);
          return false;
        }
      }

      // Check value - matchRegExp
      for (var i = 0; i < paramOpt.matchRegExp.length; i++) {
        if (!paramOpt.matchRegExp[i].test(input)) {
          sendError(res, opt.scope, k, invalidValueErrorMessage(input), 'matchRegExp: #' + i + ', ' + paramOpt.matchRegExp[i]);
          return false;
        }
      }

      // Check value - isIn
      if (paramOpt.isIn.length > 0) {
        var isIn = false;
        for (var i = 0; i < paramOpt.isIn.length; i++) {
          if (input == paramOpt.isIn[i]) {
            isIn = true;
          }
        }
        if (!isIn) {
          sendError(res, opt.scope, k, invalidValueErrorMessage(input), 'isIn: ' + paramOpt.isIn);
          return false;
        }
      }

      // Check value - notIn
      for (var i = 0; i < paramOpt.notIn.length; i++) {
        if (input == paramOpt.notIn[i]) {
          sendError(res, opt.scope, k, invalidValueErrorMessage(input), 'notIn: ' + paramOpt.notIn);
          return false;
        }
      }

      // Check value - isInteger
      if (isSetted(paramOpt.isInteger) && isInteger(input) !== paramOpt.isInteger) {
        sendError(res, opt.scope, k, invalidValueErrorMessage(input), 'isInteger');
        return false;
      }

      // Check value - isEmail
      var reEmail = /^(?:[a-z\d]+[_\-\+\.]?)*[a-z\d]+@(?:([a-z\d]+\-?)*[a-z\d]+\.)+([a-z]{2,})+$/i;
      if (isSetted(paramOpt.isEmail) && reEmail.test(input) !== paramOpt.isEmail) {
        sendError(res, opt.scope, k, invalidValueErrorMessage(input), 'isEmail');
        return false;
      }

      // Check value - equal
      if (isSetted(paramOpt.equal) && !(input == paramOpt.equal)) {
        sendError(res, opt.scope, k, invalidValueErrorMessage(input), 'equal, ' + paramOpt.equal);
        return false;
      }

      // Check value - greaterThan
      if (isSetted(paramOpt.greaterThan) && !(input > paramOpt.greaterThan)) {
        sendError(res, opt.scope, k, invalidValueErrorMessage(input), 'greaterThan, ' + paramOpt.greaterThan);
        return false;
      }

      // Check value - greaterEqual
      if (isSetted(paramOpt.greaterEqual) && !(input >= paramOpt.greaterEqual)) {
        sendError(res, opt.scope, k, invalidValueErrorMessage(input), 'greaterEqual, ' + paramOpt.greaterEqual);
        return false;
      }

      // Check value - lessThan
      if (isSetted(paramOpt.lessThan) && !(input < paramOpt.lessThan)) {
        sendError(res, opt.scope, k, invalidValueErrorMessage(input), 'lessThan, ' + paramOpt.lessThan);
        return false;
      }

      // Check value - lessEqual
      if (isSetted(paramOpt.lessEqual) && !(input <= paramOpt.lessEqual)) {
        sendError(res, opt.scope, k, invalidValueErrorMessage(input), 'lessEqual, ' + paramOpt.lessEqual);
        return false;
      }

      // Check value - allowEmpty
      if (isSetted(paramOpt.allowEmpty) && !paramOpt.allowEmpty && input === '') {
        sendError(res, opt.scope, k, invalidValueErrorMessage(input), 'allowEmpty, ' + paramOpt.allowEmpty);
        return false;
      }

      // Check value - maxLength
      if (isSetted(paramOpt.maxLength) && ('' + input).length > paramOpt.maxLength) {
        sendError(res, opt.scope, k, invalidValueErrorMessage(input), 'maxLength, ' + paramOpt.maxLength);
        return false;
      }

      // Check value - minLength
      if (isSetted(paramOpt.minLength) && ('' + input).length < paramOpt.minLength) {
        sendError(res, opt.scope, k, invalidValueErrorMessage(input), 'minLength, ' + paramOpt.minLength);
        return false;
      }
    }

    // Check OK
    next();
  }

  return middleware;
};

module.exports.DEBUG_ENABLED  = false;
module.exports.errorHttpStatus = 400;
module.exports.errorMessageFormat = '[express-request-checker] Scope: `{{scope}}`, ParamName: `{{paramName}}`, ErrorMessage: {{errorMessage}}. {{errorDetail}}';
module.exports.requestChecker = requestChecker;
