## Waar ik het meest trots op ben

Het meest trots ben ik over het voorbeeld op de settings pagina.
Dit was het laatste wat ik heb toegevoegd, en was een hele klus
om werkend te krijgen. Zo moest ik ineens mijn javascript modulair
maken, omdat examples.js en timerscripts.js functies en variabelen
van elkaar nodig hadden. Dit zorgde ervoor dat ik een aantal andere
dingen ook anders moest oplossen, met name alle onClick aspecten die
niet meer werkten. De opmaak van de voorbeeld sectie kan nog een
beetje aandacht gebruiken, maar ik ben heel blij dat ik het werkend
heb gekregen.

## Grote beslissingen

### Zorgen dat subtimers ook tegelijkertijd kunnen lopen

Op advies van Rayen heb ik ervoor gezorgd dat meerdere subtimers
tegelijkertijd kunnen lopen. Dit zorgde ervoor dat ik helemaal opnieuw
na moest denken over hoe ik mijn timers en subtimers definieerde in 
javascript. Zo werden mijn subtimers en main timer toen een object, met
attributen als een duration, running, countUp, om bij te houden of de
timer actief was, en of deze aan het optellen was of niet.

### Zorgen dat zoveel mogelijk functionaliteit beschikbaar
### is zonder in te loggen

Om ervoor te zorgen dat zoveel mogelijk functies beschikbaar is zonder
in te loggen moest ik onder andere uitzoeken hoe cookies werken in Flask,
opdat ik bij kan houden welke computer de app gebruikt en welke instellingen
er gebruikt moeten worden. Uiteindelijk heeft dit ervoor gezorgd dat de
huidige versie helemaal geen inloggen nodig heeft. Ik zou dit graag nog
toevoegen, opdat gebruikers favoriete timers en recente timers gemakkelijk
terug kunnen vinden, maar daar had ik helaas geen tijd meer voor.


Verder heb ik niet veel grote beslissingen genomen, en ben ik steeds
heel dicht bij mijn originele idee gebleven. Dit kwam grotendeels omdat ik
vantevoren een heel duidelijk idee had van wat ik wilde doen, en ook al een
aardig idee had hoe. Dat ik veel javascript zou gaan gebruiken was me al
duidelijk, maar door het weglaten van registratie en inloggen is mijn
project uiteindelijk bijna voor de helft javascript geworden. In de toekomst
zou ik zoals gezegd graag meer functies toevoegen, naast een gebruikerspagina
met favoriete en recente timers ook een save timer knop waar iedereen (ook
niet ingelogde gebruikers) hun timer kunnen 'opslaan' doordat er een link
naar de timer wordt gemaild.