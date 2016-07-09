$(function() {

  // Load D3 data for results tab
  $('.calculator-form').submit(function(e) {
    $('.graph, .legend').html('');

    requestedAjax(this, processResults);
  });

  // Load D3 data for print view
  if ($('#results-data-path').val()) {
    $('.page-print .graph').html('');

    printRequestedAjax($('#results-data-path').val(), function(data) {
      var isSavings = !_.isUndefined(data.accumtable);
      var chartData = isSavings? _.valuesIn(data.accumtable) : data.chartData;

      // Spending only
      determineResultsSummaryDisplay(data.keytable['NumberofYearsinRetirementHorizon']);

      binding(data);

      if (isSavings) {
        D3.line(chartData, 560-100, 280, 65-12, 20);
        D3.horizontal(chartData, 440, 215, 52);
      } else {
        toggleLinks(data.tableHead);
        D3.vertical(chartData, 520, 300, 65-8, data.tableHead.length);
      }
    });
  }
  // Print reports
  $('#print-page').click(function() {
    window.print();
  });

  $('.confirm-payment-form').submit(function() {
    $(this).find(':submit').attr('disabled', 'disabled');
  });

  $('.ajax-form').submit(function(e) {
    $(this).find('button').prop('disabled', true);
    e.preventDefault();

    postAjax(this, function(data) {
      binding(data);

      if (!_.isUndefined(data.modal)) {
        $(data.modal).foundation('reveal', 'open');
        $('.confirm-toggle').remove();
        $('.toggle-btns').append('<div class="confirm-toggle confirm-btn" hidden>Are You Sure?</div>');
        $('.confirm-toggle').unbind().one('click', function(e) {
          $(this).html('loading...');
          $('#submit-form').submit();
        });
      }
      if (!_.isUndefined(data.oldPlan)) {
        $('.'+ data.oldPlan +'-card, .radio-btns').hide();
      }
      if (!_.isUndefined(data.plan)) {
        $('.'+ data.plan).show();
      }
      if (!_.isUndefined(data.type)) {
        var path = _.isEqual(data.type, 'cancel')? 'reactivate' : 'cancel';

        $('.'+ data.type +'-subscription').hide();
        $('.confirm-toggle').hide();
        $('.'+ data.type + '-toggle').show();
        $('#submit-form').attr('action', '/user/subscription/'+path);
      }
    });
  });

  $('#contact-form').submit(function(e) {
    var $form = $(this);
    if ($form.valid()) {
      toggleSubmit(this, true);

      postAjax(this, function(elem) {
        flashMsg(elem);
      });
    }
  });

  // login and register ajax tabs
  // $('#register_form').submit(function(e) {
  //   var self = this;
  //   var id   = $(self).attr('data');
  //   var $form = $(this);
  //   if ($form.valid()) {
  //     toggleSubmit(self, true);
  //
  //     postAjax(self, function(res) {
  //       if (_.isUndefined(res.userMessage)) {
  //         $('#next-tab'+ id).click();
  //         $('#next-tab2-1').click();
  //         toggleNav('.register-link', '/user/logout', 'logout');
  //         toggleNav('.sign-in-link', '/user', 'My Account');
  //       } else {
  //         _.isEqual(res.code, 2001)?
  //           flashErrMsg('.tab-error', 'Acccount with that email already exists. Would you like to login?') :
  //            flashErrMsg('.tab-error', res.userMessage);
  //       }
  //
  //       _.isEqual(res.code, 2001)? $('#login-tab').click() : toggleSubmit(self, false);
  //     });
  //   }
  // });

});

function toggleNav(elem, href, html) {
  $(elem).html(html);
  $(elem).attr('href', href);
}


function toggleSubmit(elem, bool) {
  return $(elem).find('button[type=submit]').attr('disabled', bool);
}

function flashMsg(elem) {
  $(elem).fadeIn('slow');
  $(elem + '-text').addClass('error');
  $('#contact-form').find('.general-input').val('');
  $('#contact-form').find('button[type=submit]').attr('disabled', false);

  setTimeout(function() {
    $(elem).fadeOut('slow');
  }, 3000);
}

function processResults(data) {
  var isSavings = !_.isUndefined(data.accumtable);
  var chartData = isSavings? _.valuesIn(data.accumtable) : data.chartData;

  // Spending only
  determineResultsSummaryDisplay(data.keytable['NumberofYearsinRetirementHorizon']);

  binding(data);

  if (isSavings) {
    D3.line(chartData);
    D3.horizontal(chartData);
  } else {
    toggleLinks(data.tableHead);
    D3.vertical(chartData, false, false, false, data.tableHead.length);
  }
}

function determineResultsSummaryDisplay(years) {
  var links = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50];

  var eightiethBalance = $('#80thPercentileBalance');
  var lowestBalance    = $('#LowestBalance');

  links.forEach(function(year, i) {
    if (_.isEqual(year, Number(years))) {
      eightiethBalance.addClass('80thPercentileBalance'+i);
      lowestBalance.addClass('LowestBalance'+i);
    }
  });
}

function toggleLinks(data) {
  var links = ['5years', '10years', '15years', '20years', '25years', '30years', '35years', '40years', '45years', '50years'];

  _.forEach(links, function(val, i) {
    $('.'+ val +'-toggle').toggle(_.has(data[i], val));
  });
}

function binding(data) {
  $('.clear-table').html('');

  _.forIn(data, function(value, key) {
    $('.'+key).html(value);

    _.forIn(value, function(val, k) {
      $('.'+k).html(numberWithCommas(_.isArray(val) ? val[0] : val));

      _.forEach(val, function(v, i) {
        $('.'+i).html(v);
        $('.'+k+''+i).html('');
        $('.'+k+''+i).html(numberWithCommas(v));
      });

    });

  });
}

function flashErrMsg(elem, msg) {
  $(elem).html('').append(msg).fadeIn('slow').delay(5000).fadeOut();
}



function postAjax(form, cb) {
  var url  = $(form).attr('action');
  var data = $(form).serialize();

  $.post(url, data)
    .done(function(response) {
      cb(response);
    })
    .fail(function(err) {
      cb(JSON.parse(err));
    });
}

function requestedAjax(form, cb) {
  var url  = $(form).attr('action');
  var data = $(form).serialize();

  // Hide inputs content and display Ajax loading partial
  $('#content').hide();
  $('.ajax-loading').show();

  $.post(url, data)
    .done(function(response) {
      // Show inputs content and hide Ajax loading partial
      $('#content').show();
      $('.ajax-loading').hide();

      // Switch to results tab
      $('.tab-title').removeClass('disabled-results');
      $('#calculator-results-tab').click();

      cb(response);
    })
    .fail(function(err) {
      cb(JSON.parse(err));
    })
    .always(function() {
      console.info('complete');
    });
}

function printRequestedAjax(url, cb) {
  $.get(url)
    .done(function(response) {
      cb(response);
    })
    .fail(function(err) {
      cb(JSON.parse(err));
    })
    .always(function() {
      console.info('complete');
    });
}
