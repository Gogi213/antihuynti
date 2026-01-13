# Как использовать Claude Code с моделями Opus и Sonnet через Antigravity (Windows)

Инструкция для пользователей Windows, которые хотят использовать Claude Code с мощными моделями Claude Opus и Sonnet практически бесплатно.

---

## Что это и как работает?

**CLIProxyAPIPlus** — бесплатная программа, которая позволяет использовать разные AI-подписки с Claude Code:
- **Antigravity** — даёт доступ к Claude Opus 4.5 и Sonnet 4.5 (наш основной вариант)
- **GitHub Copilot** — если у вас есть подписка (только в Plus версии)
- **Kiro (AWS CodeWhisperer)** — если у вас есть подписка (только в Plus версии)
- Claude Pro/Max — если у вас есть подписка на claude.ai
- ChatGPT Plus/Pro — для моделей GPT
- И другие

**В этой инструкции мы используем Antigravity** — это подписка через Google аккаунт, которая даёт доступ к моделям Claude Opus и Sonnet. По сути — получаем мощные модели Claude практически бесплатно.

**Как это работает:**
```
Вы вводите команду → CLIProxyAPIPlus → Antigravity → Claude Opus/Sonnet → Ответ
```

---

## Что нужно

- **Windows 10/11** (x64 или ARM64)
- **Google аккаунт** — для авторизации в Antigravity
- **Node.js** — для установки Claude Code

---

## Установка (шаг за шагом)

### Шаг 1: Установите Node.js (если ещё нет)

1. Перейдите на сайт: **https://nodejs.org/**
2. Скачайте **LTS версию** для Windows
3. Запустите установщик и следуйте инструкциям
4. После установки откройте **PowerShell** или **Командную строку** и проверьте:
```powershell
node --version
```

### Шаг 2: Установите Claude Code

Откройте PowerShell (от имени администратора) и выполните:
```powershell
npm install -g @anthropic-ai/claude-code
```

### Шаг 3: Скачайте и распакуйте CLIProxyAPIPlus

1. Перейдите: **https://github.com/router-for-me/CLIProxyAPIPlus/releases**
2. Скачайте последнюю версию:
   - Для обычных ПК: **CLIProxyAPIPlus_X.X.X_windows_amd64.zip**
   - Для ARM устройств: **CLIProxyAPIPlus_X.X.X_windows_arm64.zip**
3. Распакуйте архив в удобное место, например: `C:\CLIProxyAPIPlus\`

> Вы получите файл `CLIProxyAPIPlus.exe` и `config.example.yaml`

### Шаг 4: Настройте конфигурационный файл (важно!)

**Этот шаг обязателен**, иначе будет ошибка "invalid API key".

1. В папке `C:\CLIProxyAPIPlus\` найдите файл `config.example.yaml`
2. Переименуйте его в `config.yaml`
3. Откройте `config.yaml` в любом текстовом редакторе (Блокнот, VS Code и т.д.)
4. Найдите секцию `api-keys:` и **закомментируйте её целиком**, добавив `#` в начало каждой строки:

```yaml
# api-keys:
#   - key: "sk-..."
#     description: "My API key"
```

> **Почему это нужно:** Если секция `api-keys:` активна с примерными значениями, прокси пытается использовать их вместо Antigravity и выдаёт ошибку о неверном ключе.

5. Сохраните файл

### Шаг 5: Подключите Antigravity

1. Откройте **PowerShell** или **Командную строку**
2. Перейдите в папку с программой:
```powershell
cd C:\CLIProxyAPIPlus
```
3. Запустите авторизацию Antigravity:
```powershell
.\CLIProxyAPIPlus.exe --antigravity-login
```
4. Откроется браузер — войдите через свой **Google аккаунт**
5. После успешной авторизации вернитесь в терминал и **закройте окно**

> Если браузер не открылся автоматически, добавьте флаг `--no-browser` и скопируйте URL вручную.

### Шаг 6: Запустите прокси-сервер

В той же папке выполните:
```powershell
.\CLIProxyAPIPlus.exe
```

Сервер запустится на порту **8317**. Оставьте это окно открытым!

### Шаг 7: Настройте переменные окружения для Claude Code

#### Вариант 1: Для текущей сессии PowerShell

```powershell
# Opus — самая мощная модель
$env:ANTHROPIC_BASE_URL = "http://localhost:8317"
$env:ANTHROPIC_API_KEY = "sk-cliproxyapi-dummy"
$env:ANTHROPIC_MODEL = "gemini-claude-opus-4-5-thinking"
claude
```

```powershell
# Sonnet — быстрая умная модель
$env:ANTHROPIC_BASE_URL = "http://localhost:8317"
$env:ANTHROPIC_API_KEY = "sk-cliproxyapi-dummy"
$env:ANTHROPIC_MODEL = "gemini-claude-sonnet-4-5-thinking"
claude
```

#### Вариант 2: Создайте BAT-файлы для быстрого запуска

Создайте файл `opus.bat` в удобном месте:
```batch
@echo off
set ANTHROPIC_BASE_URL=http://localhost:8317
set ANTHROPIC_API_KEY=sk-cliproxyapi-dummy
set ANTHROPIC_MODEL=gemini-claude-opus-4-5-thinking
claude
```

