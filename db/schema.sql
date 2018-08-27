-- change the root password to an empty string for development purposes
-- ALTER USER "root"@"localhost" IDENTIFIED BY "";
-- ALTER USER "root"@"localhost" IDENTIFIED WITH mysql_native_password BY "";
-- ALTER USER 'root'@'localhost' IDENTIFIED BY '';
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '';

DROP DATABASE IF EXISTS bamazon;

CREATE DATABASE bamazon;

USE bamazon;

CREATE TABLE departments (
	department_id INT NOT NULL AUTO_INCREMENT,
	department_name VARCHAR(30) NOT NULL,
	over_head_costs DECIMAL(10,2) DEFAULT 0,
	PRIMARY KEY (department_id)
);

CREATE TABLE products (
	item_id INT NOT NULL AUTO_INCREMENT,
	product_name VARCHAR(45) NOT NULL,
	department_id INT NOT NULL,
	price DECIMAL(10,2) NOT NULL,
	stock_quantity INT DEFAULT 0,
	product_sales DECIMAL(10,2) DEFAULT 0,
	PRIMARY KEY (item_id),
	FOREIGN KEY (department_id) REFERENCES departments(department_id)
);