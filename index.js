var crypto = require('crypto');
var uuid = require('uuid');
var express = require('express');
var mysql = require('mysql');
var bodyParser = require('body-parser');
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io").listen(server);
var fs = require("fs");
server.listen(8080);
var con = mysql.createConnection({
 host: "b034kdbmfuvinopgjuse-mysql.services.clever-cloud.com",
  user: "u20nnlbcqemoj3jy",
  password: "t7zRtkGhq0F1svEcGKlC",
   database: "b034kdbmfuvinopgjuse"
});
var ketqua;
//password 
var getRandomString =function(length){
	return crypto.randomBytes(Math.ceil(length/2))
	.toString('hex') // convert to hexa
	.slice(0,length); // return required number of char
};

var sha512 = function(password,salt){
	var hash = crypto.createHmac('sha512',salt); 
	hash.update(password);
	var value = hash.digest('hex');
	return{
		salt:salt,
		passwordHash:value
	};
};

function saltHashPassword(userPassword){
var salt = getRandomString(16);
var passwordData = sha512(userPassword,salt);
return passwordData;
};

function checkHashPassword(userPassword,salt){

	var passwordData = sha512(userPassword,salt);
	return passwordData;

};


io.sockets.on('connection', function(socket){

console.log("co nguoi ket noi ");
// dang ki tai khoan
socket.on('client-dang-ki-user', function(data){
	//var ketqua;
	var name     		= data.name;
	var email    		= data.email;
	var password 		= data.password;
	var uid 			= uuid.v4();
	var plaint_password = password;
	var hash_data 		= saltHashPassword(plaint_password);
	var password  		= hash_data.passwordHash;
	var salt 			= hash_data.salt;
	
  
 con.query('SELECT * FROM user where email=?',[email], function(err,result, fields){
		con.on('error',function(err){
			console.log('mysql error',err);
		});

		if (result && result.length){
			ketqua = false;
		
		console.log("tai khoan da ton tai ");
	}
	else{
		ketqua = true;
		con.query('INSERT INTO `user`(`unique_id`, `name`, `email`, `encrypted_password`, `salt`, `create_at`, `updated_at`) VALUES (?,?,?,?,?,NOW(),NOW())',[uid,name,email,password,salt],function(err,result, fields){
		con.on('error',function(err){
			console.log('mysql error',err);
			console.log('khong thanh cong');
			
		});
		console.log('thanh cong');
		//socket.emit('ket-qua-dang-ki',{noidung: ketqua});
	});
	}
	 socket.emit('ket-qua-dang-ki',{noidung: ketqua});
	});	

});
// dang nhap
socket.on('client-dang-nhap-user', function(data){
	var email    	  = data.email;
	var user_password = data.password;
	
 con.query('SELECT * FROM user where email=?',[email], function(err,result, fields){
		con.on('error',function(err){
			console.log('mysql error',err);
		});
		if (result && result.length)
		{
			var salt = result[0].salt;
			var encrypted_password = result[0].encrypted_password;
			var hashed_password = checkHashPassword(user_password,salt).passwordHash.slice(0,16);
			if (encrypted_password == hashed_password) {
				ketqua = true;
				//res.end(JSON.stringify(result[0]));
				console.log('dang nhap thanh cong');
				console.log(result[0]);
			}
			else{
				ketqua = false;
				console.log('dang nhap k thanh cong');
			}
			
		 }
		
	else
	{
		ketqua = false;
	console.log('dang nhap k thanh cong');
	}
	socket.emit('ket-qua-dang-nhap',{noidung: ketqua});
	});
});
//gui du lieu device
// socket.on('client-gui-device', function(data){
// 	device_id = data.device_id;
// 	unique_id = data.unique_id;
//   	name      = data.name;
//   	mode      = data.mode;
//   	speed     = data.speed;
//   	rotation  = data.rotation;
  
//   con.query('UPDATE `devices` SET `device_id`=?,`unique_id`=?,`name`=?,`mode`=?,`speed`=?,`rotation`=? WHERE 1',[device_id,unique_id,name,mode,speed,rotation], function(err,result, fields){
// 		con.on('error',function(err){
// 			console.log('mysql error',err);
// 		});

	
// 	});	



// });


});
