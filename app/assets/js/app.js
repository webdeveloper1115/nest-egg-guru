$(document).foundation();

var pie_1 = ['stocks', 'bonds', 'cash'];
var pie_2 = ['large-usa-stocks', 'mid-small-usa-stocks', 'foreign-stocks'];

$(function() {
  var hash = window.location.hash.substr(1);

  hashedChoice(hash, 'savings', 'spending' );
  hashedChoice(hash, 'annual', 'monthly' );

  $('.calculator-purchase').each(function() {
    var choice = $(this).attr('data');

    if ($(this).is(':checked')) {
      $('#calculator-choice').val(choice);
    }
  });

  $('.subscription-purchase').each(function() {
    var choice = $(this).attr('data');

    if ($(this).is(':checked')) {
      $('#calculator-choice').val(choice);
    }
  });


  // Subscription choice
  $('.subscription-purchase').click(function() {
    var choice = $(this).attr('data');
    $('#calculator-choice').val(choice);
    if (typeof choice == "string") {
      $.post('/user/set-purchase', { purchase: choice });
    }
  });

  $('.calculator-purchase').click(function() {
    var savings  = $('#savingsChecked');
    var spending = $('#spendingChecked');
    var choice   = $('#calculator-choice');

    $('.calculator-purchase').each(function() {
      if (savings.is(':checked') && spending.is(':checked')) {
        choice.val('bothCalculators');
      } else {
        if (savings.is(':checked')) {
          choice.val('savingsCalculator');
        }
        if (spending.is(':checked')) {
          choice.val('spendingCalculator');
        }
      }
    });
  });

  // Register Validaitons
  // $('.no-spaces').blur(function() {
  //   $(this).val(removeSpaces($(this).val()));
  // });

  // $('.password').blur(function() {
  //   var noMatch = !_.isEqual($('#password').val(), $(this).val());
  //   var length  = $(this).val().length < 6;
  //   var errElem = '.tab-error';

  //   if (noMatch) {
  //     flashErrMsg(errElem, "Your passwords don't match!");
  //   }
  //   if (length) {
  //     flashErrMsg(errElem, 'Password length is less than 6');
  //   }

  //   toggleSubmit($('.tab-ajax'), noMatch || length);
  // });

  // $('#url').blur(function() {
  //   if ($(this).val().indexOf('.') < 0) {
  //     formErr('url');
  //   }
  // });

  // $('#subdomain').blur( function() {
  //   if (!/^[a-z0-9]+$/i.test($(this).val())) {
  //     formErr('subdomain');
  //   }
  // });

  // Streaming image
  $('#logo-img').attr('src', 'data:image/;base64,'+ $('#img-stream').attr('data'));
  $('#logo-img-prev').attr('src', 'data:image/;base64,'+ $('#img-stream').attr('data'));


  // Character count on register bio
  var text_max = 425;
  $('#textarea_feedback').html(text_max + ' Characters Remaining');

  $('#textarea').focus(function(){
    $('#textarea').removeAttr('placeholder');
  }).blur(function () {
    $('#textarea').attr('placeholder', 'Jack Smith provides highly personalized financial planning and investment management guidance to business owners and their families. Jack has a degree in finance from Ivy College and an MBA from Anywhere University. He has been a financial advisor since 1994, and his perspectives are regularly cited in the national financial news media');
  });
  $('#textarea').keyup(function() {
    var text_length = $(this).val().length;
    var text_remaining = text_max - text_length;

    $('#textarea_feedback').html(text_remaining + ' characters remaining');
  });

  // Scroll back to top of page
  $('.back-to-top').click(function() {
    window.scrollTo(0, 0);
  });

  // Commas for big numbers
  $('.big-number').each(function() {
    var newNum = $(this).html();

    $(this).html(numberWithCommas(newNum));
  });

  // Only allow multiples of 5
  $('input#years-spending').on('blur', function() {
    var years     = +$(this).val();
    var remainder = years % 5;
    var round     = remainder >= 3? 5 : 0;

    if (!_.isEqual(remainder, 0)) {
      $(this).parent().prepend('<p id="years-err-msg">Please enter years in five (5) year increments starting with 5 years and growing no longer than 50 years.</p>').fadeIn('fast', function() {
        $('#years-err-msg').delay(2500).fadeOut();
      });
    };
    $(this).val(years - remainder + round);
  });

  // Set occupation to the form-submitted value
  $('#userType').val($('#userTypeValue').val());

  // Set company state to the form-submitted value
  $('#companyState').val($('#companyStateValue').val());

  // Trigger click event on actual input file field
  $('#upload-logo').click(function() {
    $('#company-logo').click();
  });

  $('#company-logo').change(function(e) {
    // no keep logo
    $('#keep-logo').val(false);
    // Check logo file size
    $('#logo-errors').text('');
    var twoMegaBytes = 2097152;  // 2MB

    if (_.isEqual(e.target.files[0], undefined)) {
      return false;
    } else if (e.target.files[0].size > twoMegaBytes) {
      $('#logo-errors').text('File size must be 2MB or less');
      $(this).val('');
      return false;
    }

    // Show logo preview
    var reader = new FileReader();

    reader.onload = function(event) {
      $('#logo-preview').html('');
      $('#logo-preview').html($('<img>', {
        src: event.target.result,
        alt: 'Company Logo'
      }));
      // if ($('.company-logo').length > 0) {
      //   $('#logo-preview').removeClass('company-logo').addClass('company-logo-exists');
      // }
    };

    reader.readAsDataURL(e.target.files[0]);
  });

  // Delete logo
  $('#delete-logo').click(function() {
    // no keep logo
    $('#keep-logo').val(false);

    // Remove logo from FileList
    $('#company-logo').val('');

    // Remove logo preview
    $('#logo-preview').html('');
    if ($('.company-logo-exists').length > 0) {
      $('#logo-preview').removeClass('company-logo-exists').addClass('company-logo');
    }
  });

  // Results tab, Change Input functionality
  $('#change-inputs').click(function(e) {
    // Switch to inputs tab
    $('#calculator-inputs-tab').click();

    // By default, user inputs remain unchanged
    initForLeadGenTool();
  });

  // Results tab, Start Again functionality
  $('#start-again').click(function(e) {
    // Switch to inputs tab
    $('#calculator-inputs-tab').click();

    // Trigger a page load to reset to system input defaults
    location.reload(false); // Reload page from the browser's cache (set to true to reload from server)
  });

  /**
   * Initialize pie charts
   */
  D3.pie(getPieValues(pie_1), 'pie-chart');
  D3.pie(getPieValues(pie_2), 'pie-chart2');

  /**
   * Responsive pie charts
   */
  $(window).on("resize", function() {
    var $chart      = $('.pie-chart svg, .pie-chart2 svg');
    var targetWidth = $chart.parent().width();

    $chart.attr("width", targetWidth);
    $chart.attr("height", targetWidth);
  });

  /**
   * Initialize range slider
   */
  $('input[type="range"]').rangeslider({ polyfill: false });

  /**
   * Bind input to slider
   */
  $('input[type="range"]').on('input', function(e) {
    var elem = $(this).attr('id').replace('-slider', '');
    $('#'+ elem).val(numberWithCommas(e.target.value));
  });

  $('.calculator-input').each(function(key, val) {
    $(val).val(numberWithCommas($(val).val()));

    var keyTimeout = null;
    $(val).keyup(function(e){
      var changeValue = function(v){
        var $slider = $('#'+$(v).attr('id')+'-slider');
        var value   = +$(v).val().replace(/[, ]+/g, "").trim();

        var min = +$(v).attr('min');
        var max = +$(v).attr('max');
        var id  = $(v).attr('id');

        var newValue = value <= max && value >= min? value : min;
        $slider.val(newValue).change();
        setValue(id, numberWithCommas(newValue));
      }

      if(keyTimeout)
        clearTimeout(keyTimeout);

      keyTimeout = setTimeout(function(){
        changeValue(val)
      }, 1000)

    })

    $(val).blur(function(e) {
      var $slider = $('#'+$(val).attr('id')+'-slider');
      var value   = +$(val).val().replace(/[, ]+/g, "").trim();
      // var step    = !_.isUndefined($(this).attr('step'));

      var min = +$(this).attr('min');
      var max = +$(this).attr('max');
      var id  = $(this).attr('id');

      var newValue = value <= max && value >= min? value : min;

      // newValue = step? (Math.round(newValue * 4) / 4) : newValue;

      // Must set the slider value first before setting the text field value
      //   or else the text field value won't be retained
      //   (it would randomly be set to the nearest step
      //   of the slider value, if step is set)
      $slider.val(newValue).change();
      setValue(id, numberWithCommas(newValue));
    });
  });

  /**
   * Closes modals
   */
  $('.close-modal').click(function(e) {
    $(this).foundation('reveal', 'close');
  });

  /**
   * Toggle confirm button
   */
  $('.toggle').click(function(e) {
    $(this).hide();
    $('.confirm-toggle').show();
  });

  /**
   * submit on confirm click
   */
  $('.confirm-toggle').one('click', function(e) {
    $(this).html('loading...');
    $('#submit-form').submit();
  });

  /**
   * Select hide or show for premium spending
   */
  $("input[name='withdrawalOption']").change(function(e){
    if($(this).is(":checked")){
      var option = +$(this).val();

      if (_.isEqual(option, 2)) { // One future adjustment to withdrawal amount
        $('.1-withdrawal').show();
        $('.2-withdrawal').hide();
      } else if (_.isEqual(option, 3)) { // Two future adjustments to withdrawal amount
        $('.1-withdrawal').show();
        $('.2-withdrawal').show();
      } else { // No future adjustments to withdrawal amount
        $('.1-withdrawal').hide();
        $('.2-withdrawal').hide();
      }
    }
  });

  $('#withdrawal-adjustment-occurrences').change(function() {
    var option = +$(this).val();

    if (_.isEqual(option, 2)) { // One future adjustment to withdrawal amount
      $('.1-withdrawal').show();
      $('.2-withdrawal').hide();
    } else if (_.isEqual(option, 3)) { // Two future adjustments to withdrawal amount
      $('.1-withdrawal').show();
      $('.2-withdrawal').show();
    } else { // No future adjustments to withdrawal amount
      $('.1-withdrawal').hide();
      $('.2-withdrawal').hide();
    }
  });

  // Disable the target stocks input and slider, only for premium savings
  $('#investment-strategy-option1, #investment-strategy-option1-check, #investment-strategy-option1-label').click(function() {
    if (!$('#investment-strategy-option1').hasClass('free-disabled')) {
      $('input#target-stocks').prop('disabled', true);
      $('#target-stocks-slider').prop('disabled', true);

      $('#target-stocks-slider').rangeslider('update');
    }
  });

  // Enable the target stocks input and slider, only for premium savings
  $('#investment-strategy-option2, #investment-strategy-option2-check, #investment-strategy-option2-label').click(function() {
    if (!$('#investment-strategy-option2').hasClass('free-disabled')) {
      $('input#target-stocks').prop('disabled', false);
      $('#target-stocks-slider').prop('disabled', false);

      $('#target-stocks-slider').rangeslider('update');
    }
  });

  // Check the actual radio button if user clicks on radio button div
  $('.radio-btn-check').click(function() {
    var radioChecked = $(this).parent().find('input[type=radio]');

    // Only check the radio button if it is not disabled
    if (!radioChecked.prop('disabled')) {
//      radioChecked.prop('checked', true);
      radioChecked.trigger('click');
    }

    // Code for toggling between dollar or percentage slider
    var option = +radioChecked.val();

    if (_.isEqual(option, 2)) {
      $('.contributionOption1').hide();
      $('.contributionOption2').show();
    } else {
      $('.contributionOption1').show();
      $('.contributionOption2').hide();
    }
  });

  // Premium Savings "Total expected annual retirement contribution"
  // Code for toggling between dollar or percentage slider
  $('input[name="contributionOption"]').change(function() {
    var option = +$(this).val();

    if (_.isEqual(option, 2)) {
      $('.contributionOption1').hide();
      $('.contributionOption2').show();
    } else {
      $('.contributionOption1').show();
      $('.contributionOption2').hide();
    }

  });

  /**
   * Pie chart increment & decrement
   */
  $('.arrow').click(function(e) {
    var input  = $(this).parent().siblings('.portfolio-input');
    var amount = !_.isUndefined($(this).attr('up'))? +input.val() + 5 : input.val() > 0? +input.val() - 5 : 0;

    var id  = input.attr('id');
    var pie = pie_1.indexOf(id) >= 0;

    setValue(id, amount);
    pie? $('.pie-chart').html('') : $('.pie-chart2').html('');
    pie? reslicePie(id, pie_1) : reslicePie(id, pie_2);
  });

  $('.pie-input').blur(function() {
    var id  = $(this).attr('id');
    var pie = pie_1.indexOf(id) >= 0;
    var amt = _.isNaN(Number(this.value))? 0 : Number(this.value);

    setValue(id, amt);
    pie? $('.pie-chart').html('') : $('.pie-chart2').html('');

    if (amt >= 100) {
      pie? reslicePie(id, pie_1, true) : reslicePie(id, pie_2, true);
    } else {
      pie? reslicePie(id, pie_1) : reslicePie(id, pie_2);
    }
  });

});



