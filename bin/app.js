#!/usr/bin/env node
const { Command } = require('commander');
const program = new Command();
const path = require('path')
const inquirer = require('inquirer');
const request = require("request");
const fs = require('fs');
const Table = require('cli-table3');
const ip = require('ip');
const spin = require('io-spin')
//옵션
program
	.option("-l, --list", "설정한 리스트를 보여드림니다")
	.option("-c, --creat", "포트포워드 설정 합니다.")
	.option("-d, --delete", "포트포워드 설정한 값을 삭제합니다.")
	.option("-r, --re", "json에 저장한 ip를 (다시)설정합니다.")

program.parse(process.argv);

const options = program.opts();

if (options.list) {
	let co = urlcheck()
	if (co == 1) {
		listget();
		listprint();
	}
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
	try {
		fs.readFileSync(`${path.dirname(__filename)}/config.json`, 'utf8');
		return 1;
	} catch (error) {
		inquirer.prompt([{
			type: "input",
			name: "check",
			message: 'url등록안되어 있습니다.\n입력해서 등록해주세요 [url]: '
		}])
			.then(function (answer) {
				if (answer.check == "") {
					console.log("입력이 되지않았습니다.");
					urlcheck();
				} else if (answer.check != "") {
					console.log("데이터가 입력되었습니다. 다시 명령어를 입력해주세요.");
					add(answer.check);
				}
			});
	}

}

//리스트 불려오기
function listget() {
	const { urlt } = require("./config.json");
	request(`${urlt}:3000/port-foward`, function (error, response, body) {
		fs.writeFileSync(`${path.dirname(__filename)}/list.json`, body);
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
	let arr = new Array;
	inquirer.prompt([{
		type: "input",
		name: "input",
		message: '지정할 이름을 선택해주세요.'

	}]).then(function (answer) {
		arr[0] = answer.input;
		inquirer.prompt([{
			type: "input",
			name: "input",
			message: '외부에서 내보낼 포트를 입력해주세요. (범위일시 10-10로 입력바람)'

		}]).then(function (answer) {
			arr[1] = answer.input;
			inquirer.prompt([{
				type: "input",
				name: "input",
				message: '내부ip를 입력해주세요.(단 이 컴퓨터 ip면 `ip`라고만 입력해주세요)'

			}]).then(function (answer) {
				if (answer.input == 'ip') {
					arr[2] = ip.address();
				} else {
					arr[2] = answer.input;
				}
				inquirer.prompt([{
					type: "input",
					name: "input",
					message: '내부포트를 입력해주세요'

				}]).then(function (answer) {
					arr[3] = answer.input;
					let table = new Table({
						head: ['name', 'sourcePort', 'ip', 'protocol', 'destPort']
						, colWidths: [12, 16, 16, 18, 10],

					});
					table.push([
						arr[0],
						arr[1],
						arr[2],
						"tcp/udp",
						arr[3]
					]);
					console.log(table.toString());
					inquirer.prompt([{
						type: "input",
						name: "yn",
						message: '설정을 iptime으로 보내겟습니까?'

					}]).then(function (answer) {
						if (answer.yn == "y") {
							const { urlt } = require("./config.json");
							const headers = {
								'Content-Type': 'application/json'
							};

							const dataString = [
								{
									"name": arr[0],
									"sourcePort": arr[1],
									"protocol": "tcp",
									"ip": arr[2],
									"destPort": arr[3]
								}
							];

							const options = {
								url: urlt + ":3000/port-foward",
								method: 'POST',
								headers: headers,
								body: JSON.stringify(dataString)
							};

							function callback(error, response, body) {
								const json = JSON.parse(body)
								if (json.result[0] != []) {
									//일정 대시간 랜덤으로 돌리기
									const spinner = spin('iptime을 재시작중입니다.')
									spinner.start()
									stop()
									function stop() {
										setTimeout(function () {
											spinner.stop()
											console.log('✔ 성공적으로 데이터를 보냈서요! `iport -l`을 다시 실행해주세요.');
											listget();
										}, 68000)
									}
								}
							}
							request(options, callback);
						} else {
							console.log("사용자가 취소를 해서 종료 합니다.");
							return;
						}
					});
				});
			});
		});
	});
}

//포트포워드 삭제하기
function delask(input) {
	const { urlt } = require("./config.json");
	const data = fs.readFileSync(`${path.dirname(__filename)}/list.json`);
	const json = JSON.parse(data);

	if (input > json.count) {
		console.log("잘못된 값을 입력해서 종료합니다. 현재 등록한 숫자는" + json.count + "개 입니다.")
		return;
	} else {
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
							fs.writeFileSync(`${path.dirname(__filename)}/list.json`, body);
						}
					}
					request(options, callback);

					//일정 대시간 랜덤으로 돌리기
					const spinner = spin('iptime을 재시작중입니다.')

					spinner.start()
					stop()
					function stop() {
						setTimeout(function () {
							spinner.stop()
							console.log('✔ iptime 이 재부팅 다되었습니다. `iport -l`을 다시 실행해주세요.');
							listget();
						}, 68000)
					}
				} else if (answer.deletask == "n") {
					console.log("사용자가 취소를 해서 종료 합니다.");
					return;
				}
			});

	}
}

