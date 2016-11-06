(function() {
	var $name = $('.player-name');
	var $message = $('.chat-box');
	var $status = $('.status-div span');
	var $log = $('.message-log-div');
	var statusDefault = $status.text(); 
	var gameObj = {
		name: '',
		message: '',
 		color: '',
 		tableIndex: '',
 		tableDB: '',
		messageDB: 'publicChat',
		player1ID: '',
		player2ID: ''
 	},
 	moveObj = {
 		quad : '',
 		cell: '',
 		quadDegRay: [0,0,0,0],
 		whiteWins: false,
 		blackWins: false,
 		tie: false,
 		yourTurn: false,
 		yourRotateTurn: false,
 		submitable: false,
 		otherPlayersID: ''
 	};

 	//****************************  Get Name *************************
 	$name.keydown( function(event) {
 		if(event.which === 13 && $name.val() !== '') {
 			gameObj.name = $name.val();
 			$('.get-name').hide();
 			$('.chat-name').text(gameObj.name);
 		}
 	});
 	// *************************** Create Game Room ******************
	setStatus = function(s) {
		$status.text(s);
		if(s !== statusDefault){
			var delay = setTimeout(function(){
				setStatus(statusDefault);
				clearInterval(delay);
			}, 3000);
		}
	}
	//Once a table is full, every 1.5 seconds the table checks that the oponent is still there
	oponentConnection = function(sid) {
		checkInterval = setInterval(function(){
			socket.emit('checkConnect', sid);
		}, 1500);
	}

	spinReminder = function() {
		var degs = 360;
		$('.whose-move').css('color', 'black');
		spinner = setInterval(function (){
			if(!moveObj.yourTurn) clearInterval(spinner);
			$('.whose-move').css('transition', '1s').css('color', 'red').css('transform', 'rotate(' + degs + 'deg)');
			degs += 360;
		}, 6000);
	}

	try{ var socket = io.connect('http://127.0.0.1:3000');}
	catch(e){ console.log('could not connect');}

	if(socket !== undefined) {
	//************************* Game Room *********************************
		// Listen for the open table List  - then show it to the user
		socket.on('openTables', function(data) {
			for(var i = 0; i < data.length; i++){
				var colStr = data[i].color;
				var otherColor = 'black';
				if(colStr === 'black') otherColor = 'white';	
				var myXML = "<p class='color hiddenp'>" + data[i].color + "</p>";
				myXML += "<p class='tableIndex hiddenp'>" + data[i].tableIndex + "</p>";
				myXML += "<p class='tableDB hiddenp'>" + data[i].tableDB + "</p>";
				myXML += "<p class='messsageDB hiddenp'>" + data[i].messageDB + "</p>";
				myXML += "<p class='tableIndex hiddenp'>" + data[i].name + "</p>";
				myXML += "<p class='player1ID " + data[i].player1ID + " hiddenp'>" + data[i].player1ID + "</p>";	 
				$('.table-wrapper').append('<div class="table ' + data[i].tableDB + ' ' + colStr + '-table"><p>Join ' + data[i].name + ' at table ' +  data[i].tableIndex + ' as ' + otherColor +'</p>' + myXML +'</div>');
			}			
		});	
		//When the client tells the user it wants to start a new table, the 
		//server puts the name of the collection for a private table and a 
		//private board into an object and sends that object back to the client
		socket.on('updateObject', function(data) {
			gameObj = data;
		});
		//This is to join an existing table
		$('.table-wrapper').on('click', '.table',function() {
			$('.table-wrapper').hide();
			$('.button-wrapper').hide();
			$('.chat-wrapper').css('display', 'block').css('margin-top', '0');
			$('.master-wrapper').css('margin', '1%');
			$('.board-wrapper').css('display', 'block').css('width', '50%');
			adjustBoardHeight();
		 	var nodeRay = this.childNodes;
		 	gameObj.color = 'black';
		 	if(nodeRay[1].innerText === 'black'){
		 		gameObj.color = 'white';
		 		moveObj.yourTurn = true;
		 		moveObj.yourRotateTurn = true;
		 		$('.whose-move').css('display', 'block');
		 		$('.submit-button').css('display', 'block');
		 	}		 	
		 	gameObj.tableIndex =  nodeRay[2].innerText;
		 	gameObj.tableDB =  nodeRay[3].innerText;
			gameObj.messageDB = nodeRay[4].innerText;
			//gameObj.name = nodeRay[5].innerText;
			gameObj.player1ID = nodeRay[6].innerText;
			gameObj.player2ID = socket.id;
			moveObj.otherPlayersID = gameObj.player1ID;
			oponentConnection(gameObj.player1ID);		
			socket.emit('removeTable', gameObj); 
			$('.chatter').remove();
			socket.emit('updatePlayer2Field', gameObj);
		});

		socket.on('removeTable2', function(data){
			$('.' + data).remove();
		});	

		socket.on('removeTable3', function(data){
			$('.' + data).parent().remove();
		});	

		socket.on('updatePlayer2Field2', function(data){
			gameObj.player2ID = data;
			moveObj.otherPlayersID = data;
			oponentConnection(gameObj.player2ID);
		});

		socket.on('checkConnect2', function(data) {
			if(data === false) {
				clearInterval(checkInterval);
				gameObj.message = "So sorry, your oponent has disconnected and will not be able to return to this table. You must refresh to find a new oponent. Maybe when I get better at programming this won't be the case";
				socket.emit('input', gameObj);				
			}
		});
		//refactor these two almost identical blocks
		$('.black-button').click( function() {
			$('.table-wrapper').hide();
			$('.button-wrapper').hide();
			$('.chat-wrapper').css('display', 'block').css('margin-top', '0');
			$('.master-wrapper').css('margin', '1%');
			$('.board-wrapper').css('display', 'block').css('width', '50%');
			adjustBoardHeight();
			gameObj.color = 'black';
			gameObj.player1ID = socket.id;
			socket.emit('newTable', gameObj);
			$('.chatter').remove();
		});

		$('.white-button').click( function() {
			$('.table-wrapper').hide();
			$('.button-wrapper').hide();
			$('.chat-wrapper').css('display', 'block').css('margin-top', '0');
			$('.master-wrapper').css('margin', '1%');
			$('.board-wrapper').css('display', 'block').css('width', '50%');
			adjustBoardHeight();		
			gameObj.color = 'white';
			moveObj.yourTurn = true;
			moveObj.yourRotateTurn = true;
			$('.whose-move').css('display', 'block');
			gameObj.player1ID = socket.id;
			socket.emit('newTable', gameObj);
			$('.chatter').remove();			
		});
		//************************* Chat Room *********************************
		//Listen for output from chat
		socket.on('output', function(data) {
			//console.log(data);
			for(var i = 0; i < data.length; i++){				
				if(gameObj.messageDB === data[i].messageDB) {
					if (data[i].name === '') {
						var colon = '';
					} else {						
						var colon = ': ';
					}
					$log.append('<div class="chatter"><span class="name-span">' + data[i].name + colon + '</span>' + data[i].message + '</div>');
				}
			}
			var height = 0;
			$('.chatter').each(function() {
				height += parseInt($(this).css('height')) + 14;
			});
			$log.scrollTop(height);
		});
		//Listen for a status
		socket.on('status', function(data) {
			var datType = typeof(data);
			if(datType === 'string') {
				setStatus(data);
			} else if(datType === 'object' && data.clear) {				
					$message.val('');
					setStatus(data.message);				
			}
		});
		//listen for keydown from the message box
		$message.on('keydown', function(event) {
			if(event.which === 13 && !event.shiftKey) {
				gameObj.name = $name.val();
				gameObj.message = $message.val();
				socket.emit('input', gameObj);
			}
		});
//********************** The Game *********************
		var $qtl = $('.q-t-l'),
			$qtr = $('.q-t-r'),
			$qbl = $('.q-b-l'),
			$qbr = $('.q-b-r'),
			quadDegRay = [0,0,0,0]
			myColor = gameObj.color;

		$('.q1-top').click(function() {
				moveObj.quadDegRay[0] += 90;
				moveObj.yourRotateTurn = rotator($qtl, moveObj.quadDegRay[0], moveObj.yourRotateTurn);
		}); 
		$('.q1-side').click(function() {
				moveObj.quadDegRay[0] -= 90;
				moveObj.yourRotateTurn = rotator($qtl, moveObj.quadDegRay[0], moveObj.yourRotateTurn);
		});
		$('.q2-top').click(function() {
				moveObj.quadDegRay[1] += 90;
				moveObj.yourRotateTurn = rotator($qtr, moveObj.quadDegRay[1], moveObj.yourRotateTurn);
		});
		$('.q2-side').click(function() {
				moveObj.quadDegRay[1] -= 90;
				moveObj.yourRotateTurn = rotator($qtr, moveObj.quadDegRay[1], moveObj.yourRotateTurn);
		});
		$('.q3-bot').click(function() {
				moveObj.quadDegRay[2] += 90;
				moveObj.yourRotateTurn = rotator($qbl, moveObj.quadDegRay[2], moveObj.yourRotateTurn);
		});
		$('.q3-side').click(function() {
				moveObj.quadDegRay[2] -= 90;
				moveObj.yourRotateTurn = rotator($qbl, moveObj.quadDegRay[2], moveObj.yourRotateTurn);
		});
		$('.q4-bot').click(function() {
				moveObj.quadDegRay[3] += 90;
				moveObj.yourRotateTurn = rotator($qbr, moveObj.quadDegRay[3], moveObj.yourRotateTurn);
		});		
		$('.q4-side').click(function() {
				moveObj.quadDegRay[3] -= 90;
				moveObj.yourRotateTurn = rotator($qbr, moveObj.quadDegRay[3], moveObj.yourRotateTurn);
		});

		$('.hole').click(function() {
			if(gameObj.player2ID !== '' 
			&& $(this).css('background-color') !== 'black' 
			&& $(this).css('background-color') !== 'white'
			&& $(this).css('background-color') !== 'rgb(255, 255, 255)'
			&& $(this).css('background-color') !== 'rgb(0, 0, 0)'
			&& !moveObj.oponentWon
			&& moveObj.yourTurn === true) {
				$('.submit-button').css('display', 'block');
				$(this).css('background-color', gameObj.color);
				var elemRay = $(this).attr("class").split(' ');
				moveObj.cell = elemRay[0];
				var elemRay = $(this).parent().attr("class").split(' '); //This recreates the array as a new variable so careful where you move it to			
				moveObj.quad = elemRay[1];
				moveObj.yourTurn = false;
				moveObj.submitable = true;
			}
		});

		$('.submit-button').click(function() {
			if(moveObj.submitable === true) {
				doEndModal(moveObj);
				moveObj.yourTurn = true; //Initialize for next player
				moveObj.yourRotateTurn = true;
				socket.emit('nextMove', moveObj);
				moveObj.yourTurn = false; //Status of this player
				moveObj.yourRotateTurn = false;
				moveObj.submitable = false;
				$('.whose-move').css('display', 'none');
				$('.submit-button').css('display', 'none');
			}		
		});

		socket.on('nextMove2', function(data){
			spinReminder();			
			$('.whose-move').css('display', 'block');
			$('.submit-button').css('display', 'none');
			var otherColor = 'black';
			if(gameObj.color === 'black') otherColor = 'white';
			moveObj.yourTurn = data.yourTurn;
			moveObj.yourRotateTurn = data.yourRotateTurn;
			moveObj.quadDegRay = data.quadDegRay;
			var myQuad = data.quad;
			var myCell = data.cell;
			var mySelector = '.' + myQuad + ' .' + myCell;
			$qtl.css('transition', '2s').css('transform', 'rotate(' + moveObj.quadDegRay[0] + 'deg)');
			$qtr.css('transition', '2s').css('transform', 'rotate(' + moveObj.quadDegRay[1] + 'deg)');
			$qbl.css('transition', '2s').css('transform', 'rotate(' + moveObj.quadDegRay[2] + 'deg)');
			$qbr.css('transition', '2s').css('transform', 'rotate(' + moveObj.quadDegRay[3] + 'deg)');
			$(mySelector).css('background-color', otherColor);
			doEndModal(data);
		});		
//*****************************************************
	} //End if
})();