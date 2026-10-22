/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
    var __webpack_exports__ = {};
    /*!****************************************************************!*\
      !*** ../demo1/src/js/custom/authentication/sign-up/general.js ***!
      \****************************************************************/


    // Class definition
    var KTSignupGeneral = function () {
        // Elements
        var form;
        var submitButton;
        var validator;
        var passwordMeter;

        // Handle form
        var handleForm = function (e) {
            // Init form validation rules. For more info check the FormValidation plugin's official documentation:https://formvalidation.io/
            validator = FormValidation.formValidation(
                form,
                {
                    fields: {
                        'firstName': {
                            validators: {
                                notEmpty: {
                                    message: 'First Name is required'
                                }
                            }
                        },
                        'lastName': {
                            validators: {
                                notEmpty: {
                                    message: 'Last Name is required'
                                }
                            }
                        },
                        'userName': {
                            validators: {
                                notEmpty: {
                                    message: 'Username is required'
                                }
                            }
                        },
                        'email': {
                            validators: {
                                notEmpty: {
                                    message: 'Email address is required'
                                },
                                emailAddress: {
                                    message: 'The value is not a valid email address'
                                }
                            }
                        },
                        'password': {
                            validators: {
                                notEmpty: {
                                    message: 'The password is required'
                                },
                                callback: {
                                    message: 'Please enter a strong password',
                                    callback: function (input) {
                                        if (input.value.length > 0) {
                                            return validatePassword();
                                        }
                                    }
                                }
                            }
                        },
                        'confirmPassword': {
                            validators: {
                                notEmpty: {
                                    message: 'The password confirmation is required'
                                },
                                identical: {
                                    compare: function () {
                                        return form.querySelector('[name="password"]').value;
                                    },
                                    message: 'The password and its confirm are not the same'
                                }
                            }
                        },
                        'toc': {
                            validators: {
                                notEmpty: {
                                    message: 'You must accept the terms and conditions'
                                }
                            }
                        }
                    },
                    plugins: {
                        trigger: new FormValidation.plugins.Trigger({
                            event: {
                                password: false
                            }
                        }),
                        bootstrap: new FormValidation.plugins.Bootstrap5({
                            rowSelector: '.fv-row',
                            eleInvalidClass: '',
                            eleValidClass: ''
                        })
                    }
                }
            );

            // Handle form submit
            form.addEventListener('submit', function (e) {
                e.preventDefault();

                validator.revalidateField('password');

                const _csrf = e.target._csrf.value;
                const firstName = e.target.firstName.value;
                const lastName = e.target.lastName.value;
                const userName = e.target.userName.value;
                const email = e.target.email.value;
                const password = e.target.password.value;
                const confirmPassword = e.target.confirmPassword.value;

                validator.validate().then(function (status) {
                    if (status == 'Valid') {
                        // Show loading indication
                        submitButton.setAttribute('data-kt-indicator', 'on');

                        // Disable button to avoid multiple click 
                        submitButton.disabled = true;

                        axios({
                            url: '/' + ADMIN_PANEL_PATH + '/auth/signup',
                            method: 'POST',
                            headers: {
                                'CSRF-Token': _csrf,
                            },
                            data: { firstName, lastName, userName, email, password, confirmPassword },
                        }).then(function (res) {
                            if (res.status === 200) {
                                Swal.fire({
                                    text: res.data.message,
                                    icon: "success",
                                    buttonsStyling: false,
                                    confirmButtonText: "Ok, got it!",
                                    customClass: {
                                        confirmButton: "btn btn-primary"
                                    }
                                }).then(() => {
                                    window.location.replace(`/${ADMIN_PANEL_PATH}`)
                                });
                            }
                        }).catch(function (err) {
                            Swal.fire({
                                text: err.response.data.message,
                                icon: "error",
                                buttonsStyling: false,
                                confirmButtonText: "Try Again",
                                customClass: {
                                    confirmButton: "btn btn-primary"
                                }
                            });
                        }).finally(function () {
                            // Hide loading indication
                            submitButton.removeAttribute('data-kt-indicator');
    
                            // Enable button
                            submitButton.disabled = false;
                        })
                    } else {
                        // Show error popup. For more info check the plugin's official documentation: https://sweetalert2.github.io/
                        Swal.fire({
                            text: "Please fill up the form properly",
                            icon: "error",
                            buttonsStyling: false,
                            confirmButtonText: "Try Again",
                            customClass: {
                                confirmButton: "btn btn-primary"
                            }
                        });
                    }
                });
            });

            // Handle password input
            form.querySelector('input[name="password"]').addEventListener('input', function () {
                if (this.value.length > 0) {
                    validator.updateFieldStatus('password', 'NotValidated');
                }
            });
        }

        // Password input validation
        var validatePassword = function () {
            return (passwordMeter.getScore() === 100);
        }

        // Public functions
        return {
            // Initialization
            init: function () {
                // Elements
                form = document.getElementById('sign-up-form');
                submitButton = form.querySelector('button[type=submit]');
                passwordMeter = KTPasswordMeter.getInstance(form.querySelector('[data-kt-password-meter="true"]'));

                handleForm();
            }
        };
    }();

    // On document ready
    KTUtil.onDOMContentLoaded(function () {
        KTSignupGeneral.init();
    });

    /******/
})()
    ;
//# sourceMappingURL=general.js.map