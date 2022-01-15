function setupBoard() {
	
	var myWidth =document.getElementById("game-div").offsetWidth;
	console.log(myWidth);

	
	var marginTop = 30,
        marginLeft = 30,
        boardDimension = 8;
    var fieldSize = myWidth/boardDimension;
    var boardSize = boardDimension*fieldSize;

    var board =[];
    
    for(var i = 0; i < boardDimension*boardDimension; i++) {
        board.push({
            x: i % boardDimension,
            y: Math.floor(i / boardDimension),
            index: i,
            n: 0,
            nb: 0,
            nr: 0
        });
    };

    var div = d3.select(".board")
        .append("div")
        .style("top", marginTop + "px")
        .style("left", marginLeft + "px")
        .style("width", boardSize + "px")
        .style("height", boardSize + "px");

    var svg = div.append("svg")
         .attr("width", boardSize + "px")
         .attr("height", boardSize + "px")
         .selectAll(".fields")
         .data(board)
        .enter()
         .append("g");

    svg.append("rect")
         .style("class", "fields")
         .style("class", "rects")
         .attr("x", function (d) {
             return d.x*fieldSize;
         })
         .attr("y", function (d) {
             return d.y*fieldSize;
         })
         .attr("color",0)
         .attr("fieldSize",fieldSize)
         .attr("next-color",0)
         .attr("neighbors",0)
         .attr("width", fieldSize + "px")
         .attr("height", fieldSize + "px")
         .style("fill", 0)
         .attr("stroke", "white")
         .on('click' , function(d){ 
	          d3.select(this)
		      	.attr("fill", function(d) {
			      	
			      	if (!checkIfColor(this,1)) {
				      	
				      	switchColor(1, d3.select(this));
			        	countNeighbors();
			        	
			        	bluesTurn();
			        	
			        	window.setTimeout(function() {
						  computerMove();
						  countNeighbors();
						  window.setTimeout(function() {
							  golTurn();
							  window.setTimeout(function() {
								  refreshWorld(svg,boardDimension,fieldSize);
								  setWorld(svg,boardDimension);
								  countNeighbors();
								  redsTurn();
								}, 1000); // time for GOL	
							}, 1000); // time to switch to GOL indicator
						}, 1500); // time for blue turn
			      	}
			    })
	         });
	         
	    
	         
	    svg.append("text");

		newBoard();
		
}

function checkIfColor(elem,i) {
	if (d3.select(elem).attr("color") == i) {
		return true;
	} else {
		return false;
	}
}

// count neighbors, but don't change based on rules:
function countNeighbors() {
	
	var svg = d3.select("svg");
	var boardDimension = Math.sqrt(svg.selectAll("rect").nodes().length);	
	var board=[];
    
	for (let ri=0; ri<(boardDimension*boardDimension);ri++) {
	    
	    // check if this element is already blue:
	    var focal_cell = d3.select(svg.selectAll("rect").nodes()[ri]);
	    var xi = focal_cell.attr("x")/focal_cell.attr("fieldSize");
	    var yi = focal_cell.attr("y")/focal_cell.attr("fieldSize");
	    
	    	    
	    var N=0;
	    var Nr=0;
	    var Nb=0;
	
		for (let i=-1; i<=1;i++) {
			for (let j=-1; j<=1;j++) {				
				if ((i == 0) && (j==0)) {
					// exclude self
				} else {
					
					// exclude going off the edges:
					if (((yi + j) < boardDimension) && ((yi + j) >= 0)) {
						if (((xi + i) < boardDimension) && ((xi + i) >= 0)) {
							// determine index of neighbor:
							var index = (yi + j)*boardDimension + (xi + i);
							
							if ((index > 0) && (index < boardDimension*boardDimension)) {
								var neighbor_cell = d3.select(svg.selectAll("rect").nodes()[index]);
								if (neighbor_cell.attr('color') > 0 ) {
									N++;
									if (neighbor_cell.attr('color') == 1) {
										Nr++;
									} else {
										Nb++;
									}
								}
							}
						}
					}
				}				
			}
		}
		
// 		console.log(N + "-" + Nr + "-" + Nb);
		
		var status = (rule(focal_cell.attr("color"),N,Nr,Nb) > 0) ? "\u2713" : "x";
						
		board.push({
            x: ri % boardDimension,
            y: Math.floor(ri / boardDimension),
            index: ri,
            n: N,
            nb: Nb,
            nr: Nr,
            s : status
        });
		
		
	}    
    
    
    svg.data(board)
    	.enter();
    	
	var fieldSize = d3.select(svg.selectAll("rect").nodes()[0]).attr("fieldSize");

    
    svg.selectAll("text")
    	.style("font-size", "20")
        .attr("text-anchor", "middle")
        .attr("dy", function(d,i) {			            
	        return ( (fieldSize*0.9) + fieldSize*(d.y) + "px");
        })
        .attr("dx", function (d,i){
	        return ( (fieldSize*0.5) + fieldSize*(d.x) + "px");
        })
        .attr("fill", function(d,i) {
	        var index = (d.y)*boardDimension + (d.x);
	        
	        if (board[index].s == "x") {
		        return "white";
	        } else {
		        var focal_cell = d3.select(svg.selectAll("rect").nodes()[index]);		
				if (focal_cell.attr("color") == 0){
					if (Nr > Nb) {
						return "red";
					} else {
						return "blue";
					}
				} else {
			        return "white";
		        }
	        }
	        
	        
    		
        })
    	.text(function(d,i,element){
	    	if (document.getElementById("cheating").value == "ON"){
		    	var index = (d.y)*boardDimension + (d.x);
	    		    	
		    	// change to check mark
		    	return board[index].s;
	    	}
    	});

	return board;
}

