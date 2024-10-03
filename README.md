## Calculating Moves
When a piece comes into play, the system first calculates every possible position the piece can be placed. For each position, features about the resulting game state are calculated.

### Features
* Total difference in height of adjacent columns
* Holes (empty spaces that cannot be filled with a piece)
* Maximum height of the structure
* Minimum height of the structure
* Lines Cleared

   
![1002-ezgif com-video-to-gif-converter](https://github.com/user-attachments/assets/bd1a0278-4b82-422c-a463-83262094b5a6)


These features are input to the neural network which outputs a score for that placement. This is repeated for every placement, and the placement with the highest score is selected. A moveset is returned which the system then executes to place the piece into the selected position.

There are 10 columns and 4 rotations so for every piece there are 40 positions to calculate.

## Training
A genetic algorithm is used to optimize the neural network. A population of 200 players are created and every generation players play the game until they loose. Once all the players in the population loose, the genetic algorithm selects the players with the highest scores and "breeds" them. Breeding consists of taking two players and combining random pieces of their neural networks. The resulting network is then mutated sligtly according to the mutation rate. This is done to create a new population of 200 players and the entire process is repeated.


##AI Performance
Interestingly, despite not having knowledge of the next piece, the AI is still capable of clearing up to 2000 lines in some cases. This demonstrates the power of the neural network in making decisions based solely on the current game state. The AI learns to create stable structures and maintain a low overall height, which allows it to adapt to new pieces as they come.
The lack of next piece information actually makes the AI's performance more impressive, as it has to make decisions with less information than a human player would typically have. This constraint forces the AI to develop more robust strategies that work well regardless of the next piece.
