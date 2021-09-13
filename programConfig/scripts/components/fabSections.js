$(document).ready(function () {
    components_ui('fab', 'ml_item');
    //vertical
    var sv = $(document).scrollTop();
    //horizontal
    var sh = $(document).scrollLeft();

    $(".fab_section").on("mouseover", function () {
        //$("#menuCapa").css("top", e.pageY - 20);
        //$("#menuCapa").css("left", e.pageX - 20);
        var fabid = "#" + $(this).attr("id");
        var coordenate = $(fabid).position();
        var coordenate_top = coordenate.top;
        console.log("Y: " + coordenate_top + " X: " + coordenate.left);

        $("#menuCapa").css("top", coordenate.top);
        $("#menuCapa").css("left", coordenate.left);
        $("#menuCapa").show('fast');
    });
});



