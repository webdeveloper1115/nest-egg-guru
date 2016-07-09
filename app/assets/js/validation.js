$(function() {

    /**
     * Define validation rules
     *
     */
    // validate register form
    $('#register_form').validate({
        rules: {
            firstName: "required",
            lastName: "required",
            email: {
                required: true,
                email: true,
                checkEmail: true
            },
            password: {
                required: true,
                minlength: 6,
                passwordHard: true,
            },
            confirmPassword: {
                required: true,
                minlength: 6,
                equalTo: "#password",
            }
        },
        messages: {
            password: {
                passwordHard: "Password MUST contain both upper and lower case letters, at least one number."
            },
            email: {
                checkEmail: "Please enter a valid email address."
            }
        },
        submitHandler: function(form) {
            return;
        }
    });

    // validate subscription form
    $('#payment-form').validate({
        rules: {
            name: "required",
            url: {
                required: false,
                checkUrl: true
            },
            emailCompany: {
                required: false,
                email: true,
                checkEmail: true
            },
            phone: {
                required: false,
            },
            subdomain: {
                required: true,
                checkSubdomain: true,
                remote: {
                  url: "/check-subdomain",
                  type: "post",
                  data: {
                    subdomain: function() {
                      return $( "#subdomain" ).val();
                    }
                  }
                }
            },
            // cardNumber: "required",
            // cardMonth: "required",
            // cardYear: "required",
            // cvc: "required"
        },
        messages: {
            url: {
                checkUrl: "Please enter a valid URL."
            },
            emailCompany: {
                checkEmail: "Please enter a valid email address."
            },
            subdomain: {
                checkSubdomain: "Subdomain should not contain any special characters, symbols or spaces."
            }
        }
    });

    // validate contact-form
    $('#contact-form').validate({
        rules: {
            firstName: "required",
            lastName: "required",
            email: {
                required: true,
                email: true,
                checkEmail: true
            },
            phone: {
                required: true,
            },
            message: "required",
        },
        messages: {
            email: {
                checkEmail: "Please enter a valid email address."
            }
        }
    });

    // validate account-form
    $('#account-form').validate({
        rules: {
            firstName: "required",
            lastName: "required",
            email: {
                required: true,
                email: true,
                checkEmail: true
            },
            name: "required",
            url: {
                required: false,
                checkUrl: true
            },
            emailCompany: {
                required: false,
                email: true,
                checkEmail: true
            },
            phone: {
                required: false,
            }
        },
        messages: {
            url: {
                checkUrl: "Please enter a valid URL."
            },
            email: {
                checkEmail: "Please enter a valid email address."
            },
						emailCompany: {
                checkEmail: "Please enter a valid email address."
            },
        },
    });

    $('#release-payment').validate({
      rules: {
        cardNumber: "required",
        cardMonth: "required",
        cardYear: "required",
        cvc: "required"
      }
    });

    /**
     * Custom rules validate methods
     *
     */
    // Check password (required 1 uppercase, 1 lowercase, 1 number)
    $.validator.addMethod("passwordHard", function(value, element) {
        var regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])/;
        return regex.test(value);
    });

    // Check url
    $.validator.addMethod("checkUrl", function(value, element) {
        value = $.trim(value);
        var isHttp = value.substr(0, 7) == 'http://';
        var isHttps = value.substr(0, 8) == 'https://';
        if (!isHttp && !isHttps) {
            value = 'http://' + value;
        }
        if (value.substr(value.length - 1, 1) != '/') {
            value = value + '/';
        }
        var regexValidUrl = /^(http|https|ftp):\/\/[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/i.test(value);
        return this.optional(element) || regexValidUrl;
    });

    // Check email
    $.validator.addMethod("checkEmail", function(value, element) {
        var regexEmail = /^[a-zA-Z0-9]+([-._][a-zA-Z0-9]+)*@([a-zA-Z0-9]+(-[a-zA-Z0-9]+)*\.)+[a-zA-Z]{2,4}$/.test(value);
        return this.optional(element) || regexEmail;
    });

    // Check subdomain
    $.validator.addMethod("checkSubdomain", function(value, element) {
        var regexSpecialChar = /[`~!@#$%^&*()|+=?;:'",.<>\{\}\[\]\\\/\s]/gi;
        var fixedString = value.replace(regexSpecialChar, '');
        if (fixedString !== value) {
            return false;
        }
        return true;
    });


    /**
     * Define form input masks
     *
     */

    var inputMaskOptions = {
        "placeholder": ""
    };

    // phone number
    $("#phone").inputmask("999-999-9999", inputMaskOptions);

    // creadit card
    $("#credit-card-number").inputmask("9999 9999 9999 9999", inputMaskOptions);

    // cvc code
    $("#cvc").inputmask("9999", inputMaskOptions);

    // zip code
    $("#zip-code").inputmask("99999", inputMaskOptions);

    // state
    $("#address_state").inputmask("aa", inputMaskOptions);

    /**
     * Defines Retrict elements
     *
     */
    // Selectors
    var retrictsSelectors = {
        restrictInputSpecialChar: ".no-special-char"
    };

    // Retrict input special charater
    $(retrictsSelectors.restrictInputSpecialChar).bind('keypress', function(event) {
        var regex = new RegExp("^[a-zA-Z0-9., _]+$");
        var key = String.fromCharCode(!event.charCode ? event.which : event.charCode);
        if (!regex.test(key)) {
            event.preventDefault();
            return false;
        }

        return true;
    });



    /**
     * Handle next and back buttons on register forms
     *
     */
    // Click on back button
    $("div#panel2 button#back-button").click(function() {
        // $('#panel2').removeClass('active');
        // $('#panel1').addClass('active');
        // $('#panel1-1').addClass('active');

        // back to account info form
        window.location.href = window.location.href.replace("step=company", "step=info");
    });

    // Click on next button
    $("div#panel1 button#payment-submit").click(function() {
        var accountInfo = {};
        accountInfo.firstName = $('#firstName').val();
        accountInfo.lastName = $('#lastName').val();
        accountInfo.proDesignation = $('#proDesignation').val();
        accountInfo.email = $('#email').val();
        accountInfo.password = $('#password').val();
        accountInfo.purchase = $('#calculator-choice').val();

        if ($("#register_form").valid()) {
            disablePaymentSubmitButton("#payment-submit");
            // Ajax check email is exist and post account info
            $.post('/user/register', accountInfo)
                .done(function(response) {
                    handleNextForm(accountInfo);
                })
                .fail(function(err) {
                    flashMessage('.tab-error', err.responseText)
                })
                .always(function() {
                    console.info("complete");
                    enablePaymentSubmitButton("#payment-submit");
                });
        }

    });

    // $("#back-button").click(function() {
    // 	window.history.back();
    // 	return false;
    // });

    /**
     * Helper functions
     *
     */
    function handleNextForm(accountInfo) {
			// $('#panel2').addClass('active');
			// $('#panel2-1').addClass('active');
			// $('#panel1').removeClass('active');

			// redirect to next form (next to register company form)
			window.location.href = window.location.href.replace("step=info", "step=company");

			// set data for form
			$('#hiddenFirstName').val(accountInfo.firstName);
			$('#hiddenLastName').val(accountInfo.lastName);
			$('#hiddenProDesignation').val(accountInfo.proDesignation);
			$('#hiddenEmail').val(accountInfo.email);
			$('#hiddenPassword').val(accountInfo.password);
			$('#hiddenPurchase').val(accountInfo.purchase);
    }

    function disablePaymentSubmitButton(selector) {
        $(selector).prop('disabled', true);
    }

    function enablePaymentSubmitButton(selector) {
        $(selector).prop('disabled', false);
    }

    function flashMessage(elem, text) {
        $(elem).text(text);
        $(elem).fadeIn('slow');

        setTimeout(function() {
            $(elem).fadeOut('slow');
            $(elem).text('');
        }, 2000);
    }
});
