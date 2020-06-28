//WRAPPER FOR ADDING PROMSIES TO IndexedDB API - https://github.com/jakearchibald/idb
import { openDB, deleteDB, wrap, unwrap } from './idb.js';

const pokemonURL = "https://pokeapi.co/api/v2/pokemon?limit=5000";
const speciesURL = "https://pokeapi.co/api/v2/pokemon-species?limit=1000";
const generationURL = "https://pokeapi.co/api/v2/generation?limit=5000";
const typeURL = "https://pokeapi.co/api/v2/type?limit=100";
const abilityeURL = "https://pokeapi.co/api/v2/ability?limit=2000";
const swordShieldURL = "./data/swordshield.json";

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
    res.double_damage_from.push(...t.damage_relations.double_damage_from.map(el => el.name));
    res.half_damage_from.push(...t.damage_relations.half_damage_from.map(el => el.name));
  })
  
  return res;
  
}

function PokeCardHtml(character, maxStats) {
  
  var typesHtml = character.types.map((t) => `<li class="list-inline-item m-0 badge-circle bg-${t}"><img class="type-badge" src="images/type-images/${t}.svg" alt="${t}"/></li>`).join(``);                      

  var html = ` 
  <div class="flip-div  mx-auto">
    <div class="flip-main my-1 mx-auto">
      <div class="front mx-auto">
        <div class="card shadow bg-${character.types[0]}" data-id="${character.id}">
          <div class="pokemon-htwt text-center rounded-top font-italic">
                  ${character.genus || ""}    HT: ${DecimeterToFeetAndInches(character.height)}    WT: ${HectogramToPounds(character.weight)}lbs
          </div>
          <div class="bg-${character.types[0]}-dark rounded-top">
            <img class="card-img-top mx-auto d-block pokemon"  src="${character.spriteURL}" onerror="this.src='./images/image-placeholder.png'" alt="Pokemon Image" />
          </div>   
          <div class="pokemon-stage text-right pr-3 rounded-bottom">
            ${character.stage}
          </div>        
          <div class="card-body pt-0 bg-${character.types[0]}-light rounded-bottom">
            <div class="pokemon-types">
              <ul class="list-inline types p-0">
                ${typesHtml}
              </ul>
            </div>
            <h5 class="card-title text-center capitalize mb-1">${character.name}</h4>              
            <p class="card-text mb-1"><small>${character.description || ""}</small></p>
            <p class="card-text mb-1">
              <small>
                <span class="text-uppercase">${character.generation}</span><br/>
                Region: <span class="capitalize">${character.region}</span><br/>
                ${character.evolves_from}               
              </small>
            </p>
          </div>
        </div>
      </div>
      <div class="back mx-auto">
        <div class="card shadow bg-${character.types[0]}" data-id="1">
          <div class="card-body bg-${character.types[0]}-light rounded">
            <table class="stats">
              <tbody>
                <tr>
                  <td class="col-stat-label small">HP</td>
                  <td class="col-stat-progress">
                    <div class="progress stat-progress my-1">
                      <div class="progress-bar bg-info" role="progressbar" style="width: ${Math.floor(character.base_stats.HP/maxStats.HP*100)}%;" aria-valuenow="${character.base_stats.HP}" aria-valuemin="0" aria-valuemax="${maxStats.HP}">${character.base_stats.HP}</div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td class="col-stat-label small">ATT</td>
                  <td class="col-stat-progress">
                    <div class="progress stat-progress my-1">
                      <div class="progress-bar bg-success" role="progressbar" style="width: ${Math.floor(character.base_stats.Attack/maxStats.Attack*100)}%;" aria-valuenow="${character.base_stats.Attack}" aria-valuemin="0" aria-valuemax="${maxStats.Attack}">${character.base_stats.Attack}</div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td class="col-stat-label small">DEF</td>
                  <td class="col-stat-progress">
                    <div class="progress stat-progress my-1">
                      <div class="progress-bar bg-danger" role="progressbar" style="width: ${Math.floor(character.base_stats.Defense/maxStats.Defense*100)}%;" aria-valuenow="${character.base_stats.Defense}" aria-valuemin="0" aria-valuemax="${maxStats.Defense}">${character.base_stats.Defense}</div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td class="col-stat-label small">S. ATT</td>
                  <td class="col-stat-progress">
                    <div class="progress stat-progress my-1">
                      <div class="progress-bar progress-bar-striped bg-success" role="progressbar" style="width: ${Math.floor(character.base_stats.SpecialAttack/maxStats.SpecialAttack*100)}%;" aria-valuenow="${character.base_stats.SpecialAttack}" aria-valuemin="0" aria-valuemax="${maxStats.SpecialAttack}">${character.base_stats.SpecialAttack}</div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td class="col-stat-label small">S. DEF</td>
                  <td class="col-stat-progress">
                    <div class="progress stat-progress my-1">
                      <div class="progress-bar progress-bar-striped bg-danger" role="progressbar" style="width: ${Math.floor(character.base_stats.SpecialDefense/maxStats.SpecialDefense*100)}%;" aria-valuenow="${character.base_stats.SpecialDefense}" aria-valuemin="0" aria-valuemax="${maxStats.SpecialDefense}">${character.base_stats.SpecialDefense}</div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td class="col-stat-label small">SPEED</td>
                  <td class="col-stat-progress">
                    <div class="progress stat-progress my-1">
                      <div class="progress-bar bg-warning" role="progressbar" style="width: ${Math.floor(character.base_stats.Speed/maxStats.Speed*100)}%;" aria-valuenow="${character.base_stats.Speed}" aria-valuemin="0" aria-valuemax="${maxStats.Speed}">${character.base_stats.Speed}</div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>           
            <div class="pt-3">            
            <p class="small">
              <span class="font-weight-bold">Strong against:</span>
            </p>
            <p class="small">
              <span class="font-weight-bold">Weak To:</span> 
            </p>
          </div>
            <div>            
              <p class="small">
                <span class="font-weight-bold">Abilities:</span> 
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

  var htmlArr = data.finalData.map(async (character) => {
        
    return PokeCardHtml(character, data.maxStats)          
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
    var filtered = data.finalData.filter((val) => {
      return val.name.toLowerCase().startsWith(searchTerm.toLowerCase().trim())  || 
            val.types.findIndex(
              type => type.toLowerCase().startsWith(searchTerm.toLowerCase().trim())) >-1 ||
            val.region.toLowerCase().startsWith(searchTerm.toLowerCase().trim())  
            
    });        
    return {
      pokemon: data.pokemon,
      types: data.types,
      species: data.species,
      generations: data.generations,
      abilities: data.abilities,
      finalData: filtered,
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

        msg.innerHTML = `${results.finalData.length}/${d.finalData.length}`;
        container.innerHTML = html;
        attachFlipHander();
      }
      );
    },750));
}

function transformData(apiDataSet,swordShieldData)
{
    var res = [];
    if (apiDataSet){
    //transform our API data first into a more friendly format
      apiDataSet.pokemon.forEach(p => {
        var species = apiDataSet.species.filter(el => el.name === p.species.name)[0] ;          
        var generation = apiDataSet.generations.filter(el => el.name === species.generation.name)[0];       
        
        res.push({
          id: p.id,
          name: p.name,
          height: p.height,
          weight: p.weight,
          spriteURL: p.sprites['front_default'] || buildSpriteURL(p),
          description: species.flavor_text_entries.filter(entry => entry.language.name === "en")[0].flavor_text.replace(String.fromCharCode(12)," ").replace(String.fromCharCode(10)," "),
          base_stats: {
            HP: p.stats.filter(el => el.stat.name === "hp" )[0].base_stat,
            Attack: p.stats.filter(el => el.stat.name === "attack" )[0].base_stat,
            Defense : p.stats.filter(el => el.stat.name === "defense" )[0].base_stat,
            SpecialAttack: p.stats.filter(el => el.stat.name === "special-attack" )[0].base_stat,
            SpecialDefense: p.stats.filter(el => el.stat.name === "special-defense" )[0].base_stat,
            Speed: p.stats.filter(el => el.stat.name === "speed" )[0].base_stat
          }, 
          stage: species.evolves_from_species ? "Stage 1/2" : "Basic",
          types: p.types.map(t => t.type.name),
          region: generation.main_region.name,
          generation: species.generation.name.replace("-"," "),
          evolves_from: species.evolves_from_species ? species.evolves_from_species.name.replace("-"," ") : "",
          evolution_chain: [],
          genus: species.genera.filter(el => el.language.name === "en")[0].genus,
          abilities: p.abilities.map(el => el.ability.name.replace("-"," ")).join(",")
        });
    });
  }
    //add in the additional data
    if(swordShieldData)
    {
        //ignore entries that have a number in them or that 
        swordShieldData.filter(el => el.galar_dex != "foreign" && !/\d/.test(el.name)).forEach(p => {
            //filter only those specific to Galar
            if (res.filter(el => el.id === p.id).length === 0 ){
              res.push(
                {
                  id: p.id,
                  name: p.name,
                  height: p.height,
                  weight: p.weight,
                  spriteURL: buildSpriteURL(p),
                  description: p.description,
                  base_stats: {
                    HP: p.base_stats ? p.base_stats[0] : 0,
                    Attack: p.base_stats ? p.base_stats[1] : 0,
                    Defense : p.base_stats ? p.base_stats[2] : 0,
                    SpecialAttack: p.base_stats ? p.base_stats[3] : 0,
                    SpecialDefense: p.base_stats ? p.base_stats[4] : 0,
                    Speed: p.base_stats ? p.base_stats[5] : 0,
                  },
                  stage: p.stage,
                  abilities: p.abilities || [],
                  types: p.types ? p.types.map(t=>t.toLowerCase()) : [],
                  region: "Galar",
                  generation: "Generation VIII",
                  evolves_from: "",
                  evolution_chain: [],
                  genus: ""
                  
                }
              );
            }
        });

    }

    return res;
}

function buildSpriteURL(p){
  //replace non alphanumeric characters with dashes
  //specific replacement for asterisk to just remove it
  
  var name = p.name
              .replace("’","")
              .replace(/[\W_]+/g,"-")
              .toLowerCase()

   //transform those that have alola to alolan to match PokemonDB image format
  if (name.endsWith("alola")) {name = name + "n"}

  return `https://img.pokemondb.net/sprites/home/normal/${name}.png`
}