/**
 * Helpers
 */
function hashedChoice(hash, a, b) {
  if (_.isEqual(hash, a) || _.isEqual(hash, b)) {
    $('#'+ hash +'Checked').attr('checked', true);
  }
}

function formErr(id) {
  var elem = $('#'+ id +'-error');

  elem.removeClass('invisible');

  setTimeout(function () {
    elem.addClass('invisible');
  }, 3000);
}

function numberWithCommas(x) {
  if (x !== undefined) {
    return x.toString().replace(/\B(?=(?:\d{3})+(?!\d))/g, ',');
  }
}

function removeSpaces(str) {
  return str.split(' ').join('');
}

function numeric(num) {
  return num.replace(/[^0-9.]/g, "");
}

function setValue(target, amount) {
  $('#'+target).val(amount);
  $('#'+target).attr('value', amount);
}

function getPieValues(array) {
  return _.map(array, function(i) {
    return +$('#' + i).val();
  });
}

function toggleMsg(elem, show) {
  return show? $(elem).fadeIn('fast') : $(elem).fadeOut('fast');
}

function disableSubmit(elem, bool) {
  return $(elem).prop('disabled', bool);
}

function reslicePie(target, array, full) {
  var sum = _.reduce(getPieValues(array), function(total, num) {
    return total += num;
  }, 0);

  var pie = _.reduce(array, function(obj, key) {
    obj[key] = +$('#'+key).attr('value');
    return obj;
  }, {});

  var chart  = pie_1.indexOf(target) >= 0? 'pie-chart' : 'pie-chart2';
  var number = 0;

  _.forIn(_.omit(pie, target), function(val, key) {
    ++number;
    pie['affected'+number] = key;
  });

  getPieValues(array).forEach(function(val, i) {
    val < 0? setValue(array[i], 0) : false;
    val > 100? setValue(array[i], 100) : false;
  });

  toggleMsg('#'+ chart, sum < 100 || sum > 100);
  disableSubmit('#submit-calculator-inputs', sum > 100 || sum < 100);

  D3.pie(getPieValues(array), chart);
}

