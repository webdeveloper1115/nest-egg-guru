$(document).ready(function() {
  var switched = false;
  
  var updateTables = function() {
    if (($(window).width() < 1024) && !switched ){ // CUSTOM EDIT: Changed 767 to 1024 (tablet)
      switched = true;
      $("table.responsive").each(function(i, element) {
        splitTable($(element));
      });
      return true;
    }
    else if (switched && ($(window).width() > 1024)) { // CUSTOM EDIT: Changed 767 to 1024 (tablet)
      switched = false;
      $("table.responsive").each(function(i, element) {
        unsplitTable($(element));
      });
    }
  };

  $(window).load(updateTables);
  $(window).on("redraw",function(){switched=false;updateTables();}); // An event to listen for
  $(window).on("resize", updateTables);


	function splitTable(original) {
		original.wrap("<div class='table-wrapper' />");

		var copy = original.clone();
		copy.find("td:not(:first-child), th:not(:first-child)").css("display", "none");
		copy.removeClass("responsive");

		original.closest(".table-wrapper").append(copy);
		copy.wrap("<div class='pinned' />");
		original.wrap("<div class='scrollable' />");

    // setCellHeights(original, copy); // CUSTOM EDIT: Commented out this line
	}

	function unsplitTable(original) {
    original.closest(".table-wrapper").find(".pinned").remove();
    original.unwrap();
    original.unwrap();
	}

  function setCellHeights(original, copy) {
    var tr = original.find('tr'),
        tr_copy = copy.find('tr'),
        heights = [];

    tr.each(function (index) {
      var self = $(this),
          tx = self.find('th, td');

      tx.each(function() {
        var height = $(this).outerHeight(true);
        heights[index] = heights[index] || 0;
        if (height > heights[index]) heights[index] = height;
      });

    });

    tr_copy.each(function (index) {
      $(this).height(heights[index]);
    });
  }

});
