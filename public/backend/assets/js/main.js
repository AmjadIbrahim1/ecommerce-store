'use strict';

// * utils function
const getValFromTagify = (string) => {
    let json;

    try {
        json = JSON.parse(string);
    } catch (err) {
        console.error(err);
        return
    }

    const arr = [];
    json.forEach(item => {
        arr.push(item.value);
    })
    return arr;
}

// * ========================================================
// * edit / add banner form validation
const form = document.getElementById('edit-banner-form');

let validator;
try {
    validator = FormValidation.formValidation(
        form,
        {
            fields: {
                'heading': {
                    validators: {
                        notEmpty: {
                            message: 'Heading is required'
                        },
                        stringLength: {
                            max: 100,
                            message: 'Max length of heading is 100'
                        }
                    }
                },
                'text': {
                    validators: {
                        notEmpty: {
                            message: 'Banner text is required'
                        },
                        stringLength: {
                            max: 50,
                            message: 'Max length of heading is 50'
                        }
                    }
                },
                'productCategory': {
                    validators: {
                        notEmpty: {
                            message: 'Please select a category',
                        },
                    }
                },
                'image': {
                    validators: {
                        // notEmpty: {
                        //     message: 'Select an image'
                        // },
                    }
                }
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

// * ========================================================
// * edit/ add banner form submit
const editBannerForm = document.getElementById('edit-banner-form');

editBannerForm?.addEventListener('submit', function (e) {
    // Prevent default button action
    e.preventDefault();

    // Validate form before submit
    if (validator) {
        validator.validate().then(function (status) {
            if (status == 'Valid') {
                // Show loading indication
                e.submitter.setAttribute('data-kt-indicator', 'on');

                // Disable button to avoid multiple click
                e.submitter.disabled = true;

                // submit form via api
                const form = e.target;
                const formData = new FormData();
                formData.append('bannerId', form.bannerId.value);
                formData.append('heading', form.heading.value);
                formData.append('text', form.text.value);
                formData.append('productCategory', form.productCategory.value);
                formData.append('image', form.image.files[0]);

                axios({
                    url: e.target.getAttribute('action'),
                    method: 'POST',
                    headers: {
                        'CSRF-Token': form._csrf.value,
                    },
                    data: formData,
                })
                    .then(res => {
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
                        }
                    })
                    .catch(err => {
                        console.log(err);

                        Swal.fire({
                            text: err.response.data.message,
                            icon: "error",
                            buttonsStyling: false,
                            confirmButtonText: "Retry",
                            customClass: {
                                confirmButton: "btn btn-primary"
                            }
                        });
                    })
                    .finally(() => {
                        // Remove loading indication
                        e.submitter.removeAttribute('data-kt-indicator');

                        // Enable button
                        e.submitter.disabled = false;
                    })
            }
        });
    }
});

// * ========================================================
// * delete banner form submit
const bannerDeleteForms = document.querySelectorAll('.delete-banner-form');
bannerDeleteForms.forEach(bannerDeleteForm => {
    bannerDeleteForm?.addEventListener('submit', (e) => {
        e.preventDefault();

        axios({
            url: `/${ADMIN_PANEL_PATH}/banner/delete`,
            method: 'DELETE',
            headers: {
                'CSRF-Token': e.target._csrf.value,
            },
            data: { _id: e.target._id.value, }
        })
            .then(res => {
                // remove the banner from dom
                e.target.parentNode.parentNode.parentNode.parentNode.parentNode.remove();


                Swal.fire({
                    text: res.data.message,
                    icon: "success",
                    buttonsStyling: false,
                    confirmButtonText: "Ok, Got It.",
                    customClass: {
                        confirmButton: "btn btn-primary"
                    }
                });
            })
            .catch(err => {
                Swal.fire({
                    text: err.response.data.message,
                    icon: "error",
                    buttonsStyling: false,
                    confirmButtonText: "Retry",
                    customClass: {
                        confirmButton: "btn btn-primary"
                    }
                });
            })
    })
});

// * ========================================================
// * add product

const productForm = document.querySelector('.product-form')
let productValidator;
try {
    productValidator = FormValidation.formValidation(
        productForm,
        {
            fields: {
                'title': {
                    validators: {
                        notEmpty: {
                            message: 'Title is required'
                        },
                        stringLength: {
                            max: 100,
                            message: 'Title should not be longer than 100 characters'
                        }
                    }
                },
                'price': {
                    validators: {
                        notEmpty: {
                            message: 'Price is required'
                        },
                        numeric: {
                            message: 'Price Should be a number'
                        },
                        greaterThan: {
                            message: 'Price should be greater than 50',
                            min: 50,
                        }
                    }
                },
                'discount': {
                    validators: {
                        numeric: {
                            message: 'Discount Should be a number'
                        },
                    }
                },
                'categories': {
                    validators: {
                        notEmpty: {
                            message: 'Select at least one category'
                        },
                    }
                },
                'tags': {
                    validators: {
                        notEmpty: {
                            message: 'Tags should not be empty'
                        },
                    }
                },
                // 'image': {
                //     validators: {
                //         notEmpty: {
                //             message: 'Image should not be empty',
                //         }
                //     }
                // },
                'shortDescription': {
                    validators: {
                        notEmpty: {
                            message: 'Short description should not be empty'
                        },
                    }
                },
                'description': {
                    validators: {
                        notEmpty: {
                            message: 'Description should not be empty'
                        },
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

tinymce.init({
    selector: '.productDescription',
    plugins: 'lists link autolink table autosave code preview emoticons searchreplace wordcount table help',
    toolbar: 'bold italic underline | alignleft aligncenter alignright alignjustify | bullist numlist | table | indent outdent | link emoticons removeformat | searchreplace code preview',
    // height: 600,
    placeholder: 'Type product description ...'
});

const productTags = new Tagify(document.querySelector('.product-tags'), {
    maxTags: 10,
    dropdown: {
        maxItems: 15,
        classname: "tagify__inline__suggestions",
        enabled: 0,
        closeOnSelect: false,
    }
});

const productAddForm = document.querySelector('.product-form');
productAddForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    tinyMCE?.triggerSave();

    // Validate form before submit
    if (productValidator) {
        productValidator.validate().then(function (status) {
            if (status == 'Valid') {
                // Show loading indication
                e.submitter.setAttribute('data-kt-indicator', 'on');

                // Disable button to avoid multiple click
                e.submitter.disabled = true;

                // get inputs value
                const _csrf = e.target._csrf.value;
                const productId = e.target.productId?.value;
                const title = e.target.title.value;
                const price = e.target.price.value;
                const discount = e.target.discount.value;
                const categories = e.target.categories.value;
                const tags = JSON.stringify(getValFromTagify(e.target.tags.value));
                const flag = e.target.flag.value;
                const image = e.target.image.files[0];
                const shortDescription = e.target.shortDescription.value;
                const description = e.target.description.value;

                console.log(categories);

                // submit form via api
                const formData = new FormData();
                formData.append('productId', productId);
                formData.append('title', title);
                formData.append('price', price);
                formData.append('discount', discount);
                formData.append('categories', categories);
                formData.append('tags', tags);
                formData.append('flag', flag);
                formData.append('shortDescription', shortDescription);
                formData.append('description', description);
                formData.append('image', image);

                axios({
                    url: e.target.getAttribute('action'),
                    method: 'POST',
                    headers: {
                        'CSRF-Token': _csrf,
                    },
                    data: formData,
                })
                    .then(res => {
                        // Show popup confirmation
                        Swal.fire({
                            text: res.data.message,
                            icon: "success",
                            buttonsStyling: false,
                            confirmButtonText: "Add Another",
                            customClass: {
                                confirmButton: "btn btn-primary"
                            },
                        })
                            .then(result => {
                                if (result.isConfirmed) {
                                    productTags.removeAllTags();
                                    e.target.reset();
                                }
                            });
                        // window.location.replace(`/${ADMIN_PANEL_PATH}/product`);
                    })
                    .catch(err => {
                        Swal.fire({
                            text: err.response?.data?.message || 'Something is wrong!',
                            icon: "error",
                            buttonsStyling: false,
                            confirmButtonText: "Retry",
                            customClass: {
                                confirmButton: "btn btn-primary"
                            }
                        });
                    })
                    .finally(() => {
                        // Remove loading indication
                        e.submitter.removeAttribute('data-kt-indicator');

                        // Enable button
                        e.submitter.disabled = false;
                        // remove all tags
                    })
            }
        });
    }
});

document.getElementById('add-ad-form')?.addEventListener('submit', (e) => {
    e.preventDefault();

    // Show loading indication
    e.submitter.setAttribute('data-kt-indicator', 'on');

    // Disable button to avoid multiple click
    e.submitter.disabled = true;

    const _csrf = e.target._csrf.value;
    const formData = new FormData();
    formData.append('adId', e.target.adId?.value);
    formData.append('slug', e.target.slug.value);
    formData.append('imageSize', e.target.imageSize.value);
    formData.append('image', e.target.image.files[0]);

    axios({
        url: e.target.getAttribute('action'),
        method: 'POST',
        headers: {
            'CSRF-Token': _csrf,
        },
        data: formData
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
        }
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
});

$('.delete-ad').on('submit', (e) => {
    e.preventDefault();

    const _csrf = e.target._csrf.value;
    const adId = e.target.adId.value;
    axios({
        url: e.target.getAttribute('action'),
        method: 'POST',
        headers: {
            'CSRF-Token': _csrf,
        },
        data: { adId }
    }).then(res => {
        // Show popup confirmation
        Swal.fire({
            text: res.data.message || 'Successful',
            icon: "success",
            buttonsStyling: false,
            confirmButtonText: "Ok, got it!",
            customClass: {
                confirmButton: "btn btn-primary"
            }
        });

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
    })
});

// toggle product feature
document.querySelectorAll('.make-featured-product').forEach(item => {
    item.addEventListener('submit', (e) => {
        e.preventDefault();
    
        const _csrf = e.target._csrf.value;
        const productId = e.target.productId.value;
        axios({
            url: e.target.getAttribute('action'),
            method: 'POST',
            headers: {
                'CSRF-Token': _csrf,
            },
            data: { productId },
        }).then(res => {
            $(e.submitter).find('i').toggleClass('bi-star bi-star-fill');
        }).catch(err => {
            Swal.fire({
                text: err.response.data.message,
                icon: "success",
                buttonsStyling: false,
                confirmButtonText: "Add Another",
                customClass: {
                    confirmButton: "btn btn-primary"
                },
            })
        })
    });
})

// delete product
document.querySelector('.delete-product')?.addEventListener('submit', (e) => {
    e.preventDefault();

    const _csrf = e.target._csrf.value;
    const productId = e.target.productId.value;
    axios({
        url: e.target.getAttribute('action'),
        method: 'POST',
        headers: {
            'CSRF-Token': _csrf,
        },
        data: { productId },
    }).then(res => {
        Swal.fire({
            text: res.data.message,
            icon: "success",
            buttonsStyling: false,
            confirmButtonText: "Add Another",
            customClass: {
                confirmButton: "btn btn-primary"
            },
        })
        window.location.reload();
    }).catch(err => {
        Swal.fire({
            text: err.response.data.message,
            icon: "success",
            buttonsStyling: false,
            confirmButtonText: "Add Another",
            customClass: {
                confirmButton: "btn btn-primary"
            },
        })
    })
});
