import WebTorrent from 'webtorrent-hybrid';
export default {
	initializeScrapePeers : function(driver){
		this.downloadAll(driver);
		var that = this;
		setInterval(function(){that.downloadAll(driver)}, 497000);
	},
	scrapePeers : function(err, driver){
		console.log(this.infoHashes)
		console.log(this.numPeers)
		var that = this;
		var session = driver.session();
		var query = "UNWIND range(0,size($infoHashes)-1) AS i " +
					// Do something for each element in the array. In this case connect two Things
					"MATCH (t:Torrent { infoHash : $infoHashes[i] }) " +
					"SET t.numPeers = $numPeers[i] "
		var params = {infoHashes : that.infoHashes, numPeers : that.numPeers}	
		session.run(query, params).then(data=>{

		})

	},
	downloadAll : function(driver){
		var that = this;
		var session = driver.session();
		var query = "MATCH (t:Torrent) " +
		"RETURN t"
		session.run(query, {}).then(data=>{
			data.records.forEach(function(torrent, i){
				if(that.recordsInfoHashes.indexOf(torrent._fields[0].properties.infoHash) === -1){
					console.log(torrent._fields[0].properties.infoHash)
					that.recordsInfoHashes.push(torrent._fields[0].properties.infoHash)
					that.client.add("magnet:?xt=urn:btih:" + torrent._fields[0].properties.infoHash, function(torrent){
						that.infoHashes.push(torrent.infoHash);
						that.numPeers.push(torrent.numPeers)
						that.bytes += torrent.length
						if(that.bytes >= 838860800){
							torrent.pause();
						}
					})	
				}
							
			})
			setTimeout(function(){
				console.log("THERE!!!")
				that.scrapePeers(null, driver)
			}, 497000)
		})
	}
	,
	bytes : 0
	,
	recordsInfoHashes : []
	,
	infoHashes : []
	,
	numPeers : []
	,
	client : new WebTorrent()
}