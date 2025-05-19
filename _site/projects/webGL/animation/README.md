# CSC-305-Assignment~2

### A simple animation written in JavaScript/WebGL and GLSL

## Task

Create an animation with full creative freedom fullfiling the particular requirements defined under "criteria".

## Criteria

- At least one two hierarchial object
- Containing at least two textures either procedural or mapped
- At least one shader edited or designed from scratch
- 360 Degree camera fly around
- Connection to real - time
- Display the frame rate in the console every 2 seconds

## Summary


I have decided to play around with color and scale to create a fantastical animation with a humorous twist. The scene starts off in black and white displaying a character with a formal hat looking into a cone with its mouth moving in disbeleif. The camera rotates around the character while parametrically zooming in until it comes to a halt in front of the contents of the cone. I have used various effects to comprise an outlandish scene within the cone:
- The whole time as the camera is focused on the scene within the cone we can see the big eye of the outside, black and white character in order to keep track of the scale difference. 
- I have chreated a psychadellic background within the cone by mapping my own paintings as a texture to the mountains.
- I have used the shader to simmulate a sun rising and setting. I have done this by synchronizing the darkness/lightness of the switching colors on the inside of the cone with the rising and setting of a multicolored sphere representing the sun.
- I have played around with animation by making one of the two characters inside the cone jump. I have also scalled gravity over time in order to make the character seem as if his final jump was big enough that he flew away. 
Once one of the two characters "flies away", I make him return shooting through the scene as if out of control of his flight. He then returns one more time aiming straight for the eye of the original big character. The scene ends by the cone dropping and the small character shooting through the eye of the big character giving him a multicolored "black eye".

**** All image textures used are my own paintings

_______________________________________________________________
Scale of big character looking through the cone from the front:

![Screenshot (143)](https://user-images.githubusercontent.com/77686772/213540076-fc071551-5232-4271-8660-ca955123af12.png)

_______________________________________________________________
Shot of the small character jumping at dawn:

![Screenshot (148)](https://user-images.githubusercontent.com/77686772/213540407-f31f2ae6-df73-4a65-bce6-e345f1ecd2f1.png)

![Screenshot (149)](https://user-images.githubusercontent.com/77686772/213540663-7b920163-586b-4ce7-9cf4-2c41b97182e5.png)

_______________________________________________________________
The small character jumping higher as the sun begins to rise:

![Screenshot (150)](https://user-images.githubusercontent.com/77686772/213540803-cf4169e2-49e4-4e81-824d-04c62e3906c5.png)

![Screenshot (154)](https://user-images.githubusercontent.com/77686772/213540855-6b5ed1f0-a69f-43f2-8400-f6043e2b77d8.png)

____________________________________________________________________
The small character coming back for the first time without control:

![Screenshot (165)](https://user-images.githubusercontent.com/77686772/213540983-bb8a9a14-97f3-4ace-ad7d-0f2ae0c8772c.png)

_______________________________________________________________
The small character giving the big character a colorful "black eye":

![Screenshot (167)](https://user-images.githubusercontent.com/77686772/213541202-b6282b1a-9141-46c7-8dff-6588919ae79c.png)

_______________________________________________________________

## Functionality
- I focused on object oriented programming in order to reuse my characters and objects.
- The whole scene is rendered in render(timestamp) in main.js.
- Shader effects are done in main.html
- Blinn Phong illumination is used in main.html.

## Desclamer
- objects.js was given to us as template code and I have not modified it
- Parts of main.js were given to us and I have done my best to comment out which code is mine and which is not. 
- Main.html was given to us to be modified. Within main.html I have rewritten phong illumination to blinn phong, and added my own vertext and fragment shaders that I wrote from scratch. I also converted the ADS shader from vertex to fragment shader.

## Grade received
100%
