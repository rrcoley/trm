document.addEventListener('DOMContentLoaded', async function () {
	const url = "http://localhost:80/json/trm.json";

	async function getJSON(Url) {
		const response = await fetch(Url);
		return await response.json();
	}
	
	Main(await getJSON(url));
});

function Main(JSONModel) {
	console.log("Main()\n")

	// Stage some colornames from the map
	var idx=0;
	for (var key in colorMap) {
		cnames[idx]=key;
		idx++;
	} 

	const sCon = document.getElementById('body-container');
	if (sCon === null) {
		console.log("Whoops - no 'body-container' in html\n");
	}

	console.log(JSONModel);
	if (JSONModel.Name !== "Root") {
		console.log("Not a ROOT JSON\n");
	}

	sCon.appendChild(newSection(JSONModel));
}

function newSection(obj) {

	const el1 = document.createElement('div');
	if (obj.Name == "Root") {
		el1.classList.add('main-title');
		el1.insertAdjacentHTML('afterbegin',"<h1>Technology Reference Model</h1>");
	} else {
		var color = cnames[obj.Lvl];
		el1.insertAdjacentHTML('afterbegin',obj.Name);
		el1.classList.add(`Lvl${obj.Lvl}`);
		el1.style.backgroundColor="white";
	}

	el1.addEventListener('click', (event) => {
		if (obj.Lvl !== 1) { event.stopPropagation(); }
		openModal(obj);
	});

	const el2 = document.createElement('div');
	el2.classList.add('container');

	el1.appendChild(el2);

	//if (obj.Subsections) {
	if (obj.Subsections && obj.Lvl < Depth) {
		obj.Subsections.forEach(subObj => {
		console.log("SubName: "+subObj.Name);

		const nele = newSection(subObj);

		el2.appendChild(nele);
	    });
	}
	return el1;
}

// Add as meany Colors as you want
var cnames=[];

const colorMap = {
        "purple":       "#9c27b0",
        "blue":         "#2196f3",
        "green":        "#4caf50",
        "red":          "#f44336",
        "orange":       "#ff9800",
        "yellow":       "#ffeb3b",
        "cyan":         "#00bcd4",
        "teal":         "#009688",
        "pink":         "#e91e63",
        "indigo":       "#3f51b5", 
}; 

function updateURL(el,mode) 
{
        switch(mode) {
        case "Depth":
                Depth = el.target.value;
                break;
//        case "Mode":
 //               Mode = el.target.value;
  //              break;
   //     case "Model":
    //            Model = el.target.value;
     //           break;
        }
        window.location.href =
                (window.location.href.split('?')[0]) + "?Depth="+Depth;

                      //  "?Model="+Model+
                      //  "&Mode="+Mode+
                      //  "&Depth="+Depth;
        window.location.replace();
}

function setSelectValue (id, val) {
        document.getElementById(id).value = val;
}

function openModal(obj) {
	console.log("openModal("+obj.Name+")\n");
}

var Depth = Number(new URLSearchParams(window.location.search).get('Depth'));
if (Depth === null || Depth === 0) { Depth=9; }
setSelectValue('Depth',Depth);

document.getElementById("Depth").onchange=function(e){ updateURL(e,"Depth"); }
