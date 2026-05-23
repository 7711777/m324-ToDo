# M324-Projekt

Modul: 324

Autor: Metehan Celik

---

# CI/CD Pipeline mit GitHub Actions

## Ziel

Bei jedem Pull Request soll automatisch geprüft werden, ob sich sowohl das Frontend (React) als auch das Backend (Spring Boot) bauen lassen. Damit wird sichergestellt, dass kein Code in den `main`-Branch gelangt, der nicht baubar ist.

## Funktionsweise

Die Pipeline wird durch jeden **Pull Request** auf den `main`-Branch ausgelöst. Sie besteht aus zwei parallelen Jobs:

1. **build-frontend** — Baut das React-Projekt mit Vite. Daraus entstehen die statischen HTML-, JS- und CSS-Dateien im `dist`-Ordner.
2. **build-backend** — Baut das Spring Boot Projekt mit Maven. Daraus entsteht eine deploybare **WAR**-Datei.

Beide Jobs laufen unabhängig parallel. Wenn beide grün abschliessen, ist die Pipeline erfolgreich und der PR kann gemergt werden.

## Getroffene Entscheidungen

### Docker Images

Anstatt die Tools manuell auf dem GitHub-Runner zu installieren, werden direkt Docker-Images verwendet, die alle benötigten Tools bereits enthalten:

| Job | Image | Begründung |
|---|---|---|
| Frontend | `node:22` | Offizielles Node.js Image. Enthält `node` und `npm` vorinstalliert. Version 22 ist die aktuelle LTS (Support bis April 2027) und kompatibel mit Vite 6 / React 19. |
| Backend | `maven:3.9-eclipse-temurin-21` | Offizielles Maven Image mit Eclipse Temurin JDK 21. Enthält `mvn` und `java` vorinstalliert. JDK 21 ist mit Spring Boot 3.4 kompatibel. |

### Trigger

Die Pipeline wird nur bei **Pull Requests** auf den `main`-Branch ausgelöst (`on: pull_request: branches: [main]`). So wird Code geprüft, bevor er gemergt wird, ohne unnötige Builds bei lokalen Push-Operationen auszulösen.

### Working Directory

Da das eigentliche Projekt im Unterordner `M324_PROJEKT_TODOLIST` liegt, wird in jedem Step das `working-directory` explizit gesetzt.

## Pipeline-Konfiguration

Datei: `.github/workflows/build.yml`

```yaml
name: Build

on:
  pull_request:
    branches: [main]

jobs:
  build-frontend:
    name: Build React Frontend
    runs-on: ubuntu-latest
    container:
      image: node:22

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Install dependencies
        working-directory: M324_PROJEKT_TODOLIST/frontend
        run: npm install

      - name: Build production bundle
        working-directory: M324_PROJEKT_TODOLIST/frontend
        run: npm run build

  build-backend:
    name: Build Spring Boot Backend
    runs-on: ubuntu-latest
    container:
      image: maven:3.9-eclipse-temurin-21

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Build with Maven
        working-directory: M324_PROJEKT_TODOLIST/backend
        run: mvn package -B
```

## Build-Befehle im Detail

### Frontend

```bash
npm install     # Installiert alle dependencies aus package.json
npm run build   # Vite generiert statische HTML/JS/CSS Dateien im dist/ Ordner
```

### Backend

```bash
mvn package -B  # Kompiliert, testet und packt das Spring Boot Projekt
                # -B = batch mode (keine interaktiven Prompts in CI)
```

Maven führt dabei automatisch die Unit-Tests aus. Wenn ein Test fehlschlägt, schlägt der Build fehl und die Pipeline wird rot.

