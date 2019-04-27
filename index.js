const express = require('express');
const cors = require('cors');
// const session = require('express-session');
// const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const bkfd2Password = require("pbkdf2-password");
const hasher = bkfd2Password();
const app = express();
const corsOptions = {
	"origin": "*",
	"methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
	"preflightContinue": false,
	"optionsSuccessStatus": 200,
	"exposedHeaders": 'x-auth-token'
}

//유저 찾기
function findUserName(token) {
	for(let t of hashes) {
		if(t.hash == token) {
			return t.tokenOwner
		}
	}
	return null;
}

//토큰 유효성 확인
function tokenValid(token) {
	for(let t of hashes) {
		// console.log('token val : ', t);
		// console.log('t hash check: ', t.hash);
		console.log('token : ', token)
		if(t.hash == token) {
			console.log('토큰 있어요')
			return true;
		} else {
			console.log('토큰 없어요')
		}
	}
	return false;
}

//유효한 토큰을 가지고 있는지 체크
function tokenCheck(req) {
	console.log(req.headers)
	let token = req.headers['x-auth-token']

	if(token) {
		console.log(req.url, 'tokenCheck() true :', req.headers['x-auth-token'])
		let result = tokenValid(token);
		return result
	} else {
		console.log(req.url, 'tokenCheck() false :', req.headers['x-auth-token'])
		return false
	}
}

//인증이 필요한 페이지인지 확인
function authRequired(req, res) {
	
	const blackList = [
		'/login',
		'/logout',
		'/coffeeList',
	]

	if(blackList.includes(req.url)) {
		return false
	} else {
		return true
	}
}

//middleware 
function isNotAuth(req, res, next) {
	let token = req.headers['x-auth-token']
	console.log(`${req.url} with x-auth-token: ${token}`)
	
	if(authRequired(req, res)){

		if(tokenCheck(req)){
			req.token = token
			return next()
		} else {
			return res.status(401).send('Unauthorized Request')
		}
		
		// if(req.session && req.session.userId) {
		// } else {
			// return res.status(401).send('Unauthorized Request');
		//}
	} else {
		console.log('no need token')
		return next()
	}
}

//토큰이 없거나 유효하지 않을 때 세션 객체를 만들지 않음
function setSession(req, res, next) {
	let token = req.token
	if(token) {
		req.session = { userName : null }
		req.session.userName = findUserName(token)
		console.log('세션 만들었어요')
		return next()
	} else {
		console.log('세션 없어도돼요')
		return next()
	}
}

app.use(express.static('public'))
app.use(cors(corsOptions))
app.use(isNotAuth)
app.use(setSession)
// app.use(cookieParser());
// app.use(session({
// 	key: 's3cr3tk3y', //세션키
// 	secret: '!@$Rfeqf34',
// 	resave: false, //변경사항이 없어도 저장할 거니?
// 	saveUninitialized: true, //초기화되지않은 상태로 저장할거냐
// 	cookie: {
// 		maxAge: 1000 * 60 * 60 * 24,
// 		httpOnly: false
// 	}
// }));

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.listen(3000, () => {
	console.log('3000 port')
})

app.get('/', (req, res) => {
	res.send('Hello World!\n');
});

app.get('/userName', (req, res) => {
	let userName = req.session.userName
	res.send({ userName: userName })
})

app.get('/name', (req, res) => {
	res.json(cafeName);
});

app.get('/coffeeList', (req, res) => {
	return res.json(coffeeList);
});

app.get('/coffeeList/premium', (req, res)=> {
	return res.json(coffeeList); 
});

// app.get('/coffeeList/:id', (req, res) => {
// 	console.log('get:coffeelist:id', req.session)
// 	const id = parseInt(req.params.id, 10);
// 	if(!id) {
// 		return res.status(400).json({error: 'Incorrect id'});
// 	}
	
// 	let coffee = coffeeList.filter(coffee => coffee.id === id)[0];
// 	if(!coffee) {
// 		return res.status(404).json({error: 'Unknown coffee'});
// 	}
// 	return res.json(coffee);
// });

app.post('/login', (req, res) => {

	// sess = req.session;
	// console.log('post:login', sess)

	let id = req.body.userId;
	let pw = req.body.userPw;

	for(i = 0; i < users.length; i++) {
		let user = users[i];
		
		if(user.id === id) {
			hasher({ password: pw, salt: user.salt }, (err, pass, salt, hash) => {
				if(hash === user.password) {
					
					let date = new Date();
					let time = date.getTime();
					
					hasher({password: user.id + time}, (err, pass, salt, hash) => {
						let newToken = {
							hash: hash,
							tokenOwner: user.name
						}
						hashes.push(newToken);
						console.log('after push ', hashes);
						console.log('login success');
						
						res.set('x-auth-token', newToken.hash);
						return res.status(200).send('ok');
					})
				} else {				
					return res.status(401).send('who are you?');
				}			
			});
		}
	}
});

app.post('/logout', (req, res) => {
	//sess = req.session;
	//console.log('post:logout', sess);

	let token = req.headers['x-auth-token'];

	if(token){
		for(let t of hashes) {
			console.log('logout t: ',t);
			if(t.hash == token) {
				console.log('logout t in if hash',t.hash);
				console.log('logout t in if token',token);
				let removeItem = hashes.indexOf(t);
				hashes.splice(removeItem, 1);
				console.log('after remove ', hashes);
				res.send(200);
			}
		}
		res.send(200);
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

//로그인할때만 사용
const users  = [
	{
		id: 'user',
		name: 'Hong Gildong',
		password: '9WA88rq4Fnp4/4+XSJEeAxS8ft3MMRKdkDMMOEY4/cidk0/WOjA/hVOF9LddrjnpdbtRB+CImk5s4XBnEAzaE94SElq4t0OJnbS6IhwPHJInGav4q9wKCh6lo8I+JxMlDLO0Cj7nBrBgrKPeuEjVPMEXBg/Ovax98hIHne9I8d4=',
		salt: 'xjIdNWYvPpsrUzn5FUTsuQXDqGNI5gp3bKCI6BZA77qBLz8hGKMNg9FufyPj0Xg86306NKkNBhjxpg6fydpcGQ==',
	},
	{
		id: 'admin',
		name: 'Dr.admin',
		password: 'g48dCR0tLzBThIMf7w3D2lZTLXznZXVbEz3r2xraLsWy3QLiP+4rJgNGaElN/Ul0MBsOQM60wRnaV023/s9Xrd0qBUhgv1ze4EgZOl8fZIBUed2Fzsj/qTALG2JM0tvYDu4AYCxmgrPF0VQalnf+YAtjrSkSfUPSnO/8u50omcQ=',
		salt: 'PbAn4fUB9Nu2L2BZOCiw1hyD+VGeLV78nQubid6nJGOhfZrgP9MacrZVGMVycQR8kBRFqwe5ay9+6AD8uHDMUg==',
	}
]

let hashes = [];
