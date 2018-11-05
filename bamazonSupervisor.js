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
    ]).then(function (input) {
        switch (input.option) {
            case "View Product Sales by Department":
                viewSales();
                break;

            case "Create New Department":
                addDepartment();
                break;
        }
    });
}

function viewSales() {

    const query = "SELECT department_id, departments.department_name, over_head_costs, product_sales, (product_sales - over_head_costs) AS total_profit FROM departments, products WHERE departments.department_name=products.department_name";

    connection.query(query, function (err, res) {
        if (err) throw err;

        // console.log(res);
        const table = new Table({
            head: ["ID", "Department", "Overhead Costs", "Product Sales", "Total Profit"],
            style: {
                head: ['blue'],
                compact: false,
                colAligns: ["center"],
            }
        });

        for (let i = 0; i < res.length; i++) {
            table.push(
                [res[i].department_id, res[i].department_name, res[i].over_head_costs, res[i].product_sales, res[i].total_profit]
            );
        }
        
        console.log(table.toString());

        showQuestions();
    })
}

function addDepartment() {
    inquirer.prompt([
        {
            name: "department_name",
            type: "input",
            message: "What is the name of the department you're adding?"

        }, {
            name: "over_head_costs",
            type: "input",
            message: "What is the department's overhead costs?"
        }]).then(function (input) {
            connection.query("INSERT INTO departments SET ?", {
                department_name: input.department_name,
                over_head_costs: input.over_head_costs
            }, function (err, res) {
                if (err) throw err;

                console.log("Department added successfully!");

                showQuestions();
            
            }
        )
    });
    
}