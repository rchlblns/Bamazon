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
    //otherwise display items for sale
    displayItems();
});

function displayItems() {
    var query = "Select item_id, product_name, price FROM products";
    connection.query(query, function (err, res) {

        if (err) throw err;

        var table = new Table({
            head: ["ID", "Product Name", "Price"],
            style: {
                head: ['blue'],
                compact: false,
                colAligns: ["center"],
            }
        });

        for (var i = 0; i < res.length; i++) {
            table.push(
                [res[i].item_id, res[i].product_name, res[i].price]
            );
        }

        console.log(table.toString());

        buyItem();
    })
}
// function checkInput() {
//     var int = Number.isInteger(parseFloat(value));
//     var sign
// }
function buyItem() {
    inquirer.prompt([
        {
            name: "productId",
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
        }]).then(function (answer) {

            const queryStr = "Select stock_quantity, price, department_name FROM products WHERE ?";

            connection.query(queryStr, { item_id: answer.productId }, function (err, res) {

                if (err) throw err;

                let availableStock = res[0].stock_quantity;
                let price = res[0].price;
                let department = res[0].department_name;

                if (available_stock <= answer.quantity) {

                    completePurchase(availableStock, price, department, answer.productId, answer.quantity);

                } else {

                    console.log("Sorry! Insufficient stock.");
                    console.log("Please modify your order.")

                    displayItems();
                }

            });
        });
}

// function completePurchase(availableStock, price, department, answer.productId, answer.quantity) {

//     let updatedStock = availableStock - answer.quantity;
//     let totalPrice = price * answer.quantity;
//     //need to update total product sales too
//     const query = "UPDATE products SET ? WHERE ?";

//     connection.query(query, [{
//         stock_quantity: updatedStock

//     },{
//         item_id: answer.productId
//     }], function(err, res) {

//         if (err) throw err

//         console.log("Your purchase is complete.")
//     });
// }