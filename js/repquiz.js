console.log("reponse quizz");
var repbutton=document.getElementById("rep-btn");
var repsection=document.getElementById("rep-sect");

//function to show answers in table
function showreps(){
    let table=document.createElement("table")
    let row =document.createElement("tr")
    row.innerHTML="<td><strong>Question</strong></td><td><strong>Reponse</strong></td>"
    table.appendChild(row)
    repsection.appendChild(table)
    for(element of questionBank){
        row=document.createElement("tr");
        row.innerHTML=`<td>${element['qn']}</td><td>${element['choices'][element['ans']]}</td>`;
        table.appendChild(row);
    }
}
repbutton.addEventListener("click", showreps);