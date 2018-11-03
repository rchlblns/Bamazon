let mysql = require("mysql");
let inquirer = require("inquirer");

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
    var query = "Select * FROM products";
    connection.query(query, function (err, res) {

        if (err) throw err;

        for (var i = 0; i < res.length; i++) {
            console.log("ID: " + res[i].item_id + " || Product Name: " + res[i].product_name + " || Price: " + res[i].price);
        }

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
            name: "item_id",
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

            let item = input.item_id;
            let quantity = input.quantity;

            const queryStr = "Select * FROM products WHERE ?";

            connection.query(queryStr, { item_id: item }, function (err, data) {

                if (err) {
                    throw err;
                } else if (data.length === 0) {
                    console.log("Invalid item ID. Please select a valid ID.");
                    displayItems();
                } else {

                    let itemData = data[0];

                    if (quantity <= itemData.stock_quantity) {
                        console.log("Order was placed!");

                        var updateQueryStr = "UPDATE products SET stock_quantity = " + (itemData.stock_quantity - quantity) + "WHERE item_id = " + item;

                        connection.query(updateQueryStr, function(err,res){
                            if (err){
                                throw err;
                            } else {
                                console.log("Your total is $" + itemData.price * quantity);
                                console.log("Thanks for shopping with us!")
                            }
                        })
                    } else {
                        console.log("Sorry! Insufficient stock.");
                        console.log("Please modify your order.")

                        displayItems();
                    }

                }

            })
        })
}