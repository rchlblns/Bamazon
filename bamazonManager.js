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

function selectAction(){
    inquirer.prompt([
        {
            type: "list",
            name: "action",
            message: "Hello manager! What would you like to do?",
            choices: [
                "View Products for Sale",
                "View Low Inventory",
                "Add to Inventory",
                "Add New Product"
            ]
        }
    ])
}
