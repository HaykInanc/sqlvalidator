let databaseName = 'database_1';

let right_query = `
	select name from users
	where length(name) < 6
`;

let startDate = `
	create table users(
		id integer primary key autoincrement,
		name varchar(128),
		lastname varchar(128)
	);

	insert into users (name, lastname) values ('Анатолий', 'Ушанов');
	insert into users (name, lastname) values ('Максим', 'Грибов');
	insert into users (name, lastname) values ('Олег', 'Семенов');
	insert into users (name, lastname) values ('Светлана', 'Ульянова');
	insert into users (name, lastname) values ('Екатерина', 'Иванова');
`;

let handlers={
	clearDatabase: function(name){
	    let db = openDatabase(name, "", "", "");

	    db.transaction(ts => {
	        let query = "SELECT * FROM sqlite_master WHERE name NOT LIKE 'sqlite\\_%' escape '\\' AND name NOT LIKE '\\_%' escape '\\'";
	        let args = [];
	        let success = (tx, result) => {
	            Object.values(result.rows).forEach(table =>tx.executeSql('DROP TABLE ' + table.name))
	        };
	        ts.executeSql(query, args, success);
	    });
	},
	success_without_rows: function(){
		let resultElem = document.querySelector('.result');
		let pElem = document.createElement('p');
		pElem.innerText = 'Пустая выборка';
		resultElem.appendChild(pElem);
		pElem.classList.add('error');
	},
	success: function(tx, result, script){
		if (!script.toLowerCase().startsWith('select')){
			return
		}else if (result.rows.length === 0){
			handlers.success_without_rows()
			return
		}
		let resultRows = result.rows;
		let resultElem = document.querySelector('.result');
		let table = document.createElement('table');
		table.setAttribute('border', '1');
		let thRowElem = document.createElement('tr');
		Object.keys(resultRows[0]).forEach(value => {
			let columnElem = document.createElement('th');
			columnElem.innerText = value;
			thRowElem.appendChild(columnElem);
		})

		table.appendChild(thRowElem);

		[...resultRows].forEach(row => {
			let rowElem = document.createElement('tr');
			table.appendChild(rowElem);
			Object.values(row).forEach(value => {
				let columnElem = document.createElement('td');
				columnElem.innerText = (value === null)? 'NULL' : value;
				rowElem.appendChild(columnElem);
			})
		})
		resultElem.appendChild(table);
	},
	error: function(tx, error){
		let resultElem = document.querySelector('.result');
		let errorElem = document.createElement('p');
		errorElem.innerText = error.message;
		errorElem.classList.add('error');
		resultElem.appendChild(errorElem);
	},
	showTables: function(tx, result){
		let rowsTable = [...result.rows].filter(r=>r.type === 'table');
		let tableListElem = document.querySelector('.tableList');
		tableListElem.innerText = '';
		let ulElem = document.createElement('ul');
		for (elem in rowsTable){
			let liElem = document.createElement('li');
			ulElem.appendChild(liElem);
			liElem.innerText = rowsTable[elem].name;
		}
		tableListElem.appendChild(ulElem);

		let rowsViews = [...result.rows].filter(r=>r.type === 'view');
		let viewListElem = document.querySelector('.viewList');
		viewListElem.innerText = '';
		let ulElem_v = document.createElement('ul');
		for (elem in rowsViews){
			let liElem = document.createElement('li');
			ulElem_v.appendChild(liElem);
			liElem.innerText = rowsViews[elem].name;
		}
		viewListElem.appendChild(ulElem_v);
	}
}

function replaceAll(string, search, substr=' '){
	return string.split(search).join(substr)
}


try{
	var db = openDatabase('database_1', '1.0', 'database_1', 2 * 1024 * 1024);
}
catch (e){
	alert('Упс... Ваш браузер не поддерживает webSQL. Попробуйте воспользоваться другим \n (Chrome должен помочь)')
}

function getCode(){
	let code = editor.getValue()
					 .replace(/--.+/g, '')
					 .replace(/\/\*(.|\s)+?\*\//gm, '')
					 .replace(/\s/g, ' ')
					 .split(';');

	let codeArr = code.map(elem=> elem.trim());
	codeArr = codeArr.map(elem=> replaceAll(elem, '\n'));
	return codeArr.filter(elem=> elem)
}

function loadStartDate(){
	db.transaction(function (tx) { 
		startDate.split(';').forEach(script=>{
			tx.executeSql(script, [], ()=>{}, ()=>{})
		});

	});
	getTablesList();
}


function run(){
	let resultElem = document.querySelector('.result');
	resultElem.innerText = '';
	db.transaction(function (tx) { 
		getCode().forEach(script => tx.executeSql(script, [], (tx, result)=>handlers.success(tx, result, script), handlers.error))
	}); 
	getTablesList();
}

function submit(){

}

function compareTables(user_query, right_query){

	/*
		1) проверка на пустоту
		2) проверка на набор полей
		3) проверка на порядок полей
		4) нехватающие записи
		5) лишние записи
	*/
	tx.executeSql(user_query, [], ()=>{}, ()=>{})

	
}

function getTablesList(){

	let code = `SELECT 
    	name,
    	type
	FROM 
	    sqlite_master 
	WHERE name NOT LIKE 'sqlite_%'
	    and name <> "__WebKitDatabaseInfoTable__"
	`;

	db.transaction(function (tx) { 
		tx.executeSql(code, [], handlers.showTables);
	});
}

function saveQuery(){
	localStorage.setItem('query', editor.getValue());
}

function setQuery(){
	const query = localStorage.getItem('query');
	if (query){
		editor.setValue(query)
	}	
}

let runBtn = document.getElementById('run');
let submitBtn = document.getElementById('submit');

runBtn.addEventListener('click', ()=>run());
submitBtn.addEventListener('click', ()=>submit())

editor.on('change', saveQuery)

handlers.clearDatabase(databaseName)

loadStartDate();
getTablesList();
setQuery();



