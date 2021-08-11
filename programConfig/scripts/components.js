function components_ui(cmpnt_name, cmpnt_type) {
    const xhttp = new XMLHttpRequest();
    xhttp.open('GET', 'components_ui.json', true);
    xhttp.send();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            let cmpnt = JSON.parse(this.responseText);
            if (cmpnt_name == 'bar_slctr') {
                for (let cmpnt_name of cmpnt) {
                    switch (cmpnt_type) {
                        case 'program':
                            $(".bar_slctr-img").attr("src", cmpnt_name.bar_slctr[0].prg[0].icon_url);
                            $('.cmpt_program_bsct').css({
                                'color': cmpnt_name.bar_slctr[0].prg[0].color,
                                'background-color': cmpnt_name.bar_slctr[0].prg[0].bk_color
                            });
                            $(".bar_slctr_cta").attr("src", cmpnt_name.bar_slctr[0].prg[0].icon_cta);
                            break;
                        case 'stage':
                            $(".bar_slctr-img").attr("src", cmpnt_name.bar_slctr[0].stage[0].icon_url);
                            $('.cmpt_program_bsct').css({
                                'color': cmpnt_name.bar_slctr[0].stage[0].color,
                                'background-color': cmpnt_name.bar_slctr[0].stage[0].bk_color,
                                'corsor': 'pointer'
                            });
                            $(".bar_slctr_cta").attr("src", cmpnt_name.bar_slctr[0].stage[0].icon_cta);
                            break;

                        case 'section':
                            $(".bar_slctr-img").attr("src", cmpnt_name.bar_slctr[0].section[0].icon_url);
                            $('.cmpt_program_bsct').css({
                                'color': cmpnt_name.bar_slctr[0].section[0].color,
                                'background-color': cmpnt_name.bar_slctr[0].section[0].bk_color,
                                'corsor': 'pointer'
                            });
                            $(".bar_slctr_cta").attr("src", cmpnt_name.bar_slctr[0].section[0].icon_cta);
                            break;
                    }
                }
            }
            if (cmpnt_name == 'fab') {
                console.log(cmpnt_name);
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
                            $(".bar_slctr_cta").attr("src", cmpnt_name.bar_slctr[0].stage[0].icon_cta);
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