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
const typeStoreName = "Types";
const abilityeURL = "https://pokeapi.co/api/v2/ability?limit=2000";
const abilityStoreName = "Abilities"

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
    

      var abilityStore = db.createObjectStore(abilityStoreName, { keyPath: 'name' });
      console.log("Created Ability store");
  

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

function PokeCardHtml(character, species, generation,type) {
  var types = character.types.map((type) => `<li class="list-inline-item m-0 badge-circle bg-${type.type.name}"><img class="type-badge" src="images/type-images/${type.type.name}.svg" alt="${type.type.name}"/></li>`).join(``);                      

  var img = character.sprites['front_default'];
  if (!img) {
    img = "/images/image-placeholder.png"
  }
  
  var englishText = species.flavor_text_entries.filter(entry => entry.language.name === "en")[0].flavor_text;
  if(!englishText)
  {
    englishText = species.flavor_text_entries[0].flavor_text;
  }

  var genera = species.genera.filter(entry => entry.language.name === "en")[0].genus;
  if(!genera)
  {
    genera = species.genera[0].genus;
  }

  var evolveFrom = "";
  var stage = "Basic";
  if(species.evolves_from_species)
  {
    evolveFrom = `Evolves From: <span class="capitalize">${species.evolves_from_species.name.replace("-"," ")}</span><br/>`;
    stage = "Stage 1/2";
  }

  var abilities = character.abilities.map(el => el.ability.name.replace("-"," ")).join(",");
  var strongAgainst = "";
  var WeekTov = "";
  
var statHP = character.stats.filter(el => el.stat.name === "hp" )[0].base_stat;
var statDefense = character.stats.filter(el => el.stat.name === "defense" )[0].base_stat;
var statAttack = character.stats.filter(el => el.stat.name === "attack" )[0].base_stat;

  var html = ` 
  <div class="flip-div  mx-auto">
    <div class="flip-main my-1 mx-auto">
      <div class="front mx-auto">
        <div class="card shadow bg-${character.types[0].type.name}" data-id="${character.id}">
          <div class="pokemon-htwt text-center rounded-top font-italic">
                  ${genera}    HT: ${DecimeterToFeetAndInches(character.height)}    WT: ${HectogramToPounds(character.weight)}lbs
          </div>
          <div class="bg-${character.types[0].type.name}-dark rounded-top">
            <img class="card-img-top mx-auto d-block pokemon"  src="${img}" alt="Pokemon Image" />
          </div>   
          <div class="pokemon-stage text-right pr-3 rounded-bottom">
            ${stage}
          </div>        
          <div class="card-body pt-0 bg-${character.types[0].type.name}-light rounded-bottom">
            <div class="pokemon-types">
              <ul class="list-inline types p-0">
                ${types}
              </ul>
            </div>
            <h5 class="card-title text-center capitalize mb-1">${character.name}</h4>              
            <p class="card-text mb-1"><small>${englishText}</small></p>
            <p class="card-text mb-1">
              <small>
                <span class="capitalize">${species.generation.name.replace("-"," ")}</span><br/>
                Region: <span class="capitalize">${generation.main_region.name}</span><br/>
                ${evolveFrom}               
              </small>
            </p>
          </div>
        </div>
      </div>
      <div class="back mx-auto">
        <div class="card shadow bg-${character.types[0].type.name}" data-id="1">
          <div class="card-body bg-${character.types[0].type.name}-light rounded">
            <small>HP</small>
            <div class="progress my-1">
              <div class="progress-bar bg-info" role="progressbar" style="width: ${Math.floor(statHP/255*100)}%;" aria-valuenow="${statHP}" aria-valuemin="0" aria-valuemax="255">${statHP}</div>
            </div>
            <small>ATTACK</small>
            <div class="progress my-1">
              <div class="progress-bar bg-success" role="progressbar" style="width: ${Math.floor(statAttack/255*100)}%;" aria-valuenow="${statAttack}" aria-valuemin="0" aria-valuemax="255">${statAttack}</div>
            </div>
            <small>DEFENSE</small>
            <div class="progress my-1">
              <div class="progress-bar bg-danger" role="progressbar" style="width: ${Math.floor(statDefense/255*100)}%;" aria-valuenow="${statDefense}" aria-valuemin="0" aria-valuemax="255">${statDefense}</div>
            </div>
            <div>            
              Strong against:<br/>
              Weak To:<br/>
            </div>
            <div>            
              Abilities: ${abilities}
            </div>  
          </div>
        </div>
      </div>
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

    tx = db.transaction(typeStoreName);
    dbStore = tx.objectStore(typeStoreName);
    var type = await dbStore.get(character.types[0].type.name)

    return PokeCardHtml(character,species,generation,type)          
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
  var msg = document.getElementById("statusMessage");
  el.addEventListener('input', debounce(()=>{
      var res;
      if(!el || !el.value || el.value.trim() ==="")
      {
        res = data;
      }
      else
      {
        res = data.filter((val) => {
            return val.name.toLowerCase().startsWith(el.value.toLowerCase().trim())  || 
                   val.types.findIndex(
                     type => type.type.name.toLowerCase().startsWith(el.value.toLowerCase().trim())
                   )>-1
            });        
      }
      
      msg.innerHTML = `found [${res.length}] matching items`;
      

      BuildPokemonCards(db,res)
      .then((html) => {
        container.innerHTML = html;
        attachFlipHander();
      }
      );
    },750));
}

function attachFlipHander(){
  var cards = document.querySelectorAll(".flip-div");
  for (const div of cards) {
    div.addEventListener('click', function(event) {
      this.classList.toggle("flipped");
    })
  }
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
    var speciesData;
    var generationData;
    var typeData;
    var abilityData;
    LoadApiData(db,pokemonStoreName,pokemonURL)
      .then((pokemon) => {
        pokemonData = pokemon;
        return LoadApiData(db,speciesStoreName,speciesURL);
      })
      .then((species) => {
        speciesData = species;
        return LoadApiData(db,generationStoreName,generationURL);
      })
      .then((generations) => {
        generationData = generations;
        return LoadApiData(db,typeStoreName,typeURL);
      })
      .then((types) => {
        typeData = types;
        return LoadApiData(db,abilityStoreName,typeURL);
      })
      .then((abilities) => {               
        abilityData = abilityData;
        return BuildPokemonCards(db, pokemonData);
      })
      .then((html)=>{
        initSearch(db,pokemonData);        
        document.getElementById(containerName).innerHTML = html;
        attachFlipHander();
        hideLoading();
      });
  })
}

init("pokemonCardDeck");

