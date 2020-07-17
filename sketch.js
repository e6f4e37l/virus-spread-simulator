//Ignore
var currentR0;
var simulationLength = 125;
var dayLength = 500;
var verticalMargin = 0.8
var currentDay = 0;
var hospitalizedPeople = [];
var firstPerson = true;
var contacts = 0;
var simTimer;
//Shorthand
Engine = Matter.Engine, World = Matter.World, Bodies = Matter.Bodies, Render = Matter.Render, Composite = Matter.Composite, Composites = Matter.Composites;
var uninfectedGrey = '#808080'; //Color of uninfected people
var activeYellow = '#F8F540'; //Color of active people
var recoveredBlue = '#449BE2'; //Color of recovered people
var hospitalizedRed = '#FF0000';
//Matter.js variables
var engine, render, world, bodies;
//Physical constraints
var simulationCard = document.getElementById("simulationCard").getBoundingClientRect();
var ground, ceiling, wall1, wall2, tempHeight = window.innerHeight * verticalMargin, tempWidth = 1;

function startSimulation() {
  document.getElementById("infectRate").disabled = true;
  document.getElementById("hospitalCapacity").disabled = true;
  document.getElementById("peopleSocialDistancing").disabled = true;
  document.getElementById("hospitalCapacity").disabled = true;
  document.getElementById("recoveryPeriod").disabled = true;
  document.getElementById("testingSpeed").disabled = true;
  document.getElementById("simulationStartButton").disabled = true;
  document.getElementById("simulationResetButton").disabled = false;

  var personSize;
  if(window.innerWidth > window.innerHeight) {
    personSize = window.innerWidth / 75;
  } else {
    personSize = window.innerHeight / 75;
  }
  var personVelocity = 2.5;
  var infectRate = document.getElementById("infectRate").value / 100;
  var population = 100;
  var infectedStarting = 1;
  var peopleSocialDistancing = population * document.getElementById("peopleSocialDistancing").value / 100;
  var hospitalCapacity = document.getElementById("hospitalCapacity").value / 100;
  var recoveryPeriod = document.getElementById("recoveryPeriod").value - 0; //in Days
  var testingSpeed = document.getElementById("testingSpeed").value - 0; //in Days

  Matter.Resolver._restingThresh = 0.001;
  var simulationCard = document.getElementById("simulationCard").getBoundingClientRect();

  //Create engine
  engine = Engine.create();
  world = engine.world;
  engine.world.gravity.y = 0;

  //Create renderer
  var options = {
    background: '#445174',
    wireframes: false,
  }
  render = Render.create({
    canvas: document.getElementById("simulationCanvas"),
    engine: engine,
    options: options,
  });

  //Add walls, ceiling, and ground
  var params = {
    isStatic: true,
    restitution: 1,
    friction: 0,
    frictionStatic: 0,
    frictionAir: 0,
    inertia: Infinity,
  }
  render.bounds.max.x = simulationCard.width;
  render.bounds.max.y = window.innerHeight * verticalMargin;
  render.canvas.width = simulationCard.width;
  render.canvas.height = window.innerHeight * verticalMargin;
  ground = Bodies.rectangle(render.canvas.width / 2, render.canvas.height + 500, screen.width * 4, 1000, params);
  wall1 = Bodies.rectangle(-500, render.canvas.height / 2, 1000, screen.height * 4, params);
  wall2 = Bodies.rectangle(render.canvas.width + 500, render.canvas.height / 2, 1000, screen.height * 4, params);
  ceiling = Bodies.rectangle(render.canvas.width / 2, -500, screen.width * 4, 1000, params);
  World.add(world, ground);
  World.add(world, wall1);
  World.add(world, wall2);
  World.add(world, ceiling);

  //Set up bodies array
  var stack = Composites.stack();
  bodies = stack.bodies;
  World.add(world, stack);

  //Run the engine and renderer
  Engine.run(engine);
  Render.run(render);

  for(var i = 0; i < population - infectedStarting - peopleSocialDistancing; i++) { //Add uninfected people that DON'T practice social distancing
    bodies.push(new makeCircle(uninfectedGrey, false));
  }
  for(var i = 0; i < peopleSocialDistancing; i++) { //Add uninfected people that DO practice social distancing
    var socialDistancingPerson = new makeCircle(uninfectedGrey, true);
    socialDistancingPerson.render.opacity = 0.5;
    bodies.push(socialDistancingPerson);
  }
  for(var i = 0; i < infectedStarting; i++) { //Add active people
    if(firstPerson) { //Gives first person testing duration of 28 days
      firstPerson = false;
      var firstInfected = new makeCircle(activeYellow, false)
      firstInfected.testingDuration = 28;
      bodies.push(firstInfected);
    } else bodies.push(new makeCircle(activeYellow, false));
  }

  //Set up collision listeners
  Matter.Events.on(engine, 'collisionStart', function(event) {
    var infectedEncounter1 = event.pairs[0].bodyA.render.fillStyle == activeYellow && event.pairs[0].bodyA.render.opacity == 1 && event.pairs[0].bodyB.render.fillStyle == uninfectedGrey && event.pairs[0].bodyB.render.opacity == 1;
    var infectedEncounter2 = event.pairs[0].bodyA.render.fillStyle == uninfectedGrey && event.pairs[0].bodyA.render.opacity == 1 && event.pairs[0].bodyB.render.fillStyle == activeYellow && event.pairs[0].bodyB.render.opacity == 1;
    var bothPeople = event.pairs[0].bodyA.label == "Circle Body" && event.pairs[0].bodyB.label == "Circle Body";
    var infectProbability = Math.random();
    if(infectedEncounter1 && bothPeople) {
      contacts++;
      if(infectRate > infectProbability) {
        event.pairs[0].bodyB.render.fillStyle = activeYellow;
        event.pairs[0].bodyA.individualR0++;
      }
    } else if(infectedEncounter2 && bothPeople) {
      contacts++;
      if(infectRate > infectProbability) {
        event.pairs[0].bodyA.render.fillStyle = activeYellow;
        event.pairs[0].bodyB.individualR0++;
      }
    }
  });

  function draw() {
    var simulationCard = document.getElementById("simulationCard").getBoundingClientRect();

    //Checks for change in window size
    if(!(simulationCard.width == tempWidth) || !(window.innerHeight * verticalMargin == tempHeight)) {
      tempWidth = simulationCard.width;
      tempHeight = window.innerHeight * verticalMargin;

      //Resize canvas, walls, ceiling, and ground
      render.bounds.max.x = simulationCard.width;
      render.bounds.max.y = window.innerHeight * verticalMargin;
      render.canvas.width = simulationCard.width;
      render.canvas.height = window.innerHeight * verticalMargin;
      //canvas = createCanvas(window.simulationCard, window.innerHeight * verticalMargin);
      Matter.Body.setPosition(ceiling, {x: window.simulationCard.width / 2, y: -500});
      Matter.Body.setPosition(wall1, {x: -500, y: window.innerHeight * verticalMargin / 2});
      Matter.Body.setPosition(wall2, {x: window.simulationCard.width + 500, y: window.innerHeight * verticalMargin / 2});
      Matter.Body.setPosition(ground, {x: window.simulationCard.width / 2, y: window.innerHeight * verticalMargin + 500});
    }

    //Iterate through the objects on screen
    for (var i = 0; i < bodies.length; i++) {
      //Necessary physical movements
      var bodyi = bodies[i];

      //If patient is active, not hospitalized, has tested positive, and there is room in hospital
      var testPositive = hospitalizedPeople.length < Math.floor(hospitalCapacity * population) && bodyi.hospitalized == false && bodyi.testingDuration <= 0 && bodyi.render.fillStyle == activeYellow;
      
      //Hospitalize patients that have tested positive
      if(testPositive) {
        hospitalizedPeople.push(i);
        bodyi.hospitalized = true;
        bodyi.render.opacity = 0.5;
        bodyi.isStatic = true;
        Matter.Body.setVelocity(bodyi, {x: 0, y: 0});
      }

      //If patient has fully recovered
      if(bodyi.recoveryDuration <= 0) {
        hospitalizedPeople.shift(); //Remove from list of hospitalized people

        //Signifies recovered and no longer hospitalized
        bodyi.render.opacity = 1;
        bodyi.render.fillStyle = recoveredBlue;
        bodyi.isStatic = false;

        //Technical stuff needed to prevent re-hospitalization
        bodyi.hospitalized = false;
        bodyi.recoveryDuration = 1;

        //Set the recovered patient free, in random direction
        var randomAngle = Math.floor(Math.random() * 360);
        Matter.Body.setVelocity(bodyi, {x: personVelocity * Math.sin(randomAngle), y: personVelocity * Math.cos(randomAngle)});
      }
    }
  }
  setInterval(draw);

  //Function that generates people (person => Circle Body)
  function makeCircle(status, staticBool) {
    var params = {
      restitution: 1,
      friction: 0,
      frictionStatic: 0,
      frictionAir: 0,
      inertia: Infinity,
      isStatic: staticBool,
      render: {
        fillStyle: status
      },
      individualR0: 0,
      hospitalized: false,
      recoveryDuration: generateRandomGaussian(recoveryPeriod),
      testingDuration: testingSpeed
    }

    //Generates people with correct parameters
    var simulationCard = document.getElementById("simulationCard").getBoundingClientRect();
    var circleBody = Bodies.circle((simulationCard.width - personSize) * Math.random() + personSize / 2, (simulationCard.height - personSize) * Math.random() + personSize / 2, personSize, params);
    //If not socially distancing, give random velocity
    if(!staticBool) {
      var randomAngle = Math.floor(Math.random() * 360);
      Matter.Body.setVelocity(circleBody, {x: personVelocity * Math.sin(randomAngle), y: personVelocity * Math.cos(randomAngle)});
    }

    return circleBody;
  }

  //Function the clears the board
  function clearBoard() {
    for(var i = bodies.length-1; i >= 0; i--) {
      var body = bodies[i];
      World.remove(world, body);
      bodies.splice(body, 1);
    }
    var stack = Composites.stack();
    bodies = stack.bodies;
    World.add(world, stack);
  }

  //Completely halts the physics engine
  function stopRender() {
    render.canvas = null;
    render.context = null;
    render.textures = {};
    Render.stop(render);
    clearInterval(draw);
  }

  function updateChartVisual() {
    var uninfected = 0;
    var active = 0;
    var recovered = 0;

    //Iterates through all the people
    for(var i = 0; i < bodies.length; i++) {
      var bodyi = bodies[i];
      if(bodyi.render.fillStyle == uninfectedGrey) uninfected++;
      if(bodyi.render.fillStyle == activeYellow) active++;
      if(bodyi.render.fillStyle == recoveredBlue) recovered++;
    }
    
    //Update hospital status
    document.getElementById('hospitalCount').innerHTML = "" + hospitalizedPeople.length + " people hospitalized";
    if(Math.floor(hospitalCapacity * population) < active) {
      document.getElementById('hospitalOverwhelmed').innerHTML = "Exceeding Hospital Capacity";
      document.getElementById('hospitalOverwhelmed').style.color = "#FF0000";
      document.getElementById('hospitalCount').style.color = "#FF0000";
    } else {
      document.getElementById('hospitalOverwhelmed').innerHTML = "Not Exceeding Hospital Capacity";
      document.getElementById('hospitalOverwhelmed').style.color = "rgb(101, 221, 155)";
      document.getElementById('hospitalCount').style.color = "rgb(101, 221, 155)";
    }

    //Update chart
    updateChart(Math.floor(population * hospitalCapacity), recovered, active, uninfected);
    currentDay++;

    //Check if simulation length has passed or if the disease has disappeared to end the simulation
    if(currentDay > simulationLength || active == 0) {
      clearInterval(simTimer);
      stopRender();
    }
  }

  //A day of the simulation
  function passDay() {
    updateChartVisual();
    var sum = 0;
    var transmitterCount = 0;
    for(var i = 0; i < bodies.length; i++ ) {
      var bodyi = bodies[i];
      if(bodyi.individualR0 > 0) {
        sum = sum + bodyi.individualR0;
        transmitterCount++;
      }
      if(bodyi.render.fillStyle == activeYellow) {
        bodyi.testingDuration--;
      }
      if(bodyi.hospitalized) {
        bodyi.recoveryDuration--;
      }
    }
    currentR0 = infectRate * (contacts / (6 * currentDay)) * (testingSpeed + recoveryPeriod);
    document.getElementById("currentR0").innerHTML = "Current R₀: " + Math.round(currentR0 * 10) / 10;
  }

  simTimer = setInterval(passDay, dayLength);
}

//Generates a number randomly, accordingly to a Gaussian distribution
function generateRandomGaussian(center) {
  var sum = 0;
  for(var i = 0; i < 30; i++) {
    sum += Math.random();
  }
  return(Math.round((center / 0.5) * sum / 30));
}