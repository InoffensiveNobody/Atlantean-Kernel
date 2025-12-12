function switchBuoy(){
	$.get("/home?user="+ (getUser() ? getUser().uuid : null), function(data){
		setAccess(data.access);
		setBuoy(data.buoy);
		setPanel();
		setTabs();
		setH1();
		//$(".buoy_select").val(ANCHOR.getParams().buoy)
	})
}


function initializeBuoySelect(uuid){
	$(".buoy_select").empty();
	$(".buoy_select").hide();
	console.log("UUID " + uuid);
	$.get("/buoys", function(data){
		console.log(data);
		data.buoys.forEach(function(record){
		console.log("HERE")
		console.log(record);
		//if(buoy.uuid !== "b5d89482-b58d-11ed-afa1-0242ac120002" && buoy.uuid !== "d2b358ee-b58d-11ed-afa1-0242ac120002"){
		var option = document.createElement("option");
		$(option).text(record._fields[0].properties.buoy);
		$(option).val(record._fields[0].properties.uuid);
		$(".buoy_select").append(option)
		})
		if(uuid && uuid !== "undefined")
			$(".buoy_select").val(uuid);
		$(".buoy_select").on('change', function(){
			ANCHOR.route("#" + ANCHOR.page() + (ANCHOR.page() === "user" ? "?user=" + getUser().uuid : ""))
			$.get("/buoy/" + $(this).val(), function(data){				
				switchBuoy();
				console.log(getBuoy().uuid);					
			})
		})
		$(".buoy_select").fadeIn(6000)

	})	
	
}

function setPanel(){
	$(".upload_panel").attr("href", "#upload")
	$(".login").attr("href", "#login")
	$(".register").attr("href", "#register")
	$(".user_profile").attr("href", "#user")
	$(".logout").attr("href", "#home");
	$(".file_manager").attr("href", "#file_manager");
  $(".snatches").show();
  $("#dmca a").click(function(e){
  	e.preventDefault();
  	alert("Please direct your DMCA complaint to: inevitableambrosia@gmail.com. We upload from Project Gutenberg, Internet Archive, and PDF results found freely on Google. This is an educational BitTorrent indexer, for public domain and freely available PDFs and audibooks only. If you have found something that should not be, please direct a DMCA complaint to my email address, including the torrent infoHash if possible. Thank you for your understanding in this matter.")
  })
	//$.get("/snatches", function(data){ $(".snatches").text(numberWithCommas(data.snatches)); $(".torrents_stat").text(numberWithCommas(data.torrents)) })
	ANCHOR.buffer();
}

function setTabs(){
	$(".torrentTab").attr("href", "#torrents");
	$(".classesTab").attr("href", "#classes");
	$(".top10Tab").attr("href", "#top10");
	$(".worldSpiritTab").attr("href", "#world_spirit")
	$(".graphTab").attr("href", "#graph");
	ANCHOR.buffer();
}

function setH1(){
  $("#rdm").click(function(e){
    e.preventDefault();
    $.post("/rdm", function(data){
      ANCHOR.route("#source?uuid=" + data.uuid)
    })
  })
	ANCHOR.buffer();
}


function userPanel(user){
	if(user){
    $(".user_profile").attr("href", "#user?uuid=" + user.uuid)
		$(".user_profile").text(user.user);
		$(".user_li").fadeIn('slow');
		$(".logout_li").fadeIn('slow');
		$(".login_li").hide();
		$(".reg_li").hide();
		$(".create_buoy_li").fadeIn('slow');
    
	}
	else{
		$(".user_li").hide();
		$(".logout_li").hide();
		$(".login_li").fadeIn('fast');
		$(".reg_li").fadeIn('fast');
		$(".create_buoy_li").hide();
	}
}

function initializeUserPanel(){
	$(".create_buoy_li").hide();
	$(".user_li").hide();
	$(".logout_li").hide();
	$(".login_li").hide();
	$(".reg_li").hide();
	
}
