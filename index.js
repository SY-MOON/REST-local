const express = require('express');
const cors = require('cors');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const bkfd2Password = require("pbkdf2-password");

const hasher = bkfd2Password();
const app = express();
let sess = null;


app.use(cors());
app.use(cookieParser());
app.use(session({
	key: 's3cr3tk3y', //세션키
	secret: '!@$Rfeqf34',
	resave: false, //변경사항이 없어도 저장할 거니?
	saveUninitialized: true, //초기화되지않은 상태로 저장할거냐
	cookie: {
		maxAge: 1000 * 60 * 60 * 24
	}
}));

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.listen(3000, () => {
	console.log('3000 port');
});

app.get('/', (req, res) => {
	res.send('Hello World!\n');
});

app.get('/name', (req, res) => res.json(cafeName));

app.get('/coffeeList', (req, res) => res.json(coffeeList));

app.get('/coffeeList/:id', (req, res) => {
	const id = parseInt(req.params.id, 10);
	if(!id) {

		return res.status(400).json({error: 'Incorrect id'});
	}
	
	let coffee = coffeeList.filter(coffee => coffee.id === id)[0];
	if(!coffee) {
		return res.status(404).json({error: 'Unknown coffee'});
	}
	return res.json(coffee);
});


app.post('/login', (req, res) => {

	sess = req.session;

	let id = req.body.userId;
	let pw = req.body.userPw;

	for(i = 0; i < users.length; i++) {
		let user = users[i];
		

		if(user.id === id) {
			hasher({ password: pw, salt: user.salt }, (err, pass, salt, hash) => {
				if(hash === user.password) {
					sess.userId = user.id;
					console.log('login success');
					return res.send('success');
				} else {				
					return res.status(401).send('who are you?');
				}			
			});
		}
	}
});

app.get('/logout', (req, res) => {
	sess = req.session;

	if(sess.userId){
		req.session.destory();  // 세션 삭제
		res.clearCookie('s3cr3tk3y');
	}else{
		res.send('ok');
	}
});


let coffeeList = [
	{
		id: 1,
		name: 'Americano',
		price: 4500
	},
	{
		id: 2,
		name: 'latte',
		price: 5000
	},
	{
		id: 3,
		name: 'cappuccino',
		price: 5500
	},
	{
		id: 4,
		name: 'cafe mocha',
		price: 6000
	}
]


let cafeName = 	{
	name: 'starbucks'
}


let users  = [
	{
		id: 'user',
		password: '9WA88rq4Fnp4/4+XSJEeAxS8ft3MMRKdkDMMOEY4/cidk0/WOjA/hVOF9LddrjnpdbtRB+CImk5s4XBnEAzaE94SElq4t0OJnbS6IhwPHJInGav4q9wKCh6lo8I+JxMlDLO0Cj7nBrBgrKPeuEjVPMEXBg/Ovax98hIHne9I8d4=',
		salt: 'xjIdNWYvPpsrUzn5FUTsuQXDqGNI5gp3bKCI6BZA77qBLz8hGKMNg9FufyPj0Xg86306NKkNBhjxpg6fydpcGQ=='
	},
	{
		id: 'admin',
		password: 'g48dCR0tLzBThIMf7w3D2lZTLXznZXVbEz3r2xraLsWy3QLiP+4rJgNGaElN/Ul0MBsOQM60wRnaV023/s9Xrd0qBUhgv1ze4EgZOl8fZIBUed2Fzsj/qTALG2JM0tvYDu4AYCxmgrPF0VQalnf+YAtjrSkSfUPSnO/8u50omcQ=',
		salt: 'PbAn4fUB9Nu2L2BZOCiw1hyD+VGeLV78nQubid6nJGOhfZrgP9MacrZVGMVycQR8kBRFqwe5ay9+6AD8uHDMUg=='
	}
]
