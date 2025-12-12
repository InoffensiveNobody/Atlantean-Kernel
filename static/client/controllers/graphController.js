


function graph(data, cb){
  nodeUUIDs = [];

  var publishers = [];
		data.data.forEach(function(record){
			record._fields.forEach(function(field, i, arr){
				var source = arr[0]
				var author = arr[1]
				var classs = arr[2]
				
			
				
				if(ANCHOR.getParams() && ANCHOR.getParams().classes && ANCHOR.getParams().classes !== "undefined"){
				    var classes2 = JSON.parse(decodeEntities(decodeEntities(ANCHOR.getParams().classes))).split(",");
				  
				   	classes2.forEach(function(c, j){
				     classes2[j] = decodeEntities(decodeEntities(classes2[j].trim().toLowerCase())).replace(/\s/g,'')				   		
				   	})  
				  
				  
				}
				
				if(ANCHOR.getParams() && ANCHOR.getParams().title && ANCHOR.getParams().title !== "undefined"){
					var titles = decodeEntities(decodeEntities(ANCHOR.getParams().title)).split(" ");
					titles.forEach(function(t, j){
						titles[j] = remove_stopwords(titles[j]);
						titles[j] = decodeEntities(decodeEntities(titles[j].trim().toLowerCase())).replace("/\s/g, ''")
						titles[j] = titles[j].replace(/[!,:]/g, "");
					})
				}

				var publisher = arr[3]



				let checkNodes = gData.nodes.some(n => field && n.id === field.properties.uuid);
				if(checkNodes && field.labels[0] !== "Edition"){
					var foundIndex = gData.nodes.findIndex(x => x.id == field.properties.uuid);
					gData.nodes[foundIndex].count++;
				}
				else if(checkNodes){
					var foundIndex = gData.nodes.findIndex(x => x.id == field.properties[publisher]);
					gData.nodes[foundIndex].count++;
				}				
				else if(!checkNodes && field){
					
					if(field.labels[0] === "Source"){
						nodeUUIDs.push(field.properties.uuid);
						if(ANCHOR.getParams() && ANCHOR.getParams().title &&   titles.some(element => field.properties.title.toLowerCase().includes(element))){
							gData.nodes.push({id: field.properties.uuid, group: "Find Source", name :decodeEntities(decodeEntities(field.properties.title)), count : 1, color: "darkcyan"});
						}
						else{
							gData.nodes.push({id: field.properties.uuid, group: "Source", name :decodeEntities(decodeEntities(field.properties.title)), count : 1, color:"darkcyan"});

						}

					}
					else if(field.labels[0] === "Author"){
						console.log(field.properties.searchable)
						if(ANCHOR.getParams()  && ANCHOR.getParams().author && ANCHOR.getParams().author.toLowerCase().includes(field.properties.searchable.toLowerCase())){
							gData.nodes.push({id: field.properties.uuid, group: "Find Author", name : decodeEntities(decodeEntities(field.properties.author)), count :1, color:"cyan"})
						}
						else{
							gData.nodes.push({id: field.properties.uuid, group: "Author", name : decodeEntities(decodeEntities(field.properties.author)), count :1, color:"cyan"})

						}

					}
					else if(field.labels[0] === "Class"){
						//console.log(classes)
						
						if(ANCHOR.getParams() && ANCHOR.getParams().classes && classes2 && classes2.includes(field.properties.name.toLowerCase())){
							gData.nodes.push({id: field.properties.uuid, group: "Find Class", name :decodeEntities(decodeEntities(field.properties.name)), count :1, color: "darkgoldenrod"});

						}

						else{
							gData.nodes.push({id: field.properties.uuid, group: "Class", name :decodeEntities(decodeEntities(field.properties.name)), count :1, color: "darkgoldenrod"});

						}				
					}
					else if(field.labels[0] === "Edition"){

						var publisher = gData.nodes.find(obj => {
						  return obj.id === field.properties.publisher;
						})

						var publisherSearch = decodeEntities(decodeEntities(ANCHOR.getParams().publisher))

						if(ANCHOR.getParams() && ANCHOR.getParams().publisher && !publisher && publisherSearch.toLowerCase().includes(decodeEntities(decodeEntities(field.properties.publisher.toLowerCase())))){
							gData.nodes.push({id: field.properties.publisher, group: "Find Publisher", name :decodeEntities(decodeEntities(field.properties.publisher)), count: 1, color:"mediumvioletred"})
						}		
						else if(!publisher){
							gData.nodes.push({id: field.properties.publisher, group: "Publisher", name :decodeEntities(decodeEntities(field.properties.publisher)), count: 1, color:"mediumvioletred"})

						}
						

					}
				}
				
				
				if(i===0){
						//Source to Author
						if(field && author){
							var checkLinks = gData.links.some(l => author && l.source === author.properties.uuid && l.target === field.properties.uuid)
							if(!checkLinks){
								gData.links.push({source: author.properties.uuid, target: field.properties.uuid, value : 1})
							}	
						}
						//source to Class
						if(field && classs){
							var checkLinks = gData.links.some(l => classs && l.source === field.properties.uuid && l.target === classs.properties.uuid)
							if(!checkLinks){
								gData.links.push({source: field.properties.uuid, target: classs.properties.uuid, value : 1})
							}
						}

						//source to PUBLISHER
						if(field && publisher){
							var checkLinks = gData.links.some(l => publisher && l.source === field.properties.uuid && l.target === publisher.properties.publisher)
							if(!checkLinks){
								gData.links.push({source: field.properties.uuid, target: publisher.properties.publisher, value : 1})
							}
						}

						
						
						/*let checkLinks2 = gData.links.some(l => l.source === field.properties.uuid && l.target === arr[3].properties.uuid);
						if(!checkLinks2){
							gData.links.push({source: field.properties.uuid, target: arr[3].properties.uuid})
						}*/
						cb()
						//break;
						//Author to Source
					
					
				}
			})
		})

  
		
		if(ANCHOR.page() === "author"){
			graphRender("author_g")
		}
		else if(ANCHOR.page() === "class"){
			graphRender("class_g")
		}
		else if(ANCHOR.page() === "source"){
			graphRender("source_g")
		}
		else if(ANCHOR.page() === "publisher"){
			graphRender("publisher_g")
		}
		else if(ANCHOR.page() === "torrents"){
			graphRender("search_graph")
		}

}

