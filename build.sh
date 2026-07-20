#!/bin/bash

# Выходим сразу, если какая-то команда завершится ошибкой
set -e

echo "Запуск сборки проекта..."

echo "Очистка папки dist..."
rm -rf dist
mkdir -p dist/css dist/js

# 2. "Минифицируем" и копируем HTML
# Удаляем лишние переносы строк и пробелы (простая сборка)
echo "Сборка HTML..."
tr -d '\n\r' < src/index.html | tr -s ' ' > dist/index.html

# 3. Копируем и сжимаем CSS
# Удаляем комментарии /* ... */ и лишние пробелы
echo "Сборка CSS..."
sed -E 's/\/\*.*?\*\///g' src/css/style.css | tr -d '\n\r' | tr -s ' ' > dist/css/style.css

# 4. Копируем и сжимаем JS
# Удаляем однострочные комментарии //
echo "Сборка JS..."
sed -E 's/\/\/.*//g' src/js/main.js | tr -d '\n\r' | tr -s ' ' > dist/js/main.js

# 5. Копируем ассеты (картинки, шрифты), если они есть
if [ -d "src/assets" ]; then
    echo "Копирование медиа-файлов..."
    cp -r src/assets dist/
fi

echo "Сборка успешно завершена в папку /dist!"