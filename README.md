# 药食 · Chinese Food & Herb Encyclopedia

An English-first guide to Chinese herbs and everyday foods for people who didn't grow up with them. For each ingredient, it explains what Traditional Chinese Medicine (TCM) says, what modern research does and doesn't show, and how the ingredient is actually eaten. The site is available in **English, 中文 and Français**.

> **Live site:** https://lulu96802.github.io/yaoshi/

---

## What's inside

- **77 ingredients** in 8 groups: medicinal herbs; fruits; vegetables; mushrooms and fungi; grains, beans and nuts; spices and aromatics; meat, fish and eggs; and teas and sweeteners. Each one has:
  - Chinese characters, pinyin and the Latin name
  - photos of the ingredient where it grows, as it's sold, and in a dish
  - its TCM nature, taste, organ systems and traditional uses, explained in plain words
  - a "what the science says" summary, with evidence badges and linked sources
  - safety notes, such as drug interactions, allergies and pregnancy
- **How you feel:** 8 everyday situations (for example *"I feel cold all the time"* or *"I'm stressed"*), the foods TCM traditionally suggests for each, and clear signs that mean you should see a doctor.
- **Body type quiz:** 36 questions based on the nine-constitution framework, with scores for every type. The quiz includes a note on where the framework comes from and what the evidence shows.
- **Key ideas:** short explainers on qi, yin and yang, the five flavours, warming and cooling foods, dampness and more.
- **Did you know?** A rotating set of facts about food culture around the world.
- **Warming / neutral / cooling filter** and a search box that accepts English, French, pinyin, Chinese characters or Latin names.

## Running it locally

There's no build step and nothing to install. Download or clone the repository and open `index.html` in a browser.

```bash
git clone https://github.com/Lulu96802/yaoshi.git
cd yaoshi
open index.html        # macOS. On Windows, double-click the file instead.
```

## Publishing with GitHub Pages

1. Push these files to a public repository: `index.html`, the `img/` folder, `.nojekyll`, `README.md` and the licence files.
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, select `main` and `/ (root)`, then click **Save**.
4. After a minute or two the site will be live at `https://Lulu96802.github.io/yaoshi/`.

## Project structure

```
index.html        The whole site: content, styles, scripts and translations
img/              Ingredient photos, named <ingredient-id>-<1|2|3>.jpg
.nojekyll         Tells GitHub Pages to serve the files as they are
README.md
LICENSE           MIT License (code)
LICENSE-TEXT.md   CC BY 4.0 (written content)
```

## Content and sources

- **TCM descriptions** follow the *Chinese Pharmacopoeia* and traditional dietary texts.
- **Evidence summaries** are written from the sources linked on each ingredient page, such as NIH NCCIH, Memorial Sloan Kettering's *About Herbs*, PubMed-indexed studies and the USDA FoodData Central database.
- **Translations** into Chinese and French were drafted with AI assistance and are being reviewed. Corrections are welcome.

## Disclaimer

This site is for learning about Chinese food, herbs and culture. It is **not medical advice**. The "How you feel" pages and the body type quiz describe traditional ideas about food. They do not diagnose or treat anything, and they don't replace a doctor or pharmacist. Always check with a health professional before using herbs, especially if you are pregnant, breastfeeding, taking medicines or managing a health condition.

## About the images

The photos were collected from publicly available online sources to illustrate each ingredient. **They are not owned by this project and are not covered by its licences.** All rights remain with their original creators. If you own an image shown here and would like it credited or removed, please [open an issue](../../issues) and it will be updated promptly.

## Licence

- **Code** (HTML, CSS and JavaScript) is released under the [MIT License](LICENSE).
- **Written content** (ingredient descriptions, explainers, quiz text, facts and translations) is released under [Creative Commons Attribution 4.0 International (CC BY 4.0)](LICENSE-TEXT.md). You may share and adapt it, including commercially, as long as you give appropriate credit.
- **Photos** are excluded from both licences (see above).

## Feedback

Spotted a mistake, a better photo or an ingredient you'd like added? Please [open an issue](../../issues).

---

This is a personal side project and is not affiliated with any organisation.
