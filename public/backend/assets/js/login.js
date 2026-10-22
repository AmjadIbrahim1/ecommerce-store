const signInForm = document.getElementById('sign_in_form');
let signInFormValidator;
try {
    signInFormValidator = FormValidation.formValidation(
        signInForm,
        {
            fields: {
                'email': {
                    validators: {
                        notEmpty: {
                            message: 'Type your email address'
                        }
                    }
                },
                'password': {
                    validators: {
                        notEmpty: {
                            message: 'Type your password'
                        }
                    }
                },
            },

            plugins: {
                trigger: new FormValidation.plugins.Trigger(),
                bootstrap: new FormValidation.plugins.Bootstrap5({
                    rowSelector: '.fv-row',
                    eleInvalidClass: '',
                    eleValidClass: ''
                })
            }
        }
    );
} catch (err) { }

signInForm.addEventListener('submit', function (e) {
    e.preventDefault();

    if (signInFormValidator) {
        signInFormValidator.validate().then((status) => {
            if (status == 'Valid') {
                // Show loading indication
                e.submitter.setAttribute('data-kt-indicator', 'on');

                // Disable button to avoid multiple click
                e.submitter.disabled = true;

                const _csrf = e.target._csrf.value;
                const email = e.target.email.value;
                const password = e.target.password.value;

                axios({
                    url: e.target.getAttribute('action'),
                    method: 'POST',
                    headers: {
                        'CSRF-Token': _csrf,
                    },
                    data: { email, password },
                }).then(res => {
                    if (res.statusText === 'OK') {
                        // Show popup confirmation
                        Swal.fire({
                            text: res.data.message,
                            icon: "success",
                            buttonsStyling: false,
                            confirmButtonText: "Ok, got it!",
                            customClass: {
                                confirmButton: "btn btn-primary"
                            }
                        });
                        window.location.replace(`/${ADMIN_PANEL_PATH}`)
                    }
                }).catch((err) => {
                    Swal.fire({
                        text: err.response.data.message,
                        icon: "error",
                        buttonsStyling: false,
                        confirmButtonText: "Retry",
                        customClass: {
                            confirmButton: "btn btn-primary"
                        }
                    });
                }).finally(() => {
                    // Remove loading indication
                    e.submitter.removeAttribute('data-kt-indicator');

                    // Enable button
                    e.submitter.disabled = false;
                })
            }
        })
    }
})
