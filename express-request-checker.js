'use strict'

/* Module Settings */
var errorHttpStatusCode = 400;
var sendErrorDetailFlag = false;

var defaultHeaders = {
  "Content-Type": "application/json"
};

var defaultFormat = JSON.stringify(
  {
    error: {
      reporter    : "express-request-checker",
      scope       : "`{{scope}}`",
      field       : "`{{field}}`",
      errorMessage: "{{errorMessage}}",
      errorDetail : "{{errorDetail}}"
    }
  }
);

var errorHttpResponseHeaders = defaultHeaders;
var errorHttpResponseBodyFormat = defaultFormat;

var defaultFieldOptions = {
  isOptional: false,
  allowEmpty: false
};

var defaultGlobalOptions = {
  strict: true
};

/* Useful functions */
var isSetted = function(obj) {
  if (typeof obj !== 'undefined' && obj !== null) {
    return true;
  }
  else {
    return false;
  }
};

var isInteger = function(v) {
  return '' + parseInt(v) === '' + v;
};

/* Check result handling */
var invalidValueErrorMessage = function(v) {
  return 'Invalid value: `' + v + '`';
};

var sendError = function(res, scope, field, errorMessage, errorDetail) {
  var response = errorHttpResponseBodyFormat;
  response = response.replace('{{scope}}',        scope,        'g');
  response = response.replace('{{field}}',        field,        'g');
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

/* Scope List */
var scopeNameList = [
  'params',
  'query',
  'body'
];

/* Checkers */
var _assertChecker = function(v, func, assertValue) {
  if (Array.isArray(func)) {
    if (func.length <= 0) { return true; }
    for (var i = 0; i < func.length; i++) {
      if (typeof func[i] !== 'function') { continue; }
      if (func[i](v) !== assertValue) { return false; }
    }
  } 
  else {
    if (typeof func !== 'function') { return true; }
    if (func(v) !== assertValue) { return false; }
  }
  return true;
};

var _compare = function(x, y, method) {
  if (!isSetted(x) || !isSetted(y)) { return true; }

  switch (method) {
    case '=': return x == y; break;
    case '>': return x > y; break;
    case '<': return x < y; break;
    case '>=': return x >= y; break;
    case '<=': return x <= y; break;
    default: return true
  }
};

var checkerList = {
  assertTrue : function(v, func) {
    return _assertChecker(v, func, true);
  },

  assertFalse : function(v, func) {
    return _assertChecker(v, func, false);
  },

  matchRegExp : function(v, regExp) {
    if (Array.isArray(regExp)) {
      if (regExp.length <= 0) { return true; }
      for (var i = 0; i < regExp.length; i++) {
        if (!isSetted(regExp[i]) || typeof regExp[i] !== 'object' || typeof regExp[i].test !== 'function') { continue; }
        if (!regExp[i].test(v)) { return false; }
      }
    }
    else {
      if (typeof regExp !== 'object' || typeof regExp.test !== 'function') { return true; }
      if (!regExp.test(v)) { return false; }
    }
    return true;
  },

  isIn : function(v, valueArr) {
    if (Array.isArray(valueArr)) {
      for (var i = 0; i < valueArr.length; i++) {
        if (v == valueArr[i]) { return true; }
      }
    }
    else {
      return true;
    }
    return false;
  },

  notIn : function(v, valueArr) {
    if (Array.isArray(valueArr)) {
      for (var i = 0; i < valueArr.length; i++) {
        if (v == valueArr[i]) { return false; }
      }
    }
    return true;
  },

  isStrictInteger : function(v, flg) {
    if (typeof flg !== 'boolean') { return true; }

    return !(flg ^ isInteger(v));
  },

  isInteger : function(v, flg) {
    if (typeof flg !== 'boolean') { return true; }
    
    return !(flg ^ (+v === parseInt(v)));
  },

  isLooseInteger : function(v, flg) {
    if (typeof flg !== 'boolean') { return true; }
    
    return !(flg ^ (v == parseInt(v)));
  },

  isEmail : function(v, flg) {
    if (typeof flg !== 'boolean') { return true; }

    var reEmail = /^(?:[a-z\d]+[_\-\+\.]?)*[a-z\d]+@(?:([a-z\d]+\-?)*[a-z\d]+\.)+([a-z]{2,})+$/i;
    return !(flg ^ reEmail.test(v));
  },

  equal : function(v, optionValue) {
    return _compare(v, optionValue, '=');
  },

  greaterThan : function(v, optionValue) {
    return _compare(v, optionValue, '>');
  },

  greaterEqual : function(v, optionValue) {
    return _compare(v, optionValue, '>=');
  },

  lessThan : function(v, optionValue) {
    return _compare(v, optionValue, '<');
  },

  lessEqual : function(v, optionValue) {
    return _compare(v, optionValue, '<=');
  },

  allowEmpty : function(v, flg) {
    if (flg !== true && v === '') { return false; }
    return true;
  },

  maxLength : function(v, len) {
    return ('' + v).length <= len;
  },

  minLength : function(v, len) {
    return ('' + v).length >= len;
  }
}

var _checkScope = function(scope, scopeCheckOption) {
  var checkResult = {
    OK: true,
    field: '',
    errorMessage: '',
    errorDetail:  ''
  };
  
  for (var fieldName in scopeCheckOption) {
    /* Set Scope default option */
    for (var optionName in defaultFieldOptions) {
      if (!isSetted(scopeCheckOption[fieldName][optionName])) {
        scopeCheckOption[fieldName][optionName] = defaultFieldOptions[optionName];
      }
    }

    /* Check optional fields */
    if (!isSetted(scope[fieldName]) && scopeCheckOption[fieldName]['isOptional'] === true) { continue; }

    /* Check fields */
    checkResult.field = fieldName;
    if (!isSetted(scope[fieldName])) {
      checkResult.OK           = false;
      checkResult.errorMessage = 'Missing field.';
      checkResult.errorDetail  = '';
      return checkResult;
    }

    for (var checkerName in scopeCheckOption[fieldName]) {
      var checker = checkerList[checkerName];
      if (!isSetted(checker)) { continue; }

      var v = scope[fieldName];
      var option = scopeCheckOption[fieldName][checkerName];
      
      if (checker(v, option) === true) { continue; }

      checkResult.OK           = false;
      checkResult.errorMessage = invalidValueErrorMessage(v);
      checkResult.errorDetail  = checkerName + ': `' + option + '`';
      return checkResult;
    }
  }

  return checkResult;
};

/* Main */
var requestChecker = function(reqCheckOption) {
  var checkerMiddleware = function(req, res, next) {
    // Replace `undefined` scope to `{}`
    for (var i = 0; i < scopeNameList.length; i++) {
      var scopeName = scopeNameList[i];
      if (!isSetted(req[scopeName])) {
        req[scopeName] = {};
      }
    }

    /* Set Global default option */
    for (var optionName in defaultGlobalOptions) {
      if (!isSetted(reqCheckOption[optionName])) {
        reqCheckOption[optionName] = defaultGlobalOptions[optionName];
      }
    }

    /* Check strict */
    if (reqCheckOption['strict'] === true) {
      for (var i = 0; i < scopeNameList.length; i++) {
        var scopeName = scopeNameList[i];

        // Skip unsetted scope
        if (!isSetted(reqCheckOption[scopeName])) { continue; }

        for (var fieldName in req[scopeName]) {
          if (isSetted(reqCheckOption[scopeName][fieldName])) { continue; }

          sendError(
            res,
            scopeName,
            fieldName,
            'Unexpected field',
            'Strict check is ON.'
          );
          return false;
        }
      }
    }

    /* Check values */
    for (var i = 0; i < scopeNameList.length; i++) {
      var scopeName = scopeNameList[i];
      if (!isSetted(reqCheckOption[scopeName])) { continue; }

      var checkResult = _checkScope(req[scopeName], reqCheckOption[scopeName])
      if (checkResult.OK) { continue; }

      sendError(
        res,
        scopeName,
        checkResult.field,
        checkResult.errorMessage,
        checkResult.errorDetail
      );
      return false;
    }

    next();
  };

  return checkerMiddleware;
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

module.exports.setDefaultFieldOptions = function(options) {
  defaultFieldOptions = options;
}

module.exports.setDefaultGlobalOptions = function(options) {
  defaultGlobalOptions = options;
}

module.exports.requestChecker = requestChecker;
