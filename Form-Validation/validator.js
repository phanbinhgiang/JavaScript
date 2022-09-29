function Validator(options) {
  var selectorRules = {};

  var formElement = document.querySelector(options.form);
  if (formElement) {
    formElement.onsubmit = function (e) {
      e.preventDefault();
      var isFormValid = true;

      options.rules.forEach(function (rule) {
        var inputElement = document.querySelector(rule.selector);
        var isValid = validate(inputElement, rule, selectorRules);
        if (isValid) {
          isFormValid = false;
        }
      });

      if (isFormValid) {
        if (typeof options.onSubmit === 'function') {
          var enableInput = formElement.querySelectorAll('[name]');
          var formValues = Array.from(enableInput).reduce(function (values, input) {
            values[input.name] = input.value;
            return values;
          }, {});
          options.onSubmit(formValues);
        } else {
          formElement.submit();
        }
      }
    };

    options.rules.forEach(function (rule) {
      if (Array.isArray(selectorRules[rule.selector])) {
        selectorRules[rule.selector].push(rule.test);
      } else {
        selectorRules[rule.selector] = [rule.test];
      }

      var inputElement = document.querySelector(rule.selector);
      if (inputElement) {
        inputElement.onblur = function () {
          validate(inputElement, rule);
        };

        inputElement.oninput = function () {
          var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(
            options.errorSelector,
          );
          errorElement.innerText = '';
          getParent(inputElement, options.formGroupSelector).classList.remove('invalid');
        };
      }
    });
  }

  function validate(inputElement, rule) {
    var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(
      '.form-message',
    );

    var rules = selectorRules[rule.selector];

    for (var i = 0; i < rules.length; i++) {
      switch (inputElement.type) {
        case 'radio':
          errorMessage = rules[i](inputElement.value);
          break;
        case 'checkbox':
          errorMessage = rules[i](inputElement.value);
          break;
        default:
          errorMessage = rules[i](inputElement.value);
      }

      if (errorMessage) {
        break;
      }
    }

    if (errorMessage) {
      errorElement.innerText = errorMessage;
      getParent(inputElement, options.formGroupSelector).classList.add('invalid');
    } else {
      errorElement.innerText = '';
      getParent(inputElement, options.formGroupSelector).classList.remove('invalid');
    }
    return errorMessage;
  }

  function getParent(element, selector) {
    while (element.parentElement) {
      if (element.parentElement.matches(selector)) {
        return element.parentElement;
      }
      element = element.parentElement;
    }
  }
}

Validator.isRequired = function (selector, message) {
  return {
    selector: selector,
    test: function (value) {
      return value.trim() ? undefined : message || 'Vui long nhap truong nay';
    },
  };
};

Validator.isEmail = function (selector, message) {
  return {
    selector: selector,
    test: function (value) {
      var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      return regex.test(value) ? undefined : message || 'Truong nay phai la email';
    },
  };
};

Validator.minLength = function (selector, min, message) {
  return {
    selector: selector,
    test: function (value) {
      return value.length >= min ? undefined : message || `Vui long nhap toi thieu ${min} ki tu`;
    },
  };
};

Validator.isConfirmed = function (selector, getConfirmValue, message) {
  return {
    selector: selector,
    test: function (value) {
      return value === getConfirmValue()
        ? undefined
        : message || 'Gia tri nhap vao khong chinh xac';
    },
  };
};
