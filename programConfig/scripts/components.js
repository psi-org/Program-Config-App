function components_ui(cmpnt_name, cmpnt_type) {
    const xhttp = new XMLHttpRequest();
    xhttp.open('GET', 'components_ui.json', true);
    xhttp.send();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            let cmpnt = JSON.parse(this.responseText);
            if (cmpnt_name == 'multilevel_list') {
                for (let cmpnt_name of cmpnt) {
                    switch (cmpnt_type) {
                        case 'program':
                            $(".multilevel_list-img").attr("src", cmpnt_name.multilevel_list[0].prg[0].icon_url);
                            $('.bsct').css({
                                'color': cmpnt_name.multilevel_list[0].prg[0].color,
                                'background-color': cmpnt_name.multilevel_list[0].prg[0].bk_color
                            });
                            $(".bsct_cta").attr("src", cmpnt_name.multilevel_list[0].prg[0].icon_cta);
                            break;
                        case 'stage':
                            $(".multilevel_list-img").attr("src", cmpnt_name.multilevel_list[0].stage[0].icon_url);
                            $('.bsct').css({
                                'color': cmpnt_name.multilevel_list[0].stage[0].color,
                                'background-color': cmpnt_name.multilevel_list[0].stage[0].bk_color,
                                'corsor': 'pointer'
                            });
                            $(".bsct_cta").attr("src", cmpnt_name.multilevel_list[0].stage[0].icon_cta);
                            break;

                        case 'section':
                            $(".multilevel_list-img").attr("src", cmpnt_name.multilevel_list[0].section[0].icon_url);
                            $('.bsct').css({
                                'color': cmpnt_name.multilevel_list[0].section[0].color,
                                'background-color': cmpnt_name.multilevel_list[0].section[0].bk_color,
                                'corsor': 'pointer'
                            });
                            $(".bsct_cta").attr("src", cmpnt_name.multilevel_list[0].section[0].icon_cta);
                            $(".section_cont").find(".multilevel_list-img").attr("src", cmpnt_name.multilevel_list[0].section[0].data_elements[0].icon_url);
                            $(".section_cont").children().css({
                                'color': cmpnt_name.multilevel_list[0].section[0].data_elements[0].color,
                                'background-color': cmpnt_name.multilevel_list[0].section[0].data_elements[0].bk_color,
                                'corsor': 'pointer'
                            });
                            $(".section_cont").find(".bsct_cta").attr("src", cmpnt_name.multilevel_list[0].section[0].data_elements[0].icon_cta);
                            break;
                    }
                }
            }
            if (cmpnt_name == 'fab') {
                for (let cmpnt_name of cmpnt) {
                    switch (cmpnt_type) {
                        case 'program':
                            $('.fab').css({
                                'color': cmpnt_name.fab[0].prg[0].color,
                                'background-color': cmpnt_name.fab[0].prg[0].bk_color,
                                'corsor': 'pointer'
                            });
                            break;
                        case 'stage':
                            $('.fab').css({
                                'color': cmpnt_name.fab[0].stage[0].color,
                                'background-color': cmpnt_name.fab[0].stage[0].bk_color,
                                'corsor': 'pointer'
                            });
                            $(".bsct_cta").attr("src", cmpnt_name.multilevel_list[0].stage[0].icon_cta);
                            break;

                        case 'section':
                            $('.fab').css({
                                'color': cmpnt_name.fab[0].section[0].color,
                                'background-color': cmpnt_name.fab[0].section[0].bk_color,
                                'corsor': 'pointer'
                            });
                            break;
                    }
                }
            }
        }
    }
}