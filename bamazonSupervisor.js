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
    showQuestions();
});

function showQuestions() {
    inquirer.prompt([
        {
            type: "list",
            name: "option",
            message: "Welcome Bamazon Supervisor! What would you like to do?",
            choices: [
                "View Product Sales by Department",
                "Create New Department"
            ]
        }
    ]).then(function(input){
        switch(input.option) {
            case "View Product Sales by Department":
            viewSales();
            break;

            case "Create New Department":
            addDepartment();
            break;
        }
    });
};

function viewSales() {

    const query = "SELECT department_id AS department_id, department_name AS department_name," + "over_head_costs AS over_head_costs, total_sales AS total_sales," + "(total_sales - over_head_costs) AS total_profit FROM departments";

    connection.query(query, function(err,res){
        if (err) throw err;

        console.table(res);
        showQuestions();
    })
}