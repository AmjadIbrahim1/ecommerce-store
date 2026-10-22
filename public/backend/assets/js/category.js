const categoryForm = document.getElementById('add-category-form');

let categoryFormValidator;
try {
    categoryFormValidator = FormValidation.formValidation(
        categoryForm,
        {
            fields: {
                'name': {
                    validators: {
                        notEmpty: {
                            message: 'Category Name is required'
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

categoryForm?.addEventListener('submit', e => {
    e.preventDefault();


    if (categoryFormValidator) {
        categoryFormValidator.validate().then(function (status) {
            if (status === 'Valid') {
                // Show loading indication
                e.submitter.setAttribute('data-kt-indicator', 'on');
                // Disable button to avoid multiple click
                e.submitter.disabled = true;

                const _csrf = e.target._csrf.value;
                const name = e.target.name.value;
                const label = e.target.label?.value;
                const parent = e.target.parent.value;

                // if user is in edit mode
                const categoryId = e.target.categoryId?.value;

                axios({
                    url: e.target.getAttribute('action'),
                    method: 'post',
                    headers: {
                        'CSRF-Token': _csrf,
                    },
                    data: { name, label, parent, categoryId },
                }).then(res => {
                    Swal.fire({
                        text: res.data.message,
                        icon: "success",
                        showDenyButton: true,
                        buttonsStyling: false,
                        confirmButtonText: `Go Back`,
                        denyButtonText: `Add Another`,
                        customClass: {
                            confirmButton: "btn btn-primary",
                            denyButton: "btn btn-success"
                        }
                    }).then(result => {
                        if (result.isConfirmed) {
                            window.location.replace(`/${ADMIN_PANEL_PATH}/category`)
                        }
                    });
                }).catch(err => {
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
});

$('#category-label').on('change', function (e) {
    const _csrf = e.target._csrf.value;
    const label = e.target.value;
    if (label === 'main') {
        return;
    }

    // get parent categories
    axios({
        url: `/${ADMIN_PANEL_PATH}/category-label`,
        method: 'post',
        headers: {
            'CSRF-Token': _csrf,
        },
        data: { label },
    }).then(res => {
        let options = res.data.categories.map(category => {
            return `<option value='${category._id}'>${category.name}</option>`
        });
        options = `<option value=''>Select Parent</option>${options}`;
        $('[name=parent]').html(options);

        // if (res.data.categories.length > 0) {
        //     $('[name=parent]').prop('disabled', false);
        //     $('[name=parent]').parents('.fv-row').removeClass('d-none');
        // } else {
        //     $('[name=parent]').prop('disabled', true);
        //     $('[name=parent]').parents('.fv-row').addClass('d-none');
        // }
    }).catch(err => {
        console.log(err);
    })
});

$('.delete-category').submit((e) => {
    e.preventDefault();

    const _csrf = e.target._csrf.value;
    const categoryId = e.target.categoryId.value;

    axios({
        url: e.target.getAttribute('action'),
        method: 'delete',
        headers: {
            'CSRF-Token': _csrf,
        },
        data: { categoryId },
    }).then(res => {
        Swal.fire({
            text: res.data.message,
            icon: "success",
            buttonsStyling: false,
            confirmButtonText: `Go Back`,
            customClass: {
                confirmButton: "btn btn-primary",
            }
        })
        window.location.reload();
    }).catch(err => {
        Swal.fire({
            text: err.response.data.message,
            icon: "error",
            buttonsStyling: false,
            confirmButtonText: "Retry",
            customClass: {
                confirmButton: "btn btn-primary"
            }
        });
    });
});