function graphRender(selector){
	console.log(gData)
	const Graph = new ForceGraphVR(document.getElementById(selector)).graphData(gData)
        	.nodeVal(node=>{
        		/*if(node.group === "Find!"){
        			return 32;
        		}*/
        	})
          .nodeThreeObject(
                     function (node) {
                       if(node.group.includes("Find")){

	                       // Create text node
	                       const nodeSpriteText = new SpriteText(node.name);
	                       nodeSpriteText.fontSize = 17;
	                       nodeSpriteText.color = node.color;
	                       //nodeSpriteText.opacity = 0.75;
	                       nodeSpriteText.textHeight = 9;
	                       //nodeSpriteText.position.y = -14;// Move to the bottom


	                       return nodeSpriteText;
                   	   }
                     }
                  )
          .onNodeClick(function(node){
	        		if(node.group === "Source" || node.group === "Find Source"){
		        		ANCHOR.route("#source?uuid="+node.id)
		        	}
		        	else if(node.group === "Author" || node.group === "Find Author"){
		        		ANCHOR.route("#author?uuid="+node.id)
		        	}
		        	else if(node.group === "Class" || node.group === "Find Class"){
		        		ANCHOR.route("#class?uuid="+node.id)
		        	}
		        	else if(node.group === "Publisher" || node.group === "Find Publisher"){
		        		ANCHOR.route("#publisher?publisher="+encodeURIComponent(node.id))		        	
		        	}
              /*if (document.exitFullscreen) {
                  document.exitFullscreen();
              } else if (document.webkitExitFullscreen) {
                  document.webkitExitFullscreen();
              } else if (document.mozCancelFullScreen) {
                  document.mozCancelFullScreen();
              } else if (document.msExitFullscreen) {
                  document.msExitFullscreen();
              }*/
		        }).height(350).width($(window).width() - 10);
}


