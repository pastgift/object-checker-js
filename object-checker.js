'use strict'

var _checkers = {
  $assertTrue: function(v, func) {
    return func(v) == true;
  },
  $assertFalse: function(v, func) {
    return func(v) == false;
  },
  $notEmptyString: function(v, flg) {
    if (typeof v != 'string') {
      return false;
    }
    return flg == (v.length > 0);
  },
  $isInteger: function(v, flg) {
    var reInteger = /^-?\d+$/;
    return flg == reInteger.test(v);
  },
  $isPositiveZeroInteger: function(v, flg) {
    var rePositiveZeroInteger = /^\d+$/;
    return flg == rePositiveZeroInteger.test(v);
  },
  $isPositiveInteger: function(v, flg) {
    var rePositiveInteger = /^[0-9]*[1-9][0-9]*$/;
    return flg == rePositiveInteger.test(v);
  },
  $isNegativeZeroInteger: function(v, flg) {
    var reNegativeZeroInteger = /^((-\d+)|(0+))$/;
    return flg == reNegativeZeroInteger.test(v);
  },
  $isNegativeInteger: function(v, flg) {
    var reNegativeInteger = /^-[0-9]*[1-9][0-9]*$/;
    return flg == reNegativeInteger.test(v);
  },
  $minValue: function(v, minValue) {
    if (typeof v != 'number') {
      return false;
    }
    return v >= minValue;
  },
  $maxValue: function(v, maxValue) {
    if (typeof v != 'number') {
      return false;
    }
    return v <= maxValue;
  },
  $isValue: function(v, value) {
    return v == value;
  },
  $in: function(v, inRange) {
    for (var i in inRange) {
      if (inRange[i] == v) {
        return true;
      }
    }
    return false;
  },
  $notIn: function(v, inRange) {
    for (var i in inRange) {
      if (inRange[i] == v) {
        return false;
      }
    }
    return true;
  },
  $minLength: function(v, minLength) {
    if ((typeof v != 'string') && (!Array.isArray(v))) {
      return false;
    }
    return v.length >= minLength;
  },
  $maxLength: function(v, maxLength) {
    if ((typeof v != 'string') && (!Array.isArray(v))) {
      return false;
    }
    return v.length <= maxLength;
  },
  $isLength: function(v, length) {
    if ((typeof v != 'string') && (!Array.isArray(v))) {
      return false;
    }
    return v.length == length;
  },
  $isEmail: function(v, flg) {
    var reEmail = /^(?:[a-z\d]+[_\-\+\.]?)*[a-z\d]+@(?:([a-z\d]+\-?)*[a-z\d]+\.)+([a-z]{2,})+$/i;
    return flg == reEmail.test(v);
  },
  $matchRegExp: function(v, regExp) {
    return regExp.test(v);
  },
  $notMatchRegExp: function(v, regExp) {
    return !regExp.test(v);
  }
}

exports.messageTemplate = {
  invalid: "Field `{{fieldName}}` value `{{fieldValue}}` is not valid. ({{checkerName}} = {{checkerOption}})",
  missing: "Field `{{fieldName}}` is missing.",
  unexpected: "Found unexpected field `{{fieldName}}`"
};

exports.createErrorMessage = function(e, messageTemplate) {
  var errorMessage = messageTemplate[e.type];
  if (errorMessage) {
    errorMessage = errorMessage.replace(/\{\{fieldName\}\}/g,  e.fieldName);
  } else {
    errorMessage = e.toString();
  }
  
  if (e.type == 'invalid') {
    errorMessage = errorMessage.replace(/\{\{fieldValue\}\}/g, JSON.stringify(e.fieldValue));
    errorMessage = errorMessage.replace(/\{\{checkerName\}\}/g, e.checkerName.slice(1));
    errorMessage = errorMessage.replace(/\{\{checkerOption\}\}/g, e.checkerOption);
  }
  return errorMessage;
};

exports.errorHandler = function(err, req, res, next) {
  var message = exports.createErrorMessage(err, exports.template);
  res.send(message);
};

var _isValid = function(objName, obj, options) {
  if (typeof obj == 'object' && typeof obj != 'undefined' && obj != null) {
    for (var objKey in obj) {
      if (!(objKey in options) && !/^\d+$/.test(objKey)) {
        var e = new Error();
        e.type = 'unexpected';
        e.fieldName = objKey;
        throw e;
      }
    }
  }
  
  if ((options.$isOptional == true) && (typeof obj == 'undefined')) {
    return;
  }

  if (typeof obj == 'undefined') {
    var e = new Error();
    e.type = 'missing';
    e.fieldName = objName;
    throw e;
  }

  for (var optionKey in options) {
    var option = options[optionKey];

    if (optionKey in _checkers) {
      var checkResult = _checkers[optionKey](obj, option);
      if (checkResult == false) {
        var e = new Error();
        e.type = 'invalid';
        e.fieldName = objName;
        e.fieldValue = obj;
        e.checkerName = optionKey;
        e.checkerOption = option;
        throw e
      }
    } else {
      if (optionKey == '$isOptional') {
        // no op
      } else if (optionKey == '$') {
        for (var i in obj) {
          var element = obj[i];
          _isValid(objName + '[' + i + ']', element, option);
        }
      } else {
        _isValid(optionKey, obj[optionKey], option);
      }
    }
  }
};

exports.isValidObject = function(obj, options) {
  try {
    _isValid('obj', obj, options);
  } catch (error) {
    console.log('error:', exports.createErrorMessage(error, exports.messageTemplate));
    return false;
  }
  return true;
};

exports.checkObject = function(obj, options) {
  var ret = {
    isValid: true,
    message: null
  }

  try {
    _isValid('obj', obj, options);
  } catch (error) {
    ret.isValid = false;
    ret.message = exports.createErrorMessage(error, exports.messageTemplate);
  }
  return ret;
};

exports.bodyCheckMiddleware = function(options) {
  var middleware = function(req, res, next) {
    var checkTarget = req.body;
    var checkOptions = options;
    try {
      _isValid('req.body', checkTarget, checkOptions);
    } catch (error) {
      exports.errorHandler(error, req, res, next);
      return;
    }
    next();
  }

  return middleware;
}
