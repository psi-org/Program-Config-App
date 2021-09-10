$(document).ready(function () {
      components_ui('multilevel_list', 'section');
      $('.bsct_cta').on("click", function () {
            if($(this).attr('src') == 'images/i-expanded-bottom_black.svg'){
                  $(this).attr('src', 'images/i-contracted-bottom_black.svg');
                  $(this).parent().parent().css({
                        'margin' : '0px',
                        'border-radius' : '4px 4px 0 0'
                  });
                  $(this).parent().parent().next().css({
                        'display': 'block'
                  });
            }else{
                  $(this).attr('src', 'images/i-expanded-bottom_black.svg');
                  $(this).parent().parent().css({
                        'margin' : '0 0 8px',
                        'border-radius' : '4px'
                  });
                  $(this).parent().parent().next().css({
                        'display': 'none'
                  });
            }
      });

      $(function() {
            $("#sortable, #userFacets").sortable({
              connectWith: "ul",
              placeholder: "placeholder",
              delay: 150
            })
            .disableSelection()
            .dblclick( function(e){
              var item = e.target;
              if (e.currentTarget.id === 'sortable') {
                //move from all to user
                $(item).fadeOut('fast', function() {
                  $(item).appendTo($('#userFacets')).fadeIn('slow');
                });
              } else {
                //move from user to all
                $(item).fadeOut('fast', function() {
                  $(item).appendTo($('#sortable')).fadeIn('slow');
                });
              }
            });
          });
});