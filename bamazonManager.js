const mysql = require("mysql");
const inquirer = require("inquirer");
const Table = require("cli-table");


//Sets mysql database to a variable
var connection = mysql.createConnection({
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
    //otherwise shows actions for Manager to complete
    selectAction();
});

function selectAction() {
    inquirer.prompt([
        {
            type: "list",
            name: "action",
            message: "Hello Bamazon manager! What would you like to do?",
            choices: [
                "View Products for Sale",
                "View Low Inventory",
                "Add to Inventory",
                "Add New Product"
            ]
        }
    ]).then(function (input) {

        switch (input.action) {
            case "View Products for Sale":
                viewProducts();
                break;

            case "View Low Inventory":
                viewLowStock();
                break;

            case "Add to Inventory":
                addStock();
                break;

            case "Add New Product":
                addProduct();
                break;
        }
    });
};

function viewProducts() {
    
    const query = "SELECT item_id, product_name, department_name, price, stock_quantity FROM products";

    connection.query(query, function (err, res) {

        if (err) throw err;

        const table = new Table({
            head: ["ID", "Product Name", "Department", "Price", "Stock Quantity"],
            style: {
                head: ['blue'],
                compact: false,
                colAligns: ["center"],
            }
        });

        for (let i = 0; i < res.length; i++) {
            table.push(
                [res[i].item_id, res[i].product_name, res[i].department_name, res[i].price, res[i].stock_quantity]
            );
        }

        console.log(table.toString());

        selectAction();

    })
}

function viewLowStock() {
    
    const query = "SELECT item_id, product_name, stock_quantity FROM products WHERE stock_quantity < 5"

    connection.query(query, function (err, res) {

        if (err) throw err;

        const table = new Table({
            head: ["ID", "Product Name", "Stock Quantity"],
            style: {
                head: ['blue'],
                compact: false,
                colAligns: ["center"],
            }
        });

        for (let i = 0; i < res.length; i++) {
            table.push(
                [res[i].item_id, res[i].product_name, res[i].stock_quantity]
            );
        }

        console.log(table.toString());

        selectAction();

    })
}

function addStock() {

    inquirer.prompt([
        {
            name: "product_id",
            type: "input",
            message: "Enter product ID that you wouldlike to add stock to."
        },
        {
            name: "stock",
            type: "input",
            message: "How much stock would you like to add?"
        }
    ]).then(function(userInput){

        connection.query("SELECT * FROM products", function(err,res){

            if (err) throw err;

            let chosenItem;

            for (let i=0; i < res.length; i++) {
                if (res[i].item_id === parseInt(userInput.product_id)) {
                    chosenItem = res[i];
                }
            }

            let updatedStock = parseInt(chosenItem.stock_quantity) + parseInt(userInput.stock);

            console.log(chosenItem.product_name + "s successfully updated! " + "New amount:" + updatedStock);

            connection.query("UPDATE products SET ? WHERE ?", [{
                stock_quantity: updatedStock
            },{
                item_id: userInput.product_id
            }], function (err,res){

                if (err) throw err;

                selectAction();
            })

        })

    })
}
