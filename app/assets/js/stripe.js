// This identifies your website in the createToken call below
Stripe.setPublishableKey('pk_test_iHQhSRPF2xvoLmhXNpqVfE8m');

$('#credit-card-number').blur(function() {
  var last4 = $(this).val().toString();
  $('#credit-card-4').val(last4.substr(last4.length - 4));
});

$(function() {

  // $('#payment-form').submit(function(event) {
  //   var $form = $(this);
  //   if ($form.valid()) {
  //     // Disable the submit button to prevent repeated clicks
  //     $('#payment-submit').prop('disabled', true);
  //     if ($('#calculator-choice').val() !== "") {
  //       Stripe.card.createToken($form, stripeResponseHandler);
  //       return false;
  //     } else {
  //       $('.payment-errors').text('You must select a product.');
  //       $('#payment-submit').prop('disabled', false);
  //       return false;
  //     }
  //   }
  // });

  $('#release-payment').submit(function(event) {
    var $form = $(this);
    if ($form.valid()) {
      // Disable the submit button to prevent repeated clicks
      $('#release-payment-submit').prop('disabled', true);
      if ($('#calculator-choice').val() !== "") {
        Stripe.card.createToken($form, stripeResponseHandler);
        return false;
      } else {
        $('.payment-errors').text('You must select a product.');
        $('#release-payment-submit').prop('disabled', false);
        return false;
      }
    }
  });

  // No use of Stripe in this case, just a check for logo
  $('#account-form').submit(function(event) {
    var $form = $(this);
    if ($form.valid()) {
      return true;
    }
    return false;
  });

  // delete handler for confirm page
  $('a.coupon-delete').click(couponDelete);

  // AJAX Check validation of stripe coupon and display message
  $('#coupon-code-button').click(function(event){
    event.preventDefault();
    $(this).prop('disabled', true);
    removeElements();

    var $couponRow = $('#coupon-code-row');
    var couponCode = $('#coupon-code').val();

    $.post('/checkout/check-coupon', { couponCode: couponCode }, function(data){
      if(data.id){
        // renders the success message and coupon id with delete button
        successMessage(data, $couponRow);
        var couponObject = JSON.stringify(data);
        // append returned coupon to form
        $('#release-payment').append($('<input type="hidden" id="hidden-coupon" name="coupon" />').val(couponObject));
        $('#coupon-code-button').prop('disabled', false);
      } else{
        // render error message on failure
        failureMessage($couponRow);
        $('#coupon-code-button').prop('disabled', false);
      }
    });
  });
});
  // remove coupon from session. Not working
function couponDelete(event){
  event.preventDefault();
  $('#hidden-coupon').remove();
  $('.coupon-message-success').remove();
  $('#coupon-id').remove();

  var dynamicId = $(this).data('coupon-id');
    $.ajax({
      url: '/checkout/coupon-delete',
      type: 'DELETE',
      success: function(data){
        removeElements();
      }
    });
}
function successMessage(data, couponRow){
  // add class to input on success
  couponRow.after(
    $('<div/>')
    .attr('id', 'coupon-message')
    .addClass('coupon-message-success')
    .text('Success! Your coupon code works.')
  );
  var doc = document.getElementById('coupon-message');
  var deleteLink = $('<a/>')
      .attr('href', 'javascript:void(0)')
      .addClass('coupon-delete')
      .text('X')
      .data('coupon-id', data.id)
      .click(couponDelete);

  $(doc).after(
    $('<div/>')
    .attr('id', 'coupon-id')
    .append(
      $('<span/>')
      .addClass('coupon-id-show')
      .text(data.id)
      .append(deleteLink)
    )
  );
}

function removeElements(){
  $('#coupon-message').remove();
  $('#coupon-id-confirm').remove();
  $('#discount-message').remove();
  $('#hidden-coupon').remove();
  $('#coupon-id').remove();
  $('#coupon-code').removeClass('coupon-input-failure');
}

function failureMessage(couponRow){
  // add class to input on failure
  couponRow.after(
    $('<div/>')
    .attr('id', 'coupon-message')
    .addClass('coupon-message-failure')
    .text('Oops! This coupon is not valid.')
  );
  $('#coupon-code').addClass('coupon-input-failure');
}

function stripeResponseHandler(status, response) {
  var $form = $('#release-payment');

  if (response.error) {
    // Show the errors on the form
    $('.payment-errors').text(response.error.message);
    $('#payment-submit').prop('disabled', false);
  } else {
    // response contains id and card, which contains additional card details
    var token = response.id;
    // Insert the token into the form so it gets submitted to the server
    $form.append($('<input type="hidden" name="stripeToken" />').val(token));
    // and submit
    $form.get(0).submit();
  }
}
