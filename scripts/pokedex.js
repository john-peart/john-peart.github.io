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

function getStengthsAndWeekness(typeArr)
{
  var res = {};
  res.double_damage_to = [];
  res.double_damage_from = [];
  res.half_damage_to = [];
  res.half_damage_from = [];

  typeArr.forEach((t) => {
    res.double_damage_to.push(...t.damage_relations.double_damage_to.map(el => el.name));
    res.half_damage_to.push(...t.damage_relations.half_damage_to.map(el => el.name));
    res.double_damage_from.push(...t.damage_relations.double_damage_to.map(el => el.name));
    res.half_damage_from.push(...t.damage_relations.double_damage_to.map(el => el.name));
  })
  
  return res;
  
}

function PokeCardHtml(character, species, generation,types, abilities, maxStats) {
  var typesHtml = character.types.map((type) => `<li class="list-inline-item m-0 badge-circle bg-${type.type.name}"><img class="type-badge" src="images/type-images/${type.type.name}.svg" alt="${type.type.name}"/></li>`).join(``);                      

  var damageRelations = getStengthsAndWeekness(types);
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
var statSpeed = character.stats.filter(el => el.stat.name === "speed" )[0].base_stat;
var statSAttack = character.stats.filter(el => el.stat.name === "special-attack" )[0].base_stat;
var statSDefense = character.stats.filter(el => el.stat.name === "special-defense" )[0].base_stat;

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
                ${typesHtml}
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
            <table class="stats">
              <tbody>
                <tr>
                  <td class="col-stat-label small">HP</td>
                  <td class="col-stat-progress">
                    <div class="progress stat-progress my-1">
                      <div class="progress-bar bg-info" role="progressbar" style="width: ${Math.floor(statHP/maxStats.HP*100)}%;" aria-valuenow="${statHP}" aria-valuemin="0" aria-valuemax="${maxStats.HP}">${statHP}</div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td class="col-stat-label small">ATT</td>
                  <td class="col-stat-progress">
                    <div class="progress stat-progress my-1">
                      <div class="progress-bar bg-success" role="progressbar" style="width: ${Math.floor(statAttack/maxStats.Attack*100)}%;" aria-valuenow="${statAttack}" aria-valuemin="0" aria-valuemax="${maxStats.Attack}">${statAttack}</div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td class="col-stat-label small">DEF</td>
                  <td class="col-stat-progress">
                    <div class="progress stat-progress my-1">
                      <div class="progress-bar bg-danger" role="progressbar" style="width: ${Math.floor(statDefense/maxStats.Defense*100)}%;" aria-valuenow="${statDefense}" aria-valuemin="0" aria-valuemax="${maxStats.Defense}">${statDefense}</div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td class="col-stat-label small">S. ATT</td>
                  <td class="col-stat-progress">
                    <div class="progress stat-progress my-1">
                      <div class="progress-bar progress-bar-striped bg-success" role="progressbar" style="width: ${Math.floor(statSAttack/maxStats.SpecialAttack*100)}%;" aria-valuenow="${statSAttack}" aria-valuemin="0" aria-valuemax="${maxStats.SpecialAttack}">${statSAttack}</div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td class="col-stat-label small">S. DEF</td>
                  <td class="col-stat-progress">
                    <div class="progress stat-progress my-1">
                      <div class="progress-bar progress-bar-striped bg-danger" role="progressbar" style="width: ${Math.floor(statSDefense/maxStats.SpecialDefense*100)}%;" aria-valuenow="${statSDefense}" aria-valuemin="0" aria-valuemax="${maxStats.SpecialDefense}">${statSDefense}</div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td class="col-stat-label small">SPEED</td>
                  <td class="col-stat-progress">
                    <div class="progress stat-progress my-1">
                      <div class="progress-bar bg-warning" role="progressbar" style="width: ${Math.floor(statSpeed/maxStats.Speed*100)}%;" aria-valuenow="${statSpeed}" aria-valuemin="0" aria-valuemax="${maxStats.Speed}">${statSpeed}</div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>           
            <div class="pt-3">            
            <p class="small">
              <span class="font-weight-bold">Strong against:</span> ${damageRelations.double_damage_to.join(", ")}, ${damageRelations.half_damage_to.join(", ")}
            </p>
            <p class="small">
              <span class="font-weight-bold">Weak To:</span> ${damageRelations.double_damage_from.join(", ")}, ${damageRelations.half_damage_from.join(", ")}
            </p>
          </div>
            <div>            
              <p class="small">
                <span class="font-weight-bold">Abilities:</span> ${abilities}
              </p>
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

function LoadApiData(url){
  console.log("Loading " + url);

  var results;
  return LoadJSON(url)
    .then(async function (apiData) {
        var promises = [];
        apiData.results.forEach(item => {
          promises.push(fetch(item.url).then((res) => res.json()));
        });
        return Promise.all(promises).then(function (results) {
          return results;          
        });
      });
}

async function BuildPokemonCards(data){

  var htmlArr = data.pokemon.map(async (character) => {
        
    var species = data.species.filter(el => el.name === character.species.name)[0]           
    var generation = data.generations.filter(el => el.name === species.generation.name)[0]      
    var type = data.types.filter(el=> el.name === character.types[0].type.name);    

    return PokeCardHtml(character,species,generation,type, data.abilities, data.maxStats)          
  })
  
  return Promise.all(htmlArr)

}

function hideLoading() {
  document.getElementById("loading").classList.add("d-none");
  document.getElementById("pokemonContainer").classList.remove("d-none");
  document.getElementById("header").classList.remove("d-none");
}

function debounce(callback, wait) {
  let timeout;
  return (...args) => {
      const context = this;
      clearTimeout(timeout);
      timeout = setTimeout(() => callback.apply(context, args), wait);
  };
}

function searchPokemon(data, searchTerm){
  if(!searchTerm || searchTerm.trim() ==="")
  {
    return data;
  }
  else
  {
    var filtered = data.pokemon.filter((val) => {
      return val.name.toLowerCase().startsWith(searchTerm.toLowerCase().trim())  || 
            val.types.findIndex(
              type => type.type.name.toLowerCase().startsWith(searchTerm.toLowerCase().trim())
            )>-1
    });        
    return {
      pokemon: filtered,
      types: data.types,
      species: data.species,
      generations: data.generations,
      abilities: data.abilities,
      maxStats: data.maxStats
    } 
  }
}

function initSearch(data){
  const container = document.getElementById("pokemonCardDeck");
  var el = document.getElementById("searchBox");
  var d = data;
  var msg = document.getElementById("record_count");
  el.addEventListener('input', debounce(()=>{
      //clear out the screen and show something if search takes longer than x milliseconds
      container.innerHTML = "";

      var results = searchPokemon(d,el.value);                

      BuildPokemonCards(results)
      .then((html) => {

        msg.innerHTML = `${results.pokemon.length}/${d.pokemon.length}`;
        container.innerHTML = html;
        attachFlipHander();
      }
      );
    },750));
}

function setMaxStats(data){
  var maxHP = 0;
  var maxDefense = 0;
  var maxAttack = 0;
  var maxSAttack = 0;
  var maxSDefense = 0;
  var maxSpeed = 0;

  data.pokemon.forEach((p) => {
    maxHP = Math.max(p.stats.filter(el => el.stat.name === "hp" )[0].base_stat,maxHP);
    maxDefense = Math.max(p.stats.filter(el => el.stat.name === "defense" )[0].base_stat,maxDefense);
    maxAttack = Math.max(p.stats.filter(el => el.stat.name === "attack" )[0].base_stat, maxAttack);
    maxSpeed = Math.max(p.stats.filter(el => el.stat.name === "speed" )[0].base_stat, maxSpeed);
    maxSAttack = Math.max(p.stats.filter(el => el.stat.name === "special-attack" )[0].base_stat, maxSAttack);
    maxSDefense = Math.max(p.stats.filter(el => el.stat.name === "special-defense" )[0].base_stat, maxSDefense);
  });

  data.maxStats = {}
  data.maxStats.HP = maxHP;
  data.maxStats.Defense = maxDefense;
  data.maxStats.Attack = maxAttack;
  data.maxStats.SpecialDefense = maxSDefense;
  data.maxStats.SpecialAttack = maxSAttack;
  data.maxStats.Speed = maxSpeed;
  return data;
}

function attachFlipHander(){
  var cards = document.querySelectorAll(".flip-div");
  for (const div of cards) {
    div.addEventListener('click', function(event) {
      this.classList.toggle("flipped");
    })
  }
}

function updateLoadingProgress(msg){
  document.getElementById("loadingStatus").innerText = msg;
}

function init(containerName) {  

    var dataSet = {};

    updateLoadingProgress("Loading Pokemon");
    LoadApiData(pokemonURL)
      .then((pokemon) => {
        updateLoadingProgress("Loading Species");
        dataSet.pokemon = pokemon;
        return LoadApiData(speciesURL);
      })
      .then((species) => {
        updateLoadingProgress("Loading Generations");
        dataSet.species = species;
        return LoadApiData(generationURL);
      })
      .then((generations) => {
        updateLoadingProgress("Loading Types");
        dataSet.generations = generations;
        return LoadApiData(typeURL);
      })
      .then((types) => {
        updateLoadingProgress("Loading Abilities");
        dataSet.types = types;
        return LoadApiData(typeURL);
      })
      .then((abilities) => {
        updateLoadingProgress("Building Pokedex");
        dataSet.abilities = abilities;               
        setMaxStats(dataSet);
        return BuildPokemonCards(dataSet);
      })
      .then((html)=>{
        initSearch(dataSet);        
        document.getElementById(containerName).innerHTML = html;
        attachFlipHander();
        hideLoading();
      })
      .catch((error) => {
        //remvoe the GIF
        document.getElementById("loadingGif").remove();
        //show the error
        updateLoadingProgress("An error has occured: " + error);
      });
}

init("pokemonCardDeck");

