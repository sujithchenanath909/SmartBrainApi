const express=require('express')
const bodyparser=require('body-parser')
const cors=require('cors');
const bcrypt = require('bcrypt');

const saltRounds = 10;


const db = require('knex')({
  client: 'pg',
  connection: {
    host : '127.0.0.1',
    user : 'postgres',
    password : 'suji123',
    database : 'smartbrain'
  }
});


//db.select('*').from('users');

const app=express();

const database={

users:[

	{
		id:'123',
		name:'sujith',
		email:'suji@gmail.com',
		password:'nameissuji',
		entries:0

	},

	{
		id:'1233',
		name:'suji',
		email:'suji@gmail.com',
		password:'nameissuji',
		entries:0

	}


],

login:[{

	id:'983',
	hash:'',
	email:'suji@gmail.com'
}
]

}

app.use(bodyparser.json());

app.use(cors());

app.get('/',(req,res)=>{


res.json('It is working');

});


app.get('/users',(req,res)=>{


res.json(database.users);

});

app.get('/user/:id',(req,res)=>{
	const {id}=req.params;

db.select('*').from('users')
.where({id}).then(user=>{
	if(user.length){

		res.json(user[0]);
	}else{

		res.status(400).json("user not found")
	}
	
}).catch(err=>res.json("Error on searching user"))

})



app.get('/users',(req,res)=>{


res.json(database.users);

});


app.put('/image',(req,res)=>{

	const {id} =req.body;

	db('users').where('id','=',id)
	.increment('entries',1)
	.returning('entries')
	.then(entries => {

		res.json(entries[0])
	}).catch(err=>{

		res.status(400).json('unable to get entries');
	})

})

app.post('/signin',(req,res)=>{


	db.select('email','hash').from('login')
	.where('email','=',req.body.email)
	.then(data=>{

			console.log('datais',data[0].hash);
			

			bcrypt.compare(req.body.password, data[0].hash).then(function(result) {

				if(result){

					db.select('*').from('users').where('email','=',req.body.email)
					.then(user=>{

						res.json (user[0])

					})
					.catch(err=>res.status(400).json('unable to get user'))
					
				}else{

					res.status(400).json('wrong credentials')
				}
			});


	})
	.catch(err=>res.status(400).json(err))

	
})


app.post('/register',(req,res)=>{

const {name , email , password} =req.body;
const hashn='';

bcrypt.hash(password, saltRounds, function(err, hash) {

		db.transaction(trx=>{

		trx.insert({

			hash:hash,
			email:email

		})
		.into('login')
		.returning('email')
		.then(loginEmail=>{

			db('users')
			.returning('*')
			.insert(
				{name: name,
				 email:email,
				 joined: new Date()}
				)
			.then(user=>{

				res.json(user[0]);

			})

		})
		.then(trx.commit)
		.catch(trx.rollback)



	})
	.catch(err=>res.status(400).json('unable to register'))
    
});


})

app.listen(3000,()=>{

	console.log('App is running on port 3000');
})