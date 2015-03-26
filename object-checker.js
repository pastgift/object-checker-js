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
  }
}

var _isValid = function(obj, options) {
  console.log('>>>', obj, options);
  if ((options.$isOptional == true) && (typeof obj == 'undefined')) {
    return;
  }

  for (var optionKey in options) {
    var option = options[optionKey];

    if (optionKey in _checkers) {
      var checkResult = _checkers[optionKey](obj, option);
      if (checkResult == false) {
        var errorMessage = "";
        errorMessage += "Param value `" + JSON.stringify(obj) + "` is not valid. ";
        errorMessage += "(" + optionKey.slice(1) + " = " + option + ")";
        console.log(errorMessage);
        throw new Error(errorMessage);
      }
    } else {
      if (optionKey == '$isOptional') {
        // no op
      } else if (optionKey == '$') {
        for (var i in obj) {
          var element = obj[i];
          _isValid(element, option);
        }
      } else {
        _isValid(obj[optionKey], option);
      }
    }
  }
};

exports.isValidObject = function(obj, options) {
  try {
    _isValid(obj, options);
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
    _isValid(obj, options);
  } catch (error) {
    ret.isValid = false;
    ret.message = error.message;
  }
  return ret;
};

exports.bodyCheckMiddleware = function(options) {
  middleware = function(req, res, next) {
    var checkTarget = req.body;
    var checkOptions = options;
    try {
      _isValid(checkTarget, checkOptions);
    } catch (error) {
      res.send(error.message);
      return;
    }
    next();
  }

  return middleware;
}