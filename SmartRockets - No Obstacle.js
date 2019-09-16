var population;
var lifespan = 200; //each rocket lives for 200 frames
var lifeP;
var count = 0;
var target;

function setup() {
    createCanvas(400, 300);
    // rocket = new Rocket();
    population = new Population();
    lifeP = createP();
    target = createVector(width/2, 50);

}

function draw() { //recurring method
    background(0);
    population.run();
    lifeP.html(count);

    count++;

    if(count == lifespan) { //every 200 frames create a new population
        // population = new Population();
        population.evaluate();
        population.selection();
        count = 0;
    }
    

    ellipse(target.x, target.y, 16, 16);
}

function Population () {
    this.rockets = []; //array of rockets
    this.popsize = 25;
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

        createP(maxfit);

        //go through again, and normalize (0 to 1)
        for(var i = 0; i < this.popsize; i++) {
            this.rockets[i].fitness /= maxfit;
        }

        this.matingpool = []; //clears
        //normalize the fitness values
        for(var i = 0; i < this.popsize; i++) {
            var n = this.rockets[i].fitness * 100;
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
            this.genes[i].setMag(0.1);
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
}

function Rocket(dna) {
    this.pos = createVector(width/2, height);
    this.vel = createVector(); //makes it start at 0
    this.acc = createVector();
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
    }
    
    this.update = function() {
        this.applyForce(this.dna.genes[count]);

        this.vel.add(this.acc);
        this.pos.add(this.vel);
        this.acc.mult(0);
    }

    this.show = function() {
        push();
        noStroke();
        fill(255, 150);
        translate(this.pos.x, this.pos.y);
        rotate(this.vel.heading());
        rectMode(CENTER);
        rect(0,0,25, 5);
        pop(); //translate and rotate affects only the rocket
    }
}
