//modules
const mysql = require("mysql");
const inquirer = require("inquirer");
const Table = require("cli-table");
const colors = require("colors");


//sets mysql database to a variable
const connection = mysql.createConnection({
    host: "localhost",
    port: 8889,
    user: "root",
    password: "root",
    database: "bamazon"
});

//connects to the database
connection.connect(function (err) {
    //if error, display error
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
    //otherwise display items for sale
    displayItems();
});

//display items
function displayItems() {
    const query = "Select item_id, product_name, department_name, price FROM products";
    connection.query(query, function (err, res) {

        if (err) throw err;

        const table = new Table({
            head: ["ID", "Product Name", "Department", "Price"],
            style: {
                head: ['cyan'],
                compact: false,
                colAligns: ["center"],
            }
        });

        //creates table 
        for (let i = 0; i < res.length; i++) {
            table.push(
                [res[i].item_id, res[i].product_name, res[i].department_name, res[i].price]
            );
        }

        console.log(table.toString());

        buyItem();
    })
}

//buy an item
function buyItem() {
    inquirer.prompt([
        {
            name: "product_id",
            type: "input",
            message: "Please enter the id of the item you wish to purchase.",
            validate: function (value) {
                if (isNaN(value) === false) {
                    return true;
                } else {
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
                } else {
                    return false;
                }
            }
        }]).then(function (userInput) {

            let id = userInput.product_id;
            let quantity = userInput.quantity;
            

            const query = "SELECT stock_quantity, product_name, department_name, price, product_sales FROM products WHERE ?";

            connection.query(query, {item_id: id}, function(err, res){

                if (err) throw err;

                //no response prompts user to enter a valid item number
                else if (res.length === 0) {
                    console.log("Item not found. Please enter a valid item number.".red);
                    displayItems();
                }

                //buy item if in stock
                else if (res[0].stock_quantity >= quantity) {
                    let total = (quantity * res[0].price).toFixed(2);
                    let updatedQuantity = res[0].stock_quantity - quantity;
                    let productSales = res[0].price * quantity;
                    let product = res[0].product_name;
                    
                    console.log(`Success! You bought ${quantity} ${product}s. Your total cost is ${total}.`.magenta);
                    console.log("Thank you for shopping at Bamazon.".magenta);

                    connection.query("UPDATE products SET ? WHERE ?", [{
                        stock_quantity: updatedQuantity,
                        product_sales: productSales

                    },
                    {
                        item_id: id
                    }], function(err,res){
                        
                        continuePrompt();
                    });

                //item not in stock, prompt to choose another item
                } else {
                    console.log("Insufficient quantity! Please choose another item.")
                    displayItems();
                }
                

            })

        
        });
}

//returns to main menu or exits application
function continuePrompt() {
    inquirer.prompt([
        {
            type: "list",
            name: "backToStart",
            message: "Do you want to continue shopping?",
            choices: ["Yes", "No"],
        }
    ]).then(function(input){
        if (input.backToStart === "Yes") {
            displayItems();     
        } else {
            console.log("Goodbye!".rainbow);
            process.exit();
        }
    })
}