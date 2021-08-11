function expandCollapse() {
	if($(".survey_dEs").css('display') == 'none') {
		$("#expand-collapse").html("Collapse All");
		$(".survey_dEs").show("slow");
	} else {
		$("#expand-collapse").html("Expand All");
		$(".survey_dEs").hide("slow");
	}
}