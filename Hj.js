function generateReportID() {
    const timestamp = Date.now(); // Get the current timestamp
    const randomNum = Math.floor(Math.random() * 10000); // Generate a random number
    return `RPT-${timestamp}-${randomNum}`; // Format the report ID
}