function setMaxStats(data){
  var maxHP = 0;
  var maxDefense = 0;
  var maxAttack = 0;
  var maxSAttack = 0;
  var maxSDefense = 0;
  var maxSpeed = 0;

  data.finalData.forEach((p) => {
    maxHP = Math.max(p.base_stats.HP,maxHP);
    maxDefense = Math.max(p.base_stats.Defense,maxDefense);
    maxAttack = Math.max(p.base_stats.Attack, maxAttack);
    maxSpeed = Math.max(p.base_stats.Speed, maxSpeed);
    maxSAttack = Math.max(p.base_stats.SpecialAttack, maxSAttack);
    maxSDefense = Math.max(p.base_stats.SpecialDefense, maxSDefense);
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
    var pokemon = [];

    updateLoadingProgress("Loading Pokemon");
    LoadApiData(pokemonURL)
      .then((pokemon) => {
        dataSet.pokemon = pokemon;
        updateLoadingProgress("Loading Species");
        return LoadApiData(speciesURL);
      })
      .then((species) => {
        dataSet.species = species;
        updateLoadingProgress("Loading Generations");
        return LoadApiData(generationURL);
      })
/*       .then((generations) => {
        dataSet.generations = generations;
        updateLoadingProgress("Loading Types");
        return LoadApiData(typeURL);
      })
      .then((types) => {
        dataSet.types = types;
        updateLoadingProgress("Loading Abilities");
        return LoadApiData(abilityeURL);
      }) */
      .then((generations) =>{
        dataSet.generations = generations;
        updateLoadingProgress("Loading Galar Data");
        return LoadJSON(swordShieldURL);
      })
      .then((swordShield) => {
 
        updateLoadingProgress("Building Pokedex");
        dataSet.finalData = transformData(dataSet,swordShield);           
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

