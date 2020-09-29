function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
    
}
function Submit()
{
    var difficulty = getUrlVars()["dif"];
    console.log(difficulty);
    
}