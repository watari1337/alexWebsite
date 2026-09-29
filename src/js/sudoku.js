/**
 * Super Sudoku (8-in-1 Overlapping Gattai Puzzle)
 * Procedural Engine, Geometry, UI, Focus Navigation & Dynamic Math/Jigsaw Generators
 * 100% Procedurally Generated Solvable Super Sudoku with 5 Difficulty Levels
 */

(function () {
    'use strict';

    // 10 пастельных оттенков для клеток Killer Sudoku
    const KILLER_PALETTE = [
        { bg: 'rgba(167, 243, 208, 0.45)', border: '#10b981', text: '#065f46' }, // Мятный
        { bg: 'rgba(233, 213, 255, 0.45)', border: '#a855f7', text: '#581c87' }, // Лавандовый
        { bg: 'rgba(254, 240, 138, 0.45)', border: '#eab308', text: '#713f12' }, // Желтый
        { bg: 'rgba(254, 215, 170, 0.45)', border: '#f97316', text: '#7c2d12' }, // Персиковый
        { bg: 'rgba(254, 205, 211, 0.45)', border: '#f43f5e', text: '#881337' }, // Розовый
        { bg: 'rgba(186, 230, 253, 0.45)', border: '#0284c7', text: '#0c4a6e' }, // Небесный
        { bg: 'rgba(199, 210, 254, 0.45)', border: '#6366f1', text: '#312e81' }, // Индиго
        { bg: 'rgba(204, 251, 241, 0.45)', border: '#14b8a6', text: '#134e4a' }, // Бирюзовый
        { bg: 'rgba(253, 230, 138, 0.45)', border: '#d97706', text: '#78350f' }, // Янтарный
        { bg: 'rgba(245, 208, 254, 0.45)', border: '#d946ef', text: '#701a75' }  // Фуксия
    ];

    // 9 мягких оттенков для 9 фигурных областей Strange Boxes (Jigsaw)
    const JIGSAW_TINTS = [
        'rgba(6, 182, 212, 0.22)',   // Циан
        'rgba(59, 130, 246, 0.22)',  // Синий
        'rgba(147, 51, 234, 0.22)',  // Фиолетовый
        'rgba(236, 72, 153, 0.22)',  // Розовый
        'rgba(249, 115, 22, 0.22)',  // Оранжевый
        'rgba(234, 179, 8, 0.22)',   // Желтый
        'rgba(34, 197, 94, 0.22)',   // Зеленый
        'rgba(20, 184, 166, 0.22)',  // Бирюза (угол Consecutive)
        'rgba(99, 102, 241, 0.22)'   // Индиго (угол Offset)
    ];

    // 5 уровней сложности: процент открытых ячеек от общего числа (576 клеток)
    const DIFFICULTY_RATIOS = {
        diff_85: 0.85, // Новичок (~490 открытых клеток)
        diff_70: 0.70, // Легкая (~403 открытых клеток)
        diff_55: 0.55, // Средняя (~317 открытых клеток)
        diff_40: 0.40, // Сложная (~230 открытых клеток)
        diff_30: 0.30  // Эксперт (~173 открытых клеток)
    };

    // 8 вариантов судоку и их координаты на глобальной сетке 33x33 (в клетках)
    const SUDOKU_VARIANTS = {
        normal: {
            id: 'normal',
            num: 1,
            name: 'Normal Sudoku',
            rusName: 'Классическое судоку',
            color: '#fca5a5',
            rStart: 0,
            cStart: 12,
            prev: 'addition',
            next: 'comparison',
            desc: 'Классические правила судоку 9×9. В каждой строке, столбце и блоке 3×3 числа от 1 до 9 без повторений.'
        },
        comparison: {
            id: 'comparison',
            num: 2,
            name: '>Sudoku<',
            rusName: 'Судоку неравенств',
            color: '#f472b6',
            rStart: 6,
            cStart: 6,
            prev: 'normal',
            next: 'killer',
            desc: 'Между соседними клетками расставлены знаки больше/меньше (<, >, ^, v). Значения в ячейках обязаны строго подчиняться этим знакам!'
        },
        killer: {
            id: 'killer',
            num: 3,
            name: 'Killer Sudoku',
            rusName: 'Судоку-Убийца',
            color: '#86efac',
            rStart: 12,
            cStart: 0,
            prev: 'comparison',
            next: 'sudoku_x',
            desc: 'Поле поделено на цветные группы ячеек (cages). Маленькое число в углу группы указывает сумму всех цифр внутри нее. Внутри одной группы цифры не могут повторяться. Границы блоков 3×3 выделены жирным черным цветом.'
        },
        sudoku_x: {
            id: 'sudoku_x',
            num: 4,
            name: 'Sudoku X',
            rusName: 'Диагональное судоку',
            color: '#93c5fd',
            rStart: 18,
            cStart: 6,
            prev: 'killer',
            next: 'offset',
            desc: 'Помимо стандартных правил строк, колонок и блоков 3×3, обе главные диагонали (отмечены красными линиями) должны содержать все цифры от 1 до 9 без повторений.'
        },
        offset: {
            id: 'offset',
            num: 5,
            name: 'Offset Sudoku',
            rusName: 'Цветовое судоку (Offset)',
            color: '#c084fc',
            rStart: 24,
            cStart: 12,
            prev: 'sudoku_x',
            next: 'strange_boxes',
            desc: 'Клетки окрашены в 9 фиксированных цветов (по 1 цвету в блоке 3×3). Все ячейки одного цвета во всей сетке 9×9 обязаны содержать все цифры от 1 до 9 без повторов.'
        },
        strange_boxes: {
            id: 'strange_boxes',
            num: 6,
            name: 'Strange Boxes',
            rusName: 'Фигурное судоку (Jigsaw)',
            color: '#67e8f9',
            rStart: 18,
            cStart: 18,
            prev: 'offset',
            next: 'consecutive',
            desc: 'Вместо квадратных блоков 3×3 поле разбито на 9 фигурных областей сложной формы по 9 клеток каждая (обведены жирными яркими контурами). Каждая фигура должна содержать цифры от 1 до 9 без повторов.'
        },
        consecutive: {
            id: 'consecutive',
            num: 7,
            name: 'Consecutive Sudoku',
            rusName: 'Последовательное судоку',
            color: '#a3e635',
            rStart: 12,
            cStart: 24,
            prev: 'strange_boxes',
            next: 'addition',
            desc: 'Если соседние числа отличаются ровно на 1 (последовательные, например 4 и 5), между ними нарисован розовый мостик. Если мостика нет — эти числа НЕ могут быть последовательными!'
        },
        addition: {
            id: 'addition',
            num: 8,
            name: 'Addition Sudoku',
            rusName: 'Математическое судоку (Math Riddles)',
            color: '#fdba74',
            rStart: 6,
            cStart: 18,
            prev: 'consecutive',
            next: 'normal',
            desc: 'На границах соседних клеток стоят математические знаки (+, -, *, /) и знак равенства (=), связывающие цифры в ячейках в математические уравнения-загадки!'
        }
    };

    const VARIANT_ORDER = ['normal', 'comparison', 'killer', 'sudoku_x', 'offset', 'strange_boxes', 'consecutive', 'addition'];

    // Базовое проверенное полное решение кольца 33x33 (все 576 ячеек), удовлетворяющее всем ограничениям
    const BASE_RING_SOLUTION = {"0,12":8,"0,13":3,"0,14":9,"0,15":5,"0,16":2,"0,17":7,"0,18":4,"0,19":6,"0,20":1,"1,12":5,"1,13":6,"1,14":1,"1,15":4,"1,16":3,"1,17":8,"1,18":7,"1,19":2,"1,20":9,"2,12":4,"2,13":2,"2,14":7,"2,15":9,"2,16":6,"2,17":1,"2,18":8,"2,19":3,"2,20":5,"3,12":2,"3,13":7,"3,14":3,"3,15":6,"3,16":1,"3,17":5,"3,18":9,"3,19":8,"3,20":4,"4,12":1,"4,13":4,"4,14":5,"4,15":2,"4,16":8,"4,17":9,"4,18":3,"4,19":7,"4,20":6,"5,12":6,"5,13":9,"5,14":8,"5,15":7,"5,16":4,"5,17":3,"5,18":5,"5,19":1,"5,20":2,"6,12":7,"6,13":8,"6,14":6,"6,15":1,"6,16":5,"6,17":4,"6,18":2,"6,19":9,"6,20":3,"7,12":3,"7,13":5,"7,14":2,"7,15":8,"7,16":9,"7,17":6,"7,18":1,"7,19":4,"7,20":7,"8,12":9,"8,13":1,"8,14":4,"8,15":3,"8,16":7,"8,17":2,"8,18":6,"8,19":5,"8,20":8,"6,6":5,"6,7":3,"6,8":9,"6,9":2,"6,10":1,"6,11":4,"7,6":1,"7,7":4,"7,8":6,"7,9":7,"7,10":8,"7,11":9,"8,6":7,"8,7":8,"8,8":2,"8,9":6,"8,10":3,"8,11":5,"9,6":8,"9,7":9,"9,8":3,"9,9":4,"9,10":7,"9,11":1,"9,12":2,"9,13":6,"9,14":5,"10,6":4,"10,7":7,"10,8":5,"10,9":8,"10,10":6,"10,11":2,"10,12":1,"10,13":9,"10,14":3,"11,6":6,"11,7":2,"11,8":1,"11,9":5,"11,10":9,"11,11":3,"11,12":4,"11,13":7,"11,14":8,"12,6":2,"12,7":1,"12,8":7,"12,9":3,"12,10":5,"12,11":6,"12,12":8,"12,13":4,"12,14":9,"13,6":3,"13,7":5,"13,8":8,"13,9":9,"13,10":4,"13,11":7,"13,12":6,"13,13":2,"13,14":1,"14,6":9,"14,7":6,"14,8":4,"14,9":1,"14,10":2,"14,11":8,"14,12":5,"14,13":3,"14,14":7,"12,0":5,"12,1":9,"12,2":6,"12,3":3,"12,4":4,"12,5":8,"13,0":4,"13,1":1,"13,2":2,"13,3":9,"13,4":7,"13,5":6,"14,0":7,"14,1":3,"14,2":8,"14,3":2,"14,4":1,"14,5":5,"15,0":2,"15,1":7,"15,2":1,"15,3":5,"15,4":3,"15,5":9,"15,6":4,"15,7":8,"15,8":6,"16,0":6,"16,1":8,"16,2":9,"16,3":4,"16,4":2,"16,5":1,"16,6":7,"16,7":3,"16,8":5,"17,0":3,"17,1":5,"17,2":4,"17,3":6,"17,4":8,"17,5":7,"17,6":1,"17,7":9,"17,8":2,"18,0":9,"18,1":2,"18,2":3,"18,3":8,"18,4":5,"18,5":4,"18,6":6,"18,7":7,"18,8":1,"19,0":1,"19,1":6,"19,2":5,"19,3":7,"19,4":9,"19,5":2,"19,6":8,"19,7":4,"19,8":3,"20,0":8,"20,1":4,"20,2":7,"20,3":1,"20,4":6,"20,5":3,"20,6":5,"20,7":2,"20,8":9,"18,9":2,"18,10":4,"18,11":3,"18,12":8,"18,13":5,"18,14":9,"19,9":1,"19,10":5,"19,11":9,"19,12":2,"19,13":6,"19,14":7,"20,9":8,"20,10":7,"20,11":6,"20,12":4,"20,13":3,"20,14":1,"21,6":1,"21,7":6,"21,8":5,"21,9":7,"21,10":9,"21,11":2,"21,12":3,"21,13":8,"21,14":4,"22,6":3,"22,7":8,"22,8":7,"22,9":5,"22,10":1,"22,11":4,"22,12":6,"22,13":9,"22,14":2,"23,6":2,"23,7":9,"23,8":4,"23,9":3,"23,10":6,"23,11":8,"23,12":7,"23,13":1,"23,14":5,"24,6":4,"24,7":3,"24,8":8,"24,9":9,"24,10":2,"24,11":1,"24,12":5,"24,13":7,"24,14":6,"25,6":9,"25,7":5,"25,8":6,"25,9":4,"25,10":3,"25,11":7,"25,12":1,"25,13":2,"25,14":8,"26,6":7,"26,7":1,"26,8":2,"26,9":6,"26,10":8,"26,11":5,"26,12":9,"26,13":4,"26,14":3,"24,15":3,"24,16":2,"24,17":4,"24,18":1,"24,19":8,"24,20":9,"25,15":7,"25,16":5,"25,17":9,"25,18":6,"25,19":3,"25,20":4,"26,15":6,"26,16":8,"26,17":1,"26,18":7,"26,19":2,"26,20":5,"27,12":7,"27,13":6,"27,14":5,"27,15":8,"27,16":4,"27,17":2,"27,18":9,"27,19":1,"27,20":3,"28,12":8,"28,13":9,"28,14":1,"28,15":5,"28,16":6,"28,17":3,"28,18":2,"28,19":4,"28,20":7,"29,12":2,"29,13":3,"29,14":4,"29,15":1,"29,16":9,"29,17":7,"29,18":5,"29,19":6,"29,20":8,"30,12":6,"30,13":5,"30,14":7,"30,15":2,"30,16":3,"30,17":8,"30,18":4,"30,19":9,"30,20":1,"31,12":4,"31,13":8,"31,14":2,"31,15":9,"31,16":1,"31,17":5,"31,18":3,"31,19":7,"31,20":6,"32,12":3,"32,13":1,"32,14":9,"32,15":4,"32,16":7,"32,17":6,"32,18":8,"32,19":5,"32,20":2,"18,18":4,"18,19":6,"18,20":1,"18,21":8,"18,22":2,"18,23":9,"18,24":5,"18,25":7,"18,26":3,"19,18":9,"19,19":7,"19,20":6,"19,21":5,"19,22":3,"19,23":4,"19,24":2,"19,25":8,"19,26":1,"20,18":3,"20,19":1,"20,20":8,"20,21":2,"20,22":7,"20,23":5,"20,24":9,"20,25":4,"20,26":6,"21,18":8,"21,19":9,"21,20":7,"21,21":6,"21,22":4,"21,23":1,"21,24":3,"21,25":2,"21,26":5,"22,18":2,"22,19":5,"22,20":3,"22,21":7,"22,22":9,"22,23":6,"22,24":4,"22,25":1,"22,26":8,"23,18":5,"23,19":4,"23,20":2,"23,21":1,"23,22":8,"23,23":3,"23,24":6,"23,25":9,"23,26":7,"24,21":3,"24,22":5,"24,23":2,"24,24":7,"24,25":6,"24,26":4,"25,21":9,"25,22":1,"25,23":7,"25,24":8,"25,25":5,"25,26":2,"26,21":4,"26,22":6,"26,23":8,"26,24":1,"26,25":3,"26,26":9,"12,24":6,"12,25":2,"12,26":9,"12,27":4,"12,28":7,"12,29":1,"12,30":8,"12,31":5,"12,32":3,"13,24":1,"13,25":5,"13,26":7,"13,27":8,"13,28":3,"13,29":2,"13,30":9,"13,31":6,"13,32":4,"14,24":8,"14,25":3,"14,26":4,"14,27":5,"14,28":9,"14,29":6,"14,30":2,"14,31":7,"14,32":1,"15,24":7,"15,25":1,"15,26":5,"15,27":2,"15,28":4,"15,29":9,"15,30":3,"15,31":8,"15,32":6,"16,24":4,"16,25":6,"16,26":2,"16,27":3,"16,28":8,"16,29":7,"16,30":1,"16,31":9,"16,32":5,"17,24":3,"17,25":9,"17,26":8,"17,27":6,"17,28":1,"17,29":5,"17,30":4,"17,31":2,"17,32":7,"18,27":9,"18,28":2,"18,29":4,"18,30":6,"18,31":1,"18,32":8,"19,27":7,"19,28":6,"19,29":3,"19,30":5,"19,31":4,"19,32":9,"20,27":1,"20,28":5,"20,29":8,"20,30":7,"20,31":3,"20,32":2,"6,21":5,"6,22":1,"6,23":6,"6,24":4,"6,25":7,"6,26":8,"7,21":2,"7,22":3,"7,23":8,"7,24":5,"7,25":9,"7,26":6,"8,21":4,"8,22":9,"8,23":7,"8,24":3,"8,25":1,"8,26":2,"9,18":9,"9,19":6,"9,20":4,"9,21":3,"9,22":2,"9,23":5,"9,24":7,"9,25":8,"9,26":1,"10,18":7,"10,19":3,"10,20":2,"10,21":1,"10,22":8,"10,23":4,"10,24":9,"10,25":6,"10,26":5,"11,18":8,"11,19":1,"11,20":5,"11,21":6,"11,22":7,"11,23":9,"11,24":2,"11,25":4,"11,26":3,"12,18":4,"12,19":7,"12,20":1,"12,21":8,"12,22":5,"12,23":3,"13,18":3,"13,19":8,"13,20":6,"13,21":9,"13,22":4,"13,23":2,"14,18":5,"14,19":2,"14,20":9,"14,21":7,"14,22":6,"14,23":1};

    // Базовая раскладка нерегулярных фигурных блоков Strange Boxes (Jigsaw)
    const BASE_JIGSAW_LAYOUT = [
        [0,0,0,1,2,2,7,7,7],
        [0,0,3,1,1,2,7,7,7],
        [0,3,3,1,2,2,7,7,7],
        [0,3,3,1,1,2,4,4,4],
        [0,3,3,1,1,2,4,4,4],
        [0,3,3,1,2,2,5,4,4],
        [8,8,8,5,5,5,5,4,6],
        [8,8,8,5,5,6,5,6,6],
        [8,8,8,5,6,6,6,6,6]
    ];

    // Состояние игры
    let gameState = {
        grid: {}, // key: "r,c" -> { r, c, val, initial, notes: Set, sudokus: [] }
        solution: {}, // key: "r,c" -> solved digit 1..9
        activeKillerCages: [], // [{ id, sum, cells: [[r,c]], color: {bg, border, text} }]
        activeConsecutiveBridges: [], // [[[r1,c1],[r2,c2]]]
        activeInequalities: [], // [{ r, c, dir, sign }]
        activeMathRiddles: [], // [{ op, dir, c1, c2, c3, a, b, res }]
        activeJigsawLayout: null, // 9x9 матрица regionId 0..8
        selectedKey: null,
        mode: 'overview', // 'overview' | 'focus'
        activeSudoku: 'normal',
        pencilMode: false,
        timerSeconds: 0,
        timerInterval: null,
        history: [],
        redoStack: [],
        currentLevel: 'diff_70'
    };

    // Справочник правил
    const RULES_DATA = {
        all: {
            title: '🧩 Super Sudoku (8 в 1)',
            subtitle: 'Грандиозный кольцевой пазл из 8 пересекающихся судоку',
            color: '#818cf8',
            html: `
                <div style="background: rgba(99, 102, 241, 0.12); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 12px; padding: 16px; margin-bottom: 20px;">
                    <h4 style="margin: 0 0 8px 0; color: #a5b4fc; font-size: 16px;">🌟 В двух словах о Super Sudoku</h4>
                    <p style="margin: 0; line-height: 1.6; font-size: 14px; color: #f1f5f9;">
                        Это гигантское кольцо из <strong>8 перекрывающихся полей 9×9</strong> (всего 576 клеток). Каждая игра генерируется <strong>полностью случайно</strong> с гарантированной математической корректностью. Каждое судоку обладает своей уникальной механикой и делит <strong>два угловых блока 3×3 с соседями</strong>!
                    </p>
                </div>

                <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 12px; padding: 14px; margin-bottom: 20px;">
                    <h4 style="margin: 0 0 6px 0; color: #34d399; font-size: 14px;">🎯 5 уровней сложности генерации:</h4>
                    <p style="margin: 0; font-size: 13px; color: #cbd5e1; line-height: 1.6;">
                        • <strong>85% заполнено (Новичок):</strong> открыто ~490 цифр — легкий вход в игру.<br>
                        • <strong>70% заполнено (Легкая):</strong> открыто ~403 цифры — комфортный режим.<br>
                        • <strong>55% заполнено (Средняя):</strong> открыто ~317 цифр — сбалансированная логика.<br>
                        • <strong>40% заполнено (Сложная):</strong> открыто ~230 цифр — серьезный вызов.<br>
                        • <strong>30% заполнено (Эксперт):</strong> открыто ~173 цифры — глубокий логический анализ.
                    </p>
                </div>

                <h4 style="color: #fff; margin: 0 0 12px 0;">8 видов судоку в кольце:</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 10px; margin-bottom: 20px;">
                    <div style="background: rgba(255,255,255,0.03); padding: 12px; border-radius: 10px; border-left: 4px solid var(--c-normal);">
                        <strong style="color: var(--c-normal);">1. Normal Sudoku</strong>
                        <p style="margin: 4px 0 0 0; font-size: 12.5px; color: #94a3b8;">Классика: строки, столбцы и блоки 3×3 без повторов.</p>
                    </div>
                    <div style="background: rgba(255,255,255,0.03); padding: 12px; border-radius: 10px; border-left: 4px solid var(--c-comparison);">
                        <strong style="color: var(--c-comparison);">2. &gt;Sudoku&lt;</strong>
                        <p style="margin: 4px 0 0 0; font-size: 12.5px; color: #94a3b8;">Знаки больше/меньше (&lt;, &gt;, ^, v) между соседними клетками.</p>
                    </div>
                    <div style="background: rgba(255,255,255,0.03); padding: 12px; border-radius: 10px; border-left: 4px solid var(--c-killer);">
                        <strong style="color: var(--c-killer);">3. Killer Sudoku</strong>
                        <p style="margin: 4px 0 0 0; font-size: 12.5px; color: #94a3b8;">Цветные пастельные группы с суммами в углу. Четкие черные границы 3×3.</p>
                    </div>
                    <div style="background: rgba(255,255,255,0.03); padding: 12px; border-radius: 10px; border-left: 4px solid var(--c-sudoku_x);">
                        <strong style="color: var(--c-sudoku_x);">4. Sudoku X</strong>
                        <p style="margin: 4px 0 0 0; font-size: 12.5px; color: #94a3b8;">Две главные диагонали также содержат все цифры 1–9.</p>
                    </div>
                    <div style="background: rgba(255,255,255,0.03); padding: 12px; border-radius: 10px; border-left: 4px solid var(--c-offset);">
                        <strong style="color: var(--c-offset);">5. Offset Sudoku</strong>
                        <p style="margin: 4px 0 0 0; font-size: 12.5px; color: #94a3b8;">9 фиксированных цветов — ячейки одного цвета содержат 1–9.</p>
                    </div>
                    <div style="background: rgba(255,255,255,0.03); padding: 12px; border-radius: 10px; border-left: 4px solid var(--c-strange_boxes);">
                        <strong style="color: var(--c-strange_boxes);">6. Strange Boxes</strong>
                        <p style="margin: 4px 0 0 0; font-size: 12.5px; color: #94a3b8;">Случайные фигурные полимино с жирными границами и цветными зонами.</p>
                    </div>
                    <div style="background: rgba(255,255,255,0.03); padding: 12px; border-radius: 10px; border-left: 4px solid var(--c-consecutive);">
                        <strong style="color: var(--c-consecutive);">7. Consecutive</strong>
                        <p style="margin: 4px 0 0 0; font-size: 12.5px; color: #94a3b8;">Розовые мостики между соседними числами, отличающимися на 1.</p>
                    </div>
                    <div style="background: rgba(255,255,255,0.03); padding: 12px; border-radius: 10px; border-left: 4px solid var(--c-addition);">
                        <strong style="color: var(--c-addition);">8. Addition Sudoku</strong>
                        <p style="margin: 4px 0 0 0; font-size: 12.5px; color: #94a3b8;">Математические уравнения (+, -, *, / и =) на границах клеток.</p>
                    </div>
                </div>
            `
        },
        normal: {
            title: '1. Normal Sudoku (Классическое)',
            subtitle: 'Стандартное судоку 9×9',
            color: '#fca5a5',
            html: `
                <div style="background: rgba(239, 68, 68, 0.12); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 12px; padding: 14px; margin-bottom: 16px;">
                    <strong style="color: #fca5a5; display: block; margin-bottom: 4px;">🎯 В двух словах:</strong>
                    В каждой строке, каждом столбце и каждом блоке 3×3 должны быть расставлены числа от 1 до 9 без каких-либо повторений.
                </div>
                <h4 style="color: #fff; margin: 16px 0 8px 0;">📜 Полные правила:</h4>
                <ul style="margin: 0 0 16px 0; padding-left: 20px; line-height: 1.7; color: #cbd5e1; font-size: 13.5px;">
                    <li>Каждая из 9 горизонтальных строк содержит цифры 1–9.</li>
                    <li>Каждый из 9 вертикальных столбцов содержит цифры 1–9.</li>
                    <li>Каждый из девяти блоков 3×3 содержит цифры 1–9.</li>
                </ul>
                <div style="background: rgba(255,255,255,0.05); border-radius: 10px; padding: 12px; border: 1px solid var(--border-subtle);">
                    <strong style="color: #fff;">🔄 Пересечения в Super Sudoku:</strong>
                    <p style="margin: 6px 0 0 0; font-size: 13px; line-height: 1.6; color: #94a3b8;">
                        • <strong>Верхний правый блок 3×3:</strong> делит с <em>Addition Sudoku</em>.<br>
                        • <strong>Левый нижний блок 3×3:</strong> делит с <em>&gt;Sudoku&lt;</em>.
                    </p>
                </div>
            `
        },
        comparison: {
            title: '2. >Sudoku< (Неравенства)',
            subtitle: 'Comparison Sudoku / Знаки больше и меньше',
            color: '#f472b6',
            html: `
                <div style="background: rgba(244, 114, 182, 0.12); border: 1px solid rgba(244, 114, 182, 0.3); border-radius: 12px; padding: 14px; margin-bottom: 16px;">
                    <strong style="color: #f472b6; display: block; margin-bottom: 4px;">🎯 В двух словах:</strong>
                    Между соседними клетками нарисованы знаки &lt;, &gt;, ^, v. Цифры обязаны строго удовлетворять этим неравенствам!
                </div>
                <h4 style="color: #fff; margin: 16px 0 8px 0;">📜 Полные правила:</h4>
                <ul style="margin: 0 0 16px 0; padding-left: 20px; line-height: 1.7; color: #cbd5e1; font-size: 13.5px;">
                    <li>Все классические правила строк, столбцов и блоков 3×3 сохраняются.</li>
                    <li>Если между клетками стоит знак «&gt;», число слева должно быть строго больше числа справа.</li>
                    <li>Если между клетками стоит «^», верхнее число должно быть строго больше нижнего.</li>
                </ul>
                <div style="background: rgba(255,255,255,0.05); border-radius: 10px; padding: 12px; border: 1px solid var(--border-subtle);">
                    <strong style="color: #fff;">🔄 Пересечения в Super Sudoku:</strong>
                    <p style="margin: 6px 0 0 0; font-size: 13px; line-height: 1.6; color: #94a3b8;">
                        • <strong>Верхний правый блок 3×3:</strong> делит с <em>Normal Sudoku</em>.<br>
                        • <strong>Нижний левый блок 3×3:</strong> делит с <em>Killer Sudoku</em>.
                    </p>
                </div>
            `
        },
        killer: {
            title: '3. Killer Sudoku (Судоку-Убийца)',
            subtitle: 'Цветные области, суммы и явные черные границы 3×3',
            color: '#86efac',
            html: `
                <div style="background: rgba(74, 222, 128, 0.12); border: 1px solid rgba(74, 222, 128, 0.3); border-radius: 12px; padding: 14px; margin-bottom: 16px;">
                    <strong style="color: #86efac; display: block; margin-bottom: 4px;">🎯 В двух словах:</strong>
                    Поле разбито на цветные пастельные группы ячеек (cages). Число в углу группы — сумма всех цифр внутри неё. Стандартные границы блоков 3×3 выделены жирными черными линиями.
                </div>
                <h4 style="color: #fff; margin: 16px 0 8px 0;">📜 Полные правила:</h4>
                <ul style="margin: 0 0 16px 0; padding-left: 20px; line-height: 1.7; color: #cbd5e1; font-size: 13.5px;">
                    <li>Классические правила строк, столбцов и блоков 3×3 сохраняются.</li>
                    <li>Каждая цветная область имеет метку суммы в своей левой верхней ячейке.</li>
                    <li>Все цифры внутри одной цветной области обязаны быть уникальными.</li>
                </ul>
                <div style="background: rgba(255,255,255,0.05); border-radius: 10px; padding: 12px; border: 1px solid var(--border-subtle);">
                    <strong style="color: #fff;">🔄 Пересечения в Super Sudoku:</strong>
                    <p style="margin: 6px 0 0 0; font-size: 13px; line-height: 1.6; color: #94a3b8;">
                        • <strong>Верхний правый блок 3×3:</strong> делит с <em>&gt;Sudoku&lt;</em>.<br>
                        • <strong>Нижний правый блок 3×3:</strong> делит с <em>Sudoku X</em>.
                    </p>
                </div>
            `
        },
        sudoku_x: {
            title: '4. Sudoku X (Диагональное)',
            subtitle: 'Ограничения на главных диагоналях',
            color: '#93c5fd',
            html: `
                <div style="background: rgba(59, 130, 246, 0.12); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 12px; padding: 14px; margin-bottom: 16px;">
                    <strong style="color: #93c5fd; display: block; margin-bottom: 4px;">🎯 В двух словах:</strong>
                    Обе главные диагонали (отмеченные красным пунктиром) обязаны содержать все цифры от 1 до 9 без повторений!
                </div>
                <h4 style="color: #fff; margin: 16px 0 8px 0;">📜 Полные правила:</h4>
                <ul style="margin: 0 0 16px 0; padding-left: 20px; line-height: 1.7; color: #cbd5e1; font-size: 13.5px;">
                    <li>Главная диагональ ↘ (сверху-слева вниз-вправо) содержит 1–9.</li>
                    <li>Главная диагональ ↗ (снизу-слева вверх-вправо) содержит 1–9.</li>
                </ul>
                <div style="background: rgba(255,255,255,0.05); border-radius: 10px; padding: 12px; border: 1px solid var(--border-subtle);">
                    <strong style="color: #fff;">🔄 Пересечения в Super Sudoku:</strong>
                    <p style="margin: 6px 0 0 0; font-size: 13px; line-height: 1.6; color: #94a3b8;">
                        • <strong>Верхний левый блок 3×3:</strong> делит с <em>Killer Sudoku</em>.<br>
                        • <strong>Нижний правый блок 3×3:</strong> делит с <em>Offset Sudoku</em>.
                    </p>
                </div>
            `
        },
        offset: {
            title: '5. Offset Sudoku (Цветовое)',
            subtitle: 'Disjoint Groups / 9 цветовых множеств',
            color: '#c084fc',
            html: `
                <div style="background: rgba(192, 132, 252, 0.12); border: 1px solid rgba(192, 132, 252, 0.3); border-radius: 12px; padding: 14px; margin-bottom: 16px;">
                    <strong style="color: #c084fc; display: block; margin-bottom: 4px;">🎯 В двух словах:</strong>
                    Каждая ячейка в блоках 3×3 имеет свой цвет. Все клетки одинакового цвета во всей сетке 9×9 также обязаны содержать все цифры от 1 до 9 без повторений!
                </div>
                <div style="background: rgba(255,255,255,0.05); border-radius: 10px; padding: 12px; border: 1px solid var(--border-subtle);">
                    <strong style="color: #fff;">🔄 Пересечения в Super Sudoku:</strong>
                    <p style="margin: 6px 0 0 0; font-size: 13px; line-height: 1.6; color: #94a3b8;">
                        • <strong>Верхний левый блок 3×3:</strong> делит с <em>Sudoku X</em>.<br>
                        • <strong>Верхний правый блок 3×3:</strong> делит со <em>Strange Boxes</em>.
                    </p>
                </div>
            `
        },
        strange_boxes: {
            title: '6. Strange Boxes (Jigsaw / Фигурное)',
            subtitle: 'Случайные нерегулярные фигурные блоки с четкими границами',
            color: '#67e8f9',
            html: `
                <div style="background: rgba(6, 182, 212, 0.12); border: 1px solid rgba(6, 182, 212, 0.3); border-radius: 12px; padding: 14px; margin-bottom: 16px;">
                    <strong style="color: #67e8f9; display: block; margin-bottom: 4px;">🎯 В двух словах:</strong>
                    Вместо квадратных блоков 3×3 поле разбито на 9 фигурных областей сложной формы по 9 клеток каждая. Каждая фигура выделена яркой границей и мягким оттенком, и содержит цифры от 1 до 9 без повторов!
                </div>
                <h4 style="color: #fff; margin: 16px 0 8px 0;">📜 Особенности генерации:</h4>
                <ul style="margin: 0 0 16px 0; padding-left: 20px; line-height: 1.7; color: #cbd5e1; font-size: 13.5px;">
                    <li>В каждой новой игре форма фигурных областей генерируется случайным образом.</li>
                    <li>Границы между блоками нарисованы толстыми контрастными неоновыми линиями.</li>
                </ul>
                <div style="background: rgba(255,255,255,0.05); border-radius: 10px; padding: 12px; border: 1px solid var(--border-subtle);">
                    <strong style="color: #fff;">🔄 Пересечения в Super Sudoku:</strong>
                    <p style="margin: 6px 0 0 0; font-size: 13px; line-height: 1.6; color: #94a3b8;">
                        • <strong>Нижний левый блок 3×3:</strong> делит с <em>Offset Sudoku</em>.<br>
                        • <strong>Верхний правый блок 3×3:</strong> делит с <em>Consecutive Sudoku</em>.
                    </p>
                </div>
            `
        },
        consecutive: {
            title: '7. Consecutive Sudoku (Последовательное)',
            subtitle: 'Судоку с розовыми мостиками смежных чисел',
            color: '#a3e635',
            html: `
                <div style="background: rgba(163, 230, 53, 0.12); border: 1px solid rgba(163, 230, 53, 0.3); border-radius: 12px; padding: 14px; margin-bottom: 16px;">
                    <strong style="color: #a3e635; display: block; margin-bottom: 4px;">🎯 В двух словах:</strong>
                    Если соседние числа отличаются ровно на 1 (например 4 и 5), между ними нарисован розовый мостик. Если мостика НЕТ — числа категорически НЕ могут быть последовательными!
                </div>
                <div style="background: rgba(255,255,255,0.05); border-radius: 10px; padding: 12px; border: 1px solid var(--border-subtle);">
                    <strong style="color: #fff;">🔄 Пересечения в Super Sudoku:</strong>
                    <p style="margin: 6px 0 0 0; font-size: 13px; line-height: 1.6; color: #94a3b8;">
                        • <strong>Нижний левый блок 3×3:</strong> делит со <em>Strange Boxes</em>.<br>
                        • <strong>Верхний левый блок 3×3:</strong> делит с <em>Addition Sudoku</em>.
                    </p>
                </div>
            `
        },
        addition: {
            title: '8. Addition Sudoku (Математическое)',
            subtitle: 'Математические загадки (+, -, *, / и =)',
            color: '#fdba74',
            html: `
                <div style="background: rgba(249, 115, 22, 0.12); border: 1px solid rgba(249, 115, 22, 0.3); border-radius: 12px; padding: 14px; margin-bottom: 16px;">
                    <strong style="color: #fdba74; display: block; margin-bottom: 4px;">🎯 В двух словах:</strong>
                    На границах соседних клеток расставлены математические знаки (+, -, *, /) и знак равенства (=). Цифры в клетках образуют цепочки уравнений: [A] (+) [B] (=) [C]!
                </div>
                <h4 style="color: #fff; margin: 16px 0 8px 0;">📜 Математические операции:</h4>
                <ul style="margin: 0 0 16px 0; padding-left: 20px; line-height: 1.7; color: #cbd5e1; font-size: 13.5px;">
                    <li><strong>Сложение (+):</strong> A + B = C (синие ячейки в сумме равны оранжевой).</li>
                    <li><strong>Вычитание (-):</strong> A - B = C.</li>
                    <li><strong>Умножение (×):</strong> A × B = C.</li>
                    <li><strong>Деление (÷):</strong> A ÷ B = C.</li>
                </ul>
                <div style="background: rgba(255,255,255,0.05); border-radius: 10px; padding: 12px; border: 1px solid var(--border-subtle);">
                    <strong style="color: #fff;">🔄 Пересечения в Super Sudoku:</strong>
                    <p style="margin: 6px 0 0 0; font-size: 13px; line-height: 1.6; color: #94a3b8;">
                        • <strong>Нижний правый блок 3×3:</strong> делит с <em>Consecutive Sudoku</em>.<br>
                        • <strong>Верхний левый блок 3×3:</strong> делит с <em>Normal Sudoku</em>.
                    </p>
                </div>
            `
        },
        overlaps: {
            title: '🔄 Кольцевые пересечения 8 в 1',
            subtitle: 'Как соединяются 8 сеток 9×9 в мега-кольцо',
            color: '#a855f7',
            html: `
                <div style="background: rgba(168, 85, 247, 0.12); border: 1px solid rgba(168, 85, 247, 0.3); border-radius: 12px; padding: 16px; margin-bottom: 20px;">
                    <h4 style="margin: 0 0 8px 0; color: #c084fc;">Ключевая тайна решения Super Sudoku</h4>
                    <p style="margin: 0; line-height: 1.6; font-size: 13.5px; color: #cbd5e1;">
                        Каждый из 8 вариантов судоку делит ровно <strong>2 угловых блока 3×3 (по 9 ячеек)</strong> со своими непосредственными соседями по часовой и против часовой стрелки. Это означает, что цифры в общих клетках подчиняются сразу двум наборам правил!
                    </p>
                </div>
            `
        }
    };

    // ==========================================================================
    // Инициализация сетки и геометрии
    // ==========================================================================
    function initBoardData() {
        gameState.grid = {};
        VARIANT_ORDER.forEach(vKey => {
            const v = SUDOKU_VARIANTS[vKey];
            for (let r = v.rStart; r < v.rStart + 9; r++) {
                for (let c = v.cStart; c < v.cStart + 9; c++) {
                    const key = `${r},${c}`;
                    if (!gameState.grid[key]) {
                        gameState.grid[key] = {
                            r: r,
                            c: c,
                            val: 0,
                            initial: false,
                            notes: new Set(),
                            sudokus: [vKey]
                        };
                    } else {
                        if (!gameState.grid[key].sudokus.includes(vKey)) {
                            gameState.grid[key].sudokus.push(vKey);
                        }
                    }
                }
            }
        });
    }

    // ==========================================================================
    // Процедурный генератор решаемых партий (100% случайная генерация)
    // ==========================================================================
    function generateProceduralPuzzle(difficultyKey) {
        // Случайная биекция цифр 1..9 -> perm(1..9)
        const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        for (let i = digits.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [digits[i], digits[j]] = [digits[j], digits[i]];
        }
        const perm = digits; // perm[d-1] дает новую цифру

        // Создаем полное валидное решение текущей партии
        gameState.solution = {};
        Object.entries(BASE_RING_SOLUTION).forEach(([k, oldVal]) => {
            gameState.solution[k] = perm[oldVal - 1];
        });

        // 1. ДИНАМИЧЕСКИЕ КЛЕТКИ ДЛЯ KILLER SUDOKU (случайные полимино 2-4 ячейки + пастельные цвета)
        generateDynamicKillerCages();

        // 2. ДИНАМИЧЕСКИЕ МОСТИКИ ДЛЯ CONSECUTIVE SUDOKU
        generateDynamicConsecutiveBridges();

        // 3. ДИНАМИЧЕСКИЕ НЕРАВЕНСТВА ДЛЯ >SUDOKU<
        generateDynamicInequalities();

        // 4. ДИНАМИЧЕСКИЕ МАТЕМАТИЧЕСКИЕ ЗАГАДКИ ДЛЯ ADDITION SUDOKU (+, -, *, /, =)
        generateDynamicMathRiddles();

        // 5. ДИНАМИЧЕСКИЕ ФИГУРНЫЕ ОБЛАСТИ ДЛЯ STRANGE BOXES (JIGSAW)
        generateDynamicJigsawLayout();

        // 6. ОТКРЫТИЕ ПОДСКАЗОК СОГЛАСНО ВЫБРАННОЙ СЛОЖНОСТИ (85%, 70%, 55%, 40%, 30%)
        const revealRatio = DIFFICULTY_RATIOS[difficultyKey] || 0.70;
        Object.entries(gameState.grid).forEach(([k, cell]) => {
            const solvedVal = gameState.solution[k];
            if (solvedVal && Math.random() < revealRatio) {
                cell.val = solvedVal;
                cell.initial = true;
            } else {
                cell.val = 0;
                cell.initial = false;
            }
            cell.notes.clear();
        });
    }

    // Генерация случайных цветных клеток для Killer Sudoku (r: 12..20, c: 0..8)
    function generateDynamicKillerCages() {
        const visited = Array.from({ length: 9 }, () => Array(9).fill(false));
        const cages = [];
        let colorIdx = 0;

        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (visited[r][c]) continue;

                const targetSize = Math.floor(Math.random() * 3) + 2; // 2..4 ячейки
                const cageCells = [[12 + r, 0 + c]];
                visited[r][c] = true;
                const usedDigits = new Set([gameState.solution[`${12 + r},${0 + c}`]]);

                let attempts = 0;
                while (cageCells.length < targetSize && attempts < 12) {
                    attempts++;
                    const curr = cageCells[Math.floor(Math.random() * cageCells.length)];
                    const lr = curr[0] - 12;
                    const lc = curr[1] - 0;
                    const neighbors = [
                        [lr - 1, lc], [lr + 1, lc], [lr, lc - 1], [lr, lc + 1]
                    ].filter(([nr, nc]) => nr >= 0 && nr < 9 && nc >= 0 && nc < 9 && !visited[nr][nc]);

                    if (neighbors.length > 0) {
                        const next = neighbors[Math.floor(Math.random() * neighbors.length)];
                        const gr = 12 + next[0];
                        const gc = 0 + next[1];
                        const digit = gameState.solution[`${gr},${gc}`];
                        if (digit && !usedDigits.has(digit)) {
                            visited[next[0]][next[1]] = true;
                            cageCells.push([gr, gc]);
                            usedDigits.add(digit);
                        }
                    }
                }

                cageCells.sort((a, b) => a[0] === b[0] ? a[1] - b[1] : a[0] - b[0]);
                const sum = cageCells.reduce((acc, [cr, cc]) => acc + (gameState.solution[`${cr},${cc}`] || 0), 0);

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

        gameState.activeKillerCages = cages;
    }

    // Динамическая генерация мостиков для Consecutive Sudoku (r: 12..20, c: 24..32)
    function generateDynamicConsecutiveBridges() {
        const bridges = [];
        // Горизонтальные
        for (let r = 12; r < 21; r++) {
            for (let c = 24; c < 32; c++) {
                const v1 = gameState.solution[`${r},${c}`];
                const v2 = gameState.solution[`${r},${c + 1}`];
                if (v1 && v2 && Math.abs(v1 - v2) === 1) {
                    bridges.push([[r, c], [r, c + 1]]);
                }
            }
        }
        // Вертикальные
        for (let r = 12; r < 20; r++) {
            for (let c = 24; c < 33; c++) {
                const v1 = gameState.solution[`${r},${c}`];
                const v2 = gameState.solution[`${r + 1},${c}`];
                if (v1 && v2 && Math.abs(v1 - v2) === 1) {
                    bridges.push([[r, c], [r + 1, c]]);
                }
            }
        }

        gameState.activeConsecutiveBridges = bridges;
    }

    // Динамическая генерация знаков для >Sudoku< (r: 6..14, c: 6..14)
    function generateDynamicInequalities() {
        const signs = [];
        // Горизонтальные
        for (let r = 6; r < 15; r++) {
            for (let c = 6; c < 14; c++) {
                const v1 = gameState.solution[`${r},${c}`];
                const v2 = gameState.solution[`${r},${c + 1}`];
                if (v1 && v2 && Math.random() < 0.65) {
                    signs.push({ r, c, dir: 'h', sign: v1 < v2 ? '<' : '>' });
                }
            }
        }
        // Вертикальные
        for (let r = 6; r < 14; r++) {
            for (let c = 6; c < 15; c++) {
                const v1 = gameState.solution[`${r},${c}`];
                const v2 = gameState.solution[`${r + 1},${c}`];
                if (v1 && v2 && Math.random() < 0.65) {
                    signs.push({ r, c, dir: 'v', sign: v1 < v2 ? '^' : 'v' });
                }
            }
        }

        gameState.activeInequalities = signs;
    }

    // Динамическая генерация математических загадок для Addition Sudoku (+, -, *, /, =)
    function generateDynamicMathRiddles() {
        const candidates = [];
        const rStart = 6, cStart = 18;

        // Горизонтальные тройки ячеек: c1 [op] c2 = c3
        for (let r = rStart; r < rStart + 9; r++) {
            for (let c = cStart; c < cStart + 7; c++) {
                const a = gameState.solution[`${r},${c}`];
                const b = gameState.solution[`${r},${c + 1}`];
                const res = gameState.solution[`${r},${c + 2}`];
                if (a && b && res) {
                    if (a + b === res) candidates.push({ op: '+', dir: 'h', c1: [r, c], c2: [r, c + 1], c3: [r, c + 2], a, b, res });
                    if (a - b === res) candidates.push({ op: '-', dir: 'h', c1: [r, c], c2: [r, c + 1], c3: [r, c + 2], a, b, res });
                    if (a * b === res) candidates.push({ op: '×', dir: 'h', c1: [r, c], c2: [r, c + 1], c3: [r, c + 2], a, b, res });
                    if (b !== 0 && a % b === 0 && Math.floor(a / b) === res) candidates.push({ op: '÷', dir: 'h', c1: [r, c], c2: [r, c + 1], c3: [r, c + 2], a, b, res });
                }
            }
        }

        // Вертикальные тройки ячеек: c1 [op] c2 = c3
        for (let c = cStart; c < cStart + 9; c++) {
            for (let r = rStart; r < rStart + 7; r++) {
                const a = gameState.solution[`${r},${c}`];
                const b = gameState.solution[`${r + 1},${c}`];
                const res = gameState.solution[`${r + 2},${c}`];
                if (a && b && res) {
                    if (a + b === res) candidates.push({ op: '+', dir: 'v', c1: [r, c], c2: [r + 1, c], c3: [r + 2, c], a, b, res });
                    if (a - b === res) candidates.push({ op: '-', dir: 'v', c1: [r, c], c2: [r + 1, c], c3: [r + 2, c], a, b, res });
                    if (a * b === res) candidates.push({ op: '×', dir: 'v', c1: [r, c], c2: [r + 1, c], c3: [r + 2, c], a, b, res });
                    if (b !== 0 && a % b === 0 && Math.floor(a / b) === res) candidates.push({ op: '÷', dir: 'v', c1: [r, c], c2: [r + 1, c], c3: [r + 2, c], a, b, res });
                }
            }
        }

        candidates.sort(() => Math.random() - 0.5);
        const selected = [];
        const usedCells = new Set();

        // Гарантируем разнообразие математических операций: берем хотя бы по одной '+', '-', '×', '÷' если есть
        ['+', '-', '×', '÷'].forEach(targetOp => {
            const found = candidates.find(cand => cand.op === targetOp && ![cand.c1, cand.c2, cand.c3].some(pt => usedCells.has(`${pt[0]},${pt[1]}`)));
            if (found) {
                selected.push(found);
                [found.c1, found.c2, found.c3].forEach(pt => usedCells.add(`${pt[0]},${pt[1]}`));
            }
        });

        // Добираем до 4-6 загадок
        candidates.forEach(cand => {
            if (selected.length < 5 && ![cand.c1, cand.c2, cand.c3].some(pt => usedCells.has(`${pt[0]},${pt[1]}`))) {
                selected.push(cand);
                [cand.c1, cand.c2, cand.c3].forEach(pt => usedCells.add(`${pt[0]},${pt[1]}`));
            }
        });

        gameState.activeMathRiddles = selected;
    }

    // ==========================================================================
    // Процедурная генерация фигурных областей Strange Boxes (Jigsaw)
    // Алгоритм мутации границ (Boundary Mutation) со взаимным обменом клеток с одинаковыми цифрами
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

    function generateDynamicJigsawLayout() {
        const layout = BASE_JIGSAW_LAYOUT.map(row => [...row]);
        const regCells = Array.from({ length: 9 }, () => []);
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                regCells[layout[r][c]].push([r, c]);
            }
        }

        // Извлекаем цифры решения доски Strange Boxes (r: 18..26, c: 18..26)
        const b7Digits = Array.from({ length: 9 }, (_, r) => 
            Array.from({ length: 9 }, (_, c) => gameState.solution[`${18 + r},${18 + c}`] || 0)
        );

        // Мутируем границы только между внутренними 7 фигурами (0..6)
        // Блоки 7 (Consecutive) и 8 (Offset) зафиксированы как угловые 3x3
        let swaps = 0;
        const targetSwaps = 20 + Math.floor(Math.random() * 15);
        for (let iter = 0; iter < 1000 && swaps < targetSwaps; iter++) {
            const targetDigit = Math.floor(Math.random() * 9) + 1;
            const digitCells = [];
            for (let r = 0; r < 9; r++) {
                for (let c = 0; c < 9; c++) {
                    const reg = layout[r][c];
                    if (reg < 7 && b7Digits[r][c] === targetDigit) {
                        digitCells.push({ r, c, reg });
                    }
                }
            }
            if (digitCells.length < 2) continue;

            const iA = Math.floor(Math.random() * digitCells.length);
            let iB = Math.floor(Math.random() * digitCells.length);
            if (iA === iB) continue;
            const cellA = digitCells[iA];
            const cellB = digitCells[iB];
            const { r: rA, c: cA, reg: regA } = cellA;
            const { r: rB, c: cB, reg: regB } = cellB;
            if (regA === regB) continue;

            // Проверяем смежность
            const neighborsA = [[rA - 1, cA], [rA + 1, cA], [rA, cA - 1], [rA, cA + 1]];
            let aAdjToB = false;
            for (const [nr, nc] of neighborsA) {
                if (nr >= 0 && nr < 9 && nc >= 0 && nc < 9) {
                    if (layout[nr][nc] === regB && !(nr === rB && nc === cB)) {
                        aAdjToB = true;
                        break;
                    }
                }
            }
            if (!aAdjToB) continue;

            const neighborsB = [[rB - 1, cB], [rB + 1, cB], [rB, cB - 1], [rB, cB + 1]];
            let bAdjToA = false;
            for (const [nr, nc] of neighborsB) {
                if (nr >= 0 && nr < 9 && nc >= 0 && nc < 9) {
                    if (layout[nr][nc] === regA && !(nr === rA && nc === cA)) {
                        bAdjToA = true;
                        break;
                    }
                }
            }
            if (!bAdjToA) continue;

            const remA = regCells[regA].filter(([r, c]) => !(r === rA && c === cA));
            remA.push([rB, cB]);
            if (!isJigsawRegionConnected(remA)) continue;

            const remB = regCells[regB].filter(([r, c]) => !(r === rB && c === cB));
            remB.push([rA, cA]);
            if (!isJigsawRegionConnected(remB)) continue;

            layout[rA][cA] = regB;
            layout[rB][cB] = regA;
            regCells[regA] = remA;
            regCells[regB] = remB;
            swaps++;
        }

        // Случайно перемешиваем идентификаторы 7 фигурных областей (0..6) для смены палитры цветов
        const perm = [0, 1, 2, 3, 4, 5, 6];
        for (let i = perm.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [perm[i], perm[j]] = [perm[j], perm[i]];
        }

        const owner = Array.from({ length: 9 }, () => Array(9).fill(-1));
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                const reg = layout[r][c];
                owner[r][c] = (reg < 7) ? perm[reg] : reg; // 7 (Consecutive) и 8 (Offset) - общие 3x3 блоки
            }
        }

        gameState.activeJigsawLayout = owner;
    }

    // Загрузка уровня сложности (diff_85, diff_70, diff_55, diff_40, diff_30)
    function loadLevel(difficultyKey) {
        initBoardData();
        gameState.currentLevel = difficultyKey;
        gameState.history = [];
        gameState.redoStack = [];
        gameState.selectedKey = null;

        // Полностью случайная генерация под выбранную сложность
        generateProceduralPuzzle(difficultyKey);

        renderCells();
        renderSvgOverlays();
        updateHighlights();
        saveToLocalStorage();
        showToast(`Сгенерирована новая партия: ${getLevelTitle(difficultyKey)}`);
    }

    function getLevelTitle(level) {
        if (level === 'diff_85') return 'Новичок (85% заполнено)';
        if (level === 'diff_70') return 'Легкая (70% заполнено)';
        if (level === 'diff_55') return 'Средняя (55% заполнено)';
        if (level === 'diff_40') return 'Сложная (40% заполнено)';
        if (level === 'diff_30') return 'Эксперт (30% заполнено)';
        return 'Легкая (70% заполнено)';
    }

    // ==========================================================================
    // Рендеринг DOM-ячеек
    // ==========================================================================
    function renderCells() {
        const gridEl = document.getElementById('cells-grid');
        if (!gridEl) return;
        gridEl.innerHTML = '';

        for (let r = 0; r < 33; r++) {
            for (let c = 0; c < 33; c++) {
                const key = `${r},${c}`;
                const cellData = gameState.grid[key];

                const cellDiv = document.createElement('div');
                cellDiv.className = 'cell';
                cellDiv.dataset.key = key;
                cellDiv.dataset.r = r;
                cellDiv.dataset.c = c;

                if (!cellData) {
                    cellDiv.style.visibility = 'hidden';
                    gridEl.appendChild(cellDiv);
                    continue;
                }

                // Классы вариантов
                const primaryVariant = cellData.sudokus[0];
                cellDiv.classList.add(`var-${primaryVariant}`);

                if (cellData.sudokus.length > 1) {
                    cellDiv.classList.add('overlap-cell');
                }

                // Цвет для Killer Sudoku клеток
                const killerCage = gameState.activeKillerCages.find(cg => 
                    cg.cells.some(([cr, cc]) => cr === r && cc === c)
                );
                if (killerCage) {
                    cellDiv.style.backgroundColor = killerCage.color.bg;
                }

                // Цвет для Strange Boxes фигурных областей (r: 18..26, c: 18..26)
                if (gameState.activeJigsawLayout && r >= 18 && r < 27 && c >= 18 && c < 27) {
                    const regId = gameState.activeJigsawLayout[r - 18][c - 18];
                    cellDiv.style.backgroundColor = JIGSAW_TINTS[regId % JIGSAW_TINTS.length];
                }

                // Offset цвета для блока Offset Sudoku (r: 24..32, c: 12..20)
                if (cellData.sudokus.includes('offset')) {
                    const offColor = (r % 3) * 3 + (c % 3);
                    cellDiv.classList.add(`off-color-${offColor}`);
                }

                // Addition цвета для математических загадок
                const inRiddle = gameState.activeMathRiddles.find(m => 
                    (m.c1[0] === r && m.c1[1] === c) || (m.c2[0] === r && m.c2[1] === c) || (m.c3[0] === r && m.c3[1] === c)
                );
                if (inRiddle) {
                    if (inRiddle.c3[0] === r && inRiddle.c3[1] === c) {
                        cellDiv.classList.add('add-red');
                    } else {
                        cellDiv.classList.add('add-blue');
                    }
                }

                // Классы границ для фигурных областей Strange Boxes (Jigsaw)
                if (gameState.activeJigsawLayout && r >= 18 && r < 27 && c >= 18 && c < 27) {
                    const sr = r - 18;
                    const sc = c - 18;
                    const myReg = gameState.activeJigsawLayout[sr][sc];

                    if (sr > 0 && gameState.activeJigsawLayout[sr - 1][sc] !== myReg) {
                        cellDiv.classList.add('jigsaw-border-top');
                    }
                    if (sr < 8 && gameState.activeJigsawLayout[sr + 1][sc] !== myReg) {
                        cellDiv.classList.add('jigsaw-border-bottom');
                    }
                    if (sc > 0 && gameState.activeJigsawLayout[sr][sc - 1] !== myReg) {
                        cellDiv.classList.add('jigsaw-border-left');
                    }
                    if (sc < 8 && gameState.activeJigsawLayout[sr][sc + 1] !== myReg) {
                        cellDiv.classList.add('jigsaw-border-right');
                    }
                }

                // Границы 3x3 блоков: НЕ рисуем стандартные 3x3 линии внутри Strange Boxes (кроме двух 3x3 углов)
                const inStrange = (r >= 18 && r < 27 && c >= 18 && c < 27);
                const isCornerConsecutive = (r >= 18 && r <= 20 && c >= 24 && c <= 26);
                const isCornerOffset = (r >= 24 && r <= 26 && c >= 18 && c <= 20);

                if (!inStrange || isCornerConsecutive || isCornerOffset) {
                    if ((r + 1) % 3 === 0) cellDiv.classList.add('box-border-bottom');
                    if ((c + 1) % 3 === 0) cellDiv.classList.add('box-border-right');
                    if (r % 3 === 0) cellDiv.classList.add('outer-border-top');
                    if (c % 3 === 0) cellDiv.classList.add('outer-border-left');
                } else {
                    // Внешний контур сетки 9x9 Strange Boxes
                    if (r === 18) cellDiv.classList.add('outer-border-top');
                    if (r === 26) cellDiv.classList.add('box-border-bottom');
                    if (c === 18) cellDiv.classList.add('outer-border-left');
                    if (c === 26) cellDiv.classList.add('box-border-right');
                }

                // Значение ячейки
                updateCellView(cellDiv, cellData);

                // Слушатель клика
                cellDiv.addEventListener('click', () => onCellClick(key));

                gridEl.appendChild(cellDiv);
            }
        }
    }

    function updateCellView(cellDiv, cellData) {
        cellDiv.innerHTML = '';

        if (cellData.val > 0) {
            cellDiv.textContent = cellData.val;
            if (cellData.initial) {
                cellDiv.classList.add('initial');
            } else {
                cellDiv.classList.add('user-value');
            }
        } else if (cellData.notes.size > 0) {
            // Карандашные заметки 1..9
            const notesGrid = document.createElement('div');
            notesGrid.className = 'cell-notes';
            for (let d = 1; d <= 9; d++) {
                const noteSpan = document.createElement('span');
                noteSpan.className = 'note-num';
                noteSpan.textContent = cellData.notes.has(d) ? d : '';
                notesGrid.appendChild(noteSpan);
            }
            cellDiv.appendChild(notesGrid);
        }

        // Проверяем, является ли верхней левой ячейкой клетки Killer для метки суммы
        const cage = gameState.activeKillerCages.find(cg => cg.cells[0][0] === cellData.r && cg.cells[0][1] === cellData.c);
        if (cage) {
            const sumLabel = document.createElement('span');
            sumLabel.className = 'cage-sum-label';
            sumLabel.textContent = cage.sum;
            sumLabel.style.color = '#fff';
            sumLabel.style.backgroundColor = cage.color.border;
            sumLabel.style.borderColor = cage.color.border;
            cellDiv.appendChild(sumLabel);
        }
    }

    // ==========================================================================
    // SVG Наложения: Диагонали, Мостики, Неравенства, Контуры Killer, Сетка Killer, Границы Jigsaw, Math
    // ==========================================================================
    function renderSvgOverlays() {
        const svgDiags = document.getElementById('svg-diagonals');
        const svgBridges = document.getElementById('svg-consecutive-bridges');
        const svgIneq = document.getElementById('svg-inequalities');
        const svgCages = document.getElementById('svg-killer-cages');
        const svgKillerGrid = document.getElementById('svg-killer-grid');
        const svgJigsaw = document.getElementById('svg-jigsaw-borders');
        const svgMath = document.getElementById('svg-addition-math');

        if (!svgDiags || !svgBridges || !svgIneq || !svgCages) return;

        svgDiags.innerHTML = '';
        svgBridges.innerHTML = '';
        svgIneq.innerHTML = '';
        svgCages.innerHTML = '';
        if (svgKillerGrid) svgKillerGrid.innerHTML = '';
        if (svgJigsaw) svgJigsaw.innerHTML = '';
        if (svgMath) svgMath.innerHTML = '';

        const cellSize = 32;

        // 1. Диагонали Sudoku X (r: 18..26, c: 6..14)
        const sxX = 6 * cellSize;
        const sxY = 18 * cellSize;
        const sxSize = 9 * cellSize;

        const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line1.setAttribute('x1', sxX);
        line1.setAttribute('y1', sxY);
        line1.setAttribute('x2', sxX + sxSize);
        line1.setAttribute('y2', sxY + sxSize);
        line1.setAttribute('stroke', '#ef4444');
        line1.setAttribute('stroke-width', '2.5');
        line1.setAttribute('stroke-dasharray', '6 3');
        line1.setAttribute('opacity', '0.75');
        svgDiags.appendChild(line1);

        const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line2.setAttribute('x1', sxX);
        line2.setAttribute('y1', sxY + sxSize);
        line2.setAttribute('x2', sxX + sxSize);
        line2.setAttribute('y2', sxY);
        line2.setAttribute('stroke', '#ef4444');
        line2.setAttribute('stroke-width', '2.5');
        line2.setAttribute('stroke-dasharray', '6 3');
        line2.setAttribute('opacity', '0.75');
        svgDiags.appendChild(line2);

        // 2. Мостики Consecutive Sudoku (розовые перемычки)
        gameState.activeConsecutiveBridges.forEach(([c1, c2]) => {
            const x1 = c1[1] * cellSize + 16;
            const y1 = c1[0] * cellSize + 16;
            const x2 = c2[1] * cellSize + 16;
            const y2 = c2[0] * cellSize + 16;

            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            if (c1[0] === c2[0]) {
                rect.setAttribute('x', Math.min(x1, x2) + 6);
                rect.setAttribute('y', y1 - 4);
                rect.setAttribute('width', 20);
                rect.setAttribute('height', 8);
            } else {
                rect.setAttribute('x', x1 - 4);
                rect.setAttribute('y', Math.min(y1, y2) + 6);
                rect.setAttribute('width', 8);
                rect.setAttribute('height', 20);
            }
            rect.setAttribute('rx', '3');
            rect.setAttribute('fill', '#ec4899');
            rect.setAttribute('opacity', '0.92');
            svgBridges.appendChild(rect);
        });

        // 3. Знаки неравенств >Sudoku<
        gameState.activeInequalities.forEach(item => {
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            let tx = item.c * cellSize;
            let ty = item.r * cellSize;

            if (item.dir === 'h') {
                tx += cellSize;
                ty += cellSize / 2 + 5;
            } else {
                tx += cellSize / 2;
                ty += cellSize + 5;
            }

            text.setAttribute('x', tx);
            text.setAttribute('y', ty);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('fill', '#f472b6');
            text.setAttribute('font-size', '14');
            text.setAttribute('font-weight', 'bold');
            text.textContent = item.sign;
            svgIneq.appendChild(text);
        });

        // 4. Killer клетки: красивые сплошные контуры по периметру каждой группы (без штриховки)
        gameState.activeKillerCages.forEach(cage => {
            const cellSet = new Set(cage.cells.map(([r, c]) => `${r},${c}`));
            const strokeColor = cage.color.border || '#10b981';

            cage.cells.forEach(([r, c]) => {
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

        // 6. СЛУЧАЙНЫЕ ЖИРНЫЕ ГРАНИЦЫ ДЛЯ STRANGE BOXES (JIGSAW)
        if (svgJigsaw && gameState.activeJigsawLayout) {
            renderJigsawBorders(svgJigsaw);
        }

        // 7. МАТЕМАТИЧЕСКИЕ ЗАГАДКИ ДЛЯ ADDITION SUDOKU (+, -, *, /, =)
        if (svgMath && gameState.activeMathRiddles.length > 0) {
            renderMathRiddles(svgMath);
        }
    }



    // Рендеринг ярких контрастных границ фигурных блоков Strange Boxes (Jigsaw)
    function renderJigsawBorders(svgJigsaw) {
        const cellSize = 32;
        const sbX = 18 * cellSize;
        const sbY = 18 * cellSize;
        const owner = gameState.activeJigsawLayout;
        if (!owner) return;

        function drawJigsawLine(x1, y1, x2, y2) {
            // Черная подложка для максимального контраста
            const bgLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            bgLine.setAttribute('x1', x1);
            bgLine.setAttribute('y1', y1);
            bgLine.setAttribute('x2', x2);
            bgLine.setAttribute('y2', y2);
            bgLine.setAttribute('stroke', '#000000');
            bgLine.setAttribute('stroke-width', '5');
            bgLine.setAttribute('stroke-linecap', 'square');
            svgJigsaw.appendChild(bgLine);

            // Неоново-голубая контрастная линия
            const fgLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            fgLine.setAttribute('x1', x1);
            fgLine.setAttribute('y1', y1);
            fgLine.setAttribute('x2', x2);
            fgLine.setAttribute('y2', y2);
            fgLine.setAttribute('stroke', '#00f0ff');
            fgLine.setAttribute('stroke-width', '3');
            fgLine.setAttribute('stroke-linecap', 'square');
            svgJigsaw.appendChild(fgLine);
        }

        // Горизонтальные границы (без дублирования)
        for (let r = 0; r <= 9; r++) {
            for (let c = 0; c < 9; c++) {
                const above = r > 0 ? owner[r - 1][c] : -1;
                const below = r < 9 ? owner[r][c] : -1;
                if (above !== below) {
                    const gx = sbX + c * cellSize;
                    const gy = sbY + r * cellSize;
                    drawJigsawLine(gx, gy, gx + cellSize, gy);
                }
            }
        }

        // Вертикальные границы (без дублирования)
        for (let c = 0; c <= 9; c++) {
            for (let r = 0; r < 9; r++) {
                const left = c > 0 ? owner[r][c - 1] : -1;
                const right = c < 9 ? owner[r][c] : -1;
                if (left !== right) {
                    const gx = sbX + c * cellSize;
                    const gy = sbY + r * cellSize;
                    drawJigsawLine(gx, gy, gx, gy + cellSize);
                }
            }
        }
    }

    // Рендеринг математических обозначений (+, -, *, /, =) на границах клеток Addition Sudoku
    function renderMathRiddles(svgMath) {
        const cellSize = 32;

        gameState.activeMathRiddles.forEach(riddle => {
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

            const opColors = {
                '+': '#22c55e',
                '-': '#f97316',
                '×': '#c084fc',
                '÷': '#38bdf8'
            };

            function drawMathBadge(x, y, symbol, color) {
                const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                circle.setAttribute('cx', x);
                circle.setAttribute('cy', y);
                circle.setAttribute('r', '10');
                circle.setAttribute('fill', '#090d16');
                circle.setAttribute('stroke', color);
                circle.setAttribute('stroke-width', '2');
                svgMath.appendChild(circle);

                const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                text.setAttribute('x', x);
                text.setAttribute('y', y);
                text.setAttribute('text-anchor', 'middle');
                text.setAttribute('dominant-baseline', 'central');
                text.setAttribute('fill', '#ffffff');
                text.setAttribute('font-size', '13');
                text.setAttribute('font-weight', '900');
                text.textContent = symbol;
                svgMath.appendChild(text);
            }

            drawMathBadge(opX, opY, op, opColors[op] || '#fdba74');
            drawMathBadge(eqX, eqY, '=', '#eab308');
        });
    }

    // ==========================================================================
    // Интерактивность, выбор ячейки и ввод цифр
    // ==========================================================================
    function onCellClick(key) {
        const cellData = gameState.grid[key];
        if (!cellData) return;

        // Если сейчас режим Overview, клик по ячейке автоматически фокусируется на её судоку
        if (gameState.mode === 'overview') {
            const targetSudoku = cellData.sudokus[0];
            setFocusSudoku(targetSudoku);
            gameState.selectedKey = key;
            updateHighlights();
            return;
        }

        gameState.selectedKey = key;
        updateHighlights();
    }

    function inputDigit(digit) {
        if (!gameState.selectedKey) return;
        const cellData = gameState.grid[gameState.selectedKey];
        if (!cellData || cellData.initial) return;

        saveHistoryState();

        if (gameState.pencilMode) {
            if (cellData.notes.has(digit)) {
                cellData.notes.delete(digit);
            } else {
                cellData.notes.add(digit);
            }
        } else {
            if (cellData.val === digit) {
                cellData.val = 0;
            } else {
                cellData.val = digit;
                cellData.notes.clear();
            }
        }

        const cellEl = document.querySelector(`.cell[data-key="${gameState.selectedKey}"]`);
        if (cellEl) updateCellView(cellEl, cellData);

        updateHighlights();
        saveToLocalStorage();
        checkVictoryCondition();
    }

    function eraseCurrentCell() {
        if (!gameState.selectedKey) return;
        const cellData = gameState.grid[gameState.selectedKey];
        if (!cellData || cellData.initial) return;

        saveHistoryState();
        cellData.val = 0;
        cellData.notes.clear();

        const cellEl = document.querySelector(`.cell[data-key="${gameState.selectedKey}"]`);
        if (cellEl) updateCellView(cellEl, cellData);

        updateHighlights();
        saveToLocalStorage();
    }

    // Подсветка одинаковых цифр
    function updateHighlights() {
        document.querySelectorAll('.cell').forEach(el => {
            el.classList.remove('selected', 'highlight-match', 'highlight-related');
        });

        if (!gameState.selectedKey) return;
        const selCell = gameState.grid[gameState.selectedKey];
        if (!selCell) return;

        const selEl = document.querySelector(`.cell[data-key="${gameState.selectedKey}"]`);
        if (selEl) selEl.classList.add('selected');

        const activeVal = selCell.val;

        if (activeVal > 0) {
            Object.values(gameState.grid).forEach(c => {
                if (c.val === activeVal) {
                    const el = document.querySelector(`.cell[data-key="${c.r},${c.c}"]`);
                    if (el && el !== selEl) el.classList.add('highlight-match');
                }
            });
        }
    }

    // ==========================================================================
    // Фокусировка и навигация Quick Focus
    // ==========================================================================
    function setFocusSudoku(sudokuId) {
        const v = SUDOKU_VARIANTS[sudokuId];
        if (!v) return;

        gameState.mode = 'focus';
        gameState.activeSudoku = sudokuId;
        document.body.classList.remove('mode-overview');
        document.body.classList.add('mode-focus');

        const overviewBanner = document.getElementById('overview-banner');
        if (overviewBanner) overviewBanner.style.display = 'none';

        const focusTitle = document.getElementById('focus-title');
        const focusBadge = document.getElementById('focus-badge');
        const quickSelect = document.getElementById('quick-jump-select');

        if (focusTitle) focusTitle.textContent = v.name;
        if (focusBadge) focusBadge.textContent = `${v.num} / 8`;
        if (quickSelect) quickSelect.value = sudokuId;

        zoomToSudoku(v);
    }

    function setOverviewMode() {
        gameState.mode = 'overview';
        document.body.classList.add('mode-overview');
        document.body.classList.remove('mode-focus');

        const wrapper = document.getElementById('board-wrapper');
        if (wrapper) {
            wrapper.style.transform = '';
        }

        const overviewBanner = document.getElementById('overview-banner');
        if (overviewBanner && !sessionStorage.getItem('alex_sudoku_banner_closed')) {
            overviewBanner.style.display = 'flex';
        }
    }

    function zoomToSudoku(v) {
        const wrapper = document.getElementById('board-wrapper');
        const viewport = document.getElementById('game-viewport');
        if (!wrapper || !viewport) return;

        const cellSize = 32;
        const centerX = (v.cStart + 4.5) * cellSize;
        const centerY = (v.rStart + 4.5) * cellSize;

        const shiftX = 528 - centerX;
        const shiftY = 528 - centerY;

        const isMobile = window.innerWidth < 700;
        const scale = isMobile ? 1.45 : 1.75;

        wrapper.style.transform = `translate(${shiftX * scale}px, ${shiftY * scale}px) scale(${scale})`;
    }

    function jumpNextSudoku() {
        const current = SUDOKU_VARIANTS[gameState.activeSudoku];
        if (current && current.next) {
            setFocusSudoku(current.next);
        }
    }

    function jumpPrevSudoku() {
        const current = SUDOKU_VARIANTS[gameState.activeSudoku];
        if (current && current.prev) {
            setFocusSudoku(current.prev);
        }
    }

    // ==========================================================================
    // История ходов (Undo / Redo)
    // ==========================================================================
    function saveHistoryState() {
        const snapshot = {};
        Object.entries(gameState.grid).forEach(([k, c]) => {
            snapshot[k] = { val: c.val, notes: new Set(c.notes) };
        });
        gameState.history.push(snapshot);
        if (gameState.history.length > 50) gameState.history.shift();
        gameState.redoStack = [];
    }

    function undoMove() {
        if (gameState.history.length === 0) {
            showToast('Нечего отменять');
            return;
        }

        const currentSnap = {};
        Object.entries(gameState.grid).forEach(([k, c]) => {
            currentSnap[k] = { val: c.val, notes: new Set(c.notes) };
        });
        gameState.redoStack.push(currentSnap);

        const prevSnap = gameState.history.pop();
        applySnapshot(prevSnap);
        showToast('Ход отменен');
    }

    function redoMove() {
        if (gameState.redoStack.length === 0) {
            showToast('Нечего повторять');
            return;
        }

        saveHistoryState();
        const nextSnap = gameState.redoStack.pop();
        applySnapshot(nextSnap);
        showToast('Ход возвращен');
    }

    function applySnapshot(snap) {
        Object.entries(snap).forEach(([k, saved]) => {
            const cell = gameState.grid[k];
            if (cell && !cell.initial) {
                cell.val = saved.val;
                cell.notes = new Set(saved.notes);
                const el = document.querySelector(`.cell[data-key="${k}"]`);
                if (el) updateCellView(el, cell);
            }
        });
        updateHighlights();
        saveToLocalStorage();
    }

    // ==========================================================================
    // Валидация и проверка на ошибки
    // ==========================================================================
    function checkCurrentErrors() {
        let errorCount = 0;
        document.querySelectorAll('.cell.error').forEach(el => el.classList.remove('error'));

        VARIANT_ORDER.forEach(vKey => {
            const v = SUDOKU_VARIANTS[vKey];

            // Строки
            for (let r = v.rStart; r < v.rStart + 9; r++) {
                const seen = {};
                for (let c = v.cStart; c < v.cStart + 9; c++) {
                    const key = `${r},${c}`;
                    const val = gameState.grid[key]?.val;
                    if (val > 0) {
                        if (seen[val]) {
                            markError(key);
                            markError(seen[val]);
                            errorCount++;
                        } else {
                            seen[val] = key;
                        }
                    }
                }
            }

            // Столбцы
            for (let c = v.cStart; c < v.cStart + 9; c++) {
                const seen = {};
                for (let r = v.rStart; r < v.rStart + 9; r++) {
                    const key = `${r},${c}`;
                    const val = gameState.grid[key]?.val;
                    if (val > 0) {
                        if (seen[val]) {
                            markError(key);
                            markError(seen[val]);
                            errorCount++;
                        } else {
                            seen[val] = key;
                        }
                    }
                }
            }

            // Блоки 3x3 (проверяем для всех, кроме Strange Boxes, где блоки фигурные)
            if (vKey !== 'strange_boxes') {
                for (let br = 0; br < 3; br++) {
                    for (let bc = 0; bc < 3; bc++) {
                        const seen = {};
                        for (let dr = 0; dr < 3; dr++) {
                            for (let dc = 0; dc < 3; dc++) {
                                const r = v.rStart + br * 3 + dr;
                                const c = v.cStart + bc * 3 + dc;
                                const key = `${r},${c}`;
                                const val = gameState.grid[key]?.val;
                                if (val > 0) {
                                    if (seen[val]) {
                                        markError(key);
                                        markError(seen[val]);
                                        errorCount++;
                                    } else {
                                        seen[val] = key;
                                    }
                                }
                            }
                        }
                    }
                }
            } else if (gameState.activeJigsawLayout) {
                // Валидация 9 фигурных областей Strange Boxes (Jigsaw)
                for (let regId = 0; regId < 9; regId++) {
                    const seen = {};
                    for (let r = 0; r < 9; r++) {
                        for (let c = 0; c < 9; c++) {
                            if (gameState.activeJigsawLayout[r][c] === regId) {
                                const key = `${v.rStart + r},${v.cStart + c}`;
                                const val = gameState.grid[key]?.val;
                                if (val > 0) {
                                    if (seen[val]) {
                                        markError(key);
                                        markError(seen[val]);
                                        errorCount++;
                                    } else {
                                        seen[val] = key;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (errorCount === 0) {
            showToast('✅ Ошибок не обнаружено!');
        } else {
            showToast(`⚠️ Найдено конфликтов: ${errorCount}`);
        }
    }

    function markError(key) {
        const el = document.querySelector(`.cell[data-key="${key}"]`);
        if (el) el.classList.add('error');
    }

    function checkVictoryCondition() {
        const allFilled = Object.values(gameState.grid).every(c => c.val > 0);
        if (!allFilled) return;

        clearInterval(gameState.timerInterval);
        const victoryModal = document.getElementById('modal-victory');
        const victoryTime = document.getElementById('victory-time');
        const timerText = document.getElementById('timer-text');

        if (victoryTime && timerText) victoryTime.textContent = timerText.textContent;
        if (victoryModal) victoryModal.classList.add('active');
    }

    // ==========================================================================
    // Таймер и Сохранение в LocalStorage
    // ==========================================================================
    function startTimer() {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = setInterval(() => {
            gameState.timerSeconds++;
            const mins = String(Math.floor(gameState.timerSeconds / 60)).padStart(2, '0');
            const secs = String(gameState.timerSeconds % 60).padStart(2, '0');
            const timerEl = document.getElementById('timer-text');
            if (timerEl) timerEl.textContent = `${mins}:${secs}`;
        }, 1000);
    }

    function saveToLocalStorage() {
        try {
            const data = {
                level: gameState.currentLevel,
                timer: gameState.timerSeconds,
                solution: gameState.solution,
                activeKillerCages: gameState.activeKillerCages,
                activeConsecutiveBridges: gameState.activeConsecutiveBridges,
                activeInequalities: gameState.activeInequalities,
                activeMathRiddles: gameState.activeMathRiddles,
                activeJigsawLayout: gameState.activeJigsawLayout,
                cells: {}
            };
            Object.entries(gameState.grid).forEach(([k, c]) => {
                if (c.val > 0 || c.notes.size > 0) {
                    data.cells[k] = { val: c.val, initial: c.initial, notes: Array.from(c.notes) };
                }
            });
            localStorage.setItem('alex_super_sudoku_save', JSON.stringify(data));
        } catch (e) {
            console.warn('LocalStorage error:', e);
        }
    }

    function loadFromLocalStorage() {
        try {
            const raw = localStorage.getItem('alex_super_sudoku_save');
            if (!raw) return false;
            const data = JSON.parse(raw);
            if (!data || !data.cells) return false;

            initBoardData();
            gameState.currentLevel = data.level || 'diff_70';
            gameState.timerSeconds = data.timer || 0;

            if (data.solution) gameState.solution = data.solution;
            if (data.activeKillerCages) gameState.activeKillerCages = data.activeKillerCages;
            if (data.activeConsecutiveBridges) gameState.activeConsecutiveBridges = data.activeConsecutiveBridges;
            if (data.activeInequalities) gameState.activeInequalities = data.activeInequalities;
            if (data.activeMathRiddles) gameState.activeMathRiddles = data.activeMathRiddles;
            if (data.activeJigsawLayout) gameState.activeJigsawLayout = data.activeJigsawLayout;

            Object.entries(data.cells).forEach(([k, saved]) => {
                const cell = gameState.grid[k];
                if (cell) {
                    cell.val = saved.val || 0;
                    cell.initial = !!saved.initial;
                    cell.notes = new Set(saved.notes || []);
                }
            });

            renderCells();
            renderSvgOverlays();
            updateHighlights();
            return true;
        } catch (e) {
            console.warn('Load save error:', e);
            return false;
        }
    }

    // ==========================================================================
    // Модальные окна (Интерактивные правила по разделам, Новая игра)
    // ==========================================================================
    function openRulesModal(tabId = 'all') {
        const modal = document.getElementById('modal-rules');
        const body = document.getElementById('modal-rules-body');
        if (!modal || !body) return;

        switchRulesTab(tabId);
        modal.classList.add('active');
    }

    function switchRulesTab(tabId) {
        const body = document.getElementById('modal-rules-body');
        if (!body) return;

        const info = RULES_DATA[tabId] || RULES_DATA.all;

        document.querySelectorAll('#modal-rules-tabs .tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabId);
        });

        body.innerHTML = `
            <div style="margin-bottom: 14px;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                    <h3 style="margin: 0; color: ${info.color}; font-size: 19px;">${info.title}</h3>
                </div>
                <div style="font-size: 12.5px; color: #94a3b8;">${info.subtitle}</div>
            </div>
            ${info.html}
        `;
    }

    function closeAllModals() {
        document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.remove('active'));
    }

    function showToast(msg) {
        const container = document.getElementById('toast-container');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = msg;
        container.appendChild(toast);
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    // ==========================================================================
    // Инициализация событий и слушателей
    // ==========================================================================
    function setupEventListeners() {
        // Кнопка закрытия начального баннера («×»)
        const bannerCloseBtn = document.getElementById('overview-banner-close');
        const overviewBanner = document.getElementById('overview-banner');
        if (bannerCloseBtn && overviewBanner) {
            bannerCloseBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                overviewBanner.style.display = 'none';
                sessionStorage.setItem('alex_sudoku_banner_closed', 'true');
            });
        }

        // Кнопка правил ❓ в шапке
        const rulesBtn = document.getElementById('btn-open-rules');
        if (rulesBtn) {
            rulesBtn.addEventListener('click', () => openRulesModal('all'));
        }

        // Клик по вкладкам внутри модального окна правил
        const modalTabs = document.getElementById('modal-rules-tabs');
        if (modalTabs) {
            modalTabs.addEventListener('click', (e) => {
                const btn = e.target.closest('.tab-btn');
                if (btn && btn.dataset.tab) {
                    switchRulesTab(btn.dataset.tab);
                }
            });
        }

        // Кнопка новой игры
        const newGameBtn = document.getElementById('btn-new-game');
        const modalNewGame = document.getElementById('modal-new-game');
        if (newGameBtn && modalNewGame) {
            newGameBtn.addEventListener('click', () => modalNewGame.classList.add('active'));
        }

        // Выбор уровня в модальном окне (5 уровней)
        document.querySelectorAll('.level-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const level = btn.dataset.level;
                closeAllModals();
                loadLevel(level);
                setOverviewMode();
            });
        });

        // Победная кнопка новой игры
        const vicNewBtn = document.getElementById('btn-victory-new');
        if (vicNewBtn) {
            vicNewBtn.addEventListener('click', () => {
                closeAllModals();
                if (modalNewGame) modalNewGame.classList.add('active');
            });
        }

        // Закрытие модальных окон
        document.querySelectorAll('[data-close-modal]').forEach(btn => {
            btn.addEventListener('click', () => {
                const modalId = btn.dataset.closeModal;
                const modal = document.getElementById(modalId);
                if (modal) modal.classList.remove('active');
            });
        });

        // Навигация Focus Bar
        const btnBackOverview = document.getElementById('btn-back-overview');
        if (btnBackOverview) btnBackOverview.addEventListener('click', setOverviewMode);

        const navNextBtn = document.getElementById('nav-next-btn');
        if (navNextBtn) navNextBtn.addEventListener('click', jumpNextSudoku);

        const navPrevBtn = document.getElementById('nav-prev-btn');
        if (navPrevBtn) navPrevBtn.addEventListener('click', jumpPrevSudoku);

        const quickSelect = document.getElementById('quick-jump-select');
        if (quickSelect) {
            quickSelect.addEventListener('change', (e) => {
                setFocusSudoku(e.target.value);
            });
        }

        // Кнопка "ℹ️ Правила" в фокус-панели
        const focusInfoBtn = document.getElementById('focus-variant-info-btn');
        if (focusInfoBtn) {
            focusInfoBtn.addEventListener('click', () => {
                openRulesModal(gameState.activeSudoku);
            });
        }

        // Интерактивные плашки-заголовки 8 судоку на самом поле
        document.querySelectorAll('.variant-label-badge').forEach(badge => {
            badge.addEventListener('click', (e) => {
                e.stopPropagation();
                const sudokuId = badge.dataset.sudoku;
                if (e.target.classList.contains('label-info-trigger')) {
                    openRulesModal(sudokuId);
                } else {
                    setFocusSudoku(sudokuId);
                }
            });
        });

        // Цифровые кнопки клавиатуры (Keypad)
        document.querySelectorAll('.digit-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const digit = parseInt(btn.dataset.digit, 10);
                inputDigit(digit);
            });
        });

        // Инструменты: карандаш, ластик, undo, redo, check
        const pencilBtn = document.getElementById('tool-pencil');
        const pencilIndicator = document.getElementById('pencil-indicator');
        if (pencilBtn) {
            pencilBtn.addEventListener('click', () => {
                gameState.pencilMode = !gameState.pencilMode;
                pencilBtn.classList.toggle('active', gameState.pencilMode);
                if (pencilIndicator) {
                    pencilIndicator.textContent = gameState.pencilMode ? 'ВКЛ' : 'ВЫКЛ';
                }
            });
        }

        const eraseBtn = document.getElementById('tool-erase');
        if (eraseBtn) eraseBtn.addEventListener('click', eraseCurrentCell);

        const undoBtn = document.getElementById('tool-undo');
        if (undoBtn) undoBtn.addEventListener('click', undoMove);

        const redoBtn = document.getElementById('tool-redo');
        if (redoBtn) redoBtn.addEventListener('click', redoMove);

        const checkBtn = document.getElementById('tool-check');
        if (checkBtn) checkBtn.addEventListener('click', checkCurrentErrors);

        // Клавиатурные шорткаты
        document.addEventListener('keydown', (e) => {
            if (e.key >= '1' && e.key <= '9') {
                inputDigit(parseInt(e.key, 10));
            } else if (e.key === 'Backspace' || e.key === 'Delete') {
                eraseCurrentCell();
            } else if (e.key === ' ' || e.key === 'n' || e.key === 'N') {
                if (pencilBtn) pencilBtn.click();
            } else if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
                if (e.shiftKey) redoMove();
                else undoMove();
            } else if (e.key === 'y' && (e.ctrlKey || e.metaKey)) {
                redoMove();
            } else if (e.key === 'Escape') {
                closeAllModals();
            }
        });
    }

    // ==========================================================================
    // Старт приложения
    // ==========================================================================
    document.addEventListener('DOMContentLoaded', () => {
        setupEventListeners();

        const hasSave = loadFromLocalStorage();
        if (!hasSave) {
            // По умолчанию начинаем случайную партию легкой сложности (70%)
            loadLevel('diff_70');
        }

        setOverviewMode();
        startTimer();
    });

})();
