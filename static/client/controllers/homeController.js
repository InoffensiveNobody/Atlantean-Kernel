function initializeHome(){
	$.get("/snatches", function(data){ 
		$("#num_torrents_stat").text(numberWithCommas(data.torrents));
		$("#num_snatches_stat").text(numberWithCommas(data.snatches)); 
	})	
} 