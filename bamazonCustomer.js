const mysql = require("mysql");
const inquirer = require("inquirer");
const Table = require("cli-table");


//Sets mysql database to a variable
const connection = mysql.createConnection({
    host: "localhost",
    port: 8889,
    user: "root",
    password: "root",
    database: "bamazon"
});

//Connects to the database
connection.connect(function (err) {
    //if error, display error
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
    //otherwise display items for sale
    displayItems();
});

function displayItems() {
    const query = "Select item_id, product_name, department_name, price FROM products";
    connection.query(query, function (err, res) {

        if (err) throw err;

        const table = new Table({
            head: ["ID", "Product Name", "Department", "Price"],
            style: {
                head: ['blue'],
                compact: false,
                colAligns: ["center"],
            }
        });

        for (let i = 0; i < res.length; i++) {
            table.push(
                [res[i].item_id, res[i].product_name, res[i].department_name, res[i].price]
            );
        }

        console.log(table.toString());

        buyItem();
    })
}

function buyItem() {
    inquirer.prompt([
        {
            name: "product_id",
            type: "input",
            message: "Please enter the id of the item you wish to purchase.",
            validate: function (value) {
                if (isNaN(value) === false) {
                    return true;
                }
                else {
                    return false;
                }
            }
        }, {
            name: "quantity",
            type: "input",
            message: "How many do you want to purchase?",
            validate: function (value) {
                if (isNaN(value) === false) {
                    return true;
                }
                else {
                    return false;
                }
            }
        }]).then(function (userInput) {

            let id = userInput.product_id;
            let quantity = userInput.quantity;
            

            const query = "SELECT stock_quantity, price, department_name FROM products WHERE ?";

            connection.query(query, {item_id: id}, function(err, res){

                if (err) throw err;

                if (res.length === 0) {
                    console.log("Item not found. Please enter a valid item number.");
                    displayItems();
                }

                if (res[0].stock_quantity >= quantity) {
                    let total = (quantity * res[0].price).toFixed(2);
                    let updatedQuantity = res[0].stock_quantity - quantity;
                    
                    console.log("Your total cost is " + total);

                    connection.query("UPDATE products SET ? WHERE ?", [{
                        stock_quantity: updatedQuantity
                    },
                    {
                        item_id: id
                    }], function(err,res){
                        console.log("Database updated");
                    });

                    // connection.end();
                } else {
                    console.log("Insufficient quantity!")
                }
                displayItems();

            })

        
        });
}