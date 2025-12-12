export default {
	//science as alchemy
	//theology of language
	//science as alchemy (NOT)
	recommendSource : function(driver, uuid, recPrevUUIDs, cb){
		var query = "MATCH (s:Source {uuid: $uuid})<-[:TAGS]-(c1:Class)-[:TAGS]->(coSource:Source)<-[:TAGS]-(c2:Class)-[t:TAGS]->(coCoSource:Source) " +
	    "WHERE s <> coCoSource AND NOT coCoSource.uuid IN $recPrevUUIDs " + 
	    "WITH coCoSource LIMIT 173 " +
		"RETURN coCoSource"
		console.log(uuid);
		var params = {uuid : uuid, recPrevUUIDs : recPrevUUIDs};
		var session = driver.session()
		session.run(query,params).then(data => {
			cb(data);
		})
	}
}