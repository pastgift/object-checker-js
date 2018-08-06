(function (global, factory) {
      typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
      typeof define === 'function' && define.amd ? define(factory) :
      (global.objectChecker = factory());
}(this, function () { 'use strict';

  var _validator = typeof require === 'function' ? require('validator') : validator;

  var VALIDATOR_LABEL = '$validator$';
  var DIRECTIVES = {
    // New directives
    $type: function(v, t) {
      switch (t.toLowerCase()) {
        case 'str':
        case 'string':
          return 'string' === typeof v;

        case 'num':
        case 'number':
        case 'float':
          return 'number' === typeof v;

        case 'int':
        case 'integer':
          var re = /^(-?[1-9][0-9]*)|0$/;
          return 'number' === typeof v && re.test(v);

        case 'arr':
        case 'array':
          return Array.isArray(v);

        case 'json':
        case 'obj':
        case 'object':
          return 'object' === typeof v;

        case 'jsonstring':
          try {
            JSON.parse(v)
            return true
          } catch(ex) {
            return false
          }

        default:
          return true;
      }
    },

    // Directives before v0.3.24
    $assertTrue: function(v, func) {
      return func(v) === true;
    },

    $assertFalse: function(v, func) {
      return func(v) === false;
    },

    $notEmptyString: function(v, flg) {
      if (typeof v != 'string') {
        return false;
      }
      return flg === (v.length > 0);
    },

    $isInteger: function(v, flg) {
      var re = /^(-?[1-9][0-9]*)|0$/;
      return flg === re.test(v);
    },

    $isPositiveZeroInteger: function(v, flg) {
      var re = /^([1-9][0-9]*)|0$/;
      return flg === re.test(v);
    },

    $isPositiveIntegerOrZero: function(v, flg) {
      var re = /^([1-9][0-9]*)|0$/;
      return flg === re.test(v);
    },

    $isPositiveInteger: function(v, flg) {
      var re = /^[1-9][0-9]*$/;
      return flg === re.test(v);
    },

    $isNegativeZeroInteger: function(v, flg) {
      var re = /^(-[1-9][0-9]*)|0$/;
      return flg === re.test(v);
    },

    $isNegativeIntegerOrZero: function(v, flg) {
      var re = /^(-[1-9][0-9]*)|0$/;
      return flg === re.test(v);
    },

    $isNegativeInteger: function(v, flg) {
      var re = /^-[1-9][0-9]*$/;
      return flg === re.test(v);
    },

    $minValue: function(v, minValue) {
      if (typeof v != 'number') {
        v = parseFloat(v);
      }
      return v >= minValue;
    },

    $maxValue: function(v, maxValue) {
      if (typeof v != 'number') {
        v = parseFloat(v);
      }
      return v <= maxValue;
    },

    $isValue: function(v, value) {
      return v === value;
    },

    $in: function(v, inRange) {
      for (var i in inRange) {
        if (inRange[i] === v) {
          return true;
        }
      }
      return false;
    },

    $notIn: function(v, inRange) {
      for (var i in inRange) {
        if (inRange[i] === v) {
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
      return v.length === length;
    },

    $isEmail: function(v, flg) {
      return flg === _validator.isEmail(v);
    },

    $matchRegExp: function(v, regExp) {
      if ('string' === typeof(regExp)) {
        regExp = new RegExp(regExp);
      }
      return regExp.test(v);
    },

    $notMatchRegExp: function(v, regExp) {
      if ('string' === typeof(regExp)) {
        regExp = new RegExp(regExp);
      }
      return !regExp.test(v);
    }
  };

  /* Functional methods */
  function createErrorMessage(e, template) {
    var errorMessage = template[e.type];
    if (errorMessage) {
      errorMessage = errorMessage.replace(/\{\{fieldName\}\}/g,  e.fieldName);
    } else {
      errorMessage = e.toString();
    }

    if (e.type === 'invalid') {
      errorMessage = errorMessage.replace(/\{\{fieldValue\}\}/g, JSON.stringify(e.fieldValue));
      errorMessage = errorMessage.replace(/\{\{checkerName\}\}/g, e.checkerName.slice(1));
      errorMessage = errorMessage.replace(/\{\{checkerOption\}\}/g, e.checkerOption);
    }
    return errorMessage;
  };

  /**
   * ObjectChecker
   * @param {Object} options - ObjectCheck options
   * @param {Object} [options.defaultRequired]
   * @param {Object} [options.customDirectives]
   * @param {Object} [options.messageTemplate]
   */
  function ObjectChecker(options) {
    if (options.defaultRequired !== true && options.defaultRequired !== false) {
      this.defaultRequired = true;
    } else {
      this.defaultRequired = options.defaultRequired;
    }

    this.messageTemplate = options.messageTemplate || {
      invalid   : "Field `{{fieldName}}` value `{{fieldValue}}` is not valid. ({{checkerName}} = {{checkerOption}})",
      missing   : "Field `{{fieldName}}` is missing.",
      unexpected: "Found unexpected field `{{fieldName}}`"
    };

    this.customDirectives = options.customDirectives || {};
  };

  ObjectChecker.prototype.verify = function(obj, options, objName) {
    options = options || {};

    if (this.defaultRequired === true
        && (options.$isOptional || options.$optional) === true
        && typeof obj === 'undefined') {
      return;
    }

    if (this.defaultRequired === false
        && (options.$isRequired || options.$required) !== true
        && typeof obj === 'undefined') {
      return;
    }

    if ((options.$allowNull === true) && (obj === null)) {
      return;
    }

    if (typeof obj === 'undefined') {
      var e = new Error();
      e.type = 'missing';
      e.fieldName = objName || 'obj';
      throw e;
    }

    var objType = (options.$type + '').toLowerCase();
    if (options.$skip === true || objType === 'any' || objType === '*') {
      return;
    }

    if (typeof obj === 'object' && typeof obj != 'undefined' && obj != null
      && objType !== 'json' && objType !== 'obj' && objType !== 'object') {
      for (var objKey in obj) {
        if (!(objKey in options) && !('$' in options && Array.isArray(obj))) {
          var e = new Error();
          e.type = 'unexpected';
          e.fieldName = objKey;
          throw e;
        }
      }
    }

    for (var optionKey in options) {
      var option = options[optionKey];

      var hasOption = false;
      var checkFunc = null;
      if (optionKey in DIRECTIVES)            hasOption = true, checkFunc = DIRECTIVES[optionKey];
      if (optionKey in this.customDirectives) hasOption = true, checkFunc = this.customDirectives[optionKey];

      if (hasOption) {
        if (!checkFunc) continue;

        var checkResult = checkFunc(obj, option);
        if (checkResult === false) {
          var e = new Error();
          e.type = 'invalid';
          e.fieldName = objName;
          e.fieldValue = obj;
          e.checkerName = optionKey;
          e.checkerOption = option;
          throw e
        }
      } else if (optionKey.slice(0, VALIDATOR_LABEL.length) === VALIDATOR_LABEL) {
        var validatorFuncName = optionKey.slice(VALIDATOR_LABEL.length);
        var validatorAssert   = 'undefined' === typeof option.assert ? true : option.assert;
        var validatorOptions  = option.options || [];
        if (!Array.isArray(validatorOptions)) {
          validatorOptions = [validatorOptions];
        }
        var checkResult = _validator[validatorFuncName].apply(_validator, [obj].concat(validatorOptions));
        if (checkResult != validatorAssert) {
          var e = new Error();
          e.type = 'invalid';
          e.fieldName = objName;
          e.fieldValue = obj;
          e.checkerName = optionKey;
          e.checkerOption = JSON.stringify(option);
          throw e
        }
      } else {
        if (['$isOptional', '$optional', '$isRequired', '$required', '$allowNull'].indexOf(optionKey) > -1) {
          // no op
        } else if (optionKey === '$') {
          for (var i in obj) {
            var element = obj[i];
            this.verify(element, option, objName + '[' + i + ']');
          }
        } else {
          this.verify(obj[optionKey], option, optionKey);
        }
      }
    }
  };

  ObjectChecker.prototype.isValid = function(obj, options) {
    try {
      this.verify(obj, options, 'obj');
    } catch (error) {
      return false;
    }
    return true;
  };

  ObjectChecker.prototype.check = function(obj, options) {
    var ret = {
      isValid: true,
      message: null
    }

    try {
      this.verify(obj, options, 'obj');

    } catch (error) {
      ret.isValid = false;
      ret.message = createErrorMessage(error, this.messageTemplate);
    }

    return ret;
  };

  ObjectChecker.prototype.expressErrorHandler = function (err, req, res, next) {
    var message = createErrorMessage(err, this.messageTemplate);
    res.send(message);
  };

  ObjectChecker.prototype.expressBodyCheckMiddleware = function(options) {
    return function(req, res, next) {
      var checkTarget = req.body;
      var checkOptions = options;
      try {
        this.verify(checkTarget, checkOptions, 'req.body');
      } catch (error) {
        this.expressErrorHandler(error, req, res, next);
        return;
      }
      next();
    }
  };

  function createObjectChecker(options) {
    return new ObjectChecker(options || {});
  };

  var objectChecker = {
    createErrorMessage : createErrorMessage,
    ObjectChecker      : ObjectChecker,
    createObjectChecker: createObjectChecker,
  };

  return objectChecker;
}));