initForLeadGenTool();

function initForLeadGenTool(){
  if($("#leadGenTool").val() == 'true') {
    if ($.cookie('email')) {//Get cookie email
      $('#submit-calculator-inputs').removeAttr("data-reveal-id").off('click.emailHandler');
      $("#email").val($.cookie('email'));
      // $(".calculator-form").submit();
    } else {
      $('#submit-calculator-inputs').attr("data-reveal-id", "SubmitEmailModal").on('click.emailHandler', function (e) {
        e.preventDefault();

        function isValidForm() {
          //Get email input
          var email = $("#emailInput").val();
          var firstName = $("#firstnameInput").val();
          var lastName = $("#lastnameInput").val();
          var filter = /^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{2,3})(\]?)$/;
          var validEmail = filter.test(email);
          var isValidForm = false;
          isValidForm = validEmail && !!(email && firstName && lastName);
          return isValidForm;
        }

        $("#submit-email-calculator").attr('disabled', 'disabled');
        $("#emailInput").on('keydown mousemove', function (event) {
          // To Disable Submit Button By Default
          var filter = /^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{2,3})(\]?)$/;
          var emailInput = $("#emailInput").val();
          if (isValidForm()) {
            $("#submit-email-calculator").removeAttr('disabled');
          }

          if (event.which == 13 && filter.test(emailInput) && emailInput != undefined) {
            event.preventDefault();
            //Set cookie email
            $.cookie('email', $("#emailInput").val(), {expires: 20*365, path: '/'});

            $("#email").val($("#emailInput").val());
            $("#firstname").val($("#firstnameInput").val());
            $("#lastname").val($("#lastnameInput").val());

            $(".calculator-form").submit();

            $('#SubmitEmailModal').foundation('reveal', 'close');
          }

        });

        $("#firstnameInput").on('keydown mousemove', function(event) {
          $("#submit-email-calculator").attr('disabled', 'disabled');
          if (isValidForm()) {
            $("#submit-email-calculator").removeAttr('disabled');
          }
        });

        $("#lastnameInput").on('keydown mousemove', function(event) {
          $("#submit-email-calculator").attr('disabled', 'disabled');
          if (isValidForm()) {
            $("#submit-email-calculator").removeAttr('disabled');
          }
        });

        // Just ask user email on the first time they visit
        $("#submit-email-calculator").on('click', function () {
          if (isValidForm()) {
            //Set cookie email
            $.cookie('email', $("#emailInput").val(), {expires: 20*365, path: '/'});

            $("#email").val($("#emailInput").val());
            $("#firstname").val($("#firstnameInput").val());
            $("#lastname").val($("#lastnameInput").val());

            $(".calculator-form").submit();

            $('#SubmitEmailModal').foundation('reveal', 'close');
          }
        });
      });
    }
  }
}

