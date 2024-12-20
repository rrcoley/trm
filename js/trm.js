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

	const sCon = document.getElementById('body-container');
	if (sCon === null) {
		console.log("Whoops - no 'body-container' in html\n");
	}

	console.log(JSONModel);
	if (JSONModel.Name !== "Root") {
		console.log("Not a ROOT JSON\n");
	}
	preProcess(JSONModel);
	console.log("maxLevel: "+maxLevel);
	InitButtons();

	const el=newSection(JSONModel);
	if (el !== undefined) {
		sCon.appendChild(el);
	}
}

function preProcess(obj) {
	if (obj.Lvl > maxLevel) {
		maxLevel=obj.Lvl;
	}
	if (obj.Lvl === "1" && categories[obj.Name] === undefined) {
		categories[obj.Name] = 1
	}
	if (obj.Subsections) {
		obj.Subsections.forEach(subObj => {
			const nele=preProcess(subObj);
		});
	}
}

function newSection(obj) {
	if (obj.Lvl === "1" && Category !== "All" && Category !== obj.Name) {
		return undefined;
	}

	const el1 = document.createElement('div');
	if (obj.Name == "Root") {
		const el = document.getElementById('header-container');
		el.classList.add('main-title');
		el.insertAdjacentHTML('afterbegin',"<h1>Technology Reference Model</h1>");
		//el1.classList.add('main-title');
		//el1.insertAdjacentHTML('afterbegin',"<h1>Technology Reference Model</h1>");
	} else {
		el1.insertAdjacentHTML('afterbegin',obj.Name);
		el1.classList.add(`Lvl${obj.Lvl}`);
		el1.style.backgroundColor="white";

		el1.addEventListener('click', (event) => {
			if (obj.Lvl !== 1) { event.stopPropagation(); }
			openModal(obj)
		});
	}

	const el2 = document.createElement('div');
	el2.classList.add('container','xxx');
	el1.appendChild(el2);
	if (obj.Subsections && obj.Lvl < Level) {
		obj.Subsections.forEach(subObj => {
			const nele = newSection(subObj);
			if (nele !== undefined) {
				el2.appendChild(nele);
			}
		});
	}
	return el1;
}

// Keep track of maxLevel in JSON
var maxLevel = 0;
var categories = {};
var Level;
var Category="All";

function updateURL(el,mode) {
        switch(mode) {
        case "Level":
                Level = el.target.value;
                break;
        case "Category":
                Category = el.target.value;
                break;
        }
        window.location.href =
                (window.location.href.split('?')[0]) + "?" +
			"Level=" + Level + "&"+ "Category=" + Category;
        window.location.replace();
}

function setSelectValue (id, val) {
	console.log("setSelectValue("+id+") to "+val);
        document.getElementById(id).value = val;
}

function openModal(obj) {
	const modalName = document.getElementById('modal-name');
	const modalLvl = document.getElementById('modal-lvl');
	const modalOwner = document.getElementById('modal-owner');
	const modalMaturity = document.getElementById('modal-maturity');
	const modalDescription = document.getElementById('modal-description');
	const modalProducts = document.getElementById('modal-products');
	const modal = document.getElementById('modal');
	console.log("openModal("+obj.Name+")\n");

	if (obj.Name === undefined)	{ obj.Name="" }
	if (obj.Lvl === undefined)	{ obj.Lvl="" }
	if (obj.Owner === undefined) 	{ obj.Owner="" }
	if (obj.Maturity === undefined) { obj.Maturity="" }
	if (obj.Desc === undefined) 	{ obj.Desc="" }

	modalName.innerHTML = obj.Name.bold();
	modalName.style.textAlign = "center";
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
	}
	modal.style.display = 'flex';	
}

document.getElementById('modal-close-x').addEventListener('click', () => {
	document.getElementById('modal').style.display="none";
});

function InitButtons(obj) {
	const levelSel = document.getElementById('Level');
	for(let i=1; i<=maxLevel; i++) {
		levelSel.options[levelSel.options.length] = new Option(i,i);
	}
	levelSel.onchange=function(e) { updateURL(e,"Level"); }
	Level = Number(new URLSearchParams(window.location.search).get('Level'));
	if (Level === null || Level === 0) { Level=maxLevel; }
console.log("Setting Level to "+Level);
	setSelectValue('Level',Level.toString());

	const categorySel = document.getElementById('Category');
	categorySel.options[categorySel.options.length] = new Option("All","All");
	for (let key in categories) {
		categorySel.options[categorySel.options.length] = new Option(key,key);
	}
	categorySel.onchange=function(e) { updateURL(e,"Category"); }
	Category = new URLSearchParams(window.location.search).get('Category');
	if (Category === null || Category === 0) { Category="All"; }
console.log("Setting Cat to "+Category);
	setSelectValue('Category',Category);
}

window.addEventListener('click',(event) => {
	const modal=document.getElementById('modal');	
	if (event.target === modal) {
		modal.style.display='none';
	}
});
