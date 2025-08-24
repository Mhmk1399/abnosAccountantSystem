// Test the non-work-days API
const testNonWorkDays = async () => {
  try {
    // Using the staff ID from your test data
    const staffId = "688a608b255173ed610e52e8";
    const year = 1404;
    const month = 5;
    
    const response = await fetch(`http://localhost:3000/api/salaryandpersonels/rollcall?nonWorkDays=true&staffId=${staffId}&year=${year}&month=${month}`);
    const data = await response.json();
    
    console.log('Non-work days result:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
};

testNonWorkDays();