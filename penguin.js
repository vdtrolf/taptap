testFunction = function(name) {
  console.log("Hello " + name);
}

class Penguin {
  constructor(l, h, name, gender, age) {
    // console.log("New penguin " + l + " " + h);
    this.lpos = l;
    this.hpos = h;
    this.name = name;
    this.gender = gender;
    this.age = age;
  }

  getName() {
    return this.name;
  }
}

// now we export the class, so other modules can create Penguin objects
module.exports = {
    testFunction : testFunction,
    Penguin : Penguin
}