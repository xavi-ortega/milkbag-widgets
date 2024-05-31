const fs = require('fs');

const inputFile = 'burn-stats.csv'; 
const outputFile = 'burn-stats.json';
const futureOutputFile = 'future-burn-stats.json'; // New output file for future data

// Function to convert date format from dd/mm/yyyy to yyyy/mm/dd
function convertDateFormat(dateStr) {
  const [day, month, year] = dateStr.split('/');
  return `${year}/${month}/${day}`;
}

// Function to generate next 100 days data with a supply of 250,000
function generateFutureData(startDate, startSupply, burn, numberOfDays) {
  let currentDate = new Date(startDate);
  let supply = startSupply;

  const futureData = [{
    time: currentDate.toUTCString().split('T')[0],
    value: Math.round(100_000_000 / supply * 100000) / 100000
  }];

  currentDate.setDate(currentDate.getDate() + 1);

  for (let i = 0; i < numberOfDays; i++) {
    supply -= burn;

    futureData.push({
      time: currentDate.toUTCString().split('T')[0],
      value: Math.round(100_000_000 / supply * 100000) / 100000
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return futureData;
}

// Read the CSV file
fs.readFile(inputFile, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading the CSV file', err);
    return;
  }

  // Split the data into rows
  const rows = data.trim().split('\n');

  // Extract the headers (first row)
  const headers = rows.shift().split(';');

  // Map the relevant headers to the desired property names
  const dateIndex = headers.indexOf('Date');
  const burnedTodayIndex = headers.indexOf('Supply');

  let lastSupplyCount;

  // Process each row to extract the relevant columns
  const results = rows.map(row => {
    const columns = row.split(';');

    const time = convertDateFormat(columns[dateIndex]);
    const supply = parseInt(columns[burnedTodayIndex].replace(/(\.|\-)/g, ''));

    lastSupplyCount = supply;

    return {
      time,
      value: Math.round(100_000_000 / supply * 100000) / 100000
    };
  });

  // Generate future data for the next 100 days with supply of 250,000
  const lastEntry = results[results.length - 1];
  const futureData = generateFutureData(new Date(lastEntry.time), lastSupplyCount, 250000, 100);

  // Write the results from CSV to a JSON file
  fs.writeFile(outputFile, JSON.stringify(results, null, 2), err => {
    if (err) {
      console.error('Error writing CSV data to JSON file', err);
    } else {
      console.log('CSV data successfully converted to JSON');
    }
  });

  // Write the future data to a separate JSON file
  fs.writeFile(futureOutputFile, JSON.stringify(futureData, null, 2), err => {
    if (err) {
      console.error('Error writing future data to JSON file', err);
    } else {
      console.log('Future data successfully written to JSON file');
    }
  });
});
