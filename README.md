# Halte — café website

An interactive website for a fictional European café, built for visitors from across Europe. It is a static front end with no build step: plain HTML, CSS and JavaScript (ES modules).

**Live:** https://saurabh-1907.github.io/halte-cafe/

## Features

- **Four languages (EN / DE / FR / IT).** Picked from the browser language on the first visit, remembered afterwards, and linkable with `?lang=de`. Prices use `Intl.NumberFormat` (`€3.40` in English, `3,40 €` in German, French and Italian), and times use the 24-hour clock (`07h30` in French).
- **Menu.** Coffee, Bakery and Brunch categories with Vegan and Gluten-free filters. Every dish shows its allergens, following EU Regulation 1169/2011.
- **Order ahead.** Quantity steppers on the menu cards and in the basket, and a total that includes VAT. Pick-up slots are built from the opening hours: at least 15 minutes ahead, the last slot 30 minutes before closing, and tomorrow's slots once today has none left. The order needs a name before it can be placed, and placing it shows a pick-up code.
- **Live opening status.** "Open now" or "opens tomorrow, 09:00", and today's row is highlighted in the opening-hours list. It refreshes every minute.
- **Cookie consent.** "Essential only" and "Accept all" are given equal weight, and the choice can be reopened from the footer. No analytics are loaded.
- **Remembers between visits.** The basket, language and cookie choice are saved in `localStorage`. Reads and writes are wrapped so the site still works when storage is blocked.
- **Motion and accessibility.** Steam rises from the cup, the badge spins, the cup follows the pointer slightly in the hero, a band of words scrolls across, and the cards lift on hover. All animation stops when the visitor's device asks for reduced motion. The site also has a skip link, `aria-pressed` toggle buttons, labelled form fields, visible focus outlines, 44 px touch targets, and a floating basket bar on phones.
- **Legal page.** `legal.html` holds Imprint and Privacy templates with placeholders.

## Project structure

```
index.html        page markup (strings are filled in by JS via data-i18n)
legal.html        imprint and privacy templates
css/styles.css    all styles
js/data.js        menu, prices, allergens, opening hours (sample content)
js/i18n.js        UI strings in four languages
js/logic.js       pure logic: money and time formatting, opening status, pick-up slots, basket maths
js/app.js         DOM rendering, events, storage
test/             unit tests for logic.js (node --test)
```

## Run locally

```bash
npm start      # serves on http://localhost:5173
npm test       # runs the unit tests
```

## Before going live

The menu, prices and opening hours in `js/data.js` are sample content. The address, phone, email, company name and VAT ID are left as `[PLACEHOLDERS]` in `index.html` and `legal.html`. Placing an order does not send it anywhere yet: it shows a confirmation in the browser only. Connecting a backend is the next step.
