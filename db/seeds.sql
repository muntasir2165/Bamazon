USE bamazon;

-- seed the departments table in the bamazon database with sample data
INSERT INTO departments (department_name, over_head_costs)
VALUES
("Men's Shoes", 320),
("Women's Shoes", 440),
("Furniture", 250),
("Baby", 850),
("Electronics", 110),
("Men's Clothing", 200),
("Women's Clothing", 520);

-- seed the products table in the bamazon database with sample data
INSERT INTO products (product_name, department_id, price, stock_quantity)
VALUES
("Nike Air Force High Top Shoes", 1, 119.99, 20),
("High Heels", 2, 179.99, 25),
("Mahogany Coffee Table", 3, 59.99, 15),
("Pampers Diapers Economy Pack", 4, 29.97, 50),
("Apple iPhone 8 plus", 5, 1029.00, 12),
("George Men's Crew-Neck T-shirt", 6, 4.00, 50),
("Athletic Works Women's Popover Hoody", 7, 9.50, 35),
("Asus Rog 15.6 inch Gaming Laptop", 5, 1528.00, 5),
("Bily Deluxe Umbrella Stroller", 4, 44.00, 30),
("AND1 Mens' Coach Athletic Shoes", 1, 14.99, 20);

USE bamazon;
SELECT * FROM departments;
SELECT * FROM products;