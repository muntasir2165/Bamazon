// require dependencies
var chalk = require("chalk");
var table = require("cli-table");
var readline = require("readline-sync");
var MySql = require("sync-mysql");

// create the connection information for the sql database
var connection = new MySql({
    host: "localhost",
    user: "root",
    password: "",
    database: "bamazon"
});

runApp();

function runApp() {
    console.log("Welcome to the Bamazon App!");
    while (true) {
        getAndDisplayProducts();
        console.log("Press q or Q anytime to quit the app.");
        var selectedProductId = getProductIdFromUser();
        if (quitApp(selectedProductId)){
            console.log("Exiting the Bamazon App...\nPlease visit us again.\n");
            break;
        }
        var quantityOfProduct = getProductQuantityFromUser(selectedProductId);
        if (quitApp(quantityOfProduct)){
            console.log("Exiting the Bamazon App...\nPlease visit us again.\n");
            break;
        }
        // at this point the selectedProductId and quantityOfProduct are valid
        // and so, the customer's order will be processed and reflected in the database
        processCustomerOrder(selectedProductId, quantityOfProduct);
        // uncomment the following line if the app is to be stopped after the first customer purchase
        // break; 
    }
}

function quitApp(input) {
    return (input === "q" || input === "Q");
}

function getProductIdFromUser() {
    while (true) {
        var selectedProductId = readline.question(chalk.greenBright("Please enter the ID of the product you would like to buy: "));
        if (quitApp(selectedProductId) || isIdValid(selectedProductId)) {
            return selectedProductId;
        } else {
            console.log(chalk.redBright("ERROR: Invalid id: " + selectedProductId));
        }
    }
}

function isIdValid(item_id) {
    if (isNaN(item_id) || !getProductId(item_id)) {
        return false;
    }
    return true;
}

function getProductQuantityFromUser(selectedProductId) {
    while (true) {
        var quantityOfProduct = readline.question(chalk.magentaBright("Please enter the number of units of '" + getProductName(selectedProductId) + "' you would like to buy: "));
        if (!quitApp(quantityOfProduct)) {
            if (isQuantityInvalid(quantityOfProduct)) {
                console.log(chalk.redBright("ERROR: Invalid quantity: " + quantityOfProduct
                    +"\nThe quantity must be a positive integer."));  
            } else if (!isQuantitySufficient(selectedProductId, quantityOfProduct)) {
                console.log(chalk.redBright("ERROR: Insufficient quantity in stock!\nPlease enter a number smaller than " + quantityOfProduct + "."));
            } else {
                return quantityOfProduct;
            }
        } else {
            return quantityOfProduct;
        }
    }
}

function isQuantityInvalid(quantity) {
    return isNaN(quantity) || parseInt(quantity) <= 0 || !isInteger(Number(quantity));
}

function isInteger(number) {
    // check that the input of type "number" is an integer
    return number % 1 === 0;
}

function isQuantitySufficient(item_id, quantity) {
    return (getProductQuantity(item_id) >= quantity);
}

function getAndDisplayProducts() {
    // only query the products that the store has in stock, that is, stock_quantity > 0
    var productArray = connection.query("SELECT item_id, product_name, price FROM bamazon.products WHERE stock_quantity > 0");
    displayProducts(productArray);
}

function displayProducts(productArray) {
    var products = new table({
        head: ["Id", "Name", "Price ($)"], 
        colWidths: [10, 45, 12],
        chars: { 'top': '═' , 'top-mid': '╤' , 'top-left': '╔' , 'top-right': '╗'
         , 'bottom': '═' , 'bottom-mid': '╧' , 'bottom-left': '╚' , 'bottom-right': '╝'
         , 'left': '║' , 'left-mid': '╟' , 'mid': '─' , 'mid-mid': '┼'
         , 'right': '║' , 'right-mid': '╢' , 'middle': '│' }
    });
    
    productArray.forEach(function(product){
        products.push([product.item_id, product.product_name, product.price]);
    });
    
    console.log(products.toString());
}

function getProductId(item_id) {
    var dbProduct = connection.query("SELECT item_id FROM bamazon.products WHERE item_id = ? AND stock_quantity > 0", [item_id]);
    if (dbProduct.length === 0) {
        console.log(chalk.redBright("ERROR: Invalid/sold out product!"));
        return null;
    } else {
        return parseInt(dbProduct[0]["item_id"]);
    }
}

function getProductName(item_id) {
    var dbProductName = connection.query("SELECT product_name FROM bamazon.products WHERE item_id = ?", [item_id]);
    if (dbProductName.length === 0) {
        console.log(chalk.redBright("ERROR: Invalid product!"));
    } else {
        return dbProductName[0]["product_name"];
    }
}

function getProductQuantity(item_id) {
    var dbProductQuantity = connection.query("SELECT stock_quantity FROM bamazon.products WHERE item_id = ?", [item_id]);
    if (dbProductQuantity.length === 0) {
        console.log(chalk.redBright("ERROR: Invalid product!"));
    } else {
        return parseInt(dbProductQuantity[0]["stock_quantity"]);
    }
}

function getProductPrice(item_id) {
    var dbProductPrice = connection.query("SELECT price FROM bamazon.products WHERE item_id = ?", [item_id]);
    if (dbProductPrice.length === 0) {
        console.log(chalk.redBright("ERROR: Invalid product!"));
    } else {
        return parseFloat(dbProductPrice[0]["price"]);
    }
}

function getProductSales(item_id) {
    var dbProductPriceSales = connection.query("SELECT product_sales FROM bamazon.products WHERE item_id = ?", [item_id]);
    if (dbProductPriceSales.length === 0) {
        console.log(chalk.redBright("ERROR: Invalid product!"));
    } else {
        return parseFloat(dbProductPriceSales[0]["product_sales"]);
    }
}

function processCustomerOrder(item_id, requested_quantity) {
    var saleRevenue = (getProductPrice(item_id) * requested_quantity);
    var result = connection.query("UPDATE bamazon.products SET stock_quantity = ?, product_sales = ? WHERE item_id = ?", [getProductQuantity(item_id) - requested_quantity, getProductSales(item_id) + saleRevenue, item_id]);
    if (result.changedRows === 1) {
      console.log(chalk.bold.cyanBright("You just purchased " + requested_quantity + " " + getProductName(item_id) + "(s)."
        + "\nTotal cost: $" + saleRevenue.toFixed(2)
        + "\nThank you for your business!\n\n"));
    }
}