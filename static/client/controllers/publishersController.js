var publishersTable;
function initializePublishers(cb){
	$("#add_class_button").removeAttr("disabled")
	if(publishersTable){
		publishersTable.destroy();
		$("#publishers tbody").empty();
		//torrentsTable.draw();
	}
	
	publishersTable = $("#publishers").DataTable({
		responsive : true,
		serverSide : true,
		pageLength: 25,
		processing: true,
		searching: false, paging : true, info: true,
		stateSave: true,
		ajax: {
			url: "/publishers",
			type: "POST",
			dataSrc : function(data){

				var records = [];

				data.data.forEach(function(record){
			      	//if(record._fields[0].properties.name && record._fields[0].properties.name !== "undefined" && record._fields[2] && record._fields[3]){
			      		records.push(["<a class='ANCHOR publisher' href='#publisher?publisher=" + record.publisher + "'>" + decodeEntities(decodeEntities(record.publisher)) +"</a>", 
				      	record.count ? record.count : "", record.snatches ? record.snatches : 0] 
				      	)
			      	
				      
			    })	
			     
			      
			    
			    return records;
			}
		},
    drawCallback : function(){
      cb();
    }
  	})


}