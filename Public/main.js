/** 
 * Parte din .html / Nu din node
*/

function Subs() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', "/subscribe?mail=" + document.getElementById("Email").value +"&difficulty=medium", false);
    xhr.send(null);
};
function FirstSub()
{
    var xhr = new XMLHttpRequest();
    xhr.open('GET', "/clickedSubscribe", false);
    xhr.send(null);
}
function Visits()
{
    var xhr = new XMLHttpRequest();
    xhr.open('GET', "/visit", false);
    xhr.send(null);
}