function initializeGraph(cb){
  
	gData = {
			nodes : [
			],
			links : [
			]
		}


	var windowsize = $(window).width();
    
    	$(".graph_search").fadeIn(2478);
    	

 
    $("#graph_plus").click(function(e){
    	e.preventDefault()
    	$("#graph_minus").fadeIn();
    	$(".graph_mobile").fadeOut();
    	$(".graph_search").fadeIn();
    	$(this).fadeOut();
    })
  
    $("#graph_heading").click(function(e){
      e.preventDefault();
    })

    $("#graph_minus").click(function(e){
    	e.preventDefault();
    	$("#graph_plus").fadeIn();
    	 $(".graph_mobile").fadeIn();
    	$(".graph_search").fadeOut();
    	$(this).fadeOut();
    })
	$("#graph_class_all").prop("checked",true)
	$("#graph_class_any").prop("checked", false)
  if(ANCHOR.getParams()){
    $("#graph_title").val(ANCHOR.getParams() && ANCHOR.getParams().title ? ANCHOR.getParams().title : "")
    $("#graph_author").val(ANCHOR.getParams() && ANCHOR.getParams().author ? ANCHOR.getParams().author : "")
    $("#graph_classes").val(ANCHOR.getParams() && ANCHOR.getParams().classes ? (decodeEntities(ANCHOR.getParams().classes) === "undefined" ? "" : decodeEntities(ANCHOR.getParams().classes).replace(/['"]+/g, '')) : "")
    $("#graph_publisher").val(ANCHOR.getParams() && ANCHOR.getParams().publisher ? decodeEntities(decodeEntities(ANCHOR.getParams().publisher)) : "");
    $("#graph_type").val(ANCHOR.getParams() && ANCHOR.getParams().type ? ANCHOR.getParams().type : "");
    $("#graph_media").val(ANCHOR.getParams() && ANCHOR.getParams().media ? ANCHOR.getParams().media : "");
    $("#graph_format").val(ANCHOR.getParams() && ANCHOR.getParams().format ? ANCHOR.getParams().format : "")
  }
	//console.log(decodeEntities(ANCHOR.getParams().publisher))
	if(ANCHOR.getParams() && ANCHOR.getParams().class_all === "true"){
		$("#graph_class_all").prop("checked", true)
		$("#graph_class_any").prop("checked", false)
	}
	else{
		$("#graph_class_all").prop("checked", false)
		$("#graph_class_any").prop("checked", true)
	}
	

	$.get("/advanced_search_ui", function(data){
		$("#graph_type").empty();
		$("#graph_type").append("<option value='all'>All Types</option>")
		$("#graph_media").empty();
		$("#graph_media").append("<option value='all'>All Media</option>")
		$("#graph_format").empty();
		$("#graph_format").append("<option value='all'>All Formats</option>")
		
		data.buoy.types.forEach(function(val){
			var option = document.createElement("option");
			$(option).val(val);
			$(option).text(decodeEntities(val));
			$("#graph_type").append(option);
			if(ANCHOR.getParams() && ANCHOR.getParams().type){
				$("#graph_type").val(ANCHOR.getParams() ? ANCHOR.getParams().type : "");
			}
		})
		data.buoy.media.forEach(function(val){
			var option = document.createElement("option");
			$(option).val(val);
			$(option).text(decodeEntities(val));
			$("#graph_media").append(option);
			if(ANCHOR.getParams() && ANCHOR.getParams().media){

				$("#graph_media").val(ANCHOR.getParams() ? ANCHOR.getParams().media : "")

			}
		})
		data.buoy.formats.forEach(function(val){
			var option = document.createElement("option");
			$(option).val(val);
			$(option).text(decodeEntities(val));
			$("#graph_format").append(option);
			if(ANCHOR.getParams() && ANCHOR.getParams().format){
				$("#graph_format").val(ANCHOR.getParams() ? ANCHOR.getParams().format : "")

			}
		})
	})
	$("#graph_submit").unbind('click')
	$("#graph_submit").click(function(){
    
		ANCHOR.route("#graph?search=true&title=" + $("#graph_title").val() + "&author=" + $("#graph_author").val() +
			"&classes=" + ($("#graph_classes").val() ? JSON.stringify($("#graph_classes").val()) : "") + "&class_all=" + $("#graph_class_all").prop("checked") + "&publisher=" + encodeURIComponent($("#graph_publisher").val()) + "&type=" + $("#graph_type").val() +
			"&media=" + $("#graph_media").val() + "&format=" + $("#graph_format").val())
    var url = window.location.hash.split("?")[1];
    document.cookie="search=" + url;
	})


	/*switch(ANCHOR.page()){
		case "source":
			$.get("source_graph/" + ANCHOR.getParams().uuid, function(data){
				graph(data, cb);	      		
			})
			break;
		case "graph":*/
 
  //window.history.pushState('#graph?', '', getCookie("search"));
 

	if(ANCHOR.page() === "torrents" && ANCHOR.getParams() && ANCHOR.getParams().search){
		$.post("/graph_search",  {title : ANCHOR.getParams() ? ANCHOR.getParams().title : "",
		author : ANCHOR.getParams() ? ANCHOR.getParams().author : "",
		classes : ANCHOR.getParams() ? ANCHOR.getParams().classes : "",
		class_all : ANCHOR.getParams() ? ANCHOR.getParams().class_all : "",
		publisher : ANCHOR.getParams() ? ANCHOR.getParams().publisher : "",
		type : ANCHOR.getParams() ? ANCHOR.getParams().type : "",
		media : ANCHOR.getParams() ? ANCHOR.getParams().media : "",
		format : ANCHOR.getParams() ? ANCHOR.getParams().format : "",
		search : ANCHOR.getParams() ? ANCHOR.getParams().search : ""}, function(data){
			graph(data,cb)
		})


	}
	
	

	//		break;
	//}

}

