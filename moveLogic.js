export default function move(gameState) {
    let moveSafety = {
        up: true,
        down: true,
        left: true,
        right: true
    };

    const myHead = gameState.you.body[0];
    const myNeck = gameState.you.body[1];
    const boardWidth = gameState.board.width;
    const boardHeight = gameState.board.height;
    const body = gameState.you.body;

    const possibleMoves = {
        up: { x: myHead.x, y: myHead.y + 1 },
        down: { x: myHead.x, y: myHead.y - 1 },
        left: { x: myHead.x - 1, y: myHead.y },
        right: { x: myHead.x + 1, y: myHead.y }
    };

    if (myNeck.x < myHead.x) moveSafety.left = false;
    else if (myNeck.x > myHead.x) moveSafety.right = false;
    else if (myNeck.y < myHead.y) moveSafety.down = false;
    else if (myNeck.y > myHead.y) moveSafety.up = false;

    if (myHead.x == 0) moveSafety.left = false;
    if (myHead.x == boardWidth - 1) moveSafety.right = false;
    if (myHead.y == 0) moveSafety.down = false;
    if (myHead.y == boardHeight - 1) moveSafety.up = false;

    for (let direction in possibleMoves) {
        const nextPos = possibleMoves[direction];
        for (let i = 0; i < body.length; i++) {
            if (body[i].x == nextPos.x && body[i].y == nextPos.y) {
                moveSafety[direction] = false;
            }
        }
    }


    const otherSnakes = gameState.board.snakes;
    const myLength = gameState.you.length;

    for (let snake of otherSnakes) {
        if (snake.id !== gameState.you.id) {
            for (let part of snake.body) {
                for (let dir in possibleMoves) {
                    const next = possibleMoves[dir];
                    if (next.x == part.x && next.y == part.y) {
                        moveSafety[dir] = false;
                    }
                }
            }
            
            const head = snake.body[0];
            if (snake.length >= myLength) {
                for (let dir in possibleMoves) {
                    const next = possibleMoves[dir];
                    const dist = Math.abs(next.x - head.x) + Math.abs(next.y - head.y);
                    if (dist == 1) {
                        moveSafety[dir] = false;
                    }
                }
            }
        }
    }

    for (let dir in moveSafety) {
        if (moveSafety[dir]) {
            const next = possibleMoves[dir];
            const area = floodFill(next, gameState, 500);
            if (area < myLength) {
                moveSafety[dir] = false;
            }
        }
    }

    const food = gameState.board.food;
    const myHealth = gameState.you.health;

    let shouldSeekFood = myHealth < 50 || gameState.board.snakes.some(snake => snake.id !== gameState.you.id && snake.length > myLength);

    let targetHead = null;
    let closestDist = Infinity;

    for (let enemy of otherSnakes) {
        if (enemy.id !== gameState.you.id && enemy.length < myLength) {
            const head = enemy.body[0];
            const dist = Math.abs(myHead.x - head.x) + Math.abs(myHead.y - head.y);
            if (dist < closestDist) {
                closestDist = dist;
                targetHead = head;
            }
        }
    }

    if (targetHead != null) {
        let bestMove = null;
        let bestScore = -Infinity;
        for (let dir of Object.keys(moveSafety)) {
            if (!moveSafety[dir]) continue;
            const next = possibleMoves[dir];
            const dist = Math.abs(next.x - targetHead.x) + Math.abs(next.y - targetHead.y);
            const area = floodFill(next, gameState, 500);
            const score = (-dist) + (area * 0.1);
            if (score > bestScore) {
                bestScore = score;
                bestMove = dir;
            }
        }
        if (bestMove != null) {
            return { move: bestMove };
        }
    }

    if (shouldSeekFood && food.length > 0) {
        let closestFood = food[0];
        let minDistance = Math.abs(myHead.x - food[0].x) + Math.abs(myHead.y - food[0].y);
        for (let f of food) {
            const dist = Math.abs(myHead.x - f.x) + Math.abs(myHead.y - f.y);
            if (dist < minDistance) {
                minDistance = dist;
                closestFood = f;
            }
        }

        let bestMove = null;
        let bestScore = -Infinity;
        for (let dir of Object.keys(moveSafety)) {
            if (!moveSafety[dir]) continue;
            const next = possibleMoves[dir];
            const dist = Math.abs(next.x - closestFood.x) + Math.abs(next.y - closestFood.y);
            const area = floodFill(next, gameState, 500);
            const score = (-dist) + (area * 0.1);
            if (score > bestScore) {
                bestScore = score;
                bestMove = dir;
            }
        }
        if (bestMove != null) {
            return { move: bestMove };
        }
    }

    let bestMove = null;
    let bestArea = -1;
    for (let dir of Object.keys(moveSafety)) {
        if (!moveSafety[dir]) continue;
        const next = possibleMoves[dir];
        const area = floodFill(next, gameState, 500);
        if (area > bestArea) {
            bestArea = area;
            bestMove = dir;
        }
    }
    if (bestMove != null) {
        return { move: bestMove };
    }

    const safeMoves = Object.keys(moveSafety).filter(dir => moveSafety[dir]);
    if (safeMoves.length > 0) {
        const centerX = Math.floor(boardWidth / 2);
        const centerY = Math.floor(boardHeight / 2);
        let fallbackMove = null;
        let fallbackDist = Infinity;

        for (let dir of safeMoves) {
            const next = possibleMoves[dir];
            const dist = Math.abs(next.x - centerX) + Math.abs(next.y - centerY);
            if (dist < fallbackDist) {
                fallbackDist = dist;
                fallbackMove = dir;
            }
        }

        return { move: fallbackMove };
    }

    return { move: "down" };
}

function floodFill(start, gameState, maxDepth = 100) {
    const queue = [start];
    const visited = new Set();
    const boardWidth = gameState.board.width;
    const boardHeight = gameState.board.height;
    const bodyCoords = new Set(gameState.board.snakes.flatMap(snake =>
        snake.body.map(part => `${part.x},${part.y}`)
    ));

    let size = 0;

    while (queue.length > 0 && size < maxDepth) {
        const { x, y } = queue.shift();
        const key = `${x},${y}`;
        if (visited.has(key)) continue;
        if (x < 0 || x >= boardWidth || y < 0 || y >= boardHeight) continue;
        if (bodyCoords.has(key)) continue;

        visited.add(key);
        size++;

        queue.push({ x: x + 1, y });
        queue.push({ x: x - 1, y });
        queue.push({ x, y: y + 1 });
        queue.push({ x, y: y - 1 });
    }

    return size;
}