//Screenshot Issue Report
$('#reportIssue').click(function () {
  $(document).ready(function() {
    html2canvas(document.body, {
      onrendered: function (canvas) {
        var img = canvas.toDataURL("image/png");
        var rad = Math.random();
        var data = {
          img: img,
          rad: rad
        };
        $.post("/report", {data: data}, function (file) {
          console.log('Test');
        });
      }
    });
  });
});

//My account Edit/Save
$('#account-form input').attr('disabled', 'disabled');
$('#account-form button#delete-logo').attr('disabled', 'disabled');
$('#account-form button#upload-logo').attr('disabled', 'disabled');
$('#account-form textarea.general-input').attr('disabled', 'disabled');
$('#account-form div.toggle').addClass('hide');
$('#account-form div#reset-password-container a').addClass('hide');

$('.form-editable').find('*').removeAttr('disabled');
$('.editable').removeAttr('disabled');

$('.edit-account').on('click', function(e){
    e.preventDefault();

    $("#account-form input").removeAttr('disabled');
    $('#account-form button#delete-logo').removeAttr('disabled');
    $('#account-form button#upload-logo').removeAttr('disabled');
    $('#account-form textarea.general-input').removeAttr('disabled');
    $('#account-form input#subdomain').attr('disabled', 'disabled');
    $('#account-form div.toggle').removeClass('hide');
    $("button.edit-account").addClass('hide');
    $("button.save-account").removeClass('hide');
    $('#account-form div#reset-password-container a').removeClass('hide');
});

//The "back" button at the bottom of the page - Go previous page
$('#backPreviousPage').on('click', function(){
    window.history.back();
});

//Handle window scroll
$(document).on("scroll", function(e){
  if($(".container-portfolio-details").length){
    var portfolioDetail = $(".container-portfolio-details").offset().top;
    var strategy = $(".container-strategy").offset().top;
    var bottom = $(".container-strategy").offset().top + $(".container-strategy").height();

    var currentTop = $(document).scrollTop() + $(window).height();
    var percent = 0;
    if(currentTop >= bottom ){
      percent = 100;
    }else if(currentTop >= strategy){
      percent = 66;
    }else if(currentTop >= portfolioDetail){
      percent = 33;
    }

    $(".progress span").width(percent + "%")
    $(".progress .percent").text(percent + "%")
  }

});
