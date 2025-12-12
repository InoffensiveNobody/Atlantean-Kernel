function processMermaid(){
	$.post("/recommend/source?uuid=" + ANCHOR.getParams().uuid + "&recPrevUUIDs=" + JSON.stringify(recPrevUUIDs), function(data){
      recPrevUUIDs.push(ANCHOR.getParams().uuid)
      var uuid = data.uuid;
      //ANCHOR.removeParams("uuid");
      console.log(data)
      //ANCHOR.setParams("uuid", data.source)
      ANCHOR.route("#source?uuid=" + data.source)
    })
}

