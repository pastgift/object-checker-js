'use strict'

var isSetted = function(obj) {
  if (typeof obj !== 'undefined' && obj !== null) {
    return true;
  }
  else {
    return false;
  }
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
	isOptional: false,
	matchRegExp: null
      };

      var paramOptions = reqOptions.params[k];
      if (typeof paramOptions === 'object' && isSetted(paramOptions)) {
	if (typeof paramOptions.isOptional == 'boolean') {
	  fullParamOptions.isOptional = paramOptions.isOptional;
	}

	// TODO: Check RegExp object
	if (typeof paramOptions.matchRegExp == 'object' && isSetted(paramOptions.matchRegExp)) {
	  fullParamOptions.matchRegExp = paramOptions.matchRegExp;
	}
      }

      fullReqOptions.params[k] = fullParamOptions;
    }
  }

  return fullReqOptions;
}

var sendError = function(res, scopeOption, paramName, errorMessage) {
  var response = '[ParamsPicker]';
  response += ' Scope: `' + scopeOption + '`';
  response += ', Param: `' + paramName + '`';
  response += ', Error:' + errorMessage;

  res.send(response);
};

var middlewareCreator = function(reqOptions) {
  var middleware = function(req, res, next) {
    var opt = completeOptions(reqOptions);

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

      // Check value - matchRegExp.
      if (isSetted(paramOpt.matchRegExp) && !paramOpt.matchRegExp.test(input)) {
        sendError(res, opt.scope, k, 'Invalid value, `' + input + '` not match `' + paramOpt.matchRegExp + '`');
        return false;
      }

      // TODO: Other check method
    }

    // Strict check
    if (opt.strict) {
      for (var k in req[opt.scope]) {
        if (!isSetted(opt.params[k])) {
          sendError(res, opt.scope, k, 'Unexpected parameter');
          return false;
        }
      }
    }

    // Check OK
    next();
  }

  return middleware;
};

module.exports = middlewareCreator;
