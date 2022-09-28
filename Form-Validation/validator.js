function Validator(options) {
  var selectorRules = {};

  var formElement = document.getElementById(options.form);
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
          validate(inputElement, rule, selectorRules);
        };

        inputElement.oninput = function () {
          var errorElement = inputElement.parentElement.querySelector('.form-message');
          errorElement.innerText = '';
          inputElement.parentElement.classList.remove('invalid');
        };
      }
    });
  }
}

function validate(inputElement, rule, selectorRules) {
  var errorElement = inputElement.parentElement.querySelector('.form-message');

  var rules = selectorRules[rule.selector];

  for (var i = 0; i < rules.length; i++) {
    errorMessage = rules[i](inputElement.value);
    if (errorMessage) {
      break;
    }
  }

  if (errorMessage) {
    errorElement.innerText = errorMessage;
    inputElement.parentElement.classList.add('invalid');
  } else {
    errorElement.innerText = '';
    inputElement.parentElement.classList.remove('invalid');
  }
  return errorMessage;
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
