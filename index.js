'use strict'

var sendError = function(res, scopeOption, paramName, errorMessage) {
  var response = '[ParamsPicker]';
  response += ' Scope: `' + scopeOption + '`';
  response += ', Param: `' + paramName + '`';
  response += ', Error:' + errorMessage;
  
  res.send(response);
};

var middlewareCreator = function(options) {
  var middleware = function(req, res, next) {
    var scopeOption = 'query';
    if (typeof options.scope === 'string') {
      if (options.scope === 'query' || options.scope === 'body') {
        scopeOption = options.scope;
      }
    }

    var strictOption = true;
    if (typeof options.strict === 'boolean') {
      strictOption = options.strict;
    }

    var paramsOption = {};
    if (typeof options.params !== 'undefined' && options.params !== null) {
      paramsOption = options.params;
    }

    for (var paramName in paramsOption) {
      var option = {};
      if (paramsOption[paramName] !== null) {
	option = paramsOption[paramName];
      }

      var isOptional = false;
      if (typeof option.isOptional === 'boolean') {
        isOptional = option.isOptional;
      }

      var input = req[scopeOption][paramName];
      var isExisted = (typeof input !== 'undefined' && input !== null);

      // Check existing.
      if(!isExisted) {
        if (isOptional) {
          continue;
        }
        else {
          sendError(res, scopeOption, paramName, 'Missing parameter.');
          return false;
        }
      }
      
      // Check value.
      if (option !== null && typeof option.matchRegExp !== 'undefined' && option.matchRegExp !== null) {
        if (!option.matchRegExp.test(input)) {
          sendError(res, scopeOption, paramName, 'Invalid value, `' + input + '` not match `' + option.matchRegExp + '`');
          return false;
        }
      }
    }

    // Strict check
    if (strictOption === true) {
      for (var reqParamName in req[scopeOption]) {
        if (typeof paramsOption[reqParamName] === 'undefined') {
          sendError(res, scopeOption, reqParamName, 'Unexpected parameter');
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
