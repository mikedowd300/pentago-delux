$(window).resize(function () {
	var width = $('.board-wrapper').css('width'); 
	$('.board-wrapper').css('height', width);
});

function adjustBoardHeight() {
	var width = $('.board-wrapper').css('width'); 
	$('.board-wrapper').css('height', width);
}

function rotator(elem, degs, bool) {
	if(bool) elem.css('transition', '2s').css('transform', 'rotate(' + degs + 'deg)');		
	return false;
}

function doEndModal(data) {
	data = updateRays(data);
	if(data.whiteWins) $('.end-message').text('White Wins!');
	if(data.blackWins) $('.end-message').text('Black Wins!');
	if(data.tie) $('.end-message').text('ITS A TIE');
	if(data.whiteWins || data.blackWins || data.tie)
		$('.game-over-modal').css('display', 'block');
}

$('.instruct-modal, .instruct-hider').click(function() {
		$('.instruct-modal').css('display', 'none');
});

$('.instruct-button').click(function() {
		$('.instruct-modal').css('display', 'block');
});

$('.play-again-button').click(function() {
	//player goes back to game room without having to refresh
		//Joins the common chat
		//Game Over Modal closes, Game Room Appears
	//The database for the private chat is deleted
	//The table# again becomes available for use
		//Pushed to an array
		//Which means an array needs to exist and that table numbers are pulled from this array when they begin
		//What to do if the array is empty - maybe as a table is pulled from the array a new table is pushed to the top (?shifted) as long as the array is not longer than X (1000?)
});
//*************************The win checker array ************
function updateRays(data) {
	var degRay = data.quadDegRay,
		quadNameRay = ['.q-t-l ', '.q-t-r ', '.q-b-l ', '.q-b-r '],
		cellNameRay = [['.cell1', '.cell2', '.cell3'], ['.cell4', '.cell5', '.cell6'], ['.cell7', '.cell8', '.cell9']],
		masterRay = [],	
		turnRay = [];
	//Calculates the number of 90 degree clockwise turns to make per quad
	for(var i = 0; i < 4; i++) {
		turnRay[i] = degRay[i] / 90;
		if(turnRay[i] === -1) turnRay[i] = 3;
		if (turnRay[i] === -2) turnRay[i] = 2;
		if(turnRay[i] === -3) turnRay[i] = 1;
	}
	for(var i = 0; i < 4; i++){
		var quad = [];
		for(var j = 0; j < 3; j++){
			var row = []; 
			for(var k = 0; k < 3; k++){				
				var tempCol = $(quadNameRay[i] + cellNameRay[j][k]).css('background-color');
				var tempVal = 0;
				if(tempCol === "rgb(0, 0, 0)") tempVal = 1;
				if(tempCol === "rgb(255, 255, 255)") tempVal = -1;
				row[k] = tempVal;
			}
			quad[j] = row;
		}	
		//Rotates each quad appropriatly
		for(var m = 0; m < turnRay[i]; m++){
			quad = rotateArrayClockwise90(quad);
		}
		masterRay[i] = quad;
	}	
	data.masterRay = masterRay;
	data = winnerCheck(data);
	return data;	
}

