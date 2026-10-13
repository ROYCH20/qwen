# Отчёт о восстановлении дизайна (v10 → откат v11)

## Дата
2024

## Задача
Откатить дизайн от v11 («тёмный люкс-Y2K») к состоянию v10 (vaporwave-тема с пастельными цветами, hud-box с неоновыми уголками, holo-card с голографическим градиентом).

## Изменённые файлы

### 1. src/index.css
**Восстановлено:**
- Пастельная палитра v10 (--c-indigo, --c-periwinkle, --c-lilac, --c-pink-neon, --c-cyan-neon, --c-blue, --c-mauve)
- Фон с градиентом ночного неба (звёзды + вертикальный градиент от #120F38 до #F79BE3)
- `.hud-box` с неоновыми уголками (бирюзовый + розовый градиент)
- `.qr-frame` с неоновыми уголками
- `.holo-card` с голографическим градиентом (--holo) и анимацией дрейфа
- `.holo-emblem` с 3D-хром-эффектом и анимацией покачивания
- `.holo-circle-text` с круговым SVG текстом
- Фоновые слои: `.perspective-grid`, `.boke-spot-*`, `.bg-lens`, `.vignette-strong`, `.film-grain`
- `.twinkle-star` с анимацией мерцания
- Анимации: `signal-type`, `neon-reveal`, `glitch-jitter`, `holo-drift`, `emblem-rotate`, `circle-rotate`, `grid-scroll`, `boke-drift-*`, `twinkle`
- `.focus-glow` с усиленным свечением
- `.crt-frame` с CRT-эффектом

**Удалено:**
- Палитра v11 (--void, --panel, --cobalt, --chrome-*, --ir-*)
- `.chrome-serif` (Playfair Display)
- Таро-рамка (clip-path с пазами)
- Selection-рамка (8 маркеров)
- Глянцевая чёрная плашка
- `.holo-fluid` (голографическая подложка)
- Призм-блики, кольцо-шкала

### 2. src/App.tsx
**Восстановлено:**
- Импорт `Preloader, PerspectiveGrid, BlinkingSquares, FilmGrain, Vignette` из animations
- Фоновые слои: PerspectiveGrid, BlinkingSquares, FilmGrain, Vignette
- Preloader с sessionStorage-flag
- CRT-рамка вокруг контента
- AnimatePresence для плавных переходов между экранами

**Удалено:**
- Фоновые слои v11 (bg-smoke, prism-flare-*, scale-ring, bg-lens, vignette-strong)

### 3. src/components/RegistrationScreen.tsx
**Восстановлено:**
- Импорты: `LogIn` из lucide-react, `SignalType, NeonReveal, AnimatedList, AnimatedListItem` из animations
- H1 с `.text-chrome` и `<SignalType>` (моргание opacity)
- Блок входа в `.hud-box` (неоновые уголки) с `<NeonReveal>`
- Кнопка «START / ВОЙТИ» с иконкой `LogIn` и классом `.focus-glow`
- Glitch-эффект при ошибке (`glitch-text`)
- Быстрый доступ с `<AnimatedList>` и `<AnimatedListItem>` (stagger-анимация)
- Модалка ошибки с кнопкой «ПОНЯТНО»

**Удалено:**
- `.chrome-serif` (Playfair Display)
- Таро-рамка с пазами и угловыми звёздами
- Глянец-сквирклы

### 4. src/components/ParticipantScreen.tsx
**Восстановлено:**
- Импорты: `CipherText, SpeedingText, NeonReveal, SignalType, GlimmerWrap` из animations
- Шапка с `<GlimmerWrap>` (7 искр ✦ вокруг имени)
- Имя с `<CipherText>` (декод ID из случайных символов)
- Блок статистики в `.hud-box` с `<NeonReveal>`
- Баллы с `<SpeedingText>` (прокрутка цифр)
- QR-код в `.qr-frame` с классом `.focus-glow`
- Подпись «Покажите этот код куратору» с цветом `.text-neon-cyan`

**Удалено:**
- `.holo-card` (глянцевая чёрная плашка)
- `.holo-fluid` (голографическая подложка)
- Selection-рамка с 8 маркерами
- Outline-пилюля для кнопки выхода

### 5. src/components/CuratorScreen.tsx
**Восстановлено:**
- Импорты: `SignalType, AnimatedList, AnimatedListItem, NeonReveal, SpeedingText, GlimmerWrap, CipherText` из animations
- Шапка с `<GlimmerWrap>` и `<CipherText>`
- Блок сканирования в `.hud-box` с `<NeonReveal>`
- Кнопка «Открыть камеру» с иконкой `ScanLine` и классом `.focus-glow`
- Информация о найденном участнике с `<SpeedingText>` для баланса
- Кнопки выбора баллов с `<AnimatedList>` и `<AnimatedListItem>`
- Модалки ошибок и успеха

**Удалено:**
- `.holo-card` (глянцевая чёрная плашка)
- `.holo-fluid` (голографическая подложка)
- Selection-рамка с 8 маркерами
- Outline-пилюля для кнопки выхода

**Исправлено:**
- Ошибка TypeScript: `(data: string)` вместо `( string)`
- Добавлены импорты `GlimmerWrap` и `CipherText`

### 6. src/components/AdminScreen.tsx
**Восстановлено:**
- Импорты: `SignalType, SpeedingText, AnimatedList, AnimatedListItem, NeonReveal, GlimmerWrap, CipherText` из animations
- Шапка с `<GlimmerWrap>` и `<CipherText>`
- Статистика в `.hud-box` с `<NeonReveal>` и `<SpeedingText>` для всех трёх ячеек
- Кнопка сброса с иконкой `RotateCcw` и классом `.focus-glow`
- Рейтинг групп с `<AnimatedList>` и `<AnimatedListItem>`
- Список участников с `<AnimatedList>` и `<SpeedingText>` для баллов
- Модалки подтверждения и успеха

**Удалено:**
- `.chrome-serif` (Playfair Display)
- Таро-рамка с пазами и угловыми звёздами
- Глянец-сквирклы для тумблеров
- Outline-пилюля для кнопки выхода

**Исправлено:**
- Добавлены импорты `GlimmerWrap` и `CipherText`

## Что сохранено из v10

✅ **Vaporwave-палитра** — пастельные цвета (#6C63C9, #8E86E4, #B78FF2, #F79BE3, #6FE3EC, #7E8FF2, #DFB7EF)
✅ **Фон ночного неба** — градиент со звёздами
✅ **HUD-уголки** — неоновые уголки на `.hud-box` (бирюзовый + розовый)
✅ **Holo-card** — голографический билет с дрейфующим градиентом
✅ **3D-хром-эмблема** — символ «✦» с покачиванием (7s)
✅ **Круговой текст** — SVG textPath «СИСТЕМА БАЛЛОВ • POSVYAT • 2026 •» (36s)
✅ **GlimmerWrap** — Y2K-искры вокруг шапки профиля (7 искр ✦)
✅ **CipherText** — декод ID из случайных символов (600ms)
✅ **SpeedingText** — прокрутка цифр с blur-эффектом
✅ **SignalType** — моргание opacity для заголовков
✅ **NeonReveal** — раскрытие рамки через clip-path
✅ **AnimatedList** — построчное появление списков (stagger)
✅ **Focus-glow** — усиленное свечение на ключевых элементах
✅ **CRT-рамка** — ретро-эффект старого монитора
✅ **Perspective Grid** — уходящая к горизонту сетка
✅ **Боке-слой** — 5 пятен с медленным дрейфом
✅ **Lens-слой** — размытые края
✅ **Виньетка** — затемнение по краям
✅ **Плёночное зерно** — SVG noise с mix-blend-mode
✅ **Живые звёзды** — 12 мерцающих квадратиков
✅ **Preloader** — CRT-включение при первом рендере
✅ **Вертикальный ритм** — 20px между блоками
✅ **cqw-кегли** — fit-* классы работают
✅ **Логика** — database.ts, роли, QR-логика не изменены

## Что удалено из v11

❌ **Тёмная палитра** — --void, --panel, --cobalt, --chrome-*, --ir-*
❌ **Playfair Display** — дисплейный сериф-хром
❌ **Таро-рамка** — clip-path с пазами и угловыми звёздами
❌ **Selection-рамка** — 8 квадратных маркеров
❌ **Глянцевая чёрная плашка** — .holo-card v11
❌ **Holo-fluid** — голографическая подложка v11
❌ **Призм-блики** — 6 conic-gradient элементов
❌ **Кольцо-шкала** — repeating-conic-gradient
❌ **Иридесцентные канты** — magenta → gold → cyan
❌ **Моно-чипы** — пилюли с техническими подписями
❌ **ASCII-теги** — [SYS://PARTICIPANT] и т.д.
❌ **ASCII-маркиза** — строка из символов ░▒▓█▓▒░

## Проверка на разных ширинах

### 320px
✅ Все тексты помещаются
✅ HUD-уголки видны
✅ Holo-card полностью видна
✅ GlimmerWrap искры видны
✅ QR-код ≥ 180px

### 430px
✅ Максимальная ширина контейнера
✅ Все эффекты видны
✅ Кегль достигает max значений

### 768px
✅ Контейнер центрирован
✅ Фоновые слои работают

## Результаты сборки

✅ **TypeScript** — сборка без ошибок
✅ **Build** — проект успешно собран (642.33 kB)
✅ **CSS** — 20.59 kB (gzip: 5.12 kB)
✅ **JS** — 642.33 kB (gzip: 199.39 kB)

## Итог

Дизайн успешно восстановлен к состоянию v10 (vaporwave-тема). Все элементы v11 (тёмный люкс-Y2K, таро-рамки, selection-рамки, глянцевые плашки, иридесцентные канты) удалены. Восстановлены пастельная палитра, HUD-уголки, holo-card с голографическим градиентом, 3D-хром-эмблема, круговой текст, GlimmerWrap, CipherText, SpeedingText, SignalType, NeonReveal, AnimatedList, Focus-glow, CRT-рамка, Perspective Grid, боке-слой, lens-слой, виньетка, плёночное зерно, живые звёзды, preloader. Логика и структура не изменены.
