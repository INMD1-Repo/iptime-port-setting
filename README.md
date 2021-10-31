# iptime-port-setting

⚠ 현재 파일이 생성되지 않는 문제점을 발견해서 수정중입니다.

이 프로젝트는 학교 동아리에 있는 iptime에서 포트포워딩을 쉽게 하기 위해서 만든 프로그램입니다..<br>
(첫번째 벡엔드를 만들어준 차차선배님게 감사에 말을 전합니다. )
# 사용법
필수 라이브러리(아래 코드에서 실행할때 동시에 설치가 됨니다)

```
commander, inquirer, request, cli-table3, fs, ip
```

파일을 다운받은후 디렉토리 폴더로 이동을 해서 아래에 코드를 입력해주세요.<br>

npm install -g

그리고 아래에 iport [Options]을 입력하시면 됨니다.<br>

```
Options:
  -l, --list    설정한 리스트를 보여드림니다
  -c, --creat   포트포워드 설정 합니다.
  -d, --delete  포트포워드 설정한 값을 삭제합니다.
  -r, --re      json에 저장한 ip를 (다시)설정합니다.
```
