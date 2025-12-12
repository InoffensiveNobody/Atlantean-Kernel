function assertHieroglyph(){
  const index = Math.floor(Math.random() * 1071)

  $("#recommend_source").text(hieroglyphs[index])
}

function assertMermaid(){
  $("#recommend_source").unbind("click");
  $("#recommend_source").click(function(e){
    e.preventDefault();
    
    $("#sourceTitle span").text("Loading...")
    $("#sourceTitle span").addClass("loading")
    processMermaid();

  })
}

