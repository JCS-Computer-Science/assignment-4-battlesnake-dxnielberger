export default function move(gameState) {
    let moveSafety = {
        up: true,
        down: true,
        left: true,
        right: true
    };

    const myHead = gameState.you.body[0];
    const myNeck = gameState.you.body[1];

    if (myNeck.x < myHead.x) moveSafety.left = false;
    else if (myNeck.x > myHead.x) moveSafety.right = false;
    else if (myNeck.y < myHead.y) moveSafety.down = false;
    else if (myNeck.y > myHead.y) moveSafety.up = false;

    const boardWidth = gameState.board.width;
    const boardHeight = gameState.board.height;

    if (myHead.x == 0) moveSafety.left = false;
    if (myHead.x == boardWidth - 1) moveSafety.right = false;
    if (myHead.y == 0) moveSafety.down = false;
    if (myHead.y == boardHeight - 1) moveSafety.up = false;

    const body = gameState.you.body;

    const possibleMoves = {
        up: { x: myHead.x, y: myHead.y + 1 },
        down: { x: myHead.x, y: myHead.y - 1 },
        left: { x: myHead.x - 1, y: myHead.y },
        right: { x: myHead.x + 1, y: myHead.y }
    };

    for (let direction in possibleMoves) {
        const nextPos = possibleMoves[direction];
        for (let i = 0; i < body.length; i++) {
            if (body[i].x == nextPos.x && body[i].y == nextPos.y) {
                moveSafety[direction] = false;
            }
        }
    }

    const otherSnakes = gameState.board.snakes;

for (let i = 0; i < otherSnakes.length; i++) {
    const snake = otherSnakes[i];

    if (snake.id !== gameState.you.id) {
        for (let j = 0; j < snake.body.length; j++) {
            const part = snake.body[j];

            for (let dir in possibleMoves) {
                const next = possibleMoves[dir];

                if (next.x == part.x && next.y == part.y) {
                    moveSafety[dir] = false;
                }
            }
        }
    }
}






    
const food = gameState.board.food;

if (food.length > 0) {
    const myHead = gameState.you.body[0];
    let closestFood = food[0];
    let minDistance = Math.abs(myHead.x - food[0].x) + Math.abs(myHead.y - food[0].y);

    for (let i = 1; i < food.length; i++) {
        const f = food[i];
        const dist = Math.abs(myHead.x - f.x) + Math.abs(myHead.y - f.y);
        if (dist < minDistance) {
            minDistance = dist;
            closestFood = f;
        }
    }
    let bestMove = null; //used google to help
    let bestDistance = Infinity; //used google to help

    for (let dir of Object.keys(moveSafety)) {
        if (moveSafety[dir]) {
            const next = possibleMoves[dir];
            const dist = Math.abs(next.x - closestFood.x) + Math.abs(next.y - closestFood.y); //the use of abs and dir, I got off google.
            if (dist < bestDistance) {
                bestDistance = dist;
                bestMove = dir;
            }
        }
    }

    if (bestMove != null) {
        return { move: bestMove };
    }
}








const safeMoves = Object.keys(moveSafety).filter(dir => moveSafety[dir]);
    const nextMove = safeMoves.length > 0 ? safeMoves[Math.floor(Math.random() * safeMoves.length)] : "down";

    return { move: nextMove };
}


//console.log(`MOVE ${gameState.turn}: ${nextMove}`);
//console.log(`MOVE ${gameState.turn}: No safe moves! Moving down.`);