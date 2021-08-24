$(document).ready(function () {
      components_ui('bsctr', 'section');
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
});