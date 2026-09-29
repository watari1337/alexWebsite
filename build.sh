#!/bin/bash

# Выходим сразу, если какая-то команда завершится ошибкой
set -e

echo "Запуск сборки проекта для Debian..."

echo "Очистка папки dist..."
rm -rf dist
mkdir -p dist/css dist/js

# 1. Копируем и сжимаем все HTML файлы
echo "Сборка HTML..."
for html in src/*.html; do
    if [ -f "$html" ]; then
        filename=$(basename "$html")
        echo "  - Обработка $filename"
        tr -d '\r' < "$html" | tr -s ' ' > "dist/$filename"
    fi
done

# 2. Копируем и сжимаем CSS файлы
echo "Сборка CSS..."
for css in src/css/*.css; do
    if [ -f "$css" ]; then
        filename=$(basename "$css")
        echo "  - Обработка $filename"
        sed -E 's/\/\*.*?\*\///g' "$css" | tr -d '\r' > "dist/css/$filename"
    fi
done

# 3. Копируем и оптимизируем JS файлы
echo "Сборка JS..."
for js in src/js/*.js; do
    if [ -f "$js" ]; then
        filename=$(basename "$js")
        echo "  - Обработка $filename"
        sed -E 's/^[[:space:]]*\/\/.*//g' "$js" | tr -d '\r' > "dist/js/$filename"
    fi
done

# 3.1 Копируем JSON файлы (конфигурации, базы решений)
for json in src/js/*.json; do
    if [ -f "$json" ]; then
        filename=$(basename "$json")
        echo "  - Копирование $filename"
        tr -d '\r' < "$json" > "dist/js/$filename"
    fi
done

# 4. Копируем ассеты (картинки, шрифты), если они есть
if [ -d "src/assets" ]; then
    echo "Копирование медиа-файлов..."
    cp -r src/assets dist/
fi

echo "Сборка успешно завершена в папку /dist!"