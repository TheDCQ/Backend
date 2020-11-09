let data = [];
const output = document.getElementById("thelist");
data.push({ "title": "dicessum" , "difficulty":"Medium"});
data.push({ "title": "Nim" , "difficulty":"Medium"});
for(var keys in data){
    console.log(data[keys]);

    output.innerHTML += `<div class = "row ml-1 mr-1"> <div class = "col-lg-3 text-left"> <h2> ${data[keys].title} </h2> </div><div class = "col-lg-3 text-center"> <p class="font-weight-light" > ${data[keys].difficulty}</p></div><div class = "col-lg-3"></div><div class = "col-sm-3 text-right">  <a class = "btn btn-outline-success" href = "${"https://thedcq.com/solution?name=" + data[keys].title + "&difficulty=" + data[keys].difficulty}">Solution</a></div></div>`;
}