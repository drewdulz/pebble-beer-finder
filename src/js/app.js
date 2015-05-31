/*
Pebble Beer Finder
Copyright 2015 Andrew Warkentin

This Pebble app displays which beer is on sale at Ontatrio Beer Stores
Information obtained from http://ontariobeerapi.ca
Beer icon made by Freepik from www.flaticon.com
*/

var UI = require('ui');
var Vector2 = require('vector2');
var ajax = require('ajax');

// Show a loading screen
var loadingWindow = new UI.Window({
	fullscreen: true,
});

var background = new UI.Rect({
	position: new Vector2(0, 0),
	size: new Vector2(144, 166), 
	backgroundColor: 'white'
});
var textfield = new UI.Text({ 
	position: new Vector2(0, 0), 
	size: new Vector2(144, 20),
	font: 'gothic-24-bold',
	text: 'Loading...', 
	textAlign: 'center', 
  color: 'black'
});
var loadingImage = new UI.Image({
	position: new Vector2(8, 35),
	size: new Vector2(128, 128),
	backgroundColor: 'clear', 
	image: 'images/loading.png'
});

loadingWindow.add(background);
loadingWindow.add(textfield);
loadingWindow.add(loadingImage); 
loadingWindow.show();

// Perform a GET requsest to the Ontario beer API.
var list = {};
ajax(
	{
		url: 'http://ontariobeerapi.ca:80/beers/?on_sale=true',
		type: 'json'
	},
	function(data, status, request) {
		// Loop through the results and push them to the items in the Menu list
		var beerList = data;
		var beerItems = [];
		data.forEach(function(beer) {
			beerItems.push({
				title: beer.name,
				subtitle: beer.type
			});
		});

		// Generate the list
		list = new UI.Menu({
			sections: [{
				title: "Beer on Sale",
				items: beerItems
			}]
		});

		// Display more info when a beer is selecteds
		list.on('select', function(e) {
			showMoreInfo(beerList, e.itemIndex);
		});

		// Show the list & hide the loading indicator
		list.show();
		loadingWindow.hide();
	},
	function(error, status, request) {
		showErrorMessage('Beer information is unavailable')
	}
);

var showMoreInfo = function(beerList, index) {
	// get more info about that beer via HTTP request
	var beerID = beerList[index].beer_id;
	ajax(
		{
			url: 'http://ontariobeerapi.ca:80/beers/' + beerID + '/products/',
			type: 'json'
		},
		function(data, status, request) {
			// construct the new window for more beer info
			var moreInfo = new UI.Window({
				fullscreen: true,
				scrollable: true
			});
			// Construct the more info panel
			// Title
			var title = new UI.Text({
				position: new Vector2(5, 0),
				size: new Vector2(144, 20),
				font: 'gothic-18-bold',
				text: data[0].name,
				textOverflow: 'ellipsis',
				textAlign: 'left'
			});

			// Percent Alcohol
			var percentAlc = new UI.Text({
				position: new Vector2(5, 20),
				size: new Vector2(144, 20),
				font: 'gothic-14',
				text: "% Alcohol: " + data[0].abv,
				textAlign: 'left'
			});

			// Pricing Title
			var priceTitle = new UI.Text({
				position: new Vector2(5, 40),
				size: new Vector2(144, 20),
				font: 'gothic-18',
				text: "Pricing:",
				textAlign: 'left'
			});

			// Generate the pricing table:
			var priceTable = [];
			data.forEach(function(product, index) {
				var productSize = product.size;
				var numberOfProducts = productSize.slice(0,2); // Get the number of items

				// Parse the string to make the text simpler for displaying on a small screen.
				if(productSize.search("355") > 0) {
					productSize = " Cans";
				} else if(productSize.search("341") > 0) {
					productSize = " Bottles";
				} else if(productSize.search("473") > 0) {
					productSize = " Tall Boys";
				} else if(productSize.search("Keg") > 0) {
					productSize = " Keg";
				}

				// Special case for price of 1 tall boy
				if(numberOfProducts.search("1 ") > 0) { 
					productSize = "Tall Boy"; 
				}

				// generate an array of price information
				priceTable[index] = new UI.Text({
					position: new Vector2(5, 60 + index * 15),
					size: new Vector2(144, 15),
					font: 'gothic-14',
					text: "$" + product.price + " for " + numberOfProducts + productSize,
					textOverflow: 'fill',
					textAlign: 'left'
				})
			});

			moreInfo.add(title);
			moreInfo.add(percentAlc);
			moreInfo.add(priceTitle);
			priceTable.forEach(function(priceInfo) {
				moreInfo.add(priceInfo);
			})
			moreInfo.show();
		},
		function(error, status, request) {
			showErrorMessage("Information Unavailable.");
		}
	);
}

// Shows input error message in a card
var showErrorMessage = function(message) {
	var errorMessage = new UI.Window({
		fullscreen: true,
	});
	// Construct the more info panel
	var textfield = new UI.Text({
		position: new Vector2(0, 55),
		size: new Vector2(144, 30),
		font: 'gothic-24-bold',
		textOverflow: 'wrap',
		text: message,
		textAlign: 'center'
	});

	errorMessage.add(textfield);
	errorMessage.show();
}

