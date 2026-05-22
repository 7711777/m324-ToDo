# Vor- und Nachteile von TDD

**Modul:** M324 – DevOps-Prozesse mit Tools unterstützen
**Autor:** Metehan Celik

---

## Was ist TDD?

Test Driven Development (TDD) ist eine Vorgehensweise beim Programmieren, bei der man zuerst den Test schreibt und erst danach den Code, der diesen Test erfüllt. Der Ablauf folgt dem **Red-Green-Refactor** Prinzip:

1. **Red:** Test schreiben, der fehlschlägt
2. **Green:** Minimalen Code schreiben, damit der Test besteht
3. **Refactor:** Code aufräumen, ohne dass Tests brechen

---

## Vorteile

- **Weniger Bugs:** Fehler werden früh entdeckt, da jede Funktion durch Tests abgesichert ist.
- **Besseres Design:** Man denkt zuerst über das Verhalten nach, bevor man Code schreibt — das führt zu klareren Schnittstellen.
- **Sicheres Refactoring:** Bestehende Tests zeigen sofort, ob eine Änderung etwas kaputt macht.
- **Lebende Dokumentation:** Die Tests beschreiben, was der Code tun soll.
- **Vertrauen in den Code:** Beim Deployen weiss man, dass die wichtigsten Funktionen funktionieren.

---

## Nachteile

- **Mehr Zeitaufwand am Anfang:** Tests zu schreiben kostet zusätzliche Zeit, besonders zu Beginn.
- **Lernkurve:** TDD richtig anzuwenden braucht Übung — gerade das "Test zuerst" denken ist ungewohnt.
- **Tests müssen gepflegt werden:** Bei Änderungen am Code müssen oft auch die Tests angepasst werden.
- **Nicht für alles geeignet:** Bei UI-Code oder Prototypen ist TDD oft umständlich.
- **Falsche Sicherheit:** Tests die bestehen heisst nicht, dass die Software korrekt ist — die Tests könnten unvollständig sein.

---

## Fazit

TDD ist nützlich für stabile, langfristige Projekte. Die zusätzliche Zeit am Anfang spart später viel Aufwand bei Fehlersuche und Refactoring. Für kleine Skripte oder schnelle Prototypen lohnt sich der Aufwand oft nicht.
