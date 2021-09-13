$(document).ready(function () {
      components_ui('ml_list', 'ml_item');
      $('.bsct_cta').on("click", function () {
            if ($(this).attr('src') == 'images/i-expanded-bottom_black.svg') {
                  $(this).attr('src', 'images/i-contracted-bottom_black.svg');
                  $(this).parent().parent().css({
                        'margin': '0px',
                        'border-radius': '4px 4px 0 0'
                  });
                  $(this).parent().parent().next().css({
                        'display': 'block'
                  });
            } else {
                  $(this).attr('src', 'images/i-expanded-bottom_black.svg');
                  $(this).parent().parent().css({
                        'margin': '0 0 8px',
                        'border-radius': '4px'
                  });
                  $(this).parent().parent().next().css({
                        'display': 'none'
                  });
            }
      });

      $(function () {
            $("#sort_sections").sortable({
                  connectWith: "sort-list-sections",
                  placeholder: "placeholder",
                  delay: 150
            }).disableSelection().dblclick(function (e) {
                  var item = e.target;
                  if (e.currentTarget.id === 'sort_sections') {
                        $(item).fadeOut('fast', function () {
                              $(item).appendTo($('#survey')).fadeIn('slow');
                        });
                  } else {
                        $(item).fadeOut('fast', function () {
                              $(item).appendTo($('#sort_sections')).fadeIn('slow');
                        });
                  }
            });

            $("#sort_des").sortable({
                  connectWith: "sort-list-des",
                  placeholder: "placeholder",
                  delay: 150
            }).disableSelection().dblclick(function (e) {
                  var item = e.target;
                  if (e.currentTarget.id === 'sort_des') {
                        $(item).fadeOut('fast', function () {
                              $(item).appendTo($('#survey')).fadeIn('slow');
                        });
                  } else {
                        $(item).fadeOut('fast', function () {
                              $(item).appendTo($('#sort_des')).fadeIn('slow');
                        });
                  }
            });
      });
});