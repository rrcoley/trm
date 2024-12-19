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
	preProcess(JSONModel);
	InitDepth();

	sCon.appendChild(newSection(JSONModel));
}

function preProcess(obj) {
	console.log("Node: "+obj.Name);
	if (obj.Lvl > maxLevel) {
		maxLevel=obj.Lvl;
	}
	console.log("maxLevel: "+maxLevel);
	if (obj.Subsections) {
		obj.Subsections.forEach(subObj => {
			const nele=preProcess(subObj);
		});
	}
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

		el1.addEventListener('click', (event) => {
			if (obj.Lvl !== 1) { event.stopPropagation(); }
			openModal(obj)
		});
	}

	if (obj.Subsections && obj.Lvl < Depth) {
		const el2 = document.createElement('div');
		el2.classList.add('container','xxx');

		el1.appendChild(el2);

		obj.Subsections.forEach(subObj => {
			const nele = newSection(subObj);
			el2.appendChild(nele);
		});
	}
	return el1;
}

// Keep track of maxLevel in JSON
var maxLevel = 0;

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
	const modalName = document.getElementById('modal-name');
	const modalLvl = document.getElementById('modal-lvl');
	const modalOwner = document.getElementById('modal-owner');
	const modalMaturity = document.getElementById('modal-maturity');
	const modalDescription = document.getElementById('modal-description');
	const modalProduct = document.getElementById('modal-product');
	const modal = document.getElementById('modal');
	console.log("openModal("+obj.Name+")\n");

	if (obj.Name === undefined)	{ obj.Name="" }
	if (obj.Lvl === undefined)	{ obj.Lvl="" }
	if (obj.Owner === undefined) 	{ obj.Owner="" }
	if (obj.Maturity === undefined) { obj.Maturity="" }
	if (obj.Desc === undefined) 	{ obj.Desc="" }

	modalName.innerHTML = obj.Name.bold();
	modalName.style.textAlign = "center";
	modalName.style.fontSize = "20pt";
	modalName.style.color = "red";
	modalLvl.innerHTML = "Level: ".bold()+obj.Lvl;
	modalOwner.innerHTML = "Owner: ".bold()+obj.Owner;
	modalMaturity.innerHTML = "Maturity: ".bold()+obj.Maturity;
	modalDescription.innerHTML = "Description: ".bold()+obj.Desc;
	prods=""
	prod_dict={}
	if (obj.Products !== undefined) {
		obj.Products.forEach(prod => {
			if (prod_dict[prod.Name] === undefined) {
				prod_dict[prod.Name]=1
				if (prods === "") 
					prods="<br>    "+prod.Name;
				else
					prods=prods+"<br>    "+prod.Name;
			}
		});
		modalProducts.innerHTML="Products: ".bold()+prods;
		modalProducts.style.color = "blue";
	}
	modal.style.display = 'flex';	
}

function InitDepth(obj) {
	const depthSel = document.getElementById('Depth');
	for(let i=1; i<maxLevel; i++) {
		depthSel.options[depthSel.options.length] = new Option('Level '+i,i);
	}
	depthSel.onchange=function(e) { updateURL(e,"Depth"); }
}

document.getElementById('modal-close-x').addEventListener('click', () =>
{
	document.getElementById('modal').style.display="none";
});

window.addEventListener('click',(event) =>
{
	const modal=document.getElementById('modal');	
	if (event.target === modal) {
		modal.style.display='none';
	}
});

var Depth = Number(new URLSearchParams(window.location.search).get('Depth'));
if (Depth === null || Depth === 0) { Depth=9; }
setSelectValue('Depth',Depth);
