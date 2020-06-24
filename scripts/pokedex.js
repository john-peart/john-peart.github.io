//WRAPPER FOR ADDING PROMSIES TO IndexedDB API - https://github.com/jakearchibald/idb
import { openDB, deleteDB, wrap, unwrap } from './idb.js';

export default function Pokedex(container) {
  this._dbPromise = openDatabase();
  //this._registerServiceWorker();
}

const pokemonURL = "https://pokeapi.co/api/v2/pokemon?limit=5000";
const pokemonStoreName = "Pokemon";
const speciesURL = "https://pokeapi.co/api/v2/pokemon-species?limit=1000";
const speciesStoreName = "Species";
const generationURL = "https://pokeapi.co/api/v2/generation?limit=5000";
const generationStoreName = "Generations";
const typeURL = "https://pokeapi.co/api/v2/type?limit=100";
const typeStoreName = "Types"

function openDatabase() {
  // If the browser doesn't support service worker,
  // we don't care about having a database
  if (!navigator.serviceWorker) {
    console.log("Service worker not supported. Will not attempt to open the database");
    return Promise.resolve();
  }

  var dbPromise = openDB('pokedex', 1, {
    upgrade(db, oldVersion, newVersion, transaction) {

      console.log("Initializing DB");

      var pokemonStore = db.createObjectStore(pokemonStoreName, { keyPath: 'id' });
      console.log("Created Pokemon store");
      pokemonStore.createIndex('name', 'name');
      pokemonStore.createIndex('order', 'order');
      console.log("Created index on Pokemon object store");

      var speciesStore = db.createObjectStore(speciesStoreName, { keyPath: 'name' });
      console.log("Created Species store");
      speciesStore.createIndex("id", "id");
      speciesStore.createIndex("order", "order");
      console.log("Created index on Sepecies object store");

      var generationStore = db.createObjectStore(generationStoreName, { keyPath: 'name' });
      console.log("Created Generations store");
      generationStore.createIndex("id", "id");
      console.log("Created index on Generations object store");

      var generationStore = db.createObjectStore(typeStoreName, { keyPath: 'name' });
      console.log("Created Type store");
      generationStore.createIndex("name", "name");
      console.log("Created index on Type object store");
    }
  });
  return dbPromise;
}

function HectogramToPounds(weigth) {
  const hectogramsToPounds = 0.220462
  return Math.round(weigth * hectogramsToPounds);
}

function DecimeterToFeetAndInches(height) {
  const decimeterToFeet = 0.3280839895;
  var valueInFeet = height * decimeterToFeet;
  var feet = Math.floor(valueInFeet);
  var inches = Math.round((valueInFeet - feet) * 12);
  return `${feet}' ${inches}"`;
}

function PokeCardHtml(character, species, generation) {
  var types = character.types.map((type) => `<span class="capitalize badge badge-${type.type.name} mr-1 px-3 py-1">${type.type.name}</span>`).join(``);
  var img = character.sprites['front_default'];
  if (!img) {
    img = "/images/image-placeholder.png"
  }
  
  var englishText = species.flavor_text_entries.filter(entry => entry.language.name === "en")[0].flavor_text;
  if(!englishText)
  {
    englishText = species.flavor_text_entries[0].flavor_text;
  }

  var html = ` 
    <div class="card shadow mx-auto my-1 bg-${character.types[0].type.name}" data-id="${character.id}">
      <div class="bg-${character.types[0].type.name}-dark rounded-top">
        <img class="card-img-top mx-auto d-block pokemon"  src="${img}" alt="Pokemon Image" />
      </div>          
      <div class="card-body bg-${character.types[0].type.name}-light rounded-bottom">
          <div class="pokemon-types">
            ${types}
          </div>
          <h4 class="card-title text-center capitalize mb-1">${character.name}</h4>              
          <p class="card-text mb-1"><small>${englishText}</small></p>
          <p class="card-text mb-1"><small>
            ${species.generation.name}<br/>
            Height: ${DecimeterToFeetAndInches(character.height)}<br/>
            Weight: ${HectogramToPounds(character.weight)}lbs<br>
            Region: ${generation.main_region.name}
            </small>
          </p>
      </div>
    </div>
  `;
  return html;
}

function LoadJSON(url) {
  return fetch(url)
    .then(response => response.json())
}

function LoadApiData(db,storeName,url, forceReload){
  console.log("Loading " + storeName);

  var results;
  return LoadJSON(url)
    .then(async function (apiData) {

      var tx = db.transaction(storeName);
      var dbStore = tx.objectStore(storeName);
      let dbData = await dbStore.getAll();

      //see if the number of results in index DB matches the number returned by the API
      if (forceReload || !dbData || dbData.length < apiData.results.length) {
        //update from the API because we don't have any OR there are  entries we don't have
        console.log("Updating IndexDB store " + storeName + " from " + url);
        const promises = [];
        apiData.results.forEach(item => {
          promises.push(fetch(item.url).then((res) => res.json()));
        });
        return Promise.all(promises).then(function (results) {
          var tx = db.transaction(storeName, "readwrite");
          var store = tx.objectStore(storeName);
          results.forEach(item => {
            store.put(item);
          });
          return results;
        });
      }
      else {
        console.log("Using cached IndexDB data for store " + storeName);
        return dbData;
      }

    })
}

async function BuildPokemonCards(db,pokemon){

  var htmlArr = pokemon.map(async (character) => {
    let tx = db.transaction(speciesStoreName);
    var dbStore = tx.objectStore(speciesStoreName);
    var species = await dbStore.get(character.species.name);

    tx = db.transaction(generationStoreName);
    dbStore = tx.objectStore(generationStoreName);              
    var generation = await dbStore.get(species.generation.name)

    return PokeCardHtml(character,species,generation)          
  })
  
  return Promise.all(htmlArr)

}

function hideLoading() {
  document.getElementById("loading").classList.add("d-none");
  document.getElementById("pokemonContainer").classList.remove("d-none");
}

function debounce(callback, wait) {
  let timeout;
  return (...args) => {
      const context = this;
      clearTimeout(timeout);
      timeout = setTimeout(() => callback.apply(context, args), wait);
  };
}

function initSearch(db, data){
  const container = document.getElementById("pokemonCardDeck");
  var el = document.getElementById("searchBox");
  el.addEventListener('input', debounce(()=> {
      var res;
      if(!el || !el.value || el.value.trim() ==="")
      {
        res = data;
      }
      else
      {
        res = data.filter((val) => {
            return val.name.startsWith(el.value.trim()) || 
                   val.types.findIndex(type => type.type.name.startsWith(el.value.trim()))>-1});        
      }
      
      BuildPokemonCards(db,res)
      .then((html) => {
        container.innerHTML = html}
      );
    },500))
}

function init(containerName) {

  var dbPromise = openDatabase();
  
  dbPromise.then(function (db) {
    if (!db) {
      console.log(db);
      console.log("DB not defined");
    }
    else {
      db.resolve;      
    }

    var pokemonData;
    LoadApiData(db,pokemonStoreName,pokemonURL)
      .then((pokemon) => {
        pokemonData = pokemon;
        return LoadApiData(db,speciesStoreName,speciesURL);
      })
      .then(() => {
        return LoadApiData(db,generationStoreName,generationURL);
      })
      .then(() => {
        return LoadApiData(db,typeStoreName,typeURL);
      })
      .then(() => {               
        return BuildPokemonCards(db, pokemonData);
      })
      .then((html)=>{
        initSearch(db,pokemonData);
        document.getElementById(containerName).innerHTML = html;
        hideLoading();
      });
  })
}

init("pokemonCardDeck");

