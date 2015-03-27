'use strict'

var _checkers = {
  $assertTrue: function(v, func) {
    return func(v) == true;
  },
  $assertFalse: function(v, func) {
    return func(v) == false;
  },
  $notEmptyString: function(v, flg) {
    return flg == ((v + "").length > 0);
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
    return v >= minValue;
  },
  $maxValue: function(v, maxValue) {
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
    return v.length >= minLength;
  },
  $maxLength: function(v, maxLength) {
    return v.length <= maxLength;
  },
  $isLength: function(v, length) {
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

exports.errorHandler = function(err, req, res, next) {
  res.send(err.message);
};

exports.invalidMessage = "Field `{{fieldName}}` value `{{fieldValue}}` is not valid. ({{checkerName}} = {{checkerOption}})"
exports.unexpectedMessage = "Found unexpected field `{{fieldName}}`"

var _isValid = function(objName, obj, options) {
  if (typeof obj == 'object' && typeof obj != 'undefined' && obj != null) {
    for (var objKey in obj) {
      if (!(objKey in options)) {
        var errorMessage = exports.unexpectedMessage;
        errorMessage = errorMessage.replace(/\{\{fieldName\}\}/g,  objKey);
        throw new Error(errorMessage);
      }
    }
  }
  
  if ((options.$isOptional == true) && (typeof obj == 'undefined')) {
    return;
  }

  for (var optionKey in options) {
    var option = options[optionKey];

    if (optionKey in _checkers) {
      var checkResult = _checkers[optionKey](obj, option);
      if (checkResult == false) {
        var errorMessage = exports.invalidMessage;
        errorMessage = errorMessage.replace(/\{\{fieldName\}\}/g,  objName);
        errorMessage = errorMessage.replace(/\{\{fieldValue\}\}/g, JSON.stringify(obj));
        errorMessage = errorMessage.replace(/\{\{checkerName\}\}/g, optionKey.slice(1));
        errorMessage = errorMessage.replace(/\{\{checkerOption\}\}/g, option);
        console.log(errorMessage);
        throw new Error(errorMessage);
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
    console.log('error:', error.message);
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
    ret.message = error.message;
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
