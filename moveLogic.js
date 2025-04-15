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

    const safeMoves = Object.keys(moveSafety).filter(dir => moveSafety[dir]);
    const nextMove = safeMoves.length > 0 ? safeMoves[Math.floor(Math.random() * safeMoves.length)] : "down";

    return { move: nextMove };
}


//console.log(`MOVE ${gameState.turn}: ${nextMove}`);
//console.log(`MOVE ${gameState.turn}: No safe moves! Moving down.`);