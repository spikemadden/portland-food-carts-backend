'use strict';

const express = require('express');
const serverless = require('serverless-http');
const fetch = require('node-fetch');
const app = express();

app.get('/search', (req, res) => {
  fetch(process.env.FOOD_CARTS_URL).then((response) => {
    return response.json();
  }).then((json) => {
    let search_term = req.query.q;
    let results = json;
    if (search_term) {
      search_term = search_term.toLowerCase();
      results = json.filter((cart) => {
        return cart.name.toLowerCase().includes(search_term) ||
          cart.alias.includes(search_term) ||
          check_categories(cart, search_term);
      });
    }
    let r = [];
    let skipped = 0;

    for (let i = 0; i < results.length; i++) {
      if (!results[i].name || !results[i].location.address1) {
        skipped += 1;
      } else {
        let cart = {
          "name": results[i].name,
          "address": results[i].location.address1,
          "latitude": results[i].coordinates.latitude,
          "longitude": results[i].coordinates.longitude,
          "rating": results[i].rating,
          "url": results[i].url
        };
        r.push(cart);
      }
    }
    res.set({
      'Access-Control-Allow-Origin': '*',	
    });
    res.send(JSON.stringify({
      "status": "success",
      "hits": results.length - skipped,
      "carts": r
    }));
  });
});

function check_categories(cart, keyword) {
  for (let i = 0; i < cart.categories.length; i++) {
    if (cart.categories[i].alias.includes(keyword)) {
      return true;
    }
  }
  return false;
}

module.exports.search = serverless(app);
