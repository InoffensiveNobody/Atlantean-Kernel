function assertTitleLoading(){
  $("h2 span").hide();

  $("h2 span").text("Loading...").addClass("loading").fadeIn(333)
}

//because when the page is already loaded, initializeTorrents isn't called
function assertTorrentsTitleLoaded(){
  $("#torrentsTitle span").text("Torrents").removeClass("loading").fadeIn(3000)

}

function assertTitleLoaded(){

  switch (ANCHOR.page()) {
    case "torrents":
      assertTorrentsTitleLoaded();
      break;
    case "top10":
      $("#top10Title span").text("Top 10").removeClass("loading").show();
    case "source":
       console.log("SOURCE")
      //TODO: maybe multiple calls here
      //$.get("/source_info/" + ANCHOR.getParams().uuid, function (data) {
        $("#sourceTitle span").text(decodeEntities(decodeEntities(tableData.data[0]._fields[0].properties.title))).removeClass("loading").show()
        /*$("#addFormat").click(function () {
          ANCHOR.route("#upload?uuid=" + ANCHOR.getParams().uuid);
        });*/
     
        ANCHOR.buffer();
      //});
      break;
    case "author":
    
         $("#authorTitle span").text(decodeEntities(decodeEntities(tableData.data[0]._fields[5].properties.author))).removeClass("loading").show()
         

      break;
    case "class":
      $("#classTitle span").text(decodeEntities(decodeEntities(tableData.data[0]._fields[5].properties.name))).removeClass("loading").show()
      
      break;
    case "publisher":
      $("#publisherTitle span").text(decodeEntities(decodeEntities(ANCHOR.getParams().publisher))).removeClass("loading").show();
      
      break;

  }
}

function assertAdvToggle(){
  $(".adv_plus").unbind("click");
  $(".adv_minus").unbind("click");
 
  var adv_showing = false;
  $(".adv_header_button").click(function (e) {
    e.preventDefault();
    if(adv_showing){
      adv_showing = !adv_showing;
      $("#adv_heading");
      $(".adv_minus").hide();
      $(".adv_plus").fadeIn(333);
      setTimeout(function () {
        $(".adv_search").css({ height: 60 });
      }, 333);
      $(".adv_show").slideUp();
    }
    else{
      adv_showing = !adv_showing;
      $("#adv_heading");
      $(".adv_plus").hide();
      $(".adv_minus").fadeIn(333);
      $(".adv_show").slideDown();
      setTimeout(function () {
        $(".adv_search").css({ height: 480 });
      }, 333);
    }
    
  });
}

