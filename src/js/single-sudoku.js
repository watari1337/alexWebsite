/**
 * Standalone 9x9 Sudoku Games (8 Individual Variants)
 * Dynamic Procedural Generator for Killer, Consecutive, Inequalities, Diagonals, Colors & Jigsaw
 */

(function () {
    'use strict';

    // Конфигурация 8 вариантов для одиночной игры
    const SINGLE_VARIANTS = {
        normal: {
            id: 'normal',
            title: 'Normal Sudoku',
            subtitle: 'Классическое судоку 9×9',
            badge: 'Классика',
            icon: '🌸',
            color: '#fca5a5',
            summary: 'В каждой строке, каждом столбце и в каждом из девяти блоков 3×3 должны стоять все цифры от 1 до 9 без повторений.',
            rulesHtml: `
                <h3>🎯 Основные правила</h3>
                <ul>
                    <li>Сетка 9×9 разбита на 9 строк, 9 столбцов и 9 блоков размером 3×3.</li>
                    <li>В каждой строке цифры 1–9 не повторяются.</li>
                    <li>В каждом столбце цифры 1–9 не повторяются.</li>
                    <li>В каждом блоке 3×3 цифры 1–9 не повторяются.</li>
                </ul>
                <h3>💡 Стратегии решения</h3>
                <ul>
                    <li><strong>Единственный кандидат (Naked Single):</strong> если в ячейке по правилам строки, столбца и блока может стоять только одна цифра — ставьте её.</li>
                    <li><strong>Скрытый кандидат (Hidden Single):</strong> если в строке или блоке цифра может встать только в одну конкретную клетку — она должна быть там.</li>
                    <li><strong>Используйте заметки:</strong> при сложных раскладах записывайте возможных кандидатов в клетки карандашом.</li>
                </ul>
            `
        },
        comparison: {
            id: 'comparison',
            title: '>Sudoku< (Неравенства)',
            subtitle: 'Судоку сравнения соседних клеток',
            badge: 'Неравенства',
            icon: '🎀',
            color: '#f472b6',
            summary: 'Помимо классических правил 9×9, между смежными ячейками нанесены знаки больше/меньше. Значения ячеек обязаны строго удовлетворять всем знакам!',
            rulesHtml: `
                <h3>🎯 Основные правила</h3>
                <ul>
                    <li>Стандартные правила строк, столбцов и блоков 3×3 соблюдаются.</li>
                    <li>Знаки <strong>&lt;, &gt;, ^, v</strong> указывают отношение между соседними по горизонтали и вертикали клетками.</li>
                    <li>Например, если между ячейками стоит знак <code>A &lt; B</code>, число в клетке A обязано быть меньше числа в клетке B.</li>
                </ul>
                <h3>💡 Логические приёмы</h3>
                <ul>
                    <li><strong>Цепочки неравенств:</strong> если вы видите цепочку <code>A &lt; B &lt; C &lt; D</code>, число A не может быть больше 6, а D не может быть меньше 4!</li>
                    <li><strong>«Пики» и «Впадины»:</strong> ячейка, которая больше всех своих соседей, с высокой вероятностью содержит 8 или 9. Ячейка, которая меньше всех соседей — 1 или 2.</li>
                </ul>
            `
        },
        killer: {
            id: 'killer',
            title: 'Killer Sudoku',
            subtitle: 'Судоку с суммами цветных областей',
            badge: 'Суммы',
            icon: '🟩',
            color: '#86efac',
            summary: 'Сетка разделена на цветные группы ячеек (cages). Маленькое число в углу группы равно сумме всех цифр внутри неё. Цифры внутри группы не повторяются!',
            rulesHtml: `
                <h3>🎯 Основные правила</h3>
                <ul>
                    <li>Стандартные правила строк, столбцов и блоков 3×3 соблюдаются.</li>
                    <li>Поле поделено на цветные области (клетки/cages).</li>
                    <li>В углу каждой области стоит число — <strong>точная сумма всех цифр</strong> внутри этой области.</li>
                    <li><strong>Критическое правило:</strong> цифры внутри одной области НИКОГДА не повторяются!</li>
                </ul>
                <h3>💡 Математические подсказки и стратегии</h3>
                <ul>
                    <li><strong>Правило 45:</strong> сумма всех чисел в любой строке, любом столбце и любом блоке 3×3 ВСЕГДА равна 45 (1+2+...+9 = 45).</li>
                    <li><strong>Уникальные комбинации сумм:</strong>
                        <ul>
                            <li>Сумма 3 из двух клеток — это ВСЕГДА [1, 2].</li>
                            <li>Сумма 4 из двух клеток — это ВСЕГДА [1, 3] (так как [2, 2] запрещено).</li>
                            <li>Сумма 17 из двух клеток — это ВСЕГДА [8, 9].</li>
                            <li>Сумма 6 из трёх клеток — это ВСЕГДА [1, 2, 3].</li>
                            <li>Сумма 24 из трёх клеток — это ВСЕГДА [7, 8, 9].</li>
                        </ul>
                    </li>
                </ul>
            `
        },
        sudoku_x: {
            id: 'sudoku_x',
            title: 'Sudoku X (Диагональное)',
            subtitle: 'Судоку с двумя главными диагоналями',
            badge: 'Диагонали',
            icon: '🔷',
            color: '#93c5fd',
            summary: 'Помимо строк, столбцов и блоков 3×3, обе главные диагонали (отмеченные красным пунктиром) также должны содержать все цифры от 1 до 9 без повторений.',
            rulesHtml: `
                <h3>🎯 Основные правила</h3>
                <ul>
                    <li>Стандартные правила строк, столбцов и блоков 3×3.</li>
                    <li><strong>Главная диагональ 1:</strong> от верхнего левого угла (1,1) до нижнего правого (9,9) содержит цифры 1–9.</li>
                    <li><strong>Главная диагональ 2:</strong> от нижнего левого угла (9,1) до верхнего правого (1,9) содержит цифры 1–9.</li>
                </ul>
                <h3>💡 Стратегии решения</h3>
                <ul>
                    <li><strong>Центральная ячейка (5, 5):</strong> лежит на пересечении ОБЕИХ диагоналей, центральной строки, центрального столбца и центрального блока! На неё действует максимальное количество ограничений.</li>
                    <li>Используйте диагонали как дополнительные 10-ю и 11-ю «строки» для вычёркивания кандидатов.</li>
                </ul>
            `
        },
        offset: {
            id: 'offset',
            title: 'Offset Sudoku (Цветовое)',
            subtitle: 'Disjoint Groups / 9 цветовых наборов',
            badge: 'Цвета',
            icon: '🌈',
            color: '#c084fc',
            summary: 'Все клетки одного цвета во всей сетке 9×9 образуют непересекающуюся группу и обязаны содержать все цифры от 1 до 9 без повторений.',
            rulesHtml: `
                <h3>🎯 Основные правила</h3>
                <ul>
                    <li>Стандартные правила строк, столбцов и блоков 3×3.</li>
                    <li>В каждом блоке 3×3 клетки окрашены в 9 разных цветов (в одинаковом порядке позиций).</li>
                    <li>Все 9 клеток одного цвета (например, все розовые или все зелёные) образуют группу, в которой цифры 1–9 <strong>не могут повторяться</strong>!</li>
                </ul>
                <h3>💡 Стратегии решения</h3>
                <ul>
                    <li>Каждый цвет действует как дополнительный блок: если в жёлтой клетке одного блока уже стоит 5, ни в одной другой жёлтой клетке на всём поле 5 стоять не может!</li>
                </ul>
            `
        },
        strange_boxes: {
            id: 'strange_boxes',
            title: 'Strange Boxes (Jigsaw)',
            subtitle: 'Судоку с нерегулярными фигурными блоками',
            badge: 'Jigsaw',
            icon: '🧩',
            color: '#67e8f9',
            summary: 'Вместо квадратных блоков 3×3 поле разбито на 9 фигурных областей сложной формы по 9 ячеек каждая. Каждая фигура содержит числа 1–9 без повторов.',
            rulesHtml: `
                <h3>🎯 Основные правила</h3>
                <ul>
                    <li>В каждой строке и в каждом столбце стоят числа от 1 до 9.</li>
                    <li>Вместо квадратных блоков 3×3 поле разбито на <strong>9 фигурных областей</strong> (полимино) по 9 ячеек каждая, обведённых жирным контуром.</li>
                    <li>Внутри каждой фигурной области цифры 1–9 не повторяются.</li>
                </ul>
                <h3>💡 Стратегии решения</h3>
                <ul>
                    <li><strong>Закон формы:</strong> если фигура выступает на 1 клетку за пределы группы строк или столбцов, эта клетка должна уравновешиваться числом на противоположной стороне.</li>
                </ul>
            `
        },
        consecutive: {
            id: 'consecutive',
            title: 'Consecutive Sudoku',
            subtitle: 'Судоку с мостиками последовательных чисел',
            badge: 'Мостики',
            icon: '🟢',
            color: '#a3e635',
            summary: 'Если значения двух соседних клеток отличаются ровно на 1, между ними нарисован розовый мостик. Если мостика нет — числа НЕ могут быть последовательными!',
            rulesHtml: `
                <h3>🎯 Основные правила</h3>
                <ul>
                    <li>Стандартные правила строк, столбцов и блоков 3×3.</li>
                    <li>Если разность между соседними клетками равна 1 (|A - B| = 1, например 3 и 4, 8 и 9), между ними стоит <strong>розовый мостик</strong>.</li>
                    <li><strong>Строгое отрицательное ограничение:</strong> если между соседними ячейками НЕТ мостика, их разность НЕ МОЖЕТ быть равна 1!</li>
                </ul>
                <h3>💡 Главный секрет решения</h3>
                <ul>
                    <li>Отрицательное правило — это мощнейшее оружие! Если в клетке стоит 5, то у всех её соседей БЕЗ мостика автоматически исключаются кандидаты 4 и 6!</li>
                    <li>Если в клетке стоит 1 или 9, у неё только одно последовательное число (2 или 8).</li>
                </ul>
            `
        },
        addition: {
            id: 'addition',
            title: 'Addition Sudoku',
            subtitle: 'Судоку с суммами цепочек ячеек',
            badge: 'Суммарное',
            icon: '🟧',
            color: '#fdba74',
            summary: 'Числа в ячейках, выделенных синим цветом, в сумме обязаны давать значение в красной ячейке под ними!',
            rulesHtml: `
                <h3>🎯 Основные правила</h3>
                <ul>
                    <li>Стандартные правила строк, столбцов и блоков 3×3.</li>
                    <li>Сетка содержит пары синих ячеек и красную целевую ячейку под ними.</li>
                    <li>Сумма чисел в синих клетках строго равна числу в соответствующей красной клетке (Blue1 + Blue2 = Red).</li>
                </ul>
                <h3>💡 Стратегии решения</h3>
                <ul>
                    <li>Поскольку все цифры лежат в диапазоне 1–9, сумма двух синих клеток не может превышать 9 (максимум для красной клетки).</li>
                    <li>Если красная клетка равна 9, то синие могут быть [1,8], [2,7], [3,6], [4,5].</li>
                </ul>
            `
        }
    };

    // 10 пастельных оттенков с яркими границами для клеток Killer Sudoku
    const CAGE_PALETTE = [
        { bg: 'rgba(167, 243, 208, 0.40)', border: '#10b981' }, // Мятный
        { bg: 'rgba(233, 213, 255, 0.40)', border: '#a855f7' }, // Лавандовый
        { bg: 'rgba(254, 240, 138, 0.40)', border: '#eab308' }, // Желтый
        { bg: 'rgba(254, 215, 170, 0.40)', border: '#f97316' }, // Персиковый
        { bg: 'rgba(254, 205, 211, 0.40)', border: '#f43f5e' }, // Розовый
        { bg: 'rgba(186, 230, 253, 0.40)', border: '#0284c7' }, // Небесный
        { bg: 'rgba(199, 210, 254, 0.40)', border: '#6366f1' }, // Индиго
        { bg: 'rgba(204, 251, 241, 0.40)', border: '#14b8a6' }, // Бирюзовый
        { bg: 'rgba(253, 230, 138, 0.40)', border: '#d97706' }, // Янтарный
        { bg: 'rgba(245, 208, 254, 0.40)', border: '#d946ef' }  // Фуксия
    ];

    // 9 мягких оттенков для 9 фигурных областей Strange Boxes (Jigsaw)
    const JIGSAW_TINTS = [
        'rgba(6, 182, 212, 0.25)',   // Яркий циан
        'rgba(59, 130, 246, 0.25)',  // Синий
        'rgba(168, 85, 247, 0.25)',  // Фиолетовый
        'rgba(244, 63, 94, 0.25)',   // Розовый
        'rgba(249, 115, 22, 0.25)',  // Оранжевый
        'rgba(234, 179, 8, 0.25)',   // Желтый
        'rgba(34, 197, 94, 0.25)',   // Зеленый
        'rgba(20, 184, 166, 0.25)',  // Бирюза
        'rgba(99, 102, 241, 0.25)'   // Индиго
    ];

    // ==========================================================================
    // Процедурный генератор нерегулярных фигур Strange Boxes (Jigsaw / Chaos)
    // Алгоритм органической мутации границ (Boundary Mutation) + быстрый MRV солвер
    // ==========================================================================
    function isJigsawRegionConnected(cells) {
        if (cells.length <= 1) return true;
        const keySet = new Set(cells.map(c => (c[0] << 4) | c[1]));
        let count = 0;
        const queue = [cells[0]];
        const visited = new Set();
        visited.add((cells[0][0] << 4) | cells[0][1]);
        while (queue.length > 0) {
            const [r, c] = queue.shift();
            count++;
            const neighbors = [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]];
            for (const [nr, nc] of neighbors) {
                if (nr >= 0 && nr < 9 && nc >= 0 && nc < 9) {
                    const code = (nr << 4) | nc;
                    if (keySet.has(code) && !visited.has(code)) {
                        visited.add(code);
                        queue.push([nr, nc]);
                    }
                }
            }
        }
        return count === cells.length;
    }

    function mutateJigsawLayout(baseLayout, steps = 24) {
        const current = baseLayout.map(row => [...row]);
        const regCells = Array.from({ length: 9 }, () => []);
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                regCells[current[r][c]].push([r, c]);
            }
        }

        let successful = 0;
        for (let iter = 0; iter < steps * 10 && successful < steps; iter++) {
            const regA = Math.floor(Math.random() * 9);
            const boundaryA = [];
            for (const [r, c] of regCells[regA]) {
                const neighbors = [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]];
                for (const [nr, nc] of neighbors) {
                    if (nr >= 0 && nr < 9 && nc >= 0 && nc < 9) {
                        const regB = current[nr][nc];
                        if (regB !== regA) boundaryA.push({ r, c, regB });
                    }
                }
            }
            if (boundaryA.length === 0) continue;
            const { r: rA, c: cA, regB } = boundaryA[Math.floor(Math.random() * boundaryA.length)];
            const remA = regCells[regA].filter(([r, c]) => !(r === rA && c === cA));
            if (!isJigsawRegionConnected(remA)) continue;

            const boundaryB = [];
            for (const [r, c] of regCells[regB]) {
                const neighbors = [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]];
                let adjToA = false;
                for (const [nr, nc] of neighbors) {
                    if (nr >= 0 && nr < 9 && nc >= 0 && nc < 9) {
                        if (current[nr][nc] === regA && !(nr === rA && nc === cA)) {
                            adjToA = true;
                            break;
                        }
                    }
                }
                if (adjToA) boundaryB.push([r, c]);
            }
            if (boundaryB.length === 0) continue;
            const [rB, cB] = boundaryB[Math.floor(Math.random() * boundaryB.length)];
            const remB = regCells[regB].filter(([r, c]) => !(r === rB && c === cB));
            remB.push([rA, cA]);
            if (!isJigsawRegionConnected(remB)) continue;

            const newA = [...remA, [rB, cB]];
            if (!isJigsawRegionConnected(newA)) continue;

            current[rA][cA] = regB;
            current[rB][cB] = regA;
            regCells[regA] = newA;
            regCells[regB] = remB;
            successful++;
        }
        return current;
    }

    function solveJigsawFast(layout) {
        const cands = Array.from({ length: 9 }, () => new Uint16Array(9).fill(0x3FE));
        const grid = Array.from({ length: 9 }, () => Array(9).fill(0));

        const peers = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => []));
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                const peerSet = new Set();
                for (let i = 0; i < 9; i++) {
                    if (i !== c) peerSet.add((r << 4) | i);
                    if (i !== r) peerSet.add((i << 4) | c);
                }
                const reg = layout[r][c];
                for (let rr = 0; rr < 9; rr++) {
                    for (let cc = 0; cc < 9; cc++) {
                        if ((rr !== r || cc !== c) && layout[rr][cc] === reg) {
                            peerSet.add((rr << 4) | cc);
                        }
                    }
                }
                peers[r][c] = Array.from(peerSet).map(code => [code >> 4, code & 0xF]);
            }
        }

        let nodes = 0;
        const maxNodes = 6000;

        function search() {
            nodes++;
            if (nodes > maxNodes) return false;

            let minCount = 10;
            let bestR = -1, bestC = -1;
            for (let r = 0; r < 9; r++) {
                for (let c = 0; c < 9; c++) {
                    if (grid[r][c] === 0) {
                        const mask = cands[r][c];
                        let cnt = 0;
                        for (let d = 1; d <= 9; d++) {
                            if (mask & (1 << d)) cnt++;
                        }
                        if (cnt === 0) return false;
                        if (cnt < minCount) {
                            minCount = cnt;
                            bestR = r;
                            bestC = c;
                            if (cnt === 1) break;
                        }
                    }
                }
                if (minCount === 1) break;
            }

            if (bestR === -1) return true;

            const mask = cands[bestR][bestC];
            const digits = [];
            for (let d = 1; d <= 9; d++) {
                if (mask & (1 << d)) digits.push(d);
            }
            for (let i = digits.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [digits[i], digits[j]] = [digits[j], digits[i]];
            }

            const cellPeers = peers[bestR][bestC];
            for (const d of digits) {
                const bit = 1 << d;
                grid[bestR][bestC] = d;

                const changed = [];
                let possible = true;
                for (const [pr, pc] of cellPeers) {
                    if (grid[pr][pc] === 0 && (cands[pr][pc] & bit)) {
                        cands[pr][pc] &= ~bit;
                        changed.push([pr, pc]);
                        if (cands[pr][pc] === 0) {
                            possible = false;
                            break;
                        }
                    }
                }

                if (possible && search()) return true;

                for (const [pr, pc] of changed) {
                    cands[pr][pc] |= bit;
                }
                grid[bestR][bestC] = 0;
            }

            return false;
        }

        return search() ? grid : null;
    }

    function generateProceduralJigsaw() {
        const base = Array.from({ length: 9 }, (_, r) => Array.from({ length: 9 }, (_, c) => Math.floor(r / 3) * 3 + Math.floor(c / 3)));
        while (true) {
            const steps = 18 + Math.floor(Math.random() * 15);
            const layout = mutateJigsawLayout(base, steps);
            const solution = solveJigsawFast(layout);
            if (solution) {
                const perm = [0, 1, 2, 3, 4, 5, 6, 7, 8];
                for (let i = 8; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [perm[i], perm[j]] = [perm[j], perm[i]];
                }
                const permutedLayout = layout.map(row => row.map(reg => perm[reg]));
                return { layout: permutedLayout, solution };
            }
        }
    }

    let gameState = {
        variant: 'killer',
        grid: [], // 9x9 array of { r, c, val, initial, notes: Set }
        solution: [], // 9x9 solved digits
        selected: null, // { r, c }
        pencilMode: false,
        timer: 0,
        timerInterval: null,
        history: [],
        redoStack: [],
        difficulty: 'medium',
        variantData: {} // dynamic rules (cages, bridges, signs, shapes)
    };

    // ==========================================================================
    // Генератор решений 9х9 и правил
    // ==========================================================================
    function generateSolvedGrid(variantId) {
        // Базовое решение классического судоку или Strange Boxes
        const base = (variantId === 'strange_boxes') ? JIGSAW_BASE_GRID : [
            [5, 3, 4, 6, 7, 8, 9, 1, 2],
            [6, 7, 2, 1, 9, 5, 3, 4, 8],
            [1, 9, 8, 3, 4, 2, 5, 6, 7],
            [8, 5, 9, 7, 6, 1, 4, 2, 3],
            [4, 2, 6, 8, 5, 3, 7, 9, 1],
            [7, 1, 3, 9, 2, 4, 8, 5, 6],
            [9, 6, 1, 5, 3, 7, 2, 8, 4],
            [2, 8, 7, 4, 1, 9, 6, 3, 5],
            [3, 4, 5, 2, 8, 6, 1, 7, 9]
        ];

        // Случайная биекция цифр 1..9
        const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        for (let i = digits.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [digits[i], digits[j]] = [digits[j], digits[i]];
        }

        const grid = [];
        for (let r = 0; r < 9; r++) {
            grid[r] = [];
            for (let c = 0; c < 9; c++) {
                grid[r][c] = digits[base[r][c] - 1];
            }
        }
        return grid;
    }

    // Генерация случайных цветных клеток для Killer Sudoku (разбиение поля 9x9 на полимино)
    function generateKillerCages(solution) {
        const visited = Array.from({ length: 9 }, () => Array(9).fill(false));
        const cages = [];
        let colorIdx = 0;

        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (visited[r][c]) continue;

                // Случайный целевой размер клетки от 2 до 4 ячеек
                const targetSize = Math.floor(Math.random() * 3) + 2;
                const cageCells = [[r, c]];
                visited[r][c] = true;
                const usedDigits = new Set([solution[r][c]]);

                // Растим область к соседям
                let attempts = 0;
                while (cageCells.length < targetSize && attempts < 10) {
                    attempts++;
                    const curr = cageCells[Math.floor(Math.random() * cageCells.length)];
                    const neighbors = [
                        [curr[0] - 1, curr[1]],
                        [curr[0] + 1, curr[1]],
                        [curr[0], curr[1] - 1],
                        [curr[0], curr[1] + 1]
                    ].filter(([nr, nc]) => nr >= 0 && nr < 9 && nc >= 0 && nc < 9 && !visited[nr][nc]);

                    if (neighbors.length > 0) {
                        const next = neighbors[Math.floor(Math.random() * neighbors.length)];
                        const digit = solution[next[0]][next[1]];
                        if (!usedDigits.has(digit)) {
                            visited[next[0]][next[1]] = true;
                            cageCells.push(next);
                            usedDigits.add(digit);
                        }
                    }
                }

                // Считаем сумму чисел
                const sum = cageCells.reduce((acc, [cr, cc]) => acc + solution[cr][cc], 0);

                cages.push({
                    sum: sum,
                    cells: cageCells
                });
            }
        }

        // Назначаем каждой клетке Killer гарантированно УНИКАЛЬНЫЙ цвет (без повторений на поле)
        const N = cages.length;
        const startHue = Math.floor(Math.random() * 360);
        const hues = [];
        for (let i = 0; i < N; i++) {
            hues.push(Math.round((startHue + i * 137.508) % 360));
        }

        // Построение карты смежности клеток для устранения близких оттенков у соседних клеток
        const cellCageMap = {};
        cages.forEach((cg, idx) => {
            cg.cells.forEach(([r, c]) => { cellCageMap[`${r},${c}`] = idx; });
        });

        const adj = Array.from({ length: N }, () => new Set());
        cages.forEach((cg, id1) => {
            cg.cells.forEach(([r, c]) => {
                [[r + 1, c], [r, c + 1]].forEach(([nr, nc]) => {
                    const id2 = cellCageMap[`${nr},${nc}`];
                    if (id2 !== undefined && id1 !== id2) {
                        adj[id1].add(id2);
                        adj[id2].add(id1);
                    }
                });
            });
        });

        for (let i = 0; i < N; i++) {
            for (const neighborId of adj[i]) {
                if (neighborId < i) {
                    let diff = Math.abs(hues[i] - hues[neighborId]);
                    if (diff > 180) diff = 360 - diff;
                    if (diff < 28) {
                        for (let j = i + 1; j < N; j++) {
                            let ok = true;
                            for (const n of adj[i]) {
                                let d = Math.abs(hues[j] - hues[n]);
                                if (d > 180) d = 360 - d;
                                if (d < 28) { ok = false; break; }
                            }
                            if (ok) {
                                [hues[i], hues[j]] = [hues[j], hues[i]];
                                break;
                            }
                        }
                    }
                }
            }
        }

        cages.forEach((cg, idx) => {
            const h = hues[idx];
            cg.id = idx + 1;
            cg.color = {
                bg: `hsla(${h}, 70%, 55%, 0.28)`,
                border: `hsl(${h}, 85%, 55%)`,
                text: '#ffffff'
            };
        });

        return cages;
    }

    // Динамический расчет мостиков для Consecutive Sudoku
    function generateConsecutiveBridges(solution) {
        const bridges = [];
        // Горизонтальные
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 8; c++) {
                if (Math.abs(solution[r][c] - solution[r][c + 1]) === 1) {
                    bridges.push({ r1: r, c1: c, r2: r, c2: c + 1, dir: 'h' });
                }
            }
        }
        // Вертикальные
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 9; c++) {
                if (Math.abs(solution[r][c] - solution[r + 1][c]) === 1) {
                    bridges.push({ r1: r, c1: c, r2: r + 1, c2: c, dir: 'v' });
                }
            }
        }
        return bridges;
    }

    // Динамический расчет неравенств для >Sudoku<
    function generateComparisonSigns(solution) {
        const signs = [];
        // Случайно выбираем ~70% пар соседних клеток
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 8; c++) {
                if (Math.random() < 0.75) {
                    signs.push({
                        r: r, c: c, dir: 'h',
                        sign: solution[r][c] < solution[r][c + 1] ? '<' : '>'
                    });
                }
            }
        }
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 9; c++) {
                if (Math.random() < 0.75) {
                    signs.push({
                        r: r, c: c, dir: 'v',
                        sign: solution[r][c] < solution[r + 1][c] ? '^' : 'v'
                    });
                }
            }
        }
        return signs;
    }

    // Генерация математических загадок для Addition Sudoku (+, -, *, /, =)
    function generateAdditionRules(solution) {
        const candidates = [];
        // Горизонтальные тройки ячеек: c1 [op] c2 = c3
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 7; c++) {
                const a = solution[r][c], b = solution[r][c + 1], res = solution[r][c + 2];
                if (a + b === res) candidates.push({ op: '+', dir: 'h', c1: [r, c], c2: [r, c + 1], c3: [r, c + 2] });
                if (a - b === res) candidates.push({ op: '-', dir: 'h', c1: [r, c], c2: [r, c + 1], c3: [r, c + 2] });
                if (a * b === res) candidates.push({ op: '×', dir: 'h', c1: [r, c], c2: [r, c + 1], c3: [r, c + 2] });
                if (b !== 0 && a % b === 0 && Math.floor(a / b) === res) candidates.push({ op: '÷', dir: 'h', c1: [r, c], c2: [r, c + 1], c3: [r, c + 2] });
            }
        }
        // Вертикальные тройки ячеек: c1 [op] c2 = c3
        for (let c = 0; c < 9; c++) {
            for (let r = 0; r < 7; r++) {
                const a = solution[r][c], b = solution[r + 1][c], res = solution[r + 2][c];
                if (a + b === res) candidates.push({ op: '+', dir: 'v', c1: [r, c], c2: [r + 1, c], c3: [r + 2, c] });
                if (a - b === res) candidates.push({ op: '-', dir: 'v', c1: [r, c], c2: [r + 1, c], c3: [r + 2, c] });
                if (a * b === res) candidates.push({ op: '×', dir: 'v', c1: [r, c], c2: [r + 1, c], c3: [r + 2, c] });
                if (b !== 0 && a % b === 0 && Math.floor(a / b) === res) candidates.push({ op: '÷', dir: 'v', c1: [r, c], c2: [r + 1, c], c3: [r + 2, c] });
            }
        }

        candidates.sort(() => Math.random() - 0.5);
        const selected = [];
        const usedCells = new Set();

        ['+', '-', '×', '÷'].forEach(targetOp => {
            const found = candidates.find(cand => cand.op === targetOp && ![cand.c1, cand.c2, cand.c3].some(pt => usedCells.has(`${pt[0]},${pt[1]}`)));
            if (found) {
                selected.push(found);
                [found.c1, found.c2, found.c3].forEach(pt => usedCells.add(`${pt[0]},${pt[1]}`));
            }
        });

        candidates.forEach(cand => {
            if (selected.length < 5 && ![cand.c1, cand.c2, cand.c3].some(pt => usedCells.has(`${pt[0]},${pt[1]}`))) {
                selected.push(cand);
                [cand.c1, cand.c2, cand.c3].forEach(pt => usedCells.add(`${pt[0]},${pt[1]}`));
            }
        });

        return selected;
    }

    // ==========================================================================
    // Инициализация новой игры
    // ==========================================================================
    function startNewGame(variantId, difficulty = 'medium') {
        gameState.variant = variantId;
        gameState.difficulty = difficulty;
        gameState.selected = null;
        gameState.history = [];
        gameState.redoStack = [];

        // Генерируем заполненное решение и специфические правила под вариант
        gameState.variantData = {};
        if (variantId === 'strange_boxes') {
            // Процедурная генерация уникальных органических фигур (мутация границ) + решение
            const { layout, solution } = generateProceduralJigsaw();
            gameState.solution = solution;
            gameState.variantData.jigsaw = layout;
        } else {
            gameState.solution = generateSolvedGrid(variantId);
            if (variantId === 'killer') {
                gameState.variantData.cages = generateKillerCages(gameState.solution);
            } else if (variantId === 'consecutive') {
                gameState.variantData.bridges = generateConsecutiveBridges(gameState.solution);
            } else if (variantId === 'comparison') {
                gameState.variantData.signs = generateComparisonSigns(gameState.solution);
            } else if (variantId === 'addition') {
                gameState.variantData.mathRiddles = generateAdditionRules(gameState.solution);
            }
        }

        // Заполняем поле и скрываем ячейки в зависимости от сложности (5 уровней)
        const diffRatios = {
            diff_85: 0.85,
            diff_70: 0.70,
            diff_55: 0.55,
            diff_40: 0.40,
            diff_30: 0.30,
            easy: 0.70,
            medium: 0.55,
            hard: 0.35
        };
        let revealRatio = diffRatios[difficulty] || 0.70;

        // В Killer и Comparison подсказок цифр нужно чуть меньше, так как помогают знаки и суммы!
        if (variantId === 'killer' || variantId === 'comparison') {
            revealRatio *= 0.75;
        }

        gameState.grid = [];
        for (let r = 0; r < 9; r++) {
            gameState.grid[r] = [];
            for (let c = 0; c < 9; c++) {
                const isGiven = Math.random() < revealRatio;
                gameState.grid[r][c] = {
                    r: r,
                    c: c,
                    val: isGiven ? gameState.solution[r][c] : 0,
                    initial: isGiven,
                    notes: new Set()
                };
            }
        }

        updateUIHeader(variantId);
        renderBoard();
        renderSvgOverlays();
        updateRulesBottom(variantId);
        saveGame();
    }

    function updateUIHeader(variantId) {
        const v = SINGLE_VARIANTS[variantId] || SINGLE_VARIANTS.normal;
        const heading = document.getElementById('game-heading');
        const badge = document.getElementById('game-badge');
        const icon = document.getElementById('banner-icon');
        const desc = document.getElementById('banner-desc');

        if (heading) heading.textContent = v.title;
        if (badge) badge.textContent = `${v.badge} • 9×9`;
        if (icon) icon.textContent = v.icon;
        if (desc) desc.textContent = v.summary;

        // Обновляем активный таб в navbar
        document.querySelectorAll('.nav-variant-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.variant === variantId);
        });
    }

    // ==========================================================================
    // Рендеринг сетки 9х9 и SVG
    // ==========================================================================
    function renderBoard() {
        const gridEl = document.getElementById('single-cells-grid');
        if (!gridEl) return;
        gridEl.innerHTML = '';

        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                const cellData = gameState.grid[r][c];
                const cellDiv = document.createElement('div');
                cellDiv.className = 'cell-9x9';
                cellDiv.dataset.r = r;
                cellDiv.dataset.c = c;

                // Strange Boxes (Jigsaw): цвет области и границы
                if (gameState.variant === 'strange_boxes' && gameState.variantData.jigsaw) {
                    const regId = gameState.variantData.jigsaw[r][c];
                    cellDiv.style.backgroundColor = JIGSAW_TINTS[regId % JIGSAW_TINTS.length];

                    if (r > 0 && gameState.variantData.jigsaw[r - 1][c] !== regId) cellDiv.classList.add('jigsaw-border-top');
                    if (r < 8 && gameState.variantData.jigsaw[r + 1][c] !== regId) cellDiv.classList.add('jigsaw-border-bottom');
                    if (c > 0 && gameState.variantData.jigsaw[r][c - 1] !== regId) cellDiv.classList.add('jigsaw-border-left');
                    if (c < 8 && gameState.variantData.jigsaw[r][c + 1] !== regId) cellDiv.classList.add('jigsaw-border-right');
                } else {
                    // Стандартные границы 3x3 для остальных вариантов
                    if ((c + 1) % 3 === 0 && c < 8) cellDiv.classList.add('box-right');
                    if ((r + 1) % 3 === 0 && r < 8) cellDiv.classList.add('box-bottom');
                }

                // Addition Sudoku ячейки математических загадок
                if (gameState.variant === 'addition' && gameState.variantData.mathRiddles) {
                    const inRiddle = gameState.variantData.mathRiddles.find(m =>
                        (m.c1[0] === r && m.c1[1] === c) || (m.c2[0] === r && m.c2[1] === c) || (m.c3[0] === r && m.c3[1] === c)
                    );
                    if (inRiddle) {
                        if (inRiddle.c3[0] === r && inRiddle.c3[1] === c) {
                            cellDiv.classList.add('add-red');
                        } else {
                            cellDiv.classList.add('add-blue');
                        }
                    }
                }

                // Offset цвета
                if (gameState.variant === 'offset') {
                    const colorIndex = (r % 3) * 3 + (c % 3);
                    cellDiv.style.backgroundColor = `var(--off-${colorIndex})`;
                }

                // Killer цвет фона клетки
                if (gameState.variant === 'killer') {
                    cellDiv.classList.add('killer-cell');
                    if (gameState.variantData.cages) {
                        const cage = gameState.variantData.cages.find(cg => cg.cells.some(([cr, cc]) => cr === r && cc === c));
                        if (cage) {
                            cellDiv.style.backgroundColor = cage.color.bg;
                            // Если это верхняя левая клетка группы — пишем сумму
                            if (cage.cells[0][0] === r && cage.cells[0][1] === c) {
                                const sumLabel = document.createElement('span');
                                sumLabel.className = 'cage-clue';
                                sumLabel.textContent = cage.sum;
                                cellDiv.appendChild(sumLabel);
                            }
                        }
                    }
                }

                updateCellDisplay(cellDiv, cellData);

                cellDiv.addEventListener('click', () => onCellSelect(r, c));
                gridEl.appendChild(cellDiv);
            }
        }
    }

    function updateCellDisplay(cellDiv, cellData) {
        // Очищаем значение (сохраняя cage-clue если есть)
        const clue = cellDiv.querySelector('.cage-clue');
        cellDiv.innerHTML = '';
        if (clue) cellDiv.appendChild(clue);

        if (cellData.val > 0) {
            const numText = document.createTextNode(cellData.val);
            cellDiv.appendChild(numText);
            if (cellData.initial) {
                cellDiv.classList.add('initial');
            } else {
                cellDiv.classList.add('user-val');
            }
        } else if (cellData.notes.size > 0) {
            const notesEl = document.createElement('div');
            notesEl.className = 'notes-grid';
            for (let d = 1; d <= 9; d++) {
                const span = document.createElement('span');
                span.className = 'note-item';
                span.textContent = cellData.notes.has(d) ? d : '';
                notesEl.appendChild(span);
            }
            cellDiv.appendChild(notesEl);
        }
    }

    function renderSvgOverlays() {
        const svgDiags = document.getElementById('svg-diagonals');
        const svgBridges = document.getElementById('svg-bridges');
        const svgIneq = document.getElementById('svg-inequalities');
        const svgCages = document.getElementById('svg-cages');

        if (!svgDiags || !svgBridges || !svgIneq || !svgCages) return;

        svgDiags.innerHTML = '';
        svgBridges.innerHTML = '';
        svgIneq.innerHTML = '';
        svgCages.innerHTML = '';

        const cellSize = 50; // 450 / 9 = 50px

        // 1. Диагонали для Sudoku X
        if (gameState.variant === 'sudoku_x') {
            const l1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            l1.setAttribute('x1', 0);
            l1.setAttribute('y1', 0);
            l1.setAttribute('x2', 450);
            l1.setAttribute('y2', 450);
            l1.setAttribute('stroke', '#ef4444');
            l1.setAttribute('stroke-width', '3');
            l1.setAttribute('stroke-dasharray', '8 4');
            l1.setAttribute('opacity', '0.85');
            svgDiags.appendChild(l1);

            const l2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            l2.setAttribute('x1', 0);
            l2.setAttribute('y1', 450);
            l2.setAttribute('x2', 450);
            l2.setAttribute('y2', 0);
            l2.setAttribute('stroke', '#ef4444');
            l2.setAttribute('stroke-width', '3');
            l2.setAttribute('stroke-dasharray', '8 4');
            l2.setAttribute('opacity', '0.85');
            svgDiags.appendChild(l2);
        }

        // 2. Мостики для Consecutive Sudoku
        if (gameState.variant === 'consecutive' && gameState.variantData.bridges) {
            gameState.variantData.bridges.forEach(b => {
                const x1 = b.c1 * cellSize + 25;
                const y1 = b.r1 * cellSize + 25;
                const x2 = b.c2 * cellSize + 25;
                const y2 = b.r2 * cellSize + 25;

                const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                if (b.dir === 'h') {
                    rect.setAttribute('x', Math.min(x1, x2) + 10);
                    rect.setAttribute('y', y1 - 6);
                    rect.setAttribute('width', 30);
                    rect.setAttribute('height', 12);
                } else {
                    rect.setAttribute('x', x1 - 6);
                    rect.setAttribute('y', Math.min(y1, y2) + 10);
                    rect.setAttribute('width', 12);
                    rect.setAttribute('height', 30);
                }
                rect.setAttribute('rx', '4');
                rect.setAttribute('fill', '#ec4899');
                rect.setAttribute('opacity', '0.9');
                svgBridges.appendChild(rect);
            });
        }

        // 3. Знаки неравенств для >Sudoku<
        if (gameState.variant === 'comparison' && gameState.variantData.signs) {
            gameState.variantData.signs.forEach(s => {
                const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                let tx = s.c * cellSize;
                let ty = s.r * cellSize;

                if (s.dir === 'h') {
                    tx += cellSize;
                    ty += cellSize / 2 + 6;
                } else {
                    tx += cellSize / 2;
                    ty += cellSize + 6;
                }

                text.setAttribute('x', tx);
                text.setAttribute('y', ty);
                text.setAttribute('text-anchor', 'middle');
                text.setAttribute('fill', '#f472b6');
                text.setAttribute('font-size', '17');
                text.setAttribute('font-weight', 'bold');
                text.textContent = s.sign;
                svgIneq.appendChild(text);
            });
        }

        // 4. Killer границы областей (СПЛОШНЫЕ аккуратные линии по внешнему периметру клеток)
        if (gameState.variant === 'killer' && gameState.variantData.cages) {
            gameState.variantData.cages.forEach(cg => {
                const cellSet = new Set(cg.cells.map(([r, c]) => `${r},${c}`));
                const strokeColor = cg.color.border || '#10b981';

                cg.cells.forEach(([r, c]) => {
                    const x1 = c * cellSize;
                    const y1 = r * cellSize;
                    const x2 = x1 + cellSize;
                    const y2 = y1 + cellSize;

                    function drawEdge(lx1, ly1, lx2, ly2) {
                        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                        line.setAttribute('x1', lx1);
                        line.setAttribute('y1', ly1);
                        line.setAttribute('x2', lx2);
                        line.setAttribute('y2', ly2);
                        line.setAttribute('stroke', strokeColor);
                        line.setAttribute('stroke-width', '2.5');
                        line.setAttribute('stroke-linecap', 'round');
                        svgCages.appendChild(line);
                    }

                    if (!cellSet.has(`${r - 1},${c}`)) drawEdge(x1, y1, x2, y1);
                    if (!cellSet.has(`${r + 1},${c}`)) drawEdge(x1, y2, x2, y2);
                    if (!cellSet.has(`${r},${c - 1}`)) drawEdge(x1, y1, x1, y2);
                    if (!cellSet.has(`${r},${c + 1}`)) drawEdge(x2, y1, x2, y2);
                });
            });
        }

        // 5. Границы фигурных блоков Strange Boxes (Jigsaw)
        const svgJigsaw = document.getElementById('svg-jigsaw-borders');
        if (svgJigsaw) {
            svgJigsaw.innerHTML = '';
            if (gameState.variant === 'strange_boxes' && gameState.variantData.jigsaw) {
                const owner = gameState.variantData.jigsaw;

                function drawJigsawLine(x1, y1, x2, y2) {
                    const bg = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    bg.setAttribute('x1', x1);
                    bg.setAttribute('y1', y1);
                    bg.setAttribute('x2', x2);
                    bg.setAttribute('y2', y2);
                    bg.setAttribute('stroke', '#000000');
                    bg.setAttribute('stroke-width', '6');
                    bg.setAttribute('stroke-linecap', 'square');
                    svgJigsaw.appendChild(bg);

                    const fg = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    fg.setAttribute('x1', x1);
                    fg.setAttribute('y1', y1);
                    fg.setAttribute('x2', x2);
                    fg.setAttribute('y2', y2);
                    fg.setAttribute('stroke', '#00f0ff');
                    fg.setAttribute('stroke-width', '3.5');
                    fg.setAttribute('stroke-linecap', 'square');
                    svgJigsaw.appendChild(fg);
                }

                // Горизонтальные границы
                for (let r = 0; r <= 9; r++) {
                    for (let c = 0; c < 9; c++) {
                        const above = r > 0 ? owner[r - 1][c] : -1;
                        const below = r < 9 ? owner[r][c] : -1;
                        if (above !== below) {
                            drawJigsawLine(c * cellSize, r * cellSize, (c + 1) * cellSize, r * cellSize);
                        }
                    }
                }

                // Вертикальные границы
                for (let c = 0; c <= 9; c++) {
                    for (let r = 0; r < 9; r++) {
                        const left = c > 0 ? owner[r][c - 1] : -1;
                        const right = c < 9 ? owner[r][c] : -1;
                        if (left !== right) {
                            drawJigsawLine(c * cellSize, r * cellSize, c * cellSize, (r + 1) * cellSize);
                        }
                    }
                }
            }
        }

        // 6. Математические загадки Addition Sudoku (+, -, *, /, =)
        const svgMath = document.getElementById('svg-addition-math');
        if (svgMath) {
            svgMath.innerHTML = '';
            if (gameState.variant === 'addition' && gameState.variantData.mathRiddles) {
                const opColors = {
                    '+': '#22c55e',
                    '-': '#f97316',
                    '×': '#c084fc',
                    '÷': '#38bdf8'
                };

                gameState.variantData.mathRiddles.forEach(riddle => {
                    const { c1, c2, c3, op, dir } = riddle;
                    let opX, opY, eqX, eqY;
                    if (dir === 'h') {
                        opX = (c1[1] + 1) * cellSize;
                        opY = c1[0] * cellSize + cellSize / 2;
                        eqX = (c2[1] + 1) * cellSize;
                        eqY = c2[0] * cellSize + cellSize / 2;
                    } else {
                        opX = c1[1] * cellSize + cellSize / 2;
                        opY = (c1[0] + 1) * cellSize;
                        eqX = c2[1] * cellSize + cellSize / 2;
                        eqY = (c2[0] + 1) * cellSize;
                    }

                    function drawMathBadge(x, y, symbol, color) {
                        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                        circle.setAttribute('cx', x);
                        circle.setAttribute('cy', y);
                        circle.setAttribute('r', '14');
                        circle.setAttribute('fill', '#090d16');
                        circle.setAttribute('stroke', color);
                        circle.setAttribute('stroke-width', '2.5');
                        svgMath.appendChild(circle);

                        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                        text.setAttribute('x', x);
                        text.setAttribute('y', y);
                        text.setAttribute('text-anchor', 'middle');
                        text.setAttribute('dominant-baseline', 'central');
                        text.setAttribute('fill', '#ffffff');
                        text.setAttribute('font-size', '18');
                        text.setAttribute('font-weight', '900');
                        text.textContent = symbol;
                        svgMath.appendChild(text);
                    }

                    drawMathBadge(opX, opY, op, opColors[op] || '#fdba74');
                    drawMathBadge(eqX, eqY, '=', '#eab308');
                });
            }
        }
    }

    // ==========================================================================
    // Ввод цифр и интерактив
    // ==========================================================================
    function onCellSelect(r, c) {
        gameState.selected = { r, c };
        updateHighlights();
    }

    function inputDigit(digit) {
        if (!gameState.selected) return;
        const { r, c } = gameState.selected;
        const cell = gameState.grid[r][c];
        if (cell.initial) return;

        saveHistory();

        if (gameState.pencilMode) {
            if (cell.notes.has(digit)) cell.notes.delete(digit);
            else cell.notes.add(digit);
        } else {
            if (cell.val === digit) {
                cell.val = 0;
            } else {
                cell.val = digit;
                cell.notes.clear();
            }
        }

        const el = document.querySelector(`.cell-9x9[data-r="${r}"][data-c="${c}"]`);
        if (el) updateCellDisplay(el, cell);

        updateHighlights();
        saveGame();
        checkVictory();
    }

    function eraseCell() {
        if (!gameState.selected) return;
        const { r, c } = gameState.selected;
        const cell = gameState.grid[r][c];
        if (cell.initial) return;

        saveHistory();
        cell.val = 0;
        cell.notes.clear();

        const el = document.querySelector(`.cell-9x9[data-r="${r}"][data-c="${c}"]`);
        if (el) updateCellDisplay(el, cell);

        updateHighlights();
        saveGame();
    }

    function updateHighlights() {
        document.querySelectorAll('.cell-9x9').forEach(el => {
            el.classList.remove('selected', 'highlight-match', 'highlight-peer');
        });

        if (!gameState.selected) return;
        const { r, c } = gameState.selected;
        const activeCell = gameState.grid[r][c];

        const selEl = document.querySelector(`.cell-9x9[data-r="${r}"][data-c="${c}"]`);
        if (selEl) selEl.classList.add('selected');

        // Подсвечиваем совпадения цифры
        if (activeCell.val > 0) {
            for (let ir = 0; ir < 9; ir++) {
                for (let ic = 0; ic < 9; ic++) {
                    if (gameState.grid[ir][ic].val === activeCell.val) {
                        const el = document.querySelector(`.cell-9x9[data-r="${ir}"][data-c="${ic}"]`);
                        if (el && el !== selEl) el.classList.add('highlight-match');
                    }
                }
            }
        }
    }

    function checkErrors() {
        let errors = 0;
        document.querySelectorAll('.cell-9x9.error').forEach(el => el.classList.remove('error'));

        // Строки
        for (let r = 0; r < 9; r++) {
            const seen = {};
            for (let c = 0; c < 9; c++) {
                const val = gameState.grid[r][c].val;
                if (val > 0) {
                    if (seen[val] !== undefined) {
                        markErr(r, c);
                        markErr(r, seen[val]);
                        errors++;
                    } else seen[val] = c;
                }
            }
        }

        // Столбцы
        for (let c = 0; c < 9; c++) {
            const seen = {};
            for (let r = 0; r < 9; r++) {
                const val = gameState.grid[r][c].val;
                if (val > 0) {
                    if (seen[val] !== undefined) {
                        markErr(r, c);
                        markErr(seen[val], c);
                        errors++;
                    } else seen[val] = r;
                }
            }
        }

        // Блоки 3x3 (для всех кроме Strange Boxes)
        if (gameState.variant !== 'strange_boxes') {
            for (let br = 0; br < 3; br++) {
                for (let bc = 0; bc < 3; bc++) {
                    const seen = {};
                    for (let dr = 0; dr < 3; dr++) {
                        for (let dc = 0; dc < 3; dc++) {
                            const r = br * 3 + dr;
                            const c = bc * 3 + dc;
                            const val = gameState.grid[r][c].val;
                            if (val > 0) {
                                if (seen[val] !== undefined) {
                                    markErr(r, c);
                                    markErr(seen[val][0], seen[val][1]);
                                    errors++;
                                } else seen[val] = [r, c];
                            }
                        }
                    }
                }
            }
        } else if (gameState.variant === 'strange_boxes' && gameState.variantData.jigsaw) {
            // Валидация 9 фигурных областей Strange Boxes (Jigsaw)
            for (let regId = 0; regId < 9; regId++) {
                const seen = {};
                for (let r = 0; r < 9; r++) {
                    for (let c = 0; c < 9; c++) {
                        if (gameState.variantData.jigsaw[r][c] === regId) {
                            const val = gameState.grid[r][c].val;
                            if (val > 0) {
                                if (seen[val] !== undefined) {
                                    markErr(r, c);
                                    markErr(seen[val][0], seen[val][1]);
                                    errors++;
                                } else seen[val] = [r, c];
                            }
                        }
                    }
                }
            }
        }

        // Killer Cages дубликаты
        if (gameState.variant === 'killer' && gameState.variantData.cages) {
            gameState.variantData.cages.forEach(cg => {
                const seen = {};
                cg.cells.forEach(([r, c]) => {
                    const val = gameState.grid[r][c].val;
                    if (val > 0) {
                        if (seen[val]) {
                            markErr(r, c);
                            markErr(seen[val][0], seen[val][1]);
                            errors++;
                        } else seen[val] = [r, c];
                    }
                });
            });
        }

        if (errors === 0) {
            showToast('✅ Ошибок в текущих цифрах не найдено!');
        } else {
            showToast(`⚠️ Найдено конфликтов: ${errors}`);
        }
    }

    function markErr(r, c) {
        const el = document.querySelector(`.cell-9x9[data-r="${r}"][data-c="${c}"]`);
        if (el) el.classList.add('error');
    }

    function checkVictory() {
        const allFilled = gameState.grid.every(row => row.every(c => c.val > 0));
        if (!allFilled) return;

        // Если все заполнено и верно
        clearInterval(gameState.timerInterval);
        const victoryModal = document.getElementById('modal-victory');
        const victoryTime = document.getElementById('victory-time');
        const timerText = document.getElementById('timer-text');
        if (victoryTime && timerText) victoryTime.textContent = timerText.textContent;
        if (victoryModal) victoryModal.classList.add('active');
    }

    // ==========================================================================
    // История ходов, Таймер, Сохранение
    // ==========================================================================
    function saveHistory() {
        const snap = gameState.grid.map(row => row.map(c => ({ val: c.val, notes: new Set(c.notes) })));
        gameState.history.push(snap);
        if (gameState.history.length > 50) gameState.history.shift();
        gameState.redoStack = [];
    }

    function undo() {
        if (gameState.history.length === 0) return;
        const cur = gameState.grid.map(row => row.map(c => ({ val: c.val, notes: new Set(c.notes) })));
        gameState.redoStack.push(cur);
        const prev = gameState.history.pop();
        applySnap(prev);
    }

    function redo() {
        if (gameState.redoStack.length === 0) return;
        const cur = gameState.grid.map(row => row.map(c => ({ val: c.val, notes: new Set(c.notes) })));
        gameState.history.push(cur);
        const next = gameState.redoStack.pop();
        applySnap(next);
    }

    function applySnap(snap) {
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (!gameState.grid[r][c].initial) {
                    gameState.grid[r][c].val = snap[r][c].val;
                    gameState.grid[r][c].notes = new Set(snap[r][c].notes);
                    const el = document.querySelector(`.cell-9x9[data-r="${r}"][data-c="${c}"]`);
                    if (el) updateCellDisplay(el, gameState.grid[r][c]);
                }
            }
        }
        updateHighlights();
        saveGame();
    }

    function startTimer() {
        clearInterval(gameState.timerInterval);
        gameState.timer = 0;
        gameState.timerInterval = setInterval(() => {
            gameState.timer++;
            const mins = String(Math.floor(gameState.timer / 60)).padStart(2, '0');
            const secs = String(gameState.timer % 60).padStart(2, '0');
            const tEl = document.getElementById('timer-text');
            if (tEl) tEl.textContent = `${mins}:${secs}`;
        }, 1000);
    }

    function saveGame() {
        try {
            const data = {
                variant: gameState.variant,
                difficulty: gameState.difficulty,
                timer: gameState.timer,
                solution: gameState.solution,
                variantData: gameState.variantData,
                cells: gameState.grid.map(r => r.map(c => ({ val: c.val, initial: c.initial, notes: Array.from(c.notes) })))
            };
            localStorage.setItem(`single_sudoku_save_${gameState.variant}`, JSON.stringify(data));
        } catch (e) {}
    }

    function updateRulesBottom(variantId) {
        const v = SINGLE_VARIANTS[variantId] || SINGLE_VARIANTS.normal;
        const title = document.getElementById('rules-detailed-title');
        const tag = document.getElementById('rules-detailed-tag');
        const summary = document.getElementById('rules-detailed-summary');
        const content = document.getElementById('rules-detailed-content');

        if (title) title.textContent = `Правила ${v.title}`;
        if (tag) tag.textContent = `${v.badge} • 9×9`;
        if (summary) summary.textContent = v.summary;
        if (content) content.innerHTML = v.rulesHtml;
    }

    function showToast(msg) {
        const box = document.getElementById('toast-box');
        if (!box) return;
        const toast = document.createElement('div');
        toast.className = 'toast-item';
        toast.textContent = msg;
        box.appendChild(toast);
        setTimeout(() => toast.remove(), 2500);
    }

    // ==========================================================================
    // Слушатели событий
    // ==========================================================================
    function setupEvents() {
        // Переключение вариантов в шапке
        document.querySelectorAll('.nav-variant-btn[data-variant]').forEach(btn => {
            btn.addEventListener('click', () => {
                const varId = btn.dataset.variant;
                startNewGame(varId, gameState.difficulty);
            });
        });

        // Клавиатура цифр
        document.querySelectorAll('.digit-key').forEach(btn => {
            btn.addEventListener('click', () => {
                inputDigit(parseInt(btn.dataset.digit, 10));
            });
        });

        // Инструменты
        const pencilBtn = document.getElementById('tool-pencil');
        const pencilState = document.getElementById('pencil-state');
        if (pencilBtn) {
            pencilBtn.addEventListener('click', () => {
                gameState.pencilMode = !gameState.pencilMode;
                pencilBtn.classList.toggle('active', gameState.pencilMode);
                if (pencilState) pencilState.textContent = gameState.pencilMode ? 'ВКЛ' : 'ВЫКЛ';
            });
        }

        const eraseBtn = document.getElementById('tool-erase');
        if (eraseBtn) eraseBtn.addEventListener('click', eraseCell);

        const undoBtn = document.getElementById('tool-undo');
        if (undoBtn) undoBtn.addEventListener('click', undo);

        const redoBtn = document.getElementById('tool-redo');
        if (redoBtn) redoBtn.addEventListener('click', redo);

        const checkBtn = document.getElementById('tool-check');
        if (checkBtn) checkBtn.addEventListener('click', checkErrors);

        // Кнопка правил
        const rulesBtn = document.getElementById('btn-open-rules');
        const rulesModal = document.getElementById('modal-rules');
        const modalBody = document.getElementById('modal-rules-body');
        const modalTitle = document.getElementById('modal-rules-title');
        if (rulesBtn && rulesModal) {
            rulesBtn.addEventListener('click', () => {
                const v = SINGLE_VARIANTS[gameState.variant];
                if (modalTitle) modalTitle.textContent = `Правила: ${v.title}`;
                if (modalBody) {
                    modalBody.innerHTML = `
                        <div style="background: rgba(255,255,255,0.05); padding: 14px; border-radius: 10px; margin-bottom: 16px;">
                            <strong style="color: #fff;">Краткая суть:</strong>
                            <p style="margin: 6px 0 0 0; color: #cbd5e1;">${v.summary}</p>
                        </div>
                        ${v.rulesHtml}
                    `;
                }
                rulesModal.classList.add('active');
            });
        }

        // Кнопка новой игры
        const newGameBtn = document.getElementById('btn-new-game');
        const newGameModal = document.getElementById('modal-new-game');
        if (newGameBtn && newGameModal) {
            newGameBtn.addEventListener('click', () => newGameModal.classList.add('active'));
        }

        // Выбор сложности
        document.querySelectorAll('.diff-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const diff = btn.dataset.diff;
                if (newGameModal) newGameModal.classList.remove('active');
                startNewGame(gameState.variant, diff);
            });
        });

        // Победный рестарт
        const vicRestart = document.getElementById('btn-victory-restart');
        if (vicRestart) {
            vicRestart.addEventListener('click', () => {
                document.getElementById('modal-victory').classList.remove('active');
                startNewGame(gameState.variant, gameState.difficulty);
            });
        }

        // Закрытие модалок
        document.querySelectorAll('[data-close-modal]').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.closeModal;
                const m = document.getElementById(id);
                if (m) m.classList.remove('active');
            });
        });

        // Клавиатура ПК
        document.addEventListener('keydown', (e) => {
            if (e.key >= '1' && e.key <= '9') {
                inputDigit(parseInt(e.key, 10));
            } else if (e.key === 'Backspace' || e.key === 'Delete') {
                eraseCell();
            } else if (e.key === ' ' || e.key === 'n' || e.key === 'N') {
                if (pencilBtn) pencilBtn.click();
            } else if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
                if (e.shiftKey) redo();
                else undo();
            } else if (e.key === 'y' && (e.ctrlKey || e.metaKey)) {
                redo();
            } else if (e.key === 'Escape') {
                document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.remove('active'));
            }
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        setupEvents();

        // Считываем параметр variant из URL (например, ?variant=killer)
        const urlParams = new URLSearchParams(window.location.search);
        const variantParam = urlParams.get('variant') || 'killer';

        startNewGame(SINGLE_VARIANTS[variantParam] ? variantParam : 'killer');
        startTimer();
    });

})();
