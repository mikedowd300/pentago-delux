var mongo = require('mongodb').MongoClient,
	client = require('socket.io').listen(3000).sockets,
	tableCount = 0, 
	clients = [];  

mongo.connect('mongodb://127.0.0.1/pentago', function(err, db){
	if(err) throw err;
	client.on('connection', function(socket) {		
		clients.push(socket);
		var chatCol = db.collection('publicChat');
		var tables = db.collection('tables');
		for(var i = 0; i < clients.length; i++) {
			if(clients[i].connected){
				console.log(clients[i].id + ' is connected');
			} else {
				console.log(clients[i].id + ' is no longer connected');
				tables.remove({player1ID: clients[i].id.slice(2)});//remove from the database
				client.emit('removeTable3', clients[i].id.slice(2));//tell clients to remove from the table list
				clients.splice(i, 1);//remove from the clients array
				i--;					
			}
		}
		//Tell player his oponnent left
		socket.on('checkConnect', function(data) {
			var conn = false;
			for(var i = 0; i < clients.length; i++){
				if(clients[i].id.slice(2) === data) conn = true;				
			}
			socket.emit('checkConnect2', conn);
		});
		//************************ Game Room ******************************		
		tables.find().limit(1000).sort({id: 1}).toArray( function(err, tableResults) {
			if(err) throw err;
			socket.emit('openTables', tableResults);
		});
		//Creating a table
		socket.on('newTable', function(data) {				
				data.tableIndex = tableCount;	
				data.tableDB = 'table' + tableCount.toString();
				data.messageDB = 'chatBox' + tableCount.toString();
				tableCount++;
				tables.insert(data, function(){
					socket.emit('updateObject', data);
					client.emit('openTables', [data]);
					var chatCol = db.collection(data.messageDB);	
					chatCol.insert(data, function() {	
						data.message = 'Hello ' + data.name + ', you are waiting for an oponent to join you.';
						data.name = '';
						client.emit('output', [data]);	
						sendStatus({message: 'Message sent!', clear: true});
					});
				});				
		});
		//removing a table from the list
		socket.on('removeTable', function(data) {			
			client.emit('removeTable2', data.tableDB);			
			tables.remove({tableDB: data.tableDB});
		});
		//Tell player1 to look for player2's id
		socket.on('updatePlayer2Field', function(data) {
			for(var i = 0; i < clients.length; i++) {
				if(clients[i].id.slice(2) === data.player1ID) var tempSock = clients[i];
			}
			if(tempSock !== undefined)
				var chatCol = db.collection(data.messageDB);	
				chatCol.insert(data, function() {	
					data.message = data.name + ' has joined the table. GAME ON!!!';
					data.name = '';
					client.emit('output', [data]);	
					sendStatus({message: 'Message sent!', clear: true});
				});			
				tempSock.emit('updatePlayer2Field2', data.player2ID);
		});
		//************************ Chat Room **********************
		//List last 100 messages when a new client joins up
		chatCol.find().limit(100).sort({_id: 1}).toArray(function(err, result) {
			if(err) throw err;
			socket.emit('output', result);
		});

		var sendStatus = function(s) {
			socket.emit('status', s);
		};		
		//Recieving a new chat message
		socket.on('input', function(data) {
			var chatCol = db.collection(data.messageDB);
			whitespacePatttern = /^\s*$/;
			if(whitespacePatttern.test(data.name) || whitespacePatttern.test(data.message)) {
				sendStatus('Invalid: Name and Message are required');
			} else {
				chatCol.insert(data, function() {	
					client.emit('output', [data]);	
					sendStatus({message: 'Message sent!', clear: true});
				});
			}
		});
//**************** Moves **********************************
		socket.on('nextMove', function(data) {
			var tempSock;
			for(var i = 0; i < clients.length; i++) {
				if(clients[i].id.slice(2) === data.otherPlayersID) 
					tempSock = clients[i];
			}
			tempSock.emit('nextMove2', data)
		});
	});
});









