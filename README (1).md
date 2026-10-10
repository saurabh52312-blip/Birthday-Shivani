# Happy Birthday, Shivani 💗

A romantic birthday surprise website (HTML, CSS, vanilla JS). No backend needed.

## Folder structure

```
index.html
style.css
script.js
photos/
  photo1.JPG
  photo2.JPG
  photo3.JPG   <- hero image
  photo4.JPG
  photo5.PNG
  photo6.JPG
assets/
  birthday-song.mp3
```

File names are case-sensitive on GitHub Pages: `.JPG` and `.PNG` must stay in capitals, exactly as above.

## Deploy on GitHub Pages

1. Create a new repository on GitHub and upload all files and both folders.
2. Go to **Settings -> Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, branch `main`, folder `/ (root)`, then Save.
4. After a minute your site is live at `https://<username>.github.io/<repo-name>/`.

## Notes

- Music starts only after she taps "Open Your Surprise" (browsers block autoplay). If `assets/birthday-song.mp3` is missing, the page still works and the music button shows a friendly message.
- Phone photos can be large. If the site loads slowly, resize each photo to about 1200px wide.
- Edit the love letter text in `index.html` (the `letter-card` section) to make it more personal.
