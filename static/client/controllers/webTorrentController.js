const client = new WebTorrent();
const torrentId = "magnet:?xt=urn:btih:8a1b50903ecfa323c0979fa6d573e9b454ca5668&dn=atlantean-silo&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com"

const torrent = client.add(torrentId, function(torrent){
  console.log("Added atlantis-silo")
})

torrent.on('ready', () => {
    console.log("DOWNLOADED FILE LIST for atlantis-silo")
    if(ANCHOR.page() === "torrent"){
      selectFile(torrent);
    }
    $(document).on("ANCHOR", function(){
      if(ANCHOR.page() === "torrent"){
        $.get("../client/views/torrent.html", function(data){     
          $("div.torrent").html(data);  
          selectFile(torrent);
          ANCHOR.buffer(); //just in case
          /* AGILE */
        })  

      }
    })
  })
//https://instant.io/#8a1b50903ecfa323c0979fa6d573e9b454ca5668


function selectFile(torrent) {
  var $body = document.body;
  var $progressBar = document.querySelector("#progressBar")
  var $numPeers = document.querySelector("#numPeers");
  var $downloaded = document.querySelector("#downloaded")
  var $total = document.querySelector("#total")
  var $remaining = document.querySelector("#remaining")
  var $uploadSpeed = document.querySelector("#uploadSpeed")
  var $downloadSpeed = document.querySelector("#downloadSpeed")
  var $percent = document.querySelector("#percent");

  // Download the torrent
    
    
    const files = torrent.files.filter(file => {
      return file.length === parseInt(ANCHOR.getParams().id);

    })
    const file = files[0]
    file.select();
    file.appendTo(document.querySelector('#output'))
    file.on('done', onDone)
      
    
    // Stream the file in the browser
    

    // Trigger statistics refresh
    
    const interval = setInterval(onProgress, 500)
    onProgress()

    // Statistics
    function onProgress () {
    // Peers
      $numPeers.innerHTML = torrent.numPeers + (torrent.numPeers === 1 ? ' peer' : ' peers')

      // Progress
      const percent = Math.floor(file.progress * 100);
      $percent.innerHTML = percent + '%'
      //$progressBar.style.width = percent + '%'
      $downloaded.innerHTML = prettyBytes(file.downloaded)
      $total.innerHTML = prettyBytes(file.length)

      // Remaining time
     let remaining

if (file.progress === 1) {
    // File is complete
    remaining = 'Done.'
    clearInterval(interval);
} else {
    // Get the total speed of the torrent
    const downloadSpeed = torrent.downloadSpeed; // in bytes/s
    console.log(downloadSpeed);
    // 1. Calculate the number of bytes left to download for this file
    const bytesRemaining = file.length - file.downloaded;

    let timeRemainingSeconds = Infinity;

    if (downloadSpeed > 0) {
        // 2. Calculate the time remaining in seconds (Bytes / Bytes/s)
        timeRemainingSeconds = bytesRemaining / downloadSpeed;
    }

    // 3. Convert to a human-readable format
    
    // Check if the time is a valid, finite number
    if (isFinite(timeRemainingSeconds)) {
        // Use timeRemainingSeconds as the argument for moment.duration
        remaining = moment.duration(timeRemainingSeconds, 'seconds').humanize()

        // Apply your requested capitalization and suffix (e.g., "1 Hour remaining.")
        // Note: I use charAt(0) for safe capitalization.
        remaining = remaining.charAt(0).toUpperCase() + remaining.substring(1) + ' remaining.'
    } else {
        // If speed is 0 or infinite (stalled or error)
        remaining = 'Stalled'
    }

    
}

  // Update the DOM element
  $remaining.innerHTML = remaining

      // Speed rates
      $downloadSpeed.innerHTML = prettyBytes(torrent.downloadSpeed) + '/s'
      $uploadSpeed.innerHTML = prettyBytes(torrent.uploadSpeed) + '/s'
    }
    function onDone () {
      $body.className += ' is-seed'
      onProgress()
      $.post("/snatched/" + file.length)
    }
  
}
