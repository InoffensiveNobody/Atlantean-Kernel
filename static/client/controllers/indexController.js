var loader;
var count = 0;
var loaderInitialized = true;
var recPrevUUIDs = []
/*
TODO: Jquery UI for autocomplete search
$('#myElement').animate({backgroundColor: '#FF0000'}, 'slow');
var i = 0;
function change() {
  var doc = document.getElementById("overlay");
  var color = ["palegoldenrod", "lightcyan"];
  doc.style.backgroundColor = color[i];
  i = (i + 1) % color.length;
}
setInterval(change, 889);*/
			
var ppInterval;


function initializePP(){
$('#popupImage')
	   //.hide()
	   .fadeIn(737);
 	 

 	 var pp=1;
 	  ppInterval = setInterval(function(){
 	 	if(pp === 2){
 	 		pp=1;
 	 		$("#popupImage").fadeOut(737);
 	 		$("#popupImage2").fadeIn(737);
 	 	}
 	 	else{
 	 		pp=2;
 	 		$("#popupImage2").fadeOut(737);
 	 		$("#popupImage").fadeIn(737);
 	 	}
 	 },737)
}

function dismissPP(){
	if(ppInterval)
 			clearInterval(ppInterval);
	$(".popupImage").hide();
 		
}

 function initializeLoader(){
 	if(!loaderInitialized){
 		loaderInitialized = true;
 	  initializePP();
	 	$('#overlay').show();
	 	$(".mobile_menu").slideUp();
	 }
 	 
 }

 function dismissLoader(){
 	if(loaderInitialized){
    setTimeout(function(){
      $(".loading").hide();
      $("h2:not(.loading)").fadeIn()  
    }, 555)
    
 	  $("#overlay").hide();
	  //if(loader){
 		dismissPP();


	 	//}
	 	loaderInitialized = false;
	 	//$(".ANCHOR_partial ." + ANCHOR.page()).fadeIn(1337);
	 	//ANCHOR._show_div(ANCHOR.page());
 	}
 }//


 function init(){
 	
 	if(ANCHOR.page() !== "upload" && ANCHOR.page() !== "file_manager" && ANCHOR.page() !== "login" && ANCHOR.page() !== "register" && ANCHOR.page() !== "create_buoy" 
 		&& ANCHOR.page() !== "torrent"){
		initializeLoader();
	}

	$(".autosuggestBox").hide();
	
	ANCHOR.buffer();
 }

 function pages(){
 	console.log(ANCHOR.page())
  $(".loading").text("Loading...!")
  //$(".ANCHOR_partial").hide();
  //audioModel.audio.pause();

	
		//initializeLoader();
    //console.log(sourceUUID, ANCHOR.getParams().uuid)
    var $window = $(window)
    var windowsize = $window.width();
    console.log(ANCHOR.page())

	if(!ANCHOR.page() || ANCHOR.page() === "home" && !homeLoaded){
		homeLoaded = true;
		$.get("../client/views/home.html", function(data){
			$("div.home").html(data);
			initializeHome();
        	$("div.home").show();;
			ANCHOR.buffer();
		})
	}
    if(ANCHOR.page()  === "torrents"){
   
    	$.get("../client/views/torrents.html", function(data){
          
					
          
          
          if(ANCHOR.getParams() && ANCHOR.getParams().search){
          	$("div.torrents").html(data)

          	htmlSearch();
          	torrentsLoaded = false;
          	initializeTorrents("torrents", dismissLoader)
          }
          else if(!torrentsLoaded){
          	$("div.torrents").html(data)

          	htmlSearch();
          	torrentsLoaded = true;
          	initializeTorrents("torrents", dismissLoader)

          }
          else{
     		assertTorrentsTitleLoaded();

          }
          $("div.torrents").show();

		  	initializeGraph(dismissLoader)
    		ANCHOR.buffer();
    	})
  	}
    else  if(ANCHOR.page() === "source" && ANCHOR.getParams() && ANCHOR.getParams().uuid !== uuid){
      uuid = ANCHOR.getParams().uuid;
		  
		  	
		  	if(!sourceLoaded){
		  		  	sourceLoaded = true;
		  			$.get("../client/views/source.html", function(data){
							
						$("div.source").html(data);
             			$("div.source").show();
             			assertHieroglyph();
						assertMermaid();
 						initializeTorrents(ANCHOR.page(), dismissLoader);

 						ANCHOR.buffer();
 					})
		  	}
		  	else{
			  $("div.source").show();
         		console.log("hi")
         		assertHieroglyph();
		  		initializeTorrents(ANCHOR.page(), dismissLoader);

		  	}  	
		
		  
		  //if(windowsize >= 1080) {
		  	//initializeGraph(dismissLoader)
		  //}
    }
    else if(ANCHOR.page() === "author" && ANCHOR.getParams() && ANCHOR.getParams().uuid !== uuid){
      uuid = ANCHOR.getParams().uuid;

    	if(!authorLoaded){
    		  		authorLoaded = true;

    		$.get("../client/views/author.html", function(data){
    			$("div.author").html(data);
          		$("div.author").show()
  				
		 		initializeTorrents(ANCHOR.page(), dismissLoader);
		 	    ANCHOR.buffer();

    		})
    	}
    	else{
        $("div.author").show();
		  	initializeTorrents(ANCHOR.page(), dismissLoader);

    	}
    	  		
    }
    else if(ANCHOR.page() === "class" && ANCHOR.getParams() && ANCHOR.getParams().uuid !== uuid){
      uuid = ANCHOR.getParams().uuid;
		  if(!classLoaded){
		  	classLoaded = true;
    		$.get("../client/views/class.html", function(data){
    			$("div.class").html(data);
          		$("div.class").show();  			
		 		initializeTorrents(ANCHOR.page(), dismissLoader);
		 		ANCHOR.buffer();

    		})
    	}
    	else{
        $("div.class").show();
		  	initializeTorrents(ANCHOR.page(), dismissLoader);

    	}
		//  if(windowsize >= 1080) {
		  	//initializeGraph(dismissLoader)
		//  }
    }
    else if(ANCHOR.page() === "publisher" && ANCHOR.getParams() && ANCHOR.getParams().publisher !== uuid){
      uuid = ANCHOR.getParams().publisher;
		  if(!publisherLoaded){
		  	publisherLoaded = true;
    		$.get("../client/views/publisher.html", function(data){
    			$("div.publisher").html(data);
          $("div.publisher").show();
    			
          initializeTorrents(ANCHOR.page(), dismissLoader);
		 			ANCHOR.buffer();
    		})
    	}
    	else{
        $("div.publisher").show()
		  	initializeTorrents(ANCHOR.page(), dismissLoader);

    	}
		//  if(windowsize >= 1080) {
		  	//initializeGraph(dismissLoader)
		//  }
    }
   

	else if(ANCHOR.page() === "top10"){
		//sort of wonky dismisslaoder

		$.get("../client/views/top10.html", function(data){
			
      if(!top10Loaded){
      	$("div.top10").html(data);
      	
      	top10Loaded = true;
      	initializeTorrents("top10_day", dismissLoader);
	    initializeTorrents("top10_week", dismissLoader);
	    initializeTorrents("top10_month", dismissLoader);
	    initializeTorrents("top10_year", dismissLoader);
	    ANCHOR.buffer();
	    htmlSearch();
      }
      $("div.top10").show();
      

		})
    	
    	

		//initializeTorrents("top10_alltime", dismissLoader);
	}
	else if(ANCHOR.page() === "upload"){
		count++;
		$.get("../client/views/upload.html", function(data){
			$("div.upload").html(data);
			htmlUpload();
      htmlSearch();
      $("div.upload").show();
      		initializeUpload(dismissLoader);
			ANCHOR.buffer();

		})
		//initializeLoader();
	}
	else if(ANCHOR.page() === "publishers"){
		if(!publishersLoaded){
			publishersLoaded  = true;
			$.get("../client/views/publishers.html", function(data){
				$("div.publishers").html(data);
				initializePublishers(dismissLoader);
        $("div.publishers").show();
				ANCHOR.buffer();			
			})
		}
	}
	else if(ANCHOR.page() === "authors" && !authorsLoaded){
		authorsLoaded = true;
		initializeAuthors(dismissLoader)
		$.get("../client/views/authors.html", function(data){
				$("div.authors").html(data);
				initializeAuthors(dismissLoader);	
        $("div.authors").show();
				ANCHOR.buffer();		
			})
	}
	else if(ANCHOR.page() === "classes"){
		initializeLoader();
   		if(!classesLoaded){
		  classesLoaded=true;
      $.get("../client/views/classes.html", function(data){
				$("div.classes").html(data);
				initializeClasses(dismissLoader);			
				ANCHOR.buffer();
        $("div.classes").show();
			})
      initializeClasses(dismissLoader);
            
   		 }	
   	}	
}
 

$(document).ready(function(){
	

	var $window = $(window);
	ANCHOR.setDefault("home")
  
  // Bind event listener
  function checkWidth() {
	  var windowsize = $window.width();
	  if (windowsize >= 1080) {
	      //if the window is greater than 440px wide then turn on jScrollPane..
	      $(".mobile_menu").hide();
	  }
	}
  $(window).resize(checkWidth);

	$(document).on("ANCHOR", function(){
		if(!firstLoad){
			//so the loader appears to reload when headers are clicked while original page is loading
			init();
			pages();
		}
		firstLoad = false;    
		$(".mobile_menu").slideUp();
	})


	//mobile




/*$("#add_class_button").click(function(){
console.log("clicked");
$("#add_class_button").attr("disabled", "disabled")
$.post("/add_class", {name : $("#class_name").val()}, function(data){
	ANCHOR.route("#class?uuid=" + data.uuid);
})
})*/
					
							
$.get("../client/views/header.html", function(data){
	$("header").html(data);
	$("header").show();
	$('#mobile_menu').click(function(e){
		e.preventDefault();
  		$(".mobile_menu").slideToggle();

	})   
	$.get("../client/views/torrent.html", function(data){
		$("div.torrent").html(data);  
		//DONT FORGET TO BUFFER			
	})


   htmlSearch();
	

  initializeUserPanel();			
  ANCHOR.buffer();																				
  var page = ANCHOR.page();
  if(!$.isEmptyObject(ANCHOR.getParams())){
    ANCHOR.route("#" + page + "?" + ANCHOR.getParamsString());
  }							    	
  else{
    ANCHOR.route("#" + page)
  }

  init();
  

  pages();   
	
})

})