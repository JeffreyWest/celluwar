function setupBoard() {
	var marginTop = 30,
        marginLeft = 30,
        fieldSize = 40,
        boardDimension = 8,
        boardSize = boardDimension*fieldSize;

    var board =[];
    
    for(var i = 0; i < boardDimension*boardDimension; i++) {
        board.push({
            x: i % boardDimension,
            y: Math.floor(i / boardDimension),
            color: 0,
            n: 0
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
         .attr("color",function(d,i) { 
	         var i = Math.floor(Math.random()*3);	         
	         return i;
	        })
         .attr("next-color",0)
         .attr("neighbors",0)
         .attr("width", fieldSize + "px")
         .attr("height", fieldSize + "px")
         .style("fill", function(d,i) {
	         // set fill to current color.
	         var i = d3.select(this).attr('color');
	         var colors = ["black","red","blue"];
	         return colors[i];	         
         })
         .attr("stroke", "white")
//          .append("text")
         .on('click' , function(d){ 
	          d3.select(this)
		      	.attr("fill", function(d) {
			      	
			      	if (!checkIfColor(this,1)) {
				      	d3.select(this)
			        	.style("fill", "red")
			        	.attr("color", 1);
			        	
			        	window.setTimeout(function() {
						  computerMove(svg,boardDimension);
						}, 500);
			        	
			        	window.setTimeout(function() {
						  refreshWorld(svg,boardDimension,fieldSize);
						  setWorld(svg,boardDimension);
						}, 1500);	
			      	}
			    })
	         });
	         
	         
	    
	         
/*
	    svg.append("text")
	        .style("font-size", "10")
	        .attr("text-anchor", "middle")
	        .attr("dy", "35px")
	        .attr("dx", "20px")
	        .attr("fill","white")
	        .text('1');
	    refreshWorld(svg,boardDimension,fieldSize);
*/
	    
	    

}

function checkIfColor(elem,i) {
	if (d3.select(elem).attr("color") == i) {
		return true;
	} else {
		return false;
	}
}

function refreshWorld(svg,boardDimension,fieldSize) {
	
	var board=[];
    
	for (let ri=0; ri<(boardDimension*boardDimension);ri++) {
	    
	    // check if this element is already blue:
	    var focal_cell = d3.select(svg.selectAll("rect").nodes()[ri]);
	    
	    var xi = focal_cell.attr("x")/fieldSize;
	    var yi = focal_cell.attr("y")/fieldSize;
	    
	    var neighbors = 0;
	    var red_neighbors = 0;
	    var blue_neighbors = 0;
	
		for (let i=-1; i<=1;i++) {
			for (let j=-1; j<=1;j++) {
				
				if ((i == 0) && (j==0)) {
					
				} else {
					// determine index of neighbor:
					var index = (yi + j)*boardDimension + (xi + i);
					
					if (index > 0) {
						if (index < (boardDimension*boardDimension)){
							var neighbor_cell = d3.select(svg.selectAll("rect").nodes()[index]);
							
							if (neighbor_cell.attr('color') > 0 ) {
								neighbors++;
								if (neighbor_cell.attr('color') == 1) {
									red_neighbors++;
								} else {
									blue_neighbors++;
								}
							}
						}
					}
				}				
			}
		}
		
		//rule 1. Any live cell with fewer than two live neighbours dies, as if by underpopulation.
		if ((focal_cell.attr('color')>0) && (neighbors<2)) {
			focal_cell.attr('next-color',0);
			
			// update neighbors
			focal_cell.attr('neighbors',neighbors);
			
		}
		
		// rule 2. Any live cell with two or three live neighbours lives on to the next generation.
		if ((focal_cell.attr('color')>0) && ((neighbors==2)&&(neighbors==3))) {
			focal_cell.attr('next-color',focal_cell.attr('color'));
			
			// update neighbors
			focal_cell.attr('neighbors',neighbors);
		}
		
		
		// rule 3. Any live cell with more than three live neighbours dies, as if by overpopulation
		if ((focal_cell.attr('color')>0) && (neighbors>3)) {
			focal_cell.attr('next-color',0);
			
			// update neighbors
			focal_cell.attr('neighbors',neighbors);
		}
				
		// rule 4. Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction
		if ((focal_cell.attr('color')==0) && (neighbors==3)) {
			// it could be red or blue:
			if (red_neighbors > blue_neighbors) {
				focal_cell.attr('next-color',1);
			} else {
				focal_cell.attr('next-color',2);
			}
			
			// update neighbors
			focal_cell.attr('neighbors',neighbors);
					
		}
		
		board.push({
            x: ri % boardDimension,
            y: Math.floor(ri / boardDimension),
            color: 0,
            n: neighbors
        });
		
		
	}
	
// 	d3.select(svg.selectAll("rect").nodes()[ri]).attr('neighbors')
    
    
    
    svg.data(board)
    .enter();

    
/*
    svg.selectAll("text")
    	.style("font-size", "10")
        .attr("text-anchor", "middle")
        .attr("dy", function(d,i) {		        
	        return ( 35 + fieldSize*(d.y) + "px");
        })
        .attr("dx", function (d,i){
	        return ( 20 + fieldSize*(d.x) + "px");
        })
        .attr("fill","white")
    	.text(function(d,i,element){
	    	var index = (d.y)*boardDimension + (d.x);	    	
	    	return board[index].n;
    	});
*/
	
	
	
}

function setWorld(svg,boardDimension) {
	// pass next-color into color, and change color:
	for (let ri=0; ri<(boardDimension*boardDimension);ri++) {
		// set color to next color attribute.
		var focal_cell = d3.select(svg.selectAll("rect").nodes()[ri]);
		
		switchColor(focal_cell.attr('next-color'), focal_cell);
		
	}
	  	
}

function computerMove(svg,boardDimension) {
	
	// check if game is won:
	
	
    ri = Math.floor(Math.random()*boardDimension*boardDimension);
    
    // check if this element is already blue:
    var element = svg.selectAll("rect").nodes()[ri];
    
    if (!checkIfColor(element,2)) {
	    switchColor(2, d3.select(element));
    } else {
	    computerMove(svg,boardDimension);
    }
}

function switchColor(i, rectangle) {
	var colors = ["black","red","blue"];
	
	rectangle.style("fill",colors[i])
			  .attr("color", i);
	
}



