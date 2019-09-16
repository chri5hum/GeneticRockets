//p5.js library included

console.log('works')
var population;
var lifespan = 1000; //must be set to max lifespan when init else rockets stall after passing original
var lifeP;
var count = 0;
var target;
var maxforce = 0.2; //change speed
var mutationindex = 0.05;
var popsizeInitializer = 70;
var targetHits;
var hitTarget = 0; //times you hit each sim
var simulationNumber;
var numSimulations = 1;
var speedMultiplier = 1;

//dont change these for now
// var 

//obstacle
var rw = 350; //set this, rest calculated
var rx = 0;
var ry = 0;
var rh = 0;

var speedMultiplierSlider
var lifespanSlider

function setup() {
    createCanvas(800, 600);
    population = new Population();
    stats = createP();
    // simulationNumber = createP();
    // targetHits = createP();
    target = createVector(width/2, 50);
    rx = width/2 - rw/2
    ry = height/2
    rh = 20
    slidersText = createP();
    speedMultiplierSlider = createSlider(5, 100, 10)
    lifespanSlider = createSlider(200, 1000, 400)

}

function draw() { //recurring method

  speedMultiplier = speedMultiplierSlider.value() / 10.0
  lifespan = lifespanSlider.value()

  background(0);
  population.run();
  
  stats.html("<Table style=\"width: "+ width + "\"><tr><th>Simulation #: " + numSimulations + "</th><th>Times Target Reached: " + hitTarget + "</th><th>Life Elapsed: " + count + "</th></tr></Table>");
  slidersText.html("<Table style=\"width:280; margin-bottom: 1px\"><tr><th>Thrust: x" + speedMultiplier + "</th><th>Lifespan: " + lifespan + "</th></tr></Table>")


    count++; //everytime you draw, increment count

    if(count >= lifespan) { //every lifespan frames create a new population
        // population = new Population();
        population.evaluate();
        population.selection();
        count = 0;
        numSimulations++;
        hitTarget = 0;
    }

    rect(rx, ry, rw, rh);
    fill('red');
    

    ellipse(target.x, target.y, 16, 16);
    fill(255)
}

function Population () {
    this.rockets = []; //array of rockets
    this.popsize = popsizeInitializer;
    this.matingpool = [];

    for(var i = 0; i < this.popsize; i++) {
        this.rockets[i] = new Rocket;

    }

    this.evaluate = function() {

        var maxfit = 0;

        //run through rockets and calc fitness
        for(var i = 0; i < this.popsize; i++) {
            this.rockets[i].calcFitness();
            if(this.rockets[i].fitness > maxfit) {
                maxfit = this.rockets[i].fitness;
            }
        }

        // createP(maxfit); //print max fitness
        console.log(this.rockets);

        //go through again, and normalize (0 to 1)
        for(var i = 0; i < this.popsize; i++) {
            this.rockets[i].fitness /= maxfit;
        }

        this.matingpool = []; //clears
        //normalize the fitness values
        for(var i = 0; i < this.popsize; i++) {
            var n = this.rockets[i].fitness * 500 * (1 + ((lifespan - count)/lifespan));
            mutationindex = 0.01;
            for(var j = 0; j < n; j++) {
                this.matingpool.push(this.rockets[i]); //add to the mating pool x times (based on fitness rating)
            }
        }
    }

    this.selection = function() {
        var newRockets = [];
        for(var i = 0; i < this.rockets.length; i++) {
            //pick 2 parents
            var parentA = random(this.matingpool).dna; //p5 has a thing where you can give it an array, and an element is randomly picked
            var parentB = random(this.matingpool).dna;
            var child = parentA.crossover(parentB);
            child.mutation();
            newRockets[i] = new Rocket(child);
        }
        this.rockets = newRockets; //set population to new population
        
    }

    this.run = function() { 
        for(var i = 0; i < this.popsize; i++) {
            this.rockets[i].update();
            this.rockets[i].show();
        } 
    }
}

function DNA(genes) { //can either recieve genes, or do them randomly
    if(genes) {
        this.genes = genes;
    } else {
        this.genes = []; //array of genes
        for(var i = 0; i < lifespan; i++) { //
            this.genes[i] = p5.Vector.random2D();
            this.genes[i].setMag(maxforce);
        }
    }
    

    this.crossover = function(partner) {
        var newgenes = [];
        var mid = floor(random(this.genes.length));
        for (var i = 0; i < this.genes.length; i++) {
            if(i > mid) {
                newgenes[i] = this.genes[i];
            } else {
                newgenes[i] = partner.genes[i];
            }
        }
        return new DNA(newgenes); 
    }

    //mutation function
    this.mutation = function() {
        for(var i = 0; i < this.genes.length; i++) {
            if(random(1) < mutationindex) { //mutation chance of 1%
                this.genes[i] = p5.Vector.random2D();
                this.genes[i].setMag(maxforce);

            }
        }
    }
}

function Rocket(dna) {
    this.pos = createVector(width/2, height);
    this.vel = createVector(); //makes it start at 0
    this.acc = createVector();
    this.completed = false;
    this.crashed = false;
    this.markedCompleted = false;
    if(dna) {
        this.dna = dna;
    } else {
        this.dna = new DNA();
    }
    this.fitness = 0;

    this.applyForce = function(force) {
        this.acc.add(force);
    }

    this.calcFitness = function() {
        //fitness is closer a rocket makes it to target
        var d = dist(this.pos.x, this.pos.y, target.x, target.y);
        this.fitness = map(d, 0, width, width, 0); //p5 method to map from on range to another
        //inverts the value, so you dont have to normalize

        if(this.completed) {
            this.fitness *= 10;
        }
        if(this.crashed) {
            this.fitness /= 10;
        }
    }
    
    this.update = function() {

        //check distance between rocket position and goal position
        var d = dist(this.pos.x, this.pos.y, target.x, target.y);
        if(d < 10) { //reached the target if less than 10 px
            this.completed = true;
            this.pos = target.copy();
            if(this.markedCompleted == false) {
                hitTarget++;
                this.markedCompleted = true;
            }

        }

        //check collision with obstacle
        if(this.pos.x > rx && this.pos.x < rx + rw && this.pos.y > ry && this.pos.y < ry + rh) {
            this.crashed = true;
        }
        if(this.pos.x > width || this.pos.x < 0) {
            this.crashed = true;
        }
        if(this.pos.y > height || this.pos.y < 0) {
            this.crashed = true;
        }

        this.applyForce(this.dna.genes[count]);
        if(!this.completed && !this.crashed) {
            this.vel.add(this.acc.mult(speedMultiplier));
            this.pos.add(this.vel);
            this.acc.mult(0);
            this.vel.limit(4); //limit velocity
        }
        
    }

    this.show = function() {
        push();
        noStroke();
        fill(255, 150);
        translate(this.pos.x, this.pos.y);
        rotate(this.vel.heading());
        // rectMode(CENTER);
        // rect(0,0,25, 5);
        triangle(0,0, 25, 5, 0, 10)
        pop(); //translate and rotate affects only the rocket
    }
}
