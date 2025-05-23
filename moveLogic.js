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
    const myLength = gameState.you.length;

    for (let i = 0; i < otherSnakes.length; i++) {
        const snake = otherSnakes[i];
        if (snake.id != gameState.you.id) {
            for (let j = 0; j < snake.body.length; j++) {
                const part = snake.body[j];
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



    const health = gameState.you.health;

    
    
    
    
    for (let dir in possibleMoves) {
        const next = possibleMoves[dir];
        if (moveSafety[dir] && isHazardTile(next.x, next.y, gameState)) {
            const inDesperation = health > 50 && floodFill(next, gameState, 30) > 10;
            if (!inDesperation) {
                moveSafety[dir] = false;
            }
        }
    }

    const currentlyInHazard = isHazardTile(myHead.x, myHead.y, gameState);
    if (currentlyInHazard) {
        for (let dir in possibleMoves) {
            const next = possibleMoves[dir];
            if (moveSafety[dir] && !isHazardTile(next.x, next.y, gameState)) {
                return { move: dir };
            }
        }
    }








    let trapTarget = null;
    let trapMoves = [];

    for (let enemy of otherSnakes) {
        if (enemy.id != gameState.you.id && enemy.length < myLength) {
            const head = enemy.body[0];
            const nearWall = (head.x <= 1 || head.x >= boardWidth - 2 || head.y <= 1 || head.y >= boardHeight - 2);

            if (nearWall) {
               
                const enemyMoves = [
                    { x: head.x + 1, y: head.y },
                    { x: head.x - 1, y: head.y },
                    { x: head.x, y: head.y + 1 },
                    { x: head.x, y: head.y - 1 }
                ].filter(move => 
                    move.x >= 0 && move.x < boardWidth &&
                    move.y >= 0 && move.y < boardHeight &&
                    !gameState.board.snakes.some(snake => 
                        snake.body.some(part => part.x == move.x && part.y == move.y)
                    )
                );

                if (enemyMoves.length <= 2) { 
                    trapTarget = head;
                    trapMoves = enemyMoves;
                    break;
                }
            }
        }
    }

    if (trapTarget != null) {
        let bestMove = null;
        let bestScore = -Infinity;
        for (let dir of Object.keys(moveSafety)) {
            if (!moveSafety[dir]) continue;

            const next = possibleMoves[dir];

            let minEnemyDist = Math.abs(next.x - trapTarget.x) + Math.abs(next.y - trapTarget.y);
            for (const escape of trapMoves) {
                const escapeDist = Math.abs(next.x - escape.x) + Math.abs(next.y - escape.y);
                if (escapeDist < minEnemyDist) {
                    minEnemyDist = escapeDist;
                }
            }

            const area = floodFill(next, gameState, 100);
            const score = (-minEnemyDist * 2) + (area * 0.1); 

            if (score > bestScore) {
                bestScore = score;
                bestMove = dir;
            }
        }

        if (bestMove != null) {
            return { move: bestMove };
        }
    }


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

    const food = gameState.board.food;
    const myHealth = gameState.you.health;

    let shouldSeekFood = myHealth < 70;

    let longerEnemyExists = gameState.board.snakes.some(snake =>
        snake.id != gameState.you.id && snake.length > myLength
    );
    if (longerEnemyExists) {
        shouldSeekFood = true;
    }

    if (shouldSeekFood && food.length > 0) {
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

    let bestMove = null;
    let bestArea = -1;
    for (let dir of Object.keys(moveSafety)) {
        if (!moveSafety[dir]) continue;

        const next = possibleMoves[dir];
        const area = floodFill(next, gameState, 100);

        if (area >= myLength && area > bestArea) {
            bestArea = area;
            bestMove = dir;
        }
    }

    if (bestMove != null) {
        return { move: bestMove };
    }

    const safeMoves = Object.keys(moveSafety).filter(dir => moveSafety[dir]);
    const nextMove = safeMoves.length > 0 ? safeMoves[Math.floor(Math.random() * safeMoves.length)] : "down";

    return { move: nextMove };
}




function isHazardTile(x, y, gameState) {
    return gameState.board.hazards.some(h => h.x == x && h.y == y);
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