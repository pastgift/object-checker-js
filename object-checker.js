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
        case 'string':
          return 'string' === typeof v;

        case 'number':
        case 'float':
          return 'number' === typeof v;

        case 'int':
          var reInteger = /^-?\d+$/;
          return 'number' === typeof v && reInteger.test(v);

        case 'array':
          return Array.isArray(v);

        case 'json':
        case 'object':
          return 'object' === typeof v;

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
      var reInteger = /^-?\d+$/;
      return flg === reInteger.test(v);
    },

    $isPositiveZeroInteger: function(v, flg) {
      var rePositiveZeroInteger = /^\d+$/;
      return flg === rePositiveZeroInteger.test(v);
    },

    $isPositiveIntegerOrZero: function(v, flg) {
      var rePositiveZeroInteger = /^\d+$/;
      return flg === rePositiveZeroInteger.test(v);
    },

    $isPositiveInteger: function(v, flg) {
      var rePositiveInteger = /^[0-9]*[1-9][0-9]*$/;
      return flg === rePositiveInteger.test(v);
    },

    $isNegativeZeroInteger: function(v, flg) {
      var reNegativeZeroInteger = /^((-\d+)|(0+))$/;
      return flg === reNegativeZeroInteger.test(v);
    },

    $isNegativeIntegerOrZero: function(v, flg) {
      var reNegativeZeroInteger = /^((-\d+)|(0+))$/;
      return flg === reNegativeZeroInteger.test(v);
    },

    $isNegativeInteger: function(v, flg) {
      var reNegativeInteger = /^-[0-9]*[1-9][0-9]*$/;
      return flg === reNegativeInteger.test(v);
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

  /* Configurable */
  var defaultRequired = true;

  var messageTemplate = {
    invalid: "Field `{{fieldName}}` value `{{fieldValue}}` is not valid. ({{checkerName}} = {{checkerOption}})",
    missing: "Field `{{fieldName}}` is missing.",
    unexpected: "Found unexpected field `{{fieldName}}`"
  };

  var customDirectives = {};

  /* Functional methods */
  function setDefaultRequired(required) {
    defaultRequired = required;
  };

  function createErrorMessage(e, messageTemplate) {
    var errorMessage = messageTemplate[e.type];
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

  function isValidObject(obj, options) {
    try {
      var checker = createObjectChecker({
        customDirectives: customDirectives,
        messageTemplate : messageTemplate,
      });
      checker.isValid('obj', obj, options);
    } catch (error) {
      console.log('error:', createErrorMessage(error, messageTemplate));
      return false;
    }
    return true;
  };

  function checkObject(obj, options) {
    var ret = {
      isValid: true,
      message: null
    }

    try {
      var checker = createObjectChecker({
        customDirectives: customDirectives,
        messageTemplate : messageTemplate,
      });
      checker.isValid('obj', obj, options);
    } catch (error) {
      ret.isValid = false;
      ret.message = createErrorMessage(error, messageTemplate);
    }
    return ret;
  };

  function bodyCheckMiddleware(options) {
    return function(req, res, next) {
      var checkTarget = req.body;
      var checkOptions = options;
      try {
        var checker = createObjectChecker({
          customDirectives: customDirectives,
          messageTemplate : messageTemplate,
        });
        checker.isValid('req.body', checkTarget, checkOptions);
      } catch (error) {
        errorHandler(error, req, res, next);
        return;
      }
      next();
    }
  };

  /**
   * ObjectChecker
   * @param {Object} options - ObjectCheck options
   * @param {Object} [options.customDirectives]
   * @param {Object} [options.messageTemplate]
   */
  function ObjectChecker(options) {
    this.defaultRequired  = defaultRequired;
    this.customDirectives = options.customDirectives || customDirectives;
    this.messageTemplate  = options.messageTemplate  || messageTemplate;

    if ('undefined' !== typeof options.defaultRequired) {
      this.defaultRequired = options.defaultRequired;
    }
  };

  ObjectChecker.prototype.isValid = function(objName, obj, options) {
    options = options || {};

    if (options.$skip === true || (options.$type || '').toLowerCase() === 'any') {
      return;
    }

    if (typeof obj === 'object' && typeof obj != 'undefined' && obj != null) {
      for (var objKey in obj) {
        if (!(objKey in options) && !('$' in options && Array.isArray(obj))) {
          var e = new Error();
          e.type = 'unexpected';
          e.fieldName = objKey;
          throw e;
        }
      }
    }

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
      e.fieldName = objName;
      throw e;
    }

    for (var optionKey in options) {
      var option = options[optionKey];

      var hasOption = false;
      var checkFunc = null;
      if (optionKey in DIRECTIVES)            hasOption = true, checkFunc = DIRECTIVES[optionKey];
      if (optionKey in customDirectives)      hasOption = true, checkFunc = customDirectives[optionKey];
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
            this.isValid(objName + '[' + i + ']', element, option);
          }
        } else {
          this.isValid(optionKey, obj[optionKey], option);
        }
      }
    }
  };

  ObjectChecker.prototype.errorHandler = function (err, req, res, next) {
    var message = createErrorMessage(err, this.messageTemplate);
    res.send(message);
  };

  ObjectChecker.prototype.isValidObject = function(obj, options) {
    try {
      this.isValid('obj', obj, options);
    } catch (error) {
      console.log('error:', createErrorMessage(error, this.messageTemplate));
      return false;
    }
    return true;
  };

  ObjectChecker.prototype.checkObject = function(obj, options) {
    var ret = {
      isValid: true,
      message: null
    }

    try {
      this.isValid('obj', obj, options);
    } catch (error) {
      ret.isValid = false;
      ret.message = createErrorMessage(error, this.messageTemplate);
    }
    return ret;
  };

  ObjectChecker.prototype.bodyCheckMiddleware = function(options) {
    return function(req, res, next) {
      var checkTarget = req.body;
      var checkOptions = options;
      try {
        this.isValid('req.body', checkTarget, checkOptions);
      } catch (error) {
        this.errorHandler(error, req, res, next);
        return;
      }
      next();
    }
  };

  function createObjectChecker(options) {
    return new ObjectChecker(options);
  };

  var objectChecker = {
    messageTemplate    : messageTemplate,
    customDirectives   : customDirectives,
    setDefaultRequired : setDefaultRequired,
    createErrorMessage : createErrorMessage,
    isValidObject      : isValidObject,
    checkObject        : checkObject,
    bodyCheckMiddleware: bodyCheckMiddleware,
    ObjectChecker      : ObjectChecker,
    createObjectChecker: createObjectChecker,
  };

  return objectChecker;
}));
