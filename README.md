# Metaballs

[Visualization for metaballs on a canvas](https://claudiu-codreanu.github.io/metaballs/main.html), using rendering without any pixelation.  
Can choose different visual effects, some quite spectacular.

<br>

- Click [here](https://claudiu-codreanu.github.io/metaballs/challenge.html) to see the original challenge and requirements
- Click [here](https://claudiu-codreanu.github.io/metaballs/main.html) to see my implementation

<br>

This was a very interesting challenge.  
A deceivingly simple algorithm, which generates stunning animations!

I had fun implementing it, but I got frustrated with the decrease in performance for larger canvases.  
Pixilating did help performance indeed, but it impacted the visuals.

So I logged some timing, and the findings were surprising:

- Calculations were actually blazing fast (about 10 milliseconds per frame)
- But rendering was painfully sluggish (100 to 500+ milliseconds per frame, depending on canvas size)

<br>

That's because I was painting every pixel or square using HSL values, and the `fillRect()` primitive.

So I decided to try something faster, such as the `getImageData()` / `putImageData()` primitives, which transfer entire arrays of pixels in a shot.

<br>

Boy was that a game changer!  
It brought rendering down to ~15 milliseconds per frame, even for larger canvases!

(Well, only for Chrome and Edge… Firefox is surprisingly slower in this regards).

<br>

Also, because image data works with RGB (not HSL), it opened the door for a rich array of color effects.  
The only challenge was converting from Hue values (single numbers) to RGB (three numbers), but I found a convenient formula online.

<br>

[Click here](https://claudiu-codreanu.github.io/metaballs/main.html) to play with my implementation.  
Make sure to try all visual effects, some are quite surprising 😎