// color, neighbors, neighbors(red), neighbors(blue)
function rule(c,n,nr,nb){
	
	//rule 1. Any live cell with fewer than two live neighbours dies, as if by underpopulation.
	if ((c>0) && (n<2)) {
		return 0; // black
	}
	
	// rule 2. Any live cell with two or three live neighbours lives on to the next generation.
	if ((c>0) && ((n==2)&&(n==3))) {
		return c;
	}
	
	// rule 3. Any live cell with more than three live neighbours dies, as if by overpopulation
	if ((c>0) && (n>3)) {
		return 0;
	}
			
	// rule 4. Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction
	if ((c==0) && (n==3)) {
		return (nr > nb) ? 1 : 2;
	}
}

function refreshWorld(svg,boardDimension,fieldSize) {
	
	var board = countNeighbors();
	    
	for (let ri=0; ri<(boardDimension*boardDimension);ri++) {
		var focal_cell = d3.select(svg.selectAll("rect").nodes()[ri]);		
		next_color = rule(focal_cell.attr('color'), board[ri].n, board[ri].nr, board[ri].nb);
	    focal_cell.attr('next-color',next_color);		
	}
	countNeighbors();
}

// set each cell's color to next-color
function setWorld(svg,boardDimension) {
	// pass next-color into color, and change color:
	for (let ri=0; ri<(boardDimension*boardDimension);ri++) {
		// set color to next color attribute.
		var focal_cell = d3.select(svg.selectAll("rect").nodes()[ri]);
		
		switchColor(focal_cell.attr('next-color'), focal_cell);	
	}
}

// computer's move:
function computerMove() {
	
	// check if game is won:
// 	var game_state = checkGameOver(svg,boardDimension);
	
	
    
    var svg = d3.select("svg");
	var boardDimension = Math.sqrt(svg.selectAll("rect").nodes().length);
	
	var ri = Math.floor(Math.random()*boardDimension*boardDimension);

    // check if this element is already blue:
    var element = svg.selectAll("rect").nodes()[ri];
    
    
    
    if (!checkIfColor(element,2)) {
	    switchColor(2, d3.select(element));
    } else {
	    computerMove();
    }

}

function switchColor(i, rectangle) {
	var colors = ["black","red","blue"];
	
	rectangle.style("fill",colors[i])
			  .attr("color", i);
}

function checkGameOver(svg,boardDimension) {
	var reds = 0;
	var blues = 0;
	
	for (let ri=0; ri<(boardDimension*boardDimension);ri++) {
		// set color to next color attribute.
		var focal_cell = d3.select(svg.selectAll("rect").nodes()[ri]);
		
		if (focal_cell.attr("color") == 1) {
			reds++;
		} else if (focal_cell.attr("color") == 2) {
			blues++;
		}
	}
	
	if (reds + blues == 0) {
		// both lost
		nextState('You lost!');
		
		return 3;
	} else if (reds == 0) {
		// red lost
		nextState('You lost!');
		
		return 1;
	} else if (blues == 0) {
		// blue lost
		nextState('You won!');
		
		return 2;
	}
	
	
	
	return 0;
	
}


function redsTurn() {
	document.getElementById("game-turn").innerHTML = 
			"It is currently: <span style='color: red; text-decoration: underline;'>Red's turn</span> ..... <span style='color: #dedede'>Blue's turn</span> ..... <span style='color: #dedede'>Game of Life</span>";
}

function bluesTurn() {
	document.getElementById("game-turn").innerHTML = 
			"It is currently: <span style='color: #dedede'>Red's turn</span> ..... <span style='color: blue; text-decoration: underline;'>Blue's turn</span> ..... <span style='color: #dedede'>Game of Life</span>";
}

function golTurn() {
	document.getElementById("game-turn").innerHTML = 
			"It is currently: <span style='color: #dedede'>Red's turn</span> ..... <span style='color: #dedede'>Blue's turn</span> ..... <span style='color: black;  text-decoration: underline;'>Game of Life</span>";
}



function myToggle(button) {
	var myButton = document.getElementById("cheating").value;
	
	document.getElementById("cheating").value = (myButton == "OFF") ? "ON" : "OFF";
	countNeighbors();
}

// new game, end turn, 

function nextState(next_state) {
	
		document.getElementById("game-button").value = next_state;

	
// 	possible states:
// You won!
// You lost!
	
	
// 	new-game
	
	newBoard();
}


function newBoard() {
	var svg = d3.select("svg");	
	var Nt = svg.selectAll("rect").nodes().length;
	var N0 = Math.floor(Nt*0.2);
    
	for (let ri=0; ri<(Nt);ri++) {
	    // check if this element is already blue:
	    var focal_cell = d3.select(svg.selectAll("rect").nodes()[ri]);
	    
	    if (Math.random() < 0.25) {
		    var color = (Math.random() < 0.5) ? 1 : 2;
			switchColor(color , focal_cell);	
	    } else {
		    switchColor(0 , focal_cell);	
	    }
	}
	countNeighbors();
}





