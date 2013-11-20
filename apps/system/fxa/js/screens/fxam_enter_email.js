/**
 * Module checks the validity of an email address, and if valid,
 * determine which screen to go to next.
 */

FxaModuleEnterEmail = (function() {
  'use strict';

  var _ = navigator.mozL10n.get;

  function _isEmailValid(emailEl) {
    return emailEl && emailEl.value && emailEl.validity.valid;
  }

  function _loadSignIn(done) {
    done(FxaModuleStates.ENTER_PASSWORD);
  }

  function _loadSignUp(done) {
    done(FxaModuleStates.SET_PASSWORD);
  }

  function _enableNext(emailEl) {
    if (_isEmailValid(emailEl)) {
      // document.querySelector('.right').removeAttribute('disabled');
      // FxaModuleUI.enableNextButton();
    } else {
      // document.querySelector('.right').setAttribute('disabled', 'disabled');
      //FxaModuleUI.disableNextButton();
    }
  }

  var Module = Object.create(FxaModule);
  Module.init = function() {
    this.initNav();
    // Blocks the navigation until check the condition
    _enableNext(this.fxaEmailInput);

    // Cache HTML elements
    this.importElements('fxa-email-input');
    // Add listeners
    this.fxaEmailInput.addEventListener(
      'input',
      function onInput(event) {
        _enableNext(event.target);
      }, false
    );

    var self = this;
    this.onChange('email', function(email) {
      if (email)
        self.fxaEmailInput.value = email;
    });
  };

  Module.onNext = function onNext(gotoNextStepCallback) {
    FxaModuleOverlay.show(_('fxa-connecting-to-firefox'));

    var email = this.fxaEmailInput.value;

    var self = this;
    FxModuleServerRequest.checkEmail(
      email,
      function onServerResponse(response) {
        FxaModuleOverlay.hide();
        FxaModuleManager.setParam('email', email);
        self.set('email', email);
        if (response.registered) {
          _loadSignIn(gotoNextStepCallback);
        } else {
          _loadSignUp(gotoNextStepCallback);
        }
      },
      function onNetworkError() {
        FxaModuleOverlay.hide();
        FxaModuleErrorOverlay.show(
          _('fxa-checking-email-error-title'),
          _('fxa-checking-email-error-message'));
      }
    );
  };

  return Module;

}());

FxaModuleEnterEmail.init();
