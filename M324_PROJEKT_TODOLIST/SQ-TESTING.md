# Testing & TDD

**Modul:** M324 – DevOps-Prozesse mit Tools unterstützen  
**Autor:** Metehan Celik  
**Datum:** 22.05.2026

---

## Unit-Tests für bestehenden Code

Als erstes wurden Unit-Tests für den bereits bestehenden Code geschrieben. Ziel war es, das bestehende Verhalten des Backends zu prüfen.

### Test 1 – Anwendung startet korrekt

Prüft ob der Spring-Kontext fehlerfrei geladen wird.

```java
@Test
void contextLoads() {
    assertTrue(true);
}
```

### Test 2 – Task Getter/Setter

Prüft ob die `Task`-Klasse den Wert korrekt speichert und zurückgibt.

```java
@Test
void testTaskDescription() {
    Task task = new Task();
    task.setTaskdescription("Einkaufen");
    assertEquals("Einkaufen", task.getTaskdescription());
}
```

### Test 3 – GET-Endpoint mit MockMvc

Prüft ob der REST-Endpoint `GET /` mit HTTP 200 antwortet.

```java
@Test
void testGetEndpointReturnsOk() throws Exception {
    mockMvc.perform(get("/"))
           .andExpect(status().isOk());
}
```

*Bild einfügen (Screenshot des Test-Codes aus DemoApplicationTests.java)*

---

## TDD – Test Driven Development

### Schritt 1: Failing Test schreiben

Zuerst wurde ein Test geschrieben für eine Funktionalität, die noch nicht existiert: das automatische Speichern des Erfassungsdatums beim Erstellen eines Tasks.

```java
@Test
void testTaskHasCreationDate() {
    Task task = new Task();
    assertNotNull(task.getCreatedAt(), "Task soll ein Erfassungsdatum haben");
}
```

Dieser Test schlägt fehl, da `getCreatedAt()` in der `Task`-Klasse noch nicht existiert.

### Schritt 2: Funktionalität implementieren

Die `Task`-Klasse wurde erweitert: ein `createdAt`-Feld wird beim Instanziieren automatisch mit dem aktuellen Datum befüllt.

```java
private String createdAt;

public Task() {
    this.createdAt = LocalDate.now().toString();
}

public String getCreatedAt() { return createdAt; }
public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
```

*Bild einfügen (Screenshot des Codes aus Task.java mit dem neuen createdAt-Feld)*

### Schritt 3: Alle Tests bestehen

Nach der Implementierung wurden alle 4 Tests mit einem einzigen Aufruf ausgeführt:

```bash
mvn test
```

*Bild einfügen (mvn test Ausgabe, alle Tests grün)*

---

## Applikation startet fehlerfrei

Nach allen Anpassungen wurde die Applikation gestartet, um zu prüfen ob keine Spring-Boot- oder Coding-Probleme bestehen:

```bash
mvn spring-boot:run
```

*Bild einfügen (Konsolen-Screenshot der gestarteten Applikation, "Started DemoApplication" sichtbar)*

---

## Test-Konfiguration

Für die Tests wird eine separate `application.properties` unter `src/test/resources/` verwendet, damit die Tests mit einer In-Memory H2-Datenbank laufen und nicht die produktive Datei beeinflussen:

```properties
spring.datasource.url=jdbc:h2:mem:testdb
spring.jpa.hibernate.ddl-auto=create-drop
```

---

## Übersicht aller Tests

| Test | Beschreibung | Ergebnis |
|---|---|---|
| `contextLoads` | Spring-Kontext startet korrekt | ✅ |
| `testTaskDescription` | Task Getter/Setter funktioniert | ✅ |
| `testGetEndpointReturnsOk` | GET "/" gibt HTTP 200 zurück | ✅ |
| `testTaskHasCreationDate` | Task hat Erfassungsdatum | ✅ |
