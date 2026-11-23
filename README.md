# Retardino

El súper de la esquina. A tiny 3D bazaar: products sit on a lazy susan you can
drag, the shopkeeper watches from the middle, and the card always gets declined.

## Run it

No build step. Serve the folder with any static server:

```sh
python3 -m http.server 8000   # then open http://localhost:8000
```

It also works as-is on GitHub Pages.

## Where things live

- `index.html`, `style.css` — page, price tag, receipt
- `src/products.js` — the catalogue (names, prices, copy) and each product's 3D model
- `src/kit.js` — the sketchbook look: toon colours, ink outlines, hand-lettered labels
- `src/main.js` — carousel, input, basket
- `vendor/` — three.js (MIT)

To add a product, write a builder in `src/products.js` that returns
`{ group, update }` and add an entry to `catalogue`.
