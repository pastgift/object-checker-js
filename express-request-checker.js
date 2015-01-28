'use strict'

var isSetted = function(obj) {
  if (typeof obj !== 'undefined' && obj !== null) {
    return true;
  }
  else {
    return false;
  }
}

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
        isOptional:  false,
        assertTrue:  [],
        assertFalse: [],
        matchRegExp: [],
        isIn:        [],
        notIn:       [],
        isInteger:   null,
        max:         null,
        min:         null
      };

      var paramOptions = reqOptions.params[k];
      if (typeof paramOptions === 'object' && isSetted(paramOptions)) {
        // isOptional
        if (typeof paramOptions.isOptional == 'boolean') {
          fullParamOptions.isOptional = paramOptions.isOptional;
        }

        // assertTrue
        if (isSetted(paramOptions.assertTrue)) {
          fullParamOptions.assertTrue = convertToArray(paramOptions.assertTrue, 'function');
        }

        // assertFalse
        if (isSetted(paramOptions.assertFalse)) {
          fullParamOptions.assertFalse = convertToArray(paramOptions.assertFalse, 'function');
        }

        // matchRegExp
        if (isSetted(paramOptions.matchRegExp)) {
          // TODO: Check RegExp object
          fullParamOptions.matchRegExp = convertToArray(paramOptions.matchRegExp);
        }

        // isIn
        if (isSetted(paramOptions.isIn)) {
          fullParamOptions.isIn = convertToArray(paramOptions.isIn);
        }

        // notIn
        if (isSetted(paramOptions.notIn)) {
          fullParamOptions.notIn = convertToArray(paramOptions.notIn);
        }

        // isInteger
        if (isSetted(paramOptions.isInteger)) {
          fullParamOptions.isInteger = paramOptions.isInteger;
        }

        // max
        if (isSetted(paramOptions.max) && isInteger(paramOptions.max)) {
          fullParamOptions.max = paramOptions.max;
        }

        // min
        if (isSetted(paramOptions.min) && isInteger(paramOptions.min)) {
          fullParamOptions.min = paramOptions.min;
        }
      }

      fullReqOptions.params[k] = fullParamOptions;
    }
  }

  return fullReqOptions;
}

var invalidValueMessage = function(v) {
  return 'Invalid value: `' + v + '`';
}

var sendError = function(res, scopeOption, paramName, errorMessage, errorDetail) {
  var response = '[ParamsPicker]';
  response += ' Scope: `' + scopeOption + '`';
  response += ', Param: `' + paramName + '`';
  response += ', Error: ' + errorMessage;

  if (module.exports.DEBUG_ENABLED && isSetted(errorDetail)) {
    response += ', ErrorDetail: ' + errorDetail;
  }

  res.send(response);
};

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
          sendError(res, opt.scope, k, invalidValueMessage(input), 'AssertTrue: #' + i);
          return false;
        }
      }

      // Check value - assertFalse
      for (var i = 0; i < paramOpt.assertFalse.length; i++) {
        if (paramOpt.assertFalse[i](input) !== false) {
          sendError(res, opt.scope, k, invalidValueMessage(input), 'AssertFalse: #' + i);
          return false;
        }
      }

      // Check value - matchRegExp
      for (var i = 0; i < paramOpt.matchRegExp.length; i++) {
        if (!paramOpt.matchRegExp[i].test(input)) {
          sendError(res, opt.scope, k, invalidValueMessage(input), 'matchRegExp: #' + i + ', ' + paramOpt.matchRegExp[i]);
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
          sendError(res, opt.scope, k, invalidValueMessage(input), 'isIn: ' + paramOpt.isIn);
          return false;
        }
      }

      // Check value - notIn
      for (var i = 0; i < paramOpt.notIn.length; i++) {
        if (input == paramOpt.notIn[i]) {
          sendError(res, opt.scope, k, invalidValueMessage(input), 'notIn: ' + paramOpt.notIn);
          return false;
        }
      }

      // Check value - isInteger
      if (isSetted(paramOpt.isInteger) && isInteger(input) !== paramOpt.isInteger) {
        sendError(res, opt.scope, k, invalidValueMessage(input), 'isInteger');
        return false;
      }

      // Check value - max
      if (isSetted(paramOpt.max) && input > paramOpt.max) {
        sendError(res, opt.scope, k, invalidValueMessage(input), 'max, ' + paramOpt.max);
        return false;
      }

      // Check value - min
      if (isSetted(paramOpt.min) && input < paramOpt.min) {
        sendError(res, opt.scope, k, invalidValueMessage(input), 'min, ' + paramOpt.min);
        return false;
      }
    }

    // Check OK
    next();
  }

  return middleware;
};

module.exports.DEBUG_ENABLED  = false;
module.exports.sendError      = sendError;
module.exports.requestChecker = requestChecker;
