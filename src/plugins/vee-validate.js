import VeeValidate from 'vee-validate';
import Vue from 'vue'


// Overriding config for vee-validate to remove fields warning
const config = {
    fieldsBagName: 'field',
    events: 'input',
};

VeeValidate.use(({ ErrorBag }) => {
  // get the original method.
  const first = ErrorBag.prototype.first;
  ErrorBag.prototype.first = function(...args) {
    // call it after binding it to the error bag instance.
    const msg = first.bind(this)(...args);
    // if there is a message returned, change the style.
    if (msg) {
      // checking if this message was from SLD Form
      var messageFromSLD = msg.search("Inverter Count|Number Of Strings|Number Of Modules");
      // if it is from SLD replacing the numbers used as name for validation
      if (messageFromSLD !== -1) {
        var patternToReplace = /[0-9][0-9][0-9]|[0-9][0-9]/;
        return msg.replace(patternToReplace, '');
      }
    }

    return msg;
  };
});

Vue.use(VeeValidate, config);

VeeValidate.Validator.extend('above_zero', {
  validate: (value) => {
    return value > 0;
  },
  getMessage: (field) => {
    return 'The ' + field + ' field must be above 0.';
  }
});