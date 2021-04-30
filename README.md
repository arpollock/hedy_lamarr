This project essentially runs a Node.js server with Yarn (on top of NPM) for package management. You will need to install Node.js, NPM, and Yarn (links should be in Google Drive). You will also need to install the typescript package through your package manager. On Mac I used Homebrew for package management. I am not sure if there is a Windows equivalent but I would do some research before diving in. I imagine there are some Medium articles or similar out there that can help; you should install in the order Node.js, NPM, and then finally Yarn. The project is also using Typescript, but I don't think that will change your installation. 

Once you have ^ above working (I would recommend getting the 'Hello World' equivalent of Node.js working on your machine outside of the project first), you can run the code in the project by doing the following commands from the main directory:

`yarn`

`yarn start`

This should then open up a brower window for you; you will then navigate to the `src` directory and the game should start running. You play the game with the arrow keys and spacebar.

I recommend opening up the project in an incognito window, as then you can force reload the cache easier to see changes while developing. 

Once that is accomplished, you can just walk through the project directory and get familar (sorry things are a bit messy). This is the tutorial the project is based on (it diverges): https://gamedevacademy.org/how-to-make-a-mario-style-platformer-with-phaser-3/?a=13#Assets_copyright. Feel free to complete the tutorial yourself if you think it would help, otherwise you are more than welcome to learn Phaser by adding features to the game.
