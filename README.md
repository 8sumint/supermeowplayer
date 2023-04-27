# supermeowplayer

　　*supermeowplayer* ～ live cutely always. be an idol☆ミ

moeful js music player

<img src="https://natu.moe/supermeowplayer/screenshot1.png" width=262 height=193 />

usage: (see [natu.moe](https://natu.moe) for irl example)

```html
<meowplayer>
<audio src="nya.mp3"></audio>
</meowplayer>
```

```html
Global volume control (scaled by individual player's "vol"):
<input type="range" id="mp-volume" oninput="on_global_volume_update()" min="10" max="100" value="90">

<meowplayer canpause animsrc="nya.anim" vol=0.8>
<audio src="nya.mp3"></audio>
</meowplayer>
```

use `canpause` to allow pausing, otherwise it's simple play/rewind operation (good for short clips)

some features:
- full auto-stop mechanism
- text animation capability
- short fade-in/out on play/pause
- seeking on click
- requires you to use a [good font](https://int10h.org/oldschool-pc-fonts/fontlist/) or it'll look awful
- some other kinda weird things i never changed

example.html hosted [here](https://natu.moe/supermeowplayer) so you don't have to yet

please enjoy <3