function assertGraphSearch(){
  $("#adv_class_all").prop("checked", false);
  $("#adv_class_any").prop("checked", true)
  
  if(ANCHOR.getParams() && ANCHOR.getParams.class_all){
    
    $("#adv_class_all").prop("checked", true);
    $("#adv_class_any").prop("checked", false);
  }
  else{
    $("#adv_class_all").prop("checked", false);
    $("#adv_class_any").prop("checked", true);
  }
  $("#adv_title").val(
    ANCHOR.getParams() && ANCHOR.getParams().title
      ? ANCHOR.getParams().title
      : ""
  );
  $("#adv_author").val(
    ANCHOR.getParams() && ANCHOR.getParams().author
      ? ANCHOR.getParams().author
      : ""
  );
  $("#adv_classes").val(
    ANCHOR.getParams() && ANCHOR.getParams().classes
      ? decodeEntities(ANCHOR.getParams().classes) === "undefined"
        ? ""
        : decodeEntities(ANCHOR.getParams().classes).replace(/['"]+/g, "")
      : ""
  );
  $("#adv_publisher").val(
    ANCHOR.getParams() && ANCHOR.getParams().publisher
      ? ANCHOR.getParams().publisher
      : ""
  );
  $("#adv_type").val(
    ANCHOR.getParams() && ANCHOR.getParams().type ? ANCHOR.getParams().type : ""
  );
  $("#adv_media").val(
    ANCHOR.getParams() && ANCHOR.getParams().media
      ? ANCHOR.getParams().media
      : ""
  );
  $("#adv_format").val(
    ANCHOR.getParams() && ANCHOR.getParams().format
      ? ANCHOR.getParams().format
      : ""
  );
}

function assertAdvSearchUI(){
  $.get("/advanced_search_ui", function (data) {
    $("#adv_type").empty();
    $("#adv_type").append("<option value='all'>All Types</option>");
    $("#adv_media").empty();
    $("#adv_media").append("<option value='all'>All Media</option>");
    $("#adv_format").empty();
    $("#adv_format").append("<option value='all'>All Formats</option>");
    $("#top10_type").empty();
    $("#top10_type").append("<option value='all'>All Types</option>");
    $("#top10_media").empty();
    $("#top10_media").append("<option value='all'>All Media</option>");
    $("#top10_format").empty();
    $("#top10_format").append("<option value='all'>All Formats</option>");
    data.buoy.types.forEach(function (val) {
      var option = document.createElement("option");
      $(option).val(val);
      $(option).text(decodeEntities(decodeEntities(val)));
      var option2 = document.createElement("option");
      $(option2).val(val);
      $(option2).text(decodeEntities(decodeEntities(val)));
      $("#adv_type").append(option);
      $("#top10_type").append(option2);
      if (ANCHOR.getParams() && ANCHOR.getParams().type) {
        $("#adv_type").val(ANCHOR.getParams() ? ANCHOR.getParams().type : "");
        $("#top10_type").val(ANCHOR.getParams() ? ANCHOR.getParams().type : "");
      }
    });
    data.buoy.media.forEach(function (val) {
      var option = document.createElement("option");
      $(option).val(val);
      $(option).text(decodeEntities(decodeEntities(val)));
      $("#adv_media").append(option);
      var option2 = document.createElement("option");
      $(option2).val(val);
      $(option2).text(decodeEntities(decodeEntities(val)));
      $("#top10_media").append(option2);
      if (ANCHOR.getParams() && ANCHOR.getParams().media) {
        $("#adv_media").val(ANCHOR.getParams() ? ANCHOR.getParams().media : "");

        $("#top10_media").val(
          ANCHOR.getParams() ? ANCHOR.getParams().media : ""
        );
      }
    });
    data.buoy.formats.forEach(function (val) {
      var option = document.createElement("option");
      $(option).val(val);
      $(option).text(decodeEntities(decodeEntities(val)));
      $("#adv_format").append(option);
      var option2 = document.createElement("option");
      $(option2).val(val);
      $(option2).text(decodeEntities(decodeEntities(val)));
      $("#top10_format").append(option2);
      if (ANCHOR.getParams() && ANCHOR.getParams().format) {
        $("#adv_format").val(
          ANCHOR.getParams() ? ANCHOR.getParams().format : ""
        );

        $("#top10_format").val(
          ANCHOR.getParams() ? ANCHOR.getParams().format : ""
        );
      }
    });
  });
}

function assertAdvSubmit(){
  $("#adv_submit").unbind("click");
  $("#adv_submit").click(function () {
    
    ANCHOR.route(
      "#torrents?search=true&title=" +
        encodeURIComponent($("#adv_title").val()) +
        "&author=" +
        encodeURIComponent($("#adv_author").val()) +
        "&classes=" +
        ($("#adv_classes").val()
          ? JSON.stringify(encodeURIComponent($("#adv_classes").val()))
          : "") +
        "&class_all=" +
        $("#adv_class_all").prop("checked") +
        "&publisher=" +
        encodeURIComponent($("#adv_publisher").val()) +
        "&type=" +
        encodeURIComponent($("#adv_type").val()) +
        "&media=" +
        $("#adv_media").val() +
        "&format=" +
        $("#adv_format").val()
    );
    initializeTorrents("torrents", dismissLoader);
  });
}



function assertLockGraphScroll(){
  function stopScroll(e){
    if(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(e.code) > -1) {
          e.preventDefault();
    }
  }

  $(".partial_graph, .search_graph").on("mouseenter", function () {
    {
      window.removeEventListener("keydown", stopScroll);
      window.addEventListener("keydown", stopScroll);
    }
  });

  $(".partial_graph, .search_graph").on('mouseleave', function () {
    window.removeEventListener("keydown", stopScroll);
  });
}

/*function assertTableHotfix(){
  setTimeout(function(){
    $(".infoHash").text("[MagnetURI]")
    $(".stream").text("[WebTorrent]")
  },3000)
  
  $(window).on('resize', function(){
    $(".infoHash").text("[MagnetURI]")
    $(".stream").text("[WebTorrent]")
    
  })
}*/

function assertTr(record, edition){
  var tr = "<tr>";
  tr += "<td>" + edition.torrent.format + "</td>";          
  
  tr +=
    "<td class='light'><p>" +
    edition.torrent.snatches +
    "</p></td>";
/*   tr +=
    "<td class='here'>" +
    timeSince(edition.torrent.created_at) +
    " ago</td>";*/
  tr +=
    "<td><a href='#torrent?id=" + edition.torrent.total_size_bytes + 
    "' id='add_torrent_tab' data-infohash='" + edition.torrent.infoHash +
    "' data-title='" + record._fields[0].properties.title + "' class='ANCHOR torrent stream' href='#torrent?infoHash=" + edition.torrent.infoHash +
    "' data-torrent-uuid = '" + edition.torrent.uuid + 
     "'>[Download]</a></td>"
  tr += "<td>" + prettyBytes(edition.torrent.total_size_bytes) + "</td>"
  tr += "</tr>";
  return tr;
}
