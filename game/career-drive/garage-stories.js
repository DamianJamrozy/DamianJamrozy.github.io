// @ts-check

/** @typedef {{pl:string,en:string}} Localized */
/** @typedef {{id:'cmax'|'focus',title:Localized,introduction:Localized,details:Localized}} GarageStory */

/** Personal car stories supplied by the CV owner. Purchase dates are intentionally unspecified.
 * @type {readonly GarageStory[]}
 */
export const GARAGE_STORIES=Object.freeze([
  {
    id:'cmax',
    title:{pl:'Mój pierwszy samochód - Ford C-Max',en:'My first car - Ford C-Max'},
    introduction:{
      pl:'W tym okresie dorobiłem się pierwszego własnego samochodu.',
      en:'Around this time, I bought my first car of my own.'
    },
    details:{
      pl:'Wybrałem C-Maxa z 2009 roku. Czarny minivan, diesel, 115 KM. Przy zakupie miał prawie 200 000 km na liczniku.',
      en:'I chose a 2009 C-Max: a black MPV with a 115 hp diesel engine. It had almost 200,000 km on the clock when I bought it.'
    }
  },
  {
    id:'focus',
    title:{pl:'Część marzenia - Ford Focus ST',en:'A part of the dream - Ford Focus ST'},
    introduction:{
      pl:'Zawsze marzył mi się Focus RS. To Ken Block zapoczątkował moją miłość do tego auta. W końcu kupiłem Focusa ST z 2018 roku, sprowadzonego z USA. Kosztował 70 tysięcy złotych, dużo mniej niż RS, a miał ten sportowy wygląd i brzmienie, których szukałem. Dla mnie to takie małe spełnienie marzenia.',
      en:'I always wanted a Focus RS. Ken Block started my love for that car. Eventually I bought a 2018 Focus ST imported from the USA. It cost PLN 70,000, much less than an RS, and had the sporty looks and sound I was after. For me, that was a little dream coming true.'
    },
    details:{
      pl:'Mam szaro-perłowego hatchbacka z benzynowym silnikiem turbo. Seryjnie miał 250 KM, po modyfikacjach ponad 300 KM. Do tego blow-off i sportowy wydech. Kawałek dalej jest zamknięty tor. Tam mogę sprawdzić, jak się prowadzi.',
      en:'I have a grey-pearl hatchback with a turbocharged petrol engine. It had 250 hp stock and makes more than 300 hp after modifications. There is a blow-off valve and a sporty exhaust too. A little further along is a closed circuit where I can put its handling to the test.'
    }
  }
]);
