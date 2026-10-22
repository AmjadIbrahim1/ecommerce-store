'use strict';

$(document).ready(() => {
    $('.slider-active-3').owlCarousel({
        loop: true,
        nav: false,
        dots: true,
        autoplay: true,
        autoplayTimeout: 5000,
        animateOut: 'fadeOut',
        animateIn: 'fadeIn',
        item: 1,
        responsive: {
            0: {
                items: 1
            },
            768: {
                items: 1
            },
            1000: {
                items: 1
            }
        }
    })

    $('.category-slider-2').owlCarousel({
        autoplay: false,
        loop: false,
        smartSpeed: 1000,
        navText: [
            "<ion-icon name='arrow-forward-outline'></ion-icon>",
            "<ion-icon name='arrow-forward-outline'></ion-icon>",
        ],
        nav: false,
        dots: false,
        margin: 10,
        responsive: {
            0: {
                items: 2,
                autoplay: true,
                loop: true,
                nav: false,
            },
            360: {
                items: 2,
                autoplay: true,
                loop: true,
            },
            500: {
                items: 2,
                autoplay: true,
                loop: true,
            },
            768: {
                items: 3,
                nav: true,
                margin: 30,
            },
            992: {
                items: 4,
                margin: 30,
            },
            1200: {
                items: 5,
                margin: 30,
            }
        }
    })

    $('.hot-deal-2').owlCarousel({
        autoplay: false,
        nav: true,
        smartSpeed: 1000,
        dots: false,
        items: 2,
        loop: false,
        margin: 30,
        responsive: {
            0: {
                items: 1,
                autoplay: true,
                loop: true,
            },
            360: {
                items: 1,
                autoplay: true,
                loop: true,
            },
            576: {
                items: 1,
                autoplay: true,
                loop: true,

            },
            768: {
                items: 1,
            },
            992: {
                items: 1,
            },
            1200: {
                items: 2,
            }
        }
    });

    $('#bar-rating').barrating({ theme: 'fontawesome-stars' });

    $('input[type="number"].nice-number').niceNumber({ autoSizeBuffer: 10 });
    // * plugin activation end =================

    const _csrfToken = $('meta[name=_csrf]').attr('content');

    // * auto search suggestion
    $('#search-box').on('keyup', function () {
        const q = this.value.trim();
        const url = `/search-suggestion?q=${q}`;
        const suggestionList = document.querySelector('.search-suggestions');
        console.log(q.length)
        if (q.length < 3) {
            suggestionList.classList.add('d-none');
            return;
        }

        fetch(url)
            .then(res => {
                return res.json();
            }).then(result => {
                $(suggestionList).empty();
                if (result.length <= 0) {
                    suggestionList.classList.add('d-none');
                    return;
                }

                result.forEach(item => {
                    suggestionList
                    $(suggestionList).append(`<a href="/product/${item.slug}" class="suggestion">${item.title}</a>`)
                });
                suggestionList.classList.remove('d-none');
            }).catch(err => {
                console.log(err);
            })
    })

    // sticky menu
    $(window).scroll(function () {
        var window_top = $(window).scrollTop() + 1;
        if (window_top > 50) {
            $('.sticky-nav').addClass('menu_fixed animated fadeInDown');
        } else {
            $('.sticky-nav').removeClass('menu_fixed animated fadeInDown');
        }
    });

    let productModal;
    $('.product-quick-view').on('click', async function (e) {
        e.preventDefault();

        const productId = $(this).data('productid');
        try {
            const res = await fetch(`/product-modal/${productId}`);
            const data = await res.text();
            $('body').append(data);
            const productModalEl = document.getElementById('productModal');
            const productModal = new bootstrap.Modal(productModalEl);

            productModal.show();
            productModalEl.addEventListener('hidden.bs.modal', function (event) {
                productModalEl.remove();
            });
        } catch (err) {
            console.log(err);
        }
    });

    // manage query parameter in url
    // $('.add-url-query').click(function (e) {
    //     e.preventDefault();
    // })


    // manage filter in search
    $.each($('.add-url-query'), function () {
        const parsedUrl = new URL(window.location.href);
        const queryName = $(this).data('queryName');
        const queryValue = $(this).data('queryValue');
        if (parsedUrl.searchParams.get(queryName)?.includes(queryValue)) {
            $(this).find('span').addClass('black');
            parsedUrl.searchParams.delete(queryName);
            $(this).attr('href', parsedUrl.toString());
            return;
        }

        const prevQueryValue = parsedUrl.searchParams.get(queryName);
        const finalQueryValue = prevQueryValue ? `${prevQueryValue},${queryValue}` : queryValue;

        parsedUrl.searchParams.set(queryName, finalQueryValue);
        $(this).attr('href', parsedUrl.toString())
    });

    // manage price range (filter)
    $('.price-range-form').submit(function (e) {
        e.preventDefault();

        const parsedUrl = new URL(window.location.href);
        const min = this.min.value;
        const max = this.max.value;
        parsedUrl.searchParams.set('price', `${min}-${max}`);
        window.location.href = parsedUrl.toString();
    });

    // user address address
    const baseAddressUrl = 'https://bdapis.herokuapp.com/api/v1.1';
    request(`${baseAddressUrl}/divisions`, 'GET').then(result => {
        const divisionList = result.data;
        divisionList.forEach(item => {
            $('.division-list').append(`<option value="${item._id}">${item.division}</option>`);
        });
    });

    let districtList;
    $('.division-list').on('change', function() {
        const divisionId = this.value;
        request(`${baseAddressUrl}/division/${divisionId}`, 'GET').then(result => {
            districtList = result.data;
        
            $('.district-list').empty();
            districtList.forEach(item => {
                $('.district-list').append(`<option value="${item._id}">${item.district}</option>`);
            });

            
        });
    });

    $('.district-list').on('change', function() {
        const districtId = this.value;
        const district = districtList.find(item => item._id === districtId);

        $('.upazilla-list').empty();
        district?.upazilla.forEach(item => {
            $('.upazilla-list').append(`<option value="${item}">${item}</option>`);
        });
    })
});

const request = (url, method, data) => {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: url,
            method: method,
            data: data,
            success: resolve,
            error: reject
        });
    })
}
