var mysql = require("mysql");

// create the connection information for the sql database
var connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: ""
});

// create the bamazon database and departments table
// and populate the departments table
connection.query("DROP DATABASE IF EXISTS bamazon", function (err) {
    if (err) throw err;
    connection.query("CREATE DATABASE bamazon", function (err) {
        if (err) throw err;
        connection.query("USE bamazon", function (err) {
            if (err) throw err;
            connection.query("CREATE TABLE departments ("
                + "department_id INT NOT NULL AUTO_INCREMENT,"
                + "department_name VARCHAR(30) NOT NULL,"
                + "over_head_costs DECIMAL(10,2) DEFAULT 0,"
                + "PRIMARY KEY (department_id)"
                + ")", function (err) {
                if (err) throw err;
                // seed the departments table in the bamazon database with sample data
                connection.query("INSERT INTO departments (department_name, over_head_costs)"
                    + "VALUES"
                    + "(\"Men's Shoes\", 320),"
                    + "(\"Women's Shoes\", 440),"
                    + "(\"Furniture\", 250),"
                    + "(\"Baby\", 850),"
                    + "(\"Electronics\", 110),"
                    + "(\"Men's Clothing\", 200),"
                    + "(\"Women's Clothing\", 520)", function (err) {
                    if (err) throw err;
                    // create the products table in the bamazon database
                    connection.query("CREATE TABLE products ("
                        + "item_id INT NOT NULL AUTO_INCREMENT,"
                        + "product_name VARCHAR(45) NOT NULL,"
                        + "department_id INT NOT NULL,"
                        + "price DECIMAL(10,2) NOT NULL,"
                        + "stock_quantity INT DEFAULT 0,"
                        + "product_sales DECIMAL(10,2) DEFAULT 0,"
                        + "PRIMARY KEY (item_id),"
                        + "FOREIGN KEY (department_id) REFERENCES departments(department_id)"
                        + ")", function (err) {
                        if (err) throw err;
                        // seed the products table in the bamazon database with sample data
                        connection.query("INSERT INTO products (product_name, department_id, price, stock_quantity)"
                            + "VALUES"
                            + "(\"Nike Air Force High Top Shoes\", 1, 119.99, 20),"
                            + "(\"High Heels\", 2, 179.99, 25),"
                            + "(\"Mahogany Coffee Table\", 3, 59.99, 15),"
                            + "(\"Pampers Diapers Economy Pack\", 4, 29.97, 50),"
                            + "(\"Apple iPhone 8 plus\", 5, 1029.00, 12),"
                            + "(\"George Men's Crew-Neck T-shirt\", 6, 4.00, 50),"
                            + "(\"Athletic Works Women's Popover Hoody\", 7, 9.50, 35),"
                            + "(\"Asus Rog 15.6 inch Gaming Laptop\", 5, 1528.00, 5),"
                            + "(\"Bily Deluxe Umbrella Stroller\", 4, 44.00, 30),"
                            + "(\"AND1 Mens' Coach Athletic Shoes\", 1, 14.99, 20)", function (err) {
                            if (err) throw err;
                            connection.end();
                        });
                    });
                });
            });
        });
    });
    console.log("The bamazon database and the associated departments and products table have been created.");
    console.log("The departments and products tables in the bamazon database have been seeded with 'mock' data.");
});