Создайте файл `sonnet.bat`:
```batch
@echo off
set ANTHROPIC_BASE_URL=http://localhost:8317
set ANTHROPIC_API_KEY=sk-cliproxyapi-dummy
set ANTHROPIC_MODEL=gemini-claude-sonnet-4-5-thinking
claude
```

Создайте файл `sonnet-no.bat` (без "размышлений"):
```batch
@echo off
set ANTHROPIC_BASE_URL=http://localhost:8317
set ANTHROPIC_API_KEY=sk-cliproxyapi-dummy
set ANTHROPIC_MODEL=gemini-claude-sonnet-4-5
claude
```

Создайте файл `g3.bat` (Gemini 3 Pro):
```batch
@echo off
set ANTHROPIC_BASE_URL=http://localhost:8317
set ANTHROPIC_API_KEY=sk-cliproxyapi-dummy
set ANTHROPIC_MODEL=gemini-3-pro-image-preview
claude
```

> Добавьте папку с BAT-файлами в PATH или запускайте их напрямую.

---

## Как пользоваться

1. **Запустите CLIProxyAPIPlus** (держите окно открытым)
2. **Откройте новое окно PowerShell/CMD** и запустите нужный BAT-файл или выполните команды вручную

| BAT-файл | Модель | Описание |
|----------|--------|----------|
| `opus.bat` | Claude Opus 4.5 | Самая умная модель — для сложных задач |
| `sonnet.bat` | Claude Sonnet 4.5 | Быстрая и умная — для обычной работы |
| `sonnet-no.bat` | Claude Sonnet 4.5 | Без "размышлений" — максимальная скорость |
| `g3.bat` | Gemini 3 Pro | Для работы с картинками |

---

## Какую модель выбрать?

**Для обычной работы:** `sonnet.bat`
Быстрый, справляется с большинством задач.

**Для сложных задач:** `opus.bat`
Самая мощная модель. Архитектура, сложная отладка, анализ большого проекта.

**Когда важна скорость:** `sonnet-no.bat`
Отвечает быстрее, но менее глубоко.

---

## Какие модели даёт Antigravity

Через подписку Antigravity доступны:

| Модель | Описание |
|--------|----------|
| Claude Opus 4.5 | Самая мощная модель Claude (с thinking) |
| Claude Sonnet 4.5 | Быстрая модель Claude (с thinking и без) |
| Gemini 3 Pro | Модель Google с поддержкой изображений |

**Важно:** Модели через Antigravity работают с автоматическим режимом "thinking" (размышления). Вы не можете менять глубину thinking — это контролируется сервером.

---

## Дополнительные провайдеры (Plus версия)

CLIProxyAPIPlus также поддерживает:

### GitHub Copilot (OAuth)
```powershell
.\CLIProxyAPIPlus.exe --copilot-login
```

### Kiro / AWS CodeWhisperer (OAuth)
```powershell
.\CLIProxyAPIPlus.exe --kiro-login
```

---

## Автозапуск сервера

Чтобы сервер запускался автоматически при старте Windows:

1. Нажмите `Win + R`, введите `shell:startup` и нажмите Enter
2. Создайте ярлык на `CLIProxyAPIPlus.exe` в открывшейся папке
3. (Опционально) В свойствах ярлыка выберите "Свёрнуто" в поле "Окно"

---

## Если что-то не работает

### "Invalid API key" или ошибка с ключом
Скорее всего, не настроен конфигурационный файл. См. **Шаг 4**:
1. Переименуйте `config.example.yaml` в `config.yaml`
2. Закомментируйте секцию `api-keys:` (добавьте `#` в начало строк)
3. Сохраните файл и перезапустите CLIProxyAPIPlus

### "Connection refused"
CLIProxyAPIPlus не запущен. Запустите его из папки с программой:
```powershell
cd C:\CLIProxyAPIPlus
.\CLIProxyAPIPlus.exe
```

### "Rate limit" или "Quota exceeded"
Подождите немного — исчерпан лимит запросов.

### "Unauthorized"
Переподключите Antigravity:
```powershell
.\CLIProxyAPIPlus.exe --antigravity-login
```

### Проверить работу CLIProxyAPIPlus
```powershell
curl http://localhost:8317/v1/models
```
или в PowerShell:
```powershell
Invoke-WebRequest -Uri "http://localhost:8317/v1/models"
```

### Брандмауэр Windows блокирует соединение
Разрешите CLIProxyAPIPlus в настройках брандмауэра Windows.

---

## Важно

- **CLIProxyAPIPlus должен быть запущен** перед использованием Claude Code
- **Все данные остаются локально** — безопасно
- **Antigravity использует ваш Google аккаунт** — авторизация через него
- **Plus версия** добавляет поддержку GitHub Copilot и Kiro (AWS CodeWhisperer)

---

## Полезные ссылки

- **Релизы CLIProxyAPIPlus:** https://github.com/router-for-me/CLIProxyAPIPlus/releases
- **Документация:** https://help.router-for.me/
- **Основной репозиторий:** https://github.com/router-for-me/CLIProxyAPI

---

*Если есть вопросы — спрашивайте!*
