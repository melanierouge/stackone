// server.js
const express = require('express');
const axios = require('axios');
const { parseString } = require('xml2js');
const app = express();
const port = 3000;

// BambooHR API URL
const bambooHRAPI = 'https://api.bamboohr.com/api/gateway.php/stackone/v1/employees/directory';
const apiKey = '68ceca5a291fa83f5b0e748784cd2597ddd52071'; // Replace with your actual API key

// Function to transform XML data to the specified interface/model
function transformEmployeeData(xmlData) {
  const employees = [];

  parseString(xmlData, (err, result) => {
    if (err) {
      console.error(err);
      return;
    }

    const employeeList = result.directory.employees[0].employee;

    employeeList.forEach((employee) => {
      const transformedEmployee = {
        id: employee.$.id,
        first_name: employee.field.find((field) => field.$.id === 'firstName')._,
        last_name: employee.field.find((field) => field.$.id === 'lastName')._,
        name: `${employee.field.find((field) => field.$.id === 'firstName')._} ${employee.field.find((field) => field.$.id === 'lastName')._}`,
        display_name: employee.field.find((field) => field.$.id === 'displayName')._,
        personal_phone_number: employee.field.find((field) => field.$.id === 'mobilePhone')._,
        work_email: employee.field.find((field) => field.$.id === 'workEmail')._,
        job_title: employee.field.find((field) => field.$.id === 'jobTitle')._,
        department: employee.field.find((field) => field.$.id === 'department')._,
        manager_id: employee.field.find((field) => field.$.id === 'supervisor')._,
      };

      employees.push(transformedEmployee);
    });
  });

  return employees;
}

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.get('/employees', async (req, res) => {
  try {
    // Make request to BambooHR API
    const response = await axios.get(bambooHRAPI, {
      auth: {
        username: apiKey,
        password: 'x', // BambooHR API expects a password, but it's not validated
      },
    });

    // Transform the fetched employee data
    const transformedData = transformEmployeeData(response.data);

    // Log the transformed data to the console
    console.log(transformedData);

    res.json(transformedData);
  } catch (error) {
    console.error(error); // Log the full error object
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log('Server is running on http://localhost:${port}');
});
