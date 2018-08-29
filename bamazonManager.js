// require dependencies
var chalk = require("chalk");
var table = require("cli-table");
var readline = require("readline-sync");
var MySql = require("sync-mysql");

// create the connection information for the sql database
var connection = new MySql({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "bamazon"
});

runApp();

function runApp() {
    console.log("Welcome to the Bamazon CLI Manager App!");
    var keepAppRunning = true;
    while (keepAppRunning) {
        console.log("Please choose one of the following options:"
            +"\n(1) View Products for Sale"
            +"\n(2) View Low Inventory"
            +"\n(3) Add to Inventory"
            +"\n(4) Add New Product\n");
        var selectedOption = null;
        while (true) {
            selectedOption = readline.question(chalk.greenBright("Please enter a number between 1 and 4 (inclusive) or q/Q to quit the app: "));
             if (quitApp(selectedOption) || isInputValid(selectedOption)) {
                break;
            } else if (!isInputValid(selectedOption)) {
                console.log(chalk.redBright("ERROR: Invalid selection."));
            }
        }
        switch (selectedOption) {
            case "q":
            case "Q":
                keepAppRunning = false;
                console.log("Exiting the Bamazon Manager App...");
                break;
            case "1":
                getAndDisplayProducts("all");
                break;
            case "2":
                getAndDisplayProducts("low_inventory");
                break;
            case "3":
                addMoreProductQuantityToInventory();
                break;
            case "4":
                addNewProductToInventory();
                break;
        }

    }
}

function quitApp(input) {
    return (input === "q" || input === "Q");
}

function isInputValid(input) {
    return (input === "1" || input === "2" || input === "3" || input === "4");
}

function addMoreProductQuantityToInventory() {
    var selectedProductId = getProductIdFromManager();
    var productQuantity = getProductQuantityFromManager(selectedProductId);
    setProductQuantityToDb(selectedProductId, productQuantity);
}

function isIdValid(item_id) {
    if (isNaN(item_id) || !getProductId(item_id)) {
        return false;
    }
    return true;
}

function isQuantityInvalid(quantity) {
    return isNaN(quantity) || parseInt(quantity) <= 0 || !isInteger(Number(quantity));
}

function isInteger(number) {
    // check that the input of type "number" is an integer
    return number % 1 === 0;
}

function addNewProductToInventory() {
    var productName = getProductNameFromManager();
    var departmentId = getProductDepartmentFromManager();
    var productPrice= getProductPriceFromManager();
    var productQuantity = getProductQuantityFromManager();
    addNewProductToDb(productName, departmentId, productPrice, productQuantity);
}

function getProductIdFromManager() {
    while (true) {
        var selectedProductId = readline.question(chalk.greenBright("Please enter the ID of the product you would like to restock the inventory with: "));
        if (isIdValid(selectedProductId)) {
            return selectedProductId;
        } else {
            console.log(chalk.redBright("ERROR: Invalid id: " + selectedProductId));
        }
    }   
}

function getProductNameFromManager() {
    while (true) {
        var productName = readline.question(chalk.magentaBright("Please enter the new product name to add to the inventory: "));
        if (!productName) {
            console.log(chalk.redBright("ERROR: Invalid name: " + productName
                +"\nThe product name must be a non-empty string."));  
        } else {
            return productName;
        }
    }
}

function getProductDepartmentFromManager() {    
    while (true) {
        var departments = getDepartments();
        displayDepartments(departments);
        var departmentId = readline.question(chalk.magentaBright("Please enter a number between 1 and " + departments.length + " (inclusive) for the new product's department id: "));
        if (!departmentId || isNaN(departmentId) || parseInt(departmentId) < 1 || parseInt(departmentId) > departments.length) {
            console.log(chalk.redBright("ERROR: Invalid Department Id: " + departmentId
                +"\nThe department ifd must be an integer between 1 and " + departments.length + " inclusive."));  
        } else {
            return departmentId;
        }
    }
}

function getProductPriceFromManager() {   
    while (true) {
        var productPrice = readline.question(chalk.magentaBright("Please enter the new product's price: "));
        if (isNaN(parseFloat(productPrice)) || parseFloat(productPrice) <= 0) {
            console.log(chalk.redBright("ERROR: Invalid price: $" + productPrice
                +"\nThe price must be a number greater than 0."));  
        } else {
            return parseFloat(productPrice);
        }
    }
}