function winnerCheck(data) {
	var a = data.masterRay,
		sums = [],	
		maxNum = 0,
		minNum = 0;	
	//Horizontal
	sums[0] = a[0][0][0] + a[0][0][1] + a[0][0][2] + a[1][0][0] + a[1][0][1];
	sums[1] = a[0][1][0] + a[0][1][1] + a[0][1][2] + a[1][1][0] + a[1][1][1];
	sums[2] = a[0][2][0] + a[0][2][1] + a[0][2][2] + a[1][2][0] + a[1][2][1];
	sums[3] = a[2][0][0] + a[2][0][1] + a[2][0][2] + a[3][0][0] + a[3][0][1];
	sums[4] = a[2][1][0] + a[2][1][1] + a[2][1][2] + a[3][1][0] + a[3][1][1];
	sums[5] = a[2][2][0] + a[2][2][1] + a[2][2][2] + a[3][2][0] + a[3][2][1];
	sums[6] = a[0][0][1] + a[0][0][2] + a[1][0][0] + a[1][0][1] + a[1][0][2];
	sums[7] = a[0][1][1] + a[0][1][2] + a[1][1][0] + a[1][1][1] + a[1][1][2];
	sums[8] = a[0][2][1] + a[0][2][2] + a[1][2][0] + a[1][2][1] + a[1][2][2];	
	sums[9] = a[2][0][0] + a[2][0][1] + a[3][0][2] + a[3][0][0] + a[3][0][1];
	sums[10] = a[2][1][0] + a[2][1][1] + a[3][1][2] + a[3][1][0] + a[3][1][1];
	sums[11] = a[2][2][0] + a[2][2][1] + a[3][2][2] + a[3][2][0] + a[3][2][1];	
	//vertical
	sums[12] = a[0][0][0] + a[0][1][0] + a[0][2][0] + a[2][0][0] + a[2][1][0];
	sums[13] = a[0][0][1] + a[0][1][1] + a[0][2][1] + a[2][0][1] + a[2][1][1];
	sums[14] = a[0][0][2] + a[0][1][2] + a[0][2][2] + a[2][0][2] + a[2][1][2];
	sums[15] = a[1][0][0] + a[1][1][0] + a[1][2][0] + a[3][0][0] + a[3][1][0];
	sums[16] = a[1][0][1] + a[1][1][1] + a[1][2][1] + a[3][0][1] + a[3][1][1];
	sums[17] = a[1][0][2] + a[1][1][2] + a[1][2][2] + a[2][0][2] + a[3][1][2];
	sums[18] = a[0][1][0] + a[0][2][0] + a[2][0][0] + a[2][1][0] + a[2][2][0];
	sums[19] = a[0][1][1] + a[0][2][1] + a[2][0][1] + a[2][1][1] + a[2][2][1];
	sums[20] = a[0][1][2] + a[0][2][2] + a[2][0][2] + a[2][1][2] + a[2][2][2];
	sums[21] = a[1][1][0] + a[1][2][0] + a[3][0][0] + a[3][1][0] + a[3][2][0];
	sums[22] = a[1][1][1] + a[1][2][1] + a[3][0][1] + a[3][1][1] + a[3][2][1];
	sums[23] = a[1][1][2] + a[1][2][2] + a[3][0][2] + a[3][1][2] + a[3][2][2];
	//Diagoal
	sums[24] = a[0][0][1] + a[0][1][2] + a[1][2][0] + a[3][0][1] + a[3][1][2];
	sums[25] = a[0][1][0] + a[0][2][1] + a[2][0][2] + a[3][1][0] + a[3][2][1];
	sums[26] = a[0][0][0] + a[0][1][1] + a[0][2][2] + a[3][0][0] + a[3][1][1];
	sums[27] = a[0][1][1] + a[0][2][2] + a[3][0][0] + a[3][1][1] + a[3][2][2];
	sums[28] = a[1][0][1] + a[1][1][0] + a[0][2][2] + a[2][0][1] + a[2][1][0];
	sums[29] = a[1][1][2] + a[1][2][1] + a[3][0][0] + a[2][1][2] + a[2][2][1];
	sums[30] = a[1][0][2] + a[1][1][1] + a[1][2][0] + a[2][0][2] + a[2][1][1];
	sums[31] = a[1][1][1] + a[1][2][0] + a[2][0][2] + a[2][1][1] + a[2][2][0];
	for(var i = 0; i < sums.length; i++) {
		if(sums[i] > maxNum) maxNum = sums[i];
		if(sums[i] < minNum) minNum = sums[i];
	}	
	if(maxNum === 5) data.blackWins = true;
	if(minNum === -5) {
		data.whiteWins = true;
		console.log(sums);
	}
	if(data.whiteWins && data.blackWins) data.tie = true;	
	return data;
}

function rotateArrayClockwise90 (ray){
	var tempRay = ray[0][1];
	ray[0][1] = ray[1][0];
	ray[1][0] = ray[2][1];
	ray[2][1] = ray[1][2];
	ray[1][2] = tempRay; 
	tempRay = ray[0][0];
	ray[0][0] = ray[2][0];
	ray[2][0] = ray[2][2];
	ray[2][2] = ray[0][2];
	ray[0][2] = tempRay;
	return ray;
} 