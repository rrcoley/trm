// Keep track of maxLevel in JSON
var Categories = {};		// Idx id returns obj.Name
var level1s = {};		// This is dictionary of the level1 Names only
var maxLevel = 0;
var idx=0;
var Level;
var Filter;
var Category="All";
var prodRows=0;

function Main(JSONModel) {
	catlen=Object.keys(Categories).length;

	console.log("Main("+catlen+")\n");
	const sCon = document.getElementById('body-container');
	if (sCon === null) {
		console.log("Whoops - no 'body-container' in html\n");
	}
	if (catlen == 0) {
		console.log(JSONModel);
		if (JSONModel.Name !== "Root") {
			console.log("Not a ROOT JSON\n");
		}
		Categories={};
		idx=0;
		preProcess(JSONModel);
		InitButtons();
	} else {
		// Delete sCon children so we can start again
		while (sCon.firstChild) {
			sCon.removeChild(sCon.lastChild);
		}
	}

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
	Categories[obj.idx]={ 'Name': obj.Name, 'Products': obj.Products };
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
		const el = document.getElementById('title-container');
		if (el.innerHTML.length == 0) {
			el.classList.add('main-title');
			el.insertAdjacentHTML('afterbegin',"Technology Reference Model");
		}
	} else {
		el1.insertAdjacentHTML('afterbegin',obj.Name);
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
	return el1;
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
	const modal = document.getElementById('modal');
	const fields = ["Name","Lvl","Owner","Maturity","Desc"];
	for(let i=0;i<fields.length;i++) {
		if (obj[fields[i]] ===  undefined) obj[fields[i]]=""
	}

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
			key=prod.Name+"~"+prod.Version+"}";
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
	}
	modal.style.display = 'flex';	
}

document.getElementById('modal-close-x').addEventListener('click', () => {
	document.getElementById('modal').style.display="none";
	const table = document.getElementById('modal-table');
	nrows=Object.keys(prod_dict).length;
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

function ProductMatch(Filter,Products) {
	var j=0;
	if (Products !== undefined) {
		Products.forEach(prod => {
			if (wildTest(Filter,prod.Name,true)) {
				j++;
			}
		});
	}
	return j;
}

function radiohandler() {
	document.getElementById('Filter').value="";
	document.getElementById('Counter').value="";
	for (var id in Categories) {
		el=document.getElementById(id);
		if (el === null) continue;
		el.style.backgroundColor="white";
	}
}

function HighlightFilterBoxes() {
	cap=(document.getElementById("Capability").checked) ? true : false;

	i=0;
	for (var id in Categories) {
		el=document.getElementById(id);
		if (el === null) continue;

		if ((cap===true && wildTest(Filter,Categories[id].Name,true)) ||
		    (cap===false && ProductMatch(Filter,Categories[id].Products))) {
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
}

function InitButtons(obj) {
	document.getElementById('Capability').onclick = radiohandler;
	document.getElementById('Product').onclick = radiohandler;
	range=document.getElementById('Range');
	range.min = 1;
	range.max = maxLevel;
	if (Level === undefined || Level === null || Level === 0) { Level=maxLevel; }
	setSelectValue('Range',Level);

	document.getElementById('rangeValue').innerHTML=range.value;
	range.addEventListener('input', (ev) => {
		document.getElementById('rangeValue').innerHTML=range.value;
		updateURL(ev,"Level");
		// Need to reset Filter at this point
		HighlightFilterBoxes();
	});

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
		HighlightFilterBoxes();
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
	Main(JsonData);
}

window.addEventListener('click',(event) => {
	const modal=document.getElementById('modal');	
	if (event.target === modal) {
		modal.style.display='none';
	}
})

function rangeSlide(value) {
	document.getElementById('rangeValue').innerHTML=value;
}

document.addEventListener('DOMContentLoaded', async function () {
	const url = "http://localhost:80/json/trm.json";

	console.log("DOMContentLoaded\n");
	async function getJSON(Url) {
		const response = await fetch(Url);
		return await response.json();
	}
	JsonData = await getJSON(url);
	Main(JsonData);
})