function getProductQuantityFromManager(item_id) {
    while (true) {
        var productQuantity = null;
        if (item_id) {
            productQuantity = readline.question(chalk.magentaBright("Please enter the NEW number of units of '" + getProductName(item_id) + "' in the inventory: "));
        } else {
            productQuantity = readline.question(chalk.magentaBright("Please enter the quantity of the new product to add to the inventory: "));     
        }
        if (isQuantityInvalid(productQuantity)) {
            console.log(chalk.redBright("ERROR: Invalid quantity: " + productQuantity
                +"\nThe quantity must be a positive integer."));  
        } else {
            return parseInt(productQuantity);
        }
    }
}

function setProductQuantityToDb(item_id, new_quantity) {
    var oldQuantity = getProductQuantity(item_id);
    var result = connection.query("UPDATE bamazon.products SET stock_quantity = ?  WHERE item_id = ?", [new_quantity, item_id]);
    if (result.changedRows === 1) {
      console.log(chalk.bold.cyanBright("You have updated the stock of " + getProductName(item_id) + "(s)"
        + " from " + oldQuantity + " to " + getProductQuantity(item_id) + " units"));
    }
}

function addNewProductToDb(productName, departmentId, productPrice, productQuantity) {
    var result = connection.query("INSERT INTO products (product_name, department_id, price, stock_quantity) VALUES (?, ?, ?, ?)",
        [productName, departmentId, productPrice, productQuantity]);
    // (sample output) => new data added to db: {"fieldCount":0,"affectedRows":1,"insertId":12,"serverStatus":2,"warningCount":0,"message":"","protocol41":true,"changedRows":0}
    if (result.changedRows === 1) {
      console.log(chalk.bold.cyanBright("You have added " + getProductQuantity(item_id) + " units of "
        + getProductName(item_id) + "(s)" + " to the inventory"));
    }   
}

function getAndDisplayProducts(criteria) {
    var productArray = "";
    switch(criteria) {
        case "all":
            productArray = connection.query("SELECT item_id, product_name, department_name, price, stock_quantity FROM bamazon.products JOIN bamazon.departments ON products.department_id = departments.department_id ORDER BY item_id");
            break;
        case "low_inventory":
            productArray = connection.query("SELECT item_id, product_name, department_name, price, stock_quantity FROM bamazon.products JOIN bamazon.departments ON products.department_id = departments.department_id WHERE stock_quantity < 5 ORDER BY item_id");
    }
    displayProducts(productArray);
}

function displayProducts(productArray) {
    var products = new table({
        head: ["Id", "Name", "Department", "Price ($)", "Quantity"], 
        colWidths: [12, 40, 20, 12, 12],
        chars: { 'top': '═' , 'top-mid': '╤' , 'top-left': '╔' , 'top-right': '╗'
         , 'bottom': '═' , 'bottom-mid': '╧' , 'bottom-left': '╚' , 'bottom-right': '╝'
         , 'left': '║' , 'left-mid': '╟' , 'mid': '─' , 'mid-mid': '┼'
         , 'right': '║' , 'right-mid': '╢' , 'middle': '│' }
    });
    
    if (productArray.length > 0) {
        productArray.forEach(function(product){
            products.push([product.item_id, product.product_name, product.department_name, product.price, product.stock_quantity]);
        });
        
        console.log(products.toString());
    } else {
        console.log(chalk.yellowBright("\nThere is no product to display at the moment\n"));
    }
}

function getProductId(item_id) {
    var dbProduct = connection.query("SELECT item_id FROM bamazon.products WHERE item_id = ?", [item_id]);
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

function displayDepartments(departments) {
    var displayOutput = "";
    departments.forEach(function(department){
        displayOutput += "Department Id: " + department.department_id + " Department Name: " + department.department_name + "\n";
    });
    console.log(displayOutput);
}

function getDepartments() {
    var departments = connection.query("SELECT department_id, department_name FROM bamazon.departments");
    return departments;
}