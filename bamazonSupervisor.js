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
    console.log("Welcome to the Bamazon CLI Supervisor App!");
    var keepAppRunning = true;
    while (keepAppRunning) {
        console.log("Please choose one of the following options:"
            +"\n(1) View Product Sales by Department"
            +"\n(2) Create New Department\n");
        var selectedOption = null;
        while (true) {
            selectedOption = readline.question(chalk.greenBright("Please enter a number between 1 and 2 (inclusive) or q/Q to quit the app: "));
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
                console.log("Exiting the Bamazon Supervisor App...");
                break;
            case "1":
                getAndDisplayProductSalesByDepartment();
                break;
            case "2":
                createNewDepartment();
                break;
        }

    }
}

function quitApp(input) {
    return (input === "q" || input === "Q");
}

function isInputValid(input) {
    return (input === "1" || input === "2");
}


function createNewDepartment() {
    var deaprtmentName = getProductDepartmentNameFromSupervisor();
    var overHeadCosts = getDepartmentOverHeadCostsFromSupervisor();
    addNewDepartmentToDb(deaprtmentName, overHeadCosts);
}

function getAndDisplayProductSalesByDepartment() {
    var departmentsArray = connection.query("SELECT departments.department_id, department_name, over_head_costs, COALESCE(total_product_sales, 0) AS total_product_sales, COALESCE(SUM(total_product_sales - over_head_costs), 0) AS total_profit FROM departments LEFT OUTER JOIN (SELECT department_id, SUM(product_sales) AS total_product_sales FROM products GROUP BY department_id) AS products_revenue ON departments.department_id = products_revenue.department_id GROUP BY departments.department_id");
    displayProductSalesByDepartment(departmentsArray);
}

function displayProductSalesByDepartment(departmentsArray) {
    var departments = new table({
        head: ["Department Id", "Department Name", "Overhead Costs ($)", "Product Sales ($)", "Total Profit ($)"], 
        colWidths: [15, 30, 20, 20, 18],
        chars: { 'top': '═' , 'top-mid': '╤' , 'top-left': '╔' , 'top-right': '╗'
         , 'bottom': '═' , 'bottom-mid': '╧' , 'bottom-left': '╚' , 'bottom-right': '╝'
         , 'left': '║' , 'left-mid': '╟' , 'mid': '─' , 'mid-mid': '┼'
         , 'right': '║' , 'right-mid': '╢' , 'middle': '│' }
    });
    
    departmentsArray.forEach(function(department){
        departments.push([department.department_id, department.department_name, department.over_head_costs, department.total_product_sales, department.total_profit]);
    });
    
    console.log(departments.toString());
}

function getProductDepartmentNameFromSupervisor() {    
    while (true) {
        var departmentName = readline.question(chalk.magentaBright("Please enter the new department name to add to the Bamazon database: "));
        if (!departmentName) {
            console.log(chalk.redBright("ERROR: Invalid name: " + departmentName
                +"\nThe department name must be a non-empty string."));  
        } else {
            return departmentName;
        }
    }
}

function getDepartmentOverHeadCostsFromSupervisor() {   
    while (true) {
        var dbDepartmentOverHeadCosts = readline.question(chalk.magentaBright("Please enter the new department's overhead costs: "));
        if (isNaN(parseFloat(dbDepartmentOverHeadCosts)) || parseFloat(dbDepartmentOverHeadCosts) <= 0) {
            console.log(chalk.redBright("ERROR: Invalid overhead costs: $" + dbDepartmentOverHeadCosts
                +"\nThe overhead costs must be a number greater than 0."));  
        } else {
            return parseFloat(dbDepartmentOverHeadCosts);
        }
    }
}

function getDepartmentNameFromDb(department_id) {
    var dbDepartmentName = connection.query("SELECT department_name FROM bamazon.departments WHERE department_id = ?", [department_id]);
    if (dbDepartmentName.length === 0) {
        console.log(chalk.redBright("ERROR: Invalid department!"));
    } else {
        return dbDepartmentName[0]["department_name"];
    }
}

function getDepartmentOverHeadCostsfromDb(department_id) {
    var dbDepartmentOverHeadCosts = connection.query("SELECT over_head_costs FROM bamazon.departments WHERE department_id = ?", [department_id]);
    if (dbDepartmentOverHeadCosts.length === 0) {
        console.log(chalk.redBright("ERROR: Invalid department!"));
    } else {
        return dbDepartmentOverHeadCosts[0]["over_head_costs"];
    }
}

function addNewDepartmentToDb(departmentName, overHeadCosts) {
    var result = connection.query("INSERT INTO departments (department_name, over_head_costs) VALUES (?, ?)",
        [departmentName, overHeadCosts]);
    if (result.changedRows === 1) {
      console.log(chalk.bold.cyanBright("You have added a new department named " + getDepartmentNameFromDb(result.insertId)
        + " with an overhead cost of " + getDepartmentOverHeadCostsfromDb(result.insertId) + " to the Bamazon database."));
    }   
}