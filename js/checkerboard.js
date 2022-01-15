function setupBoard() {
	
	var myWidth =document.getElementById("game-div").offsetWidth;
	
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
         .attr('stroke-width', '3')
         .on('click' , function(d){ 
	          d3.select(this)
		      	.attr("fill", function(d) {
			      	
			      	if (!(d3.select(this).attr("color") == 1)) {
				      	var button_status = document.getElementById("game-button").name;
				      	
				      	if ((button_status == "new-game") || (button_status == "make-your-move") || (button_status = "red-selection-made")) {
					      	switchColor(1, d3.select(this), true);
				        	countNeighbors();
				        	document.getElementById("game-button").name = "red-selection-made";				        	
				        	nextState(true);	
				      	}
			      	}
			    })
	         });
	         
	    svg.append("text");		
	    newBoard();
}

// count neighbors, but don't change based on rules:
function countNeighbors() {
	
	var svg = d3.select("svg");
	var boardDimension = Math.sqrt(svg.selectAll("rect").nodes().length);	
	var board=[];
    
	for (let ri=0; ri<(boardDimension*boardDimension);ri++) {
	    
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
						return "#0096ff";
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
	
	return 0;
}

// check all cells, change "next-color" according to rules of G.o.L.
function refreshWorld() {
	
	var svg = d3.select("svg");
	var boardDimension = Math.sqrt(svg.selectAll("rect").nodes().length);
	
	var board = countNeighbors();
	    
	for (let ri=0; ri<(boardDimension*boardDimension);ri++) {
		var focal_cell = d3.select(svg.selectAll("rect").nodes()[ri]);		
		next_color = rule(focal_cell.attr('color'), board[ri].n, board[ri].nr, board[ri].nb);
	    focal_cell.attr('next-color',next_color);		
	}
	countNeighbors();
}

// set each cell's color to next-color
function setWorld() {
	var svg = d3.select("svg");
	var boardDimension = Math.sqrt(svg.selectAll("rect").nodes().length);
	// pass next-color into color, and change color:
	for (let ri=0; ri<(boardDimension*boardDimension);ri++) {
		// set color to next color attribute.
		var focal_cell = d3.select(svg.selectAll("rect").nodes()[ri]);
		switchColor(focal_cell.attr('next-color'), focal_cell, false);	
	}
}

function makeAllDark() {
	// switch all to dark colors:
	var svg = d3.select("svg");
	var boardDimension = Math.sqrt(svg.selectAll("rect").nodes().length);
	// pass next-color into color, and change color:
	for (let ri=0; ri<(boardDimension*boardDimension);ri++) {
		// set color to next color attribute.
		var focal_cell = d3.select(svg.selectAll("rect").nodes()[ri]);
		switchColor(focal_cell.attr('color'), focal_cell, false);	
	}
}

// computer's move:
function computerMove() {
    var svg = d3.select("svg");
	var boardDimension = Math.sqrt(svg.selectAll("rect").nodes().length);
	var ri = Math.floor(Math.random()*boardDimension*boardDimension);

    // check if this element is already blue:
    var element = svg.selectAll("rect").nodes()[ri];
    if (!(d3.select(element).attr("color") == 2)) {
	    switchColor(2, d3.select(element), true);
    } else {
	    computerMove();
    }
}

function removeLightReds(colors){
	// set color to old color, dark version (don't need to change 
	var svg = d3.select("svg");
		var boardDimension = Math.sqrt(svg.selectAll("rect").nodes().length);
		// pass next-color into color, and change color:
		for (let ri=0; ri<(boardDimension*boardDimension);ri++) {
			var focal_cell = d3.select(svg.selectAll("rect").nodes()[ri]);
			var old_color = focal_cell.attr("old-color");
			if (old_color) {
				console.log(old_color)
			
				focal_cell.style("fill",colors[old_color])
					.attr("color", old_color);
			}
			
		}
}

function switchColor(i, rectangle, temporary) {
	var colors = ["#212121","red","blue"];
	
	if (temporary) {
		
		// if this is a temp selection, remove all previous "light colored"
		removeLightReds(colors);
		var old_color = rectangle.attr("color");
		
		
		colors = ["#212121","#ff2f92","#0096ff"];
		rectangle.style("fill",colors[i])
			.attr("old-color", old_color)
			.attr("color", i);
		
	} else {
		rectangle.style("fill",colors[i])
			  .attr("color", i);
	}
		
	
}

function checkGameOver() {
	var reds = 0;
	var blues = 0;
	
	var game_is_over = false;
	
	var svg = d3.select("svg");
	var boardDimension = Math.sqrt(svg.selectAll("rect").nodes().length);
	
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
		document.getElementById("instructions").innerHTML = "YOU LOST! No red cells left."
		game_is_over = true;
	} else if (reds == 0) {
		document.getElementById("instructions").innerHTML = "YOU LOST! Blue has 100% of remaining alive cells."
		game_is_over = true;
	} else if (blues == 0) {
		document.getElementById("instructions").innerHTML = "YOU WON! Congratulations."
		game_is_over = true;
	}
	
	if (game_is_over){
		// change state to new game:
		// switch from black to green
		var element = document.getElementById("game-button");
		element.classList.remove("btn-dark");
		element.classList.remove("btn-light");
		element.classList.add("btn-success");
		element.value = "New Game";
		element.name = "new-game";
	}
}



// new game, end turn, 

function nextState(duplicate_selection) {
	// if myCall == 1, then it's a new game
	// if myCall == 2, then red has made a selection
	
	
	var current_state = document.getElementById("game-button").name;
	
	
	if (current_state == "new-game") {
		// leave state the same ("New Game"):
		newBoard();
	} else if (current_state == "red-selection-made") {
		if ((document.getElementById("game-button").value == "New Game") || (document.getElementById("game-button").value == "Waiting...") || (duplicate_selection)) {
			console.log("user has made selection but not finalized it yet");
						
			// switch from green to red
			var element = document.getElementById("game-button");
			element.classList.remove("btn-success");
			element.classList.remove("btn-light");
			element.classList.add("btn-danger");
			element.value = "End Turn";
			
			// instructions:
			document.getElementById("instructions").innerHTML = "End your turn by clicking the button above."
			
			
			
			
		} else {
			console.log("user has made selection and is ending their turn");
			
			makeAllDark();
			
			// switch from red to blue
			var element = document.getElementById("game-button");
			element.classList.remove("btn-danger");
			element.classList.remove("btn-light");
			element.classList.add("btn-primary");
			element.value = "End Computer's Turn";
			element.name = "blue-selection-made";
			
			// instructions:
			document.getElementById("instructions").innerHTML = "Wait for blue to make a move, then click the button to end your opponent's turn."
			
			// make blue's move
			window.setTimeout(function() {
			  computerMove();
			  countNeighbors();
			}, 500);
		}		
	} else if (current_state == "blue-selection-made") {
		console.log("computer has made selection and user is ending computer turn");
		
		
		makeAllDark();
		
		// switch from blue to black
		var element = document.getElementById("game-button");
		element.classList.remove("btn-primary");
		element.classList.add("btn-dark");
		element.value = "Simulate Conway's G.o.L.";
		
		// change state:
		document.getElementById("game-button").name = "gol-ready";
		
		// instructions:
		document.getElementById("instructions").innerHTML = "Click the button to simulate Conway's Game of Life (1 iteration)."
		
	} else if (current_state == "gol-ready") {
		console.log("user has opted to simulate game of life");
		
		// switch from black to red
		var element = document.getElementById("game-button");
		element.classList.remove("btn-dark");
		element.classList.add("btn-light");
		element.value = "Waiting...";
		
		document.getElementById("game-button").name = "make-your-move";
		document.getElementById("instructions").innerHTML = "Make a move by clicking on a <span style='color: black;  text-decoration: underline;'>black</span> or <span style='color: blue;  text-decoration: underline;'>blue</span> square."
		
		
		window.setTimeout(function() {
		  refreshWorld();
		  setWorld();
		  countNeighbors();
		  checkGameOver();
		}, 500);	
		
		
		// 
		
	}	else if (current_state == "make-your-move") {
		console.log("make your move has triggered");
		alert("Please make a selection by clicking on a black or blue square.");
	}
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
			switchColor(color , focal_cell, false);	
	    } else {
		    switchColor(0 , focal_cell, false);	
	    }
	}
	countNeighbors();
}
function hintToggle() {
	var myButton = document.getElementById("cheating").value;
	
	document.getElementById("cheating").value = (myButton == "OFF") ? "ON" : "OFF";
	countNeighbors();
}





