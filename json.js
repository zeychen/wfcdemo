$().ready(function(){
    $.getJSON( "src/testJSON.json", function( data ) {
    console.log(data);
  });
});