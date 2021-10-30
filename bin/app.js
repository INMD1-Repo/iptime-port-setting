#!/usr/bin/env node
const { Command } = require('commander');
const program = new Command();
const path = require('path')
const inquirer = require('inquirer');
const request = require("request");
const fs = require('fs');
const Table = require('cli-table3');

//기본적으로 시작체크
listdata();
urlcheck();

//옵션
program
	.option("-l, --list", "설정한 리스트를 보여드림니다")
	.option("-c, --creat", "포트포워드 설정 합니다.")
	.option("-d, --delete", "포트포워드 설정한 값을 삭제합니다.")
	.option("-r, --re", "json에 저장한 ip를 (다시)설정합니다.")
program.parse(process.argv);

const options = program.opts();

if (options.list) {
	const data = fs.readFileSync(`${path.dirname(__filename)}/list.json`);
	const json = JSON.parse(data);
	console.log(`이 iptime 기기는 최대 ${json.max} 까지 설정할수 있고 \n현재 ${json.count} 까지 만들었습니다.`)
	listdata();
	urlcheck();
	listprint();
} else if (options.re) {
	inquirer.prompt([{
		type: "input",
		name: "check",
		message: 'url를 입력해주세요.'
	}])
		.then(function (answer) {
			if (answer.check == "") {
				console.log("입력이 되지않았습니다.");
				urlcheck();
			} else if (answer.check != "") {
				add(answer.check);
			}
		});
} else if (options.delete) {
	listprint();

	inquirer.prompt([{
		type: "input",
		name: "delname",
		message: '위 리스트를 보고 번호를 입력해주세요.'

	}])
		.then(function (answer) {
			if (answer.check != "") {
				delask(answer.delname);
			} else if (answer.delname == "") {
				console.log("입력이 되지않았습니다.");
				ask();
			}
		});
} else if (options.creat) {
	addport();
}

//url이 json으로 저장되어 있는지 확인
function urlcheck() {
	fs.readFile(`${path.dirname(__filename)}/config.json`, 'utf8', (err, data) => {
		if (err) {
			inquirer.prompt([{
				type: "input",
				name: "check",
				message: 'url등록안되어 있습니다. 입력해서 등록해주세요 [url]'
			}])
				.then(function (answer) {
					if (answer.check == "") {
						console.log("입력이 되지않았습니다.");
						urlcheck();
					} else if (answer.check != "") {
						add(answer.check);
						dataget();
					}
				});
		}
	});
}

//파일에 정보를 등록하기
function add(url) {
	const j = {
		urlt: url
	}
	const json = JSON.stringify(j)
	fs.writeFile(`${path.dirname(__filename)}/config.json`, json, 'utf8', function (err, data) {
		console.log("등록이 완료되었습니다.");
	});
}

//api에 연결해서 리스트 가지고오기
function listdata() {
	const { urlt } = require("./config.json");
	request(`${urlt}:3000/port-foward`, function (error, response, body) {
		fs.writeFileSync(`${path.dirname(__filename)}/list.json`, body);
	});
}

//리스트 출력하기
function listprint() {
	const data = fs.readFileSync(`${path.dirname(__filename)}/list.json`);
	const json = JSON.parse(data);
	// instantiate
	let table = new Table({
		head: ['NUM', 'id', 'name', 'sourcePort', 'ip', 'destPort']
		, colWidths: [5, 12, 16, 16, 18, 10],

	});
	for (let index = 0; index < json.count; index++) {
		table.push([
			index,
			json.data[index].id,
			json.data[index].text.name,
			json.data[index].text.sourcePort,
			json.data[index].text.ip,
			json.data[index].text.destPort,
		]);
	}
	console.log(table.toString());
}

//포트 추가하기
function addport() {
	let arr = {};
	inquirer.prompt([{
		type: "input",
		name: "name",
		message: '지정할 이름을 선택해주세요.'

	}]);
	inquirer.prompt([{
		type: "input",
		name: "answer4",
		message: '외부에서 내보낼 포트를 입력해주세요. (범위일시 10-10로 입력바람)'
	}])
	inquirer.prompt([{
		type: "input",
		name: "answer4",
		message: '내부ip를 입력해주세요.'

	}])
	inquirer.prompt([{
		type: "input",
		name: "answer4",
		message: '내부포트를 입력해주세요'

	}]);
	// const { urlt } = require("./config.json");
	// var request = require('request');

	// const headers = {
	// 	'Content-Type': 'application/json'
	// };

	// const dataString = [
	// 	{
	// 		"name": "tes1",
	// 		"sourcePort": "8888-8888",
	// 		"protocol": "tcp",
	// 		"ip": "192.168.42.131",
	// 		"destPort": 8888
	// 	}
	// ];

	// const options = {
	// 	url: 'http://192.168.42.130:3000/port-foward',
	// 	method: 'POST',
	// 	headers: headers,
	// 	body: dataString
	// };

	// function callback(error, response, body) {
	// 	if (!error && response.statusCode == 200) {
	// 		console.log(body);
	// 	}
	// }

	// request(options, callback);
}

//포트포워드 삭제하기
function delask(input) {
	const { urlt } = require("./config.json");
	const data = fs.readFileSync(`${path.dirname(__filename)}/list.json`);
	const json = JSON.parse(data);

	//찾은거 출력하기
	let table = new Table({
		head: ['NUM', 'id', 'name', 'sourcePort', 'ip', 'destPort']
		, colWidths: [5, 12, 16, 16, 18, 10],

	});
	table.push([
		input,
		json.data[input].id,
		json.data[input].text.name,
		json.data[input].text.sourcePort,
		json.data[input].text.ip,
		json.data[input].text.destPort,
	]);
	console.log(table.toString());

	//마지막 물어보기
	inquirer.prompt([{
		type: "input",
		name: "deletask",
		message: '정말로 이 설정을 삭제하시겟습니까?(y/n)'

	}])
		.then(function (answer) {
			if (answer.deletask == "y") {
				const options = {
					url: urlt + ":3000/port-foward/" + json.data[input].id,
					method: 'DELETE'
				};

				function callback(error, response, body) {
					if (!error && response.statusCode == 200) {
						console.log(body);
					}
				}
				request(options, callback);
				console.log("위에서 오류가 나지 않으면 삭제요청을 성공적으로 보낸거니 약 1분 젇도 기다려주세요.")
			} else if (answer.deletask == "n") {
				console.log("사용자가 취소를 해서 종료 합니다.");
				return;
			}
		});

}

