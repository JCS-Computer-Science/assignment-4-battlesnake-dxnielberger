export default function move(gameState) {
    let moveSafety = {
        up: true,
        down: true,
        left: true,
        right: true
    };

    const myHead = gameState.you.body[0];
    const myNeck = gameState.you.body[1];

    // Prevent moving backwards
    if (myNeck.x < myHead.x) moveSafety.left = false;
    else if (myNeck.x > myHead.x) moveSafety.right = false;
    else if (myNeck.y < myHead.y) moveSafety.down = false;
    else if (myNeck.y > myHead.y) moveSafety.up = false;

    const boardWidth = gameState.board.width;
    const boardHeight = gameState.board.height;

    // Wall collisions
    if (myHead.x == 0) moveSafety.left = false;
    if (myHead.x == boardWidth - 1) moveSafety.right = false;
    if (myHead.y == 0) moveSafety.down = false;
    if (myHead.y == boardHeight - 1) moveSafety.up = false;

    // Avoid my own body
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

    // Avoid other snakes
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

    // ATTACK STRATEGY: Hunt smaller snakes first
    const myLength = gameState.you.length;
    let targetHead = null;
    let closestDist = Infinity;

    for (let i = 0; i < otherSnakes.length; i++) {
        const enemy = otherSnakes[i];
        if (enemy.id == gameState.you.id) continue;

        if (enemy.length < myLength) {
            const head = enemy.body[0];
            const dist = Math.abs(myHead.x - head.x) + Math.abs(myHead.y - head.y);
            if (dist < closestDist) {
                closestDist = dist;
                targetHead = head;
            }
        }
    }

    if (targetHead != null) {
        let bestAttack = null;
        let bestDist = Infinity;
        for (let dir of Object.keys(moveSafety)) {
            if (moveSafety[dir]) {
                const next = possibleMoves[dir];
                const dist = Math.abs(next.x - targetHead.x) + Math.abs(next.y - targetHead.y);
                if (dist < bestDist) {
                    bestDist = dist;
                    bestAttack = dir;
                }
            }
        }

        if (bestAttack != null) {
            return { move: bestAttack };
        }
    }

    // FOOD STRATEGY: only if not attacking
    const food = gameState.board.food;
    if (food.length > 0) {
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

        let bestMove = null;
        let bestDistance = Infinity;
        for (let dir of Object.keys(moveSafety)) {
            if (moveSafety[dir]) {
                const next = possibleMoves[dir];
                const dist = Math.abs(next.x - closestFood.x) + Math.abs(next.y - closestFood.y);
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

    // Last resort: random safe move
    const safeMoves = Object.keys(moveSafety).filter(dir => moveSafety[dir]);
    const nextMove = safeMoves.length > 0 ? safeMoves[Math.floor(Math.random() * safeMoves.length)] : "down";

    return { move: nextMove };
}



//console.log(`MOVE ${gameState.turn}: ${nextMove}`);
//console.log(`MOVE ${gameState.turn}: No safe moves! Moving down.`);