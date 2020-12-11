CS174A Team Project: Shooting Range
Artavazd Torosyan, Angela Gu, Edgar Hukassian

We designed an aim trainer first-person shooter game with an abstract, non-realistic graphic style.
Targets are randomly generated and the gun rotates and translates based on canvas mouse position. 
The game is high-score based, with a base-level score of 30. Scoring is determined by how long you play:
initially, the timer is set to 30 seconds, but each target hit adds time, and the goal is to play for
as long as possible. Difficulty is increased as time passes with the addition of target movement and 
scaling and flashing graphics. 

The advanced feature implemented is mouse picking via an offscreen color buffer. All targets are drawn
twice: onscreen with a non-unique (black) color, and offscreen with a unique randomly assigned color.
When the player clicks, the offscreen color is read and if there is a match with an offscreen target
color, that target is shot.

Implementation of the offscreen framebuffer for mouse picking was referenced from example code
in the book "WebGL Beginner's Guide" by Diego Cantor and Brandon Jones in chapter 8, pages 259 to 261 
and page 267. The 3D gun model was downloaded from https//free3d.com/.

References: 
Cantor, Diego and Brandon Jones. 'WebGL Beginner's Guide'. Packt Publishing, 2012.
