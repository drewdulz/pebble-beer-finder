

var UI = require('ui');
var Vector2 = require('vector2');
var ajax = require('ajax');

// Show a loading screen
var loadingWindow = new UI.Window({
	fullscreen: true,
});
var textfield = new UI.Text({
	position: new Vector2(0, 45),
	size: new Vector2(144, 30),
	font: 'gothic-24-bold',
	text: 'Loading Beers on Sale...',
	textAlign: 'center'
});
loadingWindow.add(textfield);
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
			});
			// Construct the more info panel
			// Title
			var title = new UI.Text({
				position: new Vector2(20, 0),
				size: new Vector2(124, 20),
				font: 'gothic-18-bold',
				text: data[0].name,
				textOverflow: 'ellipsis',
				textAlign: 'left'
			});

			// Percent Alcohol
			var percentAlc = new UI.Text({
				position: new Vector2(20, 20),
				size: new Vector2(124, 10),
				font: 'gothic-14',
				text: "% Alcohol: " + data[0].abv,
				textAlign: 'left'
			});

			// Pricing Title
			var priceTitle = new UI.Text({
				position: new Vector2(20, 30),
				size: new Vector2(124, 20),
				font: 'gothic-18',
				text: "Pricing",
				textAlign: 'left'
			});

			// Generate the pricing table:
			var priceTable = [];
			data.forEach(function(product, index) {
				// generate an array of price information
				priceTable[index] = new UI.Text({
					position: new Vector2(20, 50 + index * 10),
					size: new Vector2(124, 10),
					font: 'gothic-14',
					text: "$" + product.price + " for " + product.size,
					textOverflow: 'fill',
					textAlign: 'left'
				})

			})

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

