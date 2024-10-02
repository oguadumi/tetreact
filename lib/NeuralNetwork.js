export class NeuralNetwork {
    constructor(inputNodes, hiddenNodes, outputNodes, hiddenLayers) {
      this.inputNodes = inputNodes;
      this.hiddenNodes = hiddenNodes;
      this.outputNodes = outputNodes;
      this.hiddenLayers = hiddenLayers;
      
      this.weights = [];
      this.biases = [];
  
      // Initialize weights and biases
      this.weights.push(this.createMatrix(this.hiddenNodes, this.inputNodes));
      this.biases.push(this.createMatrix(this.hiddenNodes, 1));
  
      for (let i = 0; i < this.hiddenLayers - 1; i++) {
        this.weights.push(this.createMatrix(this.hiddenNodes, this.hiddenNodes));
        this.biases.push(this.createMatrix(this.hiddenNodes, 1));
      }
  
      this.weights.push(this.createMatrix(this.outputNodes, this.hiddenNodes));
      this.biases.push(this.createMatrix(this.outputNodes, 1));
  
      // Randomize initial weights and biases
      this.weights.forEach(w => this.randomize(w));
      this.biases.forEach(b => this.randomize(b));
    }
  
    predict(inputs) {
      let output = this.matrixFromArray(inputs);
  
      for (let i = 0; i < this.weights.length; i++) {
        output = this.multiply(this.weights[i], output);
        output = this.add(output, this.biases[i]);
        output = this.map(output, x => Math.max(0, x)); // ReLU activation
      }
  
      return this.toArray(output);
    }
  
    mutate(rate) {
      function mutateValue(val) {
        if (Math.random() < rate) {
          return val + randomGaussian() * 0.5;
        }
        return val;
      }
  
      this.weights = this.weights.map(w => this.map(w, mutateValue));
      this.biases = this.biases.map(b => this.map(b, mutateValue));
    }
  
    crossover(partner) {
      const child = new NeuralNetwork(this.inputNodes, this.hiddenNodes, this.outputNodes, this.hiddenLayers);
  
      child.weights = this.weights.map((w, i) => this.crossoverMatrix(w, partner.weights[i]));
      child.biases = this.biases.map((b, i) => this.crossoverMatrix(b, partner.biases[i]));
  
      return child;
    }
  
    // Helper methods
    createMatrix(rows, cols) {
      return Array(rows).fill().map(() => Array(cols).fill(0));
    }
  
    randomize(matrix) {
      return matrix.map(row => row.map(() => Math.random() * 2 - 1));
    }
  
    multiply(a, b) {
      if (a[0].length !== b.length) throw new Error('Incompatible matrix sizes');
      return a.map(row => Array(b[0].length).fill().map((_, i) => row.reduce((sum, val, j) => sum + val * b[j][i], 0)));
    }
  
    add(a, b) {
      return a.map((row, i) => row.map((val, j) => val + b[i][j]));
    }
  
    map(matrix, func) {
      return matrix.map(row => row.map(func));
    }
  
    matrixFromArray(arr) {
      return arr.map(val => [val]);
    }
  
    toArray(matrix) {
      return matrix.reduce((arr, row) => arr.concat(row), []);
    }
  
    crossoverMatrix(a, b) {
      return a.map((row, i) => row.map((val, j) => Math.random() < 0.5 ? val : b[i][j]));
    }
  }
  
  function randomGaussian() {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  }