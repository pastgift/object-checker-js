'use strict'

var defaultHeaders = {
  "Content-Type": "application/json"
};

var defaultFormat = JSON.stringify(
  {
    error: {
      reporter    : "express-request-checker",
      scope       : "`{{scope}}`",
      paramName   : "`{{paramName}}`",
      errorMessage: "{{errorMessage}}",
      errorDetail : "{{errorDetail}}"
    }
  }
);

var sendErrorDetailFlag = false;
var errorHttpStatusCode = 400;
var errorHttpResponseHeaders = defaultHeaders;
var errorHttpResponseBodyFormat = defaultFormat;

var scopes = ['params', 'query', 'body'];

var isSetted = function(obj) {
  if (typeof obj !== 'undefined' && obj !== null) {
    return true;
  }
  else {
    return false;
  }
};

var isEmptyObj = function(obj) {
  for (var i in obj) {
    return false;
  }
  return true;
}

var invalidValueErrorMessage = function(v) {
  return 'Invalid value: `' + v + '`';
};

var sendError = function(res, scope, paramName, errorMessage, errorDetail) {
  var response = errorHttpResponseBodyFormat;
  response = response.replace('{{scope}}',        scope,        'g');
  response = response.replace('{{paramName}}',    paramName,    'g');
  response = response.replace('{{errorMessage}}', errorMessage, 'g');

  if (sendErrorDetailFlag && isSetted(errorDetail)) {
    response = response.replace('{{errorDetail}}', errorDetail, 'g');
  }
  else {
    response = response.replace('{{errorDetail}}', '');
  }

  var httpStatus = errorHttpStatusCode;
  if (!isInteger(httpStatus)) {
    httpStatus = 400;
  }

  for (var headerKey in errorHttpResponseHeaders) {
    var headerValue = errorHttpResponseHeaders[headerKey];
    res.set(headerKey, headerValue);
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
};

var isInteger = function(v) {
  return '' + parseInt(v) === '' + v;
};

var completeReqOption = function(reqOption) {
  if (!isSetted(reqOption)) {
    throw new Error('reqOption should not be `null`');
  }

  // DEFAULT request option
  var fullReqOption = {
    strict: true,
    params: null,
    query:  null,
    body:   null,
    ip    : {}
  }

  if (typeof reqOption.strict === 'boolean') {
    fullReqOption.strict = reqOption.strict;
  }

  for (var iScopeName in scopes) {
    var reqScopeName = scopes[iScopeName];
    var reqScopeOption = reqOption[reqScopeName];

    // Skip unsetted scope
    if (typeof reqScopeOption === 'undefined') { continue; }

    // Init reqOption.<scope>.
    fullReqOption[reqScopeName] = {};

    for (var reqParamName in reqScopeOption) {
      var reqParamOption = reqScopeOption[reqParamName];

      // DEFAULT parameter option
      var fullParamOption = {
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

      // Skip unsetted option
      if (typeof reqParamOption !== 'object' || !isSetted(reqParamOption)) { continue; }

      var optionArray, optionName;

      // (true|false) isOptional, allowEmpty
      optionArray = ['isOptional', 'allowEmpty'];
      for (var iOptionName in optionArray) {
        optionName = optionArray[iOptionName];

        // Skip invalid option
        if (typeof reqParamOption[optionName] !== 'boolean') { continue; }

        fullParamOption[optionName] = reqParamOption[optionName];
      }

      // (true|false|null) isInteger, isEmail, isEmpty
      optionArray = ['isInteger', 'isEmail', 'isEmpty'];
      for (var iOptionName in optionArray) {
        optionName = optionArray[iOptionName];
        // Skip invalid option
        if (!isSetted(reqParamOption[optionName])) { continue; }

        fullParamOption[optionName] = reqParamOption[optionName];
      }

      // (array#function) assertTrue, assertFalse
      optionArray = ['assertTrue', 'assertFalse'];
      for (var iOptionName in optionArray) {
        optionName = optionArray[iOptionName];
        // Skip invalid option
        if (!isSetted(reqParamOption[optionName])) { continue; }

        fullParamOption[optionName] = convertToArray(reqParamOption[optionName], 'function');
      }

      // (array) matchRegExp, isIn, notIn
      optionArray = ['matchRegExp', 'isIn', 'notIn'];
      for (var iOptionName in optionArray) {
        optionName = optionArray[iOptionName];
        // Skip invalid option
        if (!isSetted(reqParamOption[optionName])) { continue; }

        fullParamOption[optionName] = convertToArray(reqParamOption[optionName]);
      }

      // (number|null) equal, greaterThan, greaterEqual, lessThan, lessEqual
      optionArray = ['equal', 'greaterThan', 'greaterEqual', 'lessThan', 'lessEqual'];
      for (var iOptionName in optionArray) {
        optionName = optionArray[iOptionName];
        // Skip invalid option
        if (!isSetted(reqParamOption[optionName]) || typeof reqParamOption[optionName] !== 'number') { continue; }

        fullParamOption[optionName] = reqParamOption[optionName];
      }

      // (integer|null) maxLength, minLength
      optionArray = ['maxLength', 'minLength'];
      for (var iOptionName in optionArray) {
        optionName = optionArray[iOptionName];
        // Skip invalid option
        if (!isSetted(reqParamOption[optionName]) || !isInteger(reqParamOption[optionName])) { continue; }

        fullParamOption[optionName] = reqParamOption[optionName];
      }

      fullReqOption[reqScopeName][reqParamName] = fullParamOption;
    }
  }

  return fullReqOption;
};

var requestChecker = function(reqOption) {
  var middleware = function(req, res, next) {
    var opt = completeReqOption(reqOption);

    // Replace `undefined` scope to `{}`
    for (var iScopeName in scopes) {
      var scopeName = scopes[iScopeName];
      if (!isSetted(req[scopeName])) {
        req[scopeName] = {};
      }
    }

    // Strict check
    if (opt.strict) {
      for (var iScopeName in scopes) {
        var scopeName = scopes[iScopeName];

        // Skip unsetted scope
        if (!isSetted(opt[scopeName])) { continue; }

        for (var reqParamName in req[scopeName]) {
          // Existed. OK
          if (isSetted(opt[scopeName][reqParamName])) { continue; }

          sendError(res, scopeName, reqParamName, 'Unexpected parameter');
          return false;
        }
      }
    }

    // Main check
    for (var iScopeName in scopes) {
      var scopeName = scopes[iScopeName];
      var scopeOption = opt[scopeName];

      for (var paramOptionName in scopeOption) {
        var paramOption = scopeOption[paramOptionName];
        var input = req[scopeName][paramOptionName];

        // Check existing.
        if(!isSetted(input)) {
          // Skip optional param
          if (paramOption.isOptional) { continue; }

          sendError(res, scopeName, paramOptionName, 'Missing parameter.');
          return false;
        }

        // Check value - assertTrue
        for (var i = 0; i < paramOption.assertTrue.length; i++) {
          if (paramOption.assertTrue[i](input) !== true) {
            sendError(res, scopeName, paramOptionName, invalidValueErrorMessage(input), 'AssertTrue: #' + i);
            return false;
          }
        }

        // Check value - assertFalse
        for (var i = 0; i < paramOption.assertFalse.length; i++) {
          if (paramOption.assertFalse[i](input) !== false) {
            sendError(res, scopeName, paramOptionName, invalidValueErrorMessage(input), 'AssertFalse: #' + i);
            return false;
          }
        }

        // Check value - matchRegExp
        for (var i = 0; i < paramOption.matchRegExp.length; i++) {
          if (!paramOption.matchRegExp[i].test(input)) {
            sendError(res, scopeName, paramOptionName, invalidValueErrorMessage(input), 'matchRegExp: #' + i + ', ' + paramOption.matchRegExp[i]);
            return false;
          }
        }

        // Check value - isIn
        if (paramOption.isIn.length > 0) {
          var isIn = false;
          for (var i = 0; i < paramOption.isIn.length; i++) {
            if (input == paramOption.isIn[i]) {
              isIn = true;
            }
          }
          if (!isIn) {
            sendError(res, scopeName, paramOptionName, invalidValueErrorMessage(input), 'isIn: ' + paramOption.isIn);
            return false;
          }
        }

        // Check value - notIn
        for (var i = 0; i < paramOption.notIn.length; i++) {
          if (input == paramOption.notIn[i]) {
            sendError(res, scopeName, paramOptionName, invalidValueErrorMessage(input), 'notIn: ' + paramOption.notIn);
            return false;
          }
        }

        // Check value - isInteger
        if (isSetted(paramOption.isInteger) && isInteger(input) !== paramOption.isInteger) {
          sendError(res, scopeName, paramOptionName, invalidValueErrorMessage(input), 'isInteger');
          return false;
        }

        // Check value - isEmail
        var reEmail = /^(?:[a-z\d]+[_\-\+\.]?)*[a-z\d]+@(?:([a-z\d]+\-?)*[a-z\d]+\.)+([a-z]{2,})+$/i;
        if (isSetted(paramOption.isEmail) && reEmail.test(input) !== paramOption.isEmail) {
          sendError(res, scopeName, paramOptionName, invalidValueErrorMessage(input), 'isEmail');
          return false;
        }

        // Check value - equal
        if (isSetted(paramOption.equal) && !(input == paramOption.equal)) {
          sendError(res, scopeName, paramOptionName, invalidValueErrorMessage(input), 'equal, ' + paramOption.equal);
          return false;
        }

        // Check value - greaterThan
        if (isSetted(paramOption.greaterThan) && !(input > paramOption.greaterThan)) {
          sendError(res, scopeName, paramOptionName, invalidValueErrorMessage(input), 'greaterThan, ' + paramOption.greaterThan);
          return false;
        }

        // Check value - greaterEqual
        if (isSetted(paramOption.greaterEqual) && !(input >= paramOption.greaterEqual)) {
          sendError(res, scopeName, paramOptionName, invalidValueErrorMessage(input), 'greaterEqual, ' + paramOption.greaterEqual);
          return false;
        }

        // Check value - lessThan
        if (isSetted(paramOption.lessThan) && !(input < paramOption.lessThan)) {
          sendError(res, scopeName, paramOptionName, invalidValueErrorMessage(input), 'lessThan, ' + paramOption.lessThan);
          return false;
        }

        // Check value - lessEqual
        if (isSetted(paramOption.lessEqual) && !(input <= paramOption.lessEqual)) {
          sendError(res, scopeName, paramOptionName, invalidValueErrorMessage(input), 'lessEqual, ' + paramOption.lessEqual);
          return false;
        }

        // Check value - allowEmpty
        if (isSetted(paramOption.allowEmpty) && !paramOption.allowEmpty && input === '') {
          sendError(res, scopeName, paramOptionName, invalidValueErrorMessage(input), 'allowEmpty, ' + paramOption.allowEmpty);
          return false;
        }

        // Check value - maxLength
        if (isSetted(paramOption.maxLength) && ('' + input).length > paramOption.maxLength) {
          sendError(res, scopeName, paramOptionName, invalidValueErrorMessage(input), 'maxLength, ' + paramOption.maxLength);
          return false;
        }

        // Check value - minLength
        if (isSetted(paramOption.minLength) && ('' + input).length < paramOption.minLength) {
          sendError(res, scopeName, paramOptionName, invalidValueErrorMessage(input), 'minLength, ' + paramOption.minLength);
          return false;
        }

        // Check value - isEmpty
        if (isSetted(paramOption.isEmpty) && (paramOption.isEmpty ^ input === '')) {
          sendError(res, scopeName, paramOptionName, invalidValueMessage(input), 'isEmpty, ' + paramOption.isEmpty);
          return false;
        }
      }
    }

    // Check OK
    next();
  };

  return middleware;
};

module.exports.SEND_ERROR_DETAIL = function(enabled) {
  sendErrorDetailFlag = enabled;
};

module.exports.setErrorHttpStatusCode = function(code) {
  errorHttpStatusCode = code;
};

module.exports.setErrorHttpResponseHeaders = function(headers) {
  errorHttpResponseHeaders = headers;
};

module.exports.setErrorHttpResponseBodyFormat = function(format) {
  errorHttpResponseBodyFormat = format;
};

module.exports.requestChecker = requestChecker;
