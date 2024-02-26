Medestudenten: Rayen Oaf

## Problemen

### Probleem 1: Docstrings in app.py zijn niet duidelijk
De docstrings in app.py zijn niet duidelijk genoeg, waardoor het niet direct
duidelijk is wat de functies/routes doen.

Dit is te verbeteren door:  
Betere docstrings te schrijven.

Gemaakte afweging:  
Veel docstrings konden verduidelijkt worden zonder veel extra werk.
Te uitgebreide docstrings kunnen dan weer de leesbaarheid tegenwerken.

Voorbeelden:  
Docstring voor de api/css_loader route:  
"""Api to send settings data to JavaScript""" vervangen door 
"""API that returns settings data as JSON:
- threshold value in seconds
- threshold behaviour as a string
- timer shape as a string
- colour scheme as an int"""

Docstring voor de api/current_timer route:  
"""Api to send timer data to JavaScript""" vervangen door 
"""API that returns current timer data as JSON:
- id as a unique identifier string
- name as a string
- duration in seconds
- a list of subtimers"""

### Probleem 2: Opsplitsen javascript
De functies in javascript zijn vaak erg groot, met name de startTimers() functie.
Dit komt de leesbaarheid en begrijpelijkheid van de code niet ten goede.

Dit is te verbeteren door:  
Classes te gebruiken en functies verder op te splitsen.

Gemaakte afweging:  
Ik had graag de timers als javascript classes geimplementeerd en functies verder
opgesplitst. Als ik meer tijd had had ik dat zeker gedaan, maar ik heb vooral
tijd gestoken in functionaliteit.

Voorbeelden:  
Een goed voorbeeld van een functie die onoverzichtelijk is geworden is de
startTimers() functie, te vinden in timerscripts.js
