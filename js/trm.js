// Keep track of maxLevel in JSON
var categories = {};		// Idx id returns obj.Name
var level1s = {};		// This is dictionary of the level1 Names only
var Products = {};
var maxLevel = 0;
var idx=0;
var Level;
var Filter;
var Category="All";
var prodRows=0;

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
	categories={};
	idx=0;
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
	if (obj.Lvl === "1" && level1s[obj.Name] === undefined) {
		level1s[obj.Name] = 1
	}
	obj.idx = idx++;
	categories[obj.idx]=obj.Name;
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
		el.insertAdjacentHTML('afterbegin',"Technology Reference Model");
	} else {
		el1.insertAdjacentHTML('afterbegin',obj.Name);
		//console.log(obj.Name);
		el1.classList.add(`Lvl${obj.Lvl}`);
		el1.id=obj.idx;
		el1.style.backgroundColor="white";

		el1.addEventListener('click', (ev) => {
			if (obj.Lvl !== 1) { ev.stopPropagation(); }
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
	if (obj.Products !== undefined) {
		// Cache Products
		obj.Products.forEach(prod => {
			key="{"+prod.Name+"}{"+prod.Version+"}";
			if (Products[key] === undefined) {
				Products[key] = prod;
				//console.log("Key: ["+key+"] = "+Products[key].Name);
			}
		});
	}
	return el1;
}

function updateURL(el,mode) {
        switch(mode) {
        case "Level":    Level    = el.target.value; break;
        case "Category": Category = el.target.value; break;
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
	modalLvl.innerHTML = "Level: ".bold()+obj.Lvl+"&nbsp&nbsp&nbsp&nbsp["+obj.idx+"]";
	modalOwner.innerHTML = "Owner: ".bold()+obj.Owner;
	modalMaturity.innerHTML = "Maturity: ".bold()+obj.Maturity;
	modalDescription.innerHTML = "Description: ".bold()+obj.Desc;
	prod_dict={}
	prodRows=0;
	if (obj.Products !== undefined) {
		var createClickHandler = function(obj) {
			return function() { 
				// Access to all obj properties now
				alert("Name: "+obj.Name+" Version: "+obj.Version); 
			}
		}
		obj.Products.forEach(prod => {
			key="{"+prod.Name+"}{"+prod.Version+"}";
			if (prod_dict[key] === undefined) {
				prod_dict[key]=prod;
				const table = document.getElementById('modal-table');
				var tr = table.insertRow(-1);	
				tr.insertCell().textContent = prod.Name;	

				cell=tr.insertCell();
				cell.textContent = prod.Version;	
				cell.style.textAlign = "center";

				cell = tr.insertCell();
				cell.textContent = prod.Status;
				cell.style.color = "white";
				cell.style.textAlign = "center";

				switch (prod.Status) {
				case "red":
					cell.bgColor = "red";
					break;
				case "amber":
					cell.bgColor = "amber";
					break;
				case "green":
					cell.bgColor = "green";
					break;
				}

				tr.insertCell().textContent = prod.Desc;	
				table.append(tr);
				prodRows++;
				tr.onclick = createClickHandler(prod);
			}
		});
		console.log("ProdRows="+prodRows);	
	}
	modal.style.display = 'flex';	
}

document.getElementById('modal-close-x').addEventListener('click', () => {
	document.getElementById('modal').style.display="none";
	const table = document.getElementById('modal-table');
	nrows=Object.keys(prod_dict).length;
	//console.log("About to delete "+prodRows+" rows");
	for(let i=prodRows; i>0; i--) {
		table.deleteRow(i);
		prodRows--;
	}
})

function wildTest(wildcard, str, star) {
	if (wildcard !== "" && star) { wildcard=wildcard+"*"; }
	// regexp escape 
	let w = wildcard.replace(/[.+^${}()|[\]\\]/g, '\\$&'); 
	const re = new RegExp(`^${w.replace(/\*/g,'.*').replace(/\?/g,'.')}$`,'i');
	return re.test(str); // remove last 'i' above to have case sensitive
}

function InitButtons(obj) {
	const levelSel = document.getElementById('Level');
	for(let i=maxLevel; i>0; i--) {
		levelSel.options[levelSel.options.length] = new Option(i,i);
	}
	levelSel.onchange=function(e) { updateURL(e,"Level"); }
	Level = Number(new URLSearchParams(window.location.search).get('Level'));
	if (Level === null || Level === 0) { Level=maxLevel; }
	setSelectValue('Level',Level.toString());

	const categorySel = document.getElementById('Category');
	categorySel.options[categorySel.options.length] = new Option("All","All");
	for (let key in level1s) {
		categorySel.options[categorySel.options.length] = new Option(key,key);
	}
	categorySel.onchange=function(e) { updateURL(e,"Category"); }
	Category = new URLSearchParams(window.location.search).get('Category');
	if (Category === null || Category === 0) { Category="All"; }
	setSelectValue('Category',Category);

	const filter = document.getElementById('Filter');

	filter.addEventListener('keyup', (ev) => {
		Filter=filter.value;
		i=0;
		for (var id in categories) {
			var key=categories[id].toLowerCase();
			el=document.getElementById(id);
			if (el === null) continue;
			if (wildTest(Filter,key,true)) {
				el.style.backgroundColor="#ADDDFA";
				i++;
			} else {
				el.style.backgroundColor="white";
			}
		}
		el=document.getElementById('Counter');
		if (i===0) 
			el.value="";
		else
			el.value=i;
	});
}

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

window.addEventListener('click',(event) => {
	const modal=document.getElementById('modal');	
	if (event.target === modal) {
		modal.style.display='none';
	}
})

document.addEventListener('DOMContentLoaded', async function () {
	const url = "http://localhost:80/json/trm.json";

	async function getJSON(Url) {
		const response = await fetch(Url);
		return await response.json();
	}
	
	Main(await getJSON(url));
})
