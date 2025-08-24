// Test script to POST fake rollcall data
const fakeData = {
  staff: "68984adc2664142b8aedb65b",
  month: 6,
  year: 2025,
 days: [
    { day: 1, status: "absent", entryTime: "", launchtime: "", exitTime: "" },
    { day: 2, status: "present", entryTime: "08:45", launchtime: "1:00", exitTime: "19:00" },
    { day: 3, status:  "present", entryTime: "08:45", launchtime: "1:00", exitTime: "19:00"  },
    { day: 4, status: "present", entryTime: "08:20", launchtime: "1:00", exitTime: "18:00" },
    { day: 5, status: "present", entryTime: "08:35", launchtime: "1:00", exitTime: "17:35" },
    { day: 6, status: "holiday", description: "Weekend" },
    { day: 7, status: "holiday", description: "Weekend" },
    { day: 8, status: "present", entryTime: "08:40", launchtime: "1:00", exitTime: "19:30" },
    { day: 9, status: "present", entryTime: "08:40", launchtime: "1:00", exitTime: "19:30"  },
    { day: 10, status: "present", entryTime: "08:25", launchtime: "1:00", exitTime: "18:15" },
    { day: 11, status: "permission", entryTime: "10:00", launchtime: "1:00", exitTime: "17:00", description: "Doctor appointment" },
    { day: 12, status: "present", entryTime: "08:30", launchtime: "1:00", exitTime: "18:45" },
    { day: 13, status: "holiday", description: "Weekend" },
    { day: 14, status: "holiday", description: "Weekend" },
    { day: 15, status:"absent", entryTime: "", launchtime: "", exitTime: "" } ,
    { day: 16, status: "absent", entryTime: "", launchtime: "", exitTime: "" },
    { day: 17, status: "absent", entryTime: "", launchtime: "", exitTime: "" },
    { day: 18, status: "present", entryTime: "08:35", launchtime: "1:00", exitTime: "19:15" },
    { day: 19, status: "present", entryTime: "08:40", launchtime: "1:00", exitTime: "18:00" },
    { day: 20, status: "holiday", description: "Weekend" },
    { day: 21, status: "holiday", description: "Weekend" },
    { day: 22, status: "present", entryTime: "08:30", launchtime: "1:00", exitTime: "19:00" },
    { day: 23, status: "present", entryTime: "08:25", launchtime: "1:00", exitTime: "18:30" },
    { day: 24, status: "present", entryTime: "08:45", launchtime: "1:00", exitTime: "19:45" },
    { day: 25, status: "holiday", description: "Christmas Day" },
    { day: 26, status: "present", entryTime: "08:45", launchtime: "1:00", exitTime: "19:45" },
    { day: 27, status: "present", entryTime: "08:45", launchtime: "1:00", exitTime: "19:45" },
    { day: 28, status: "holiday", description: "Weekend" },
    { day: 29, status: "present", entryTime: "08:30", launchtime: "1:00", exitTime: "18:30" },
    { day: 30, status: "present", entryTime: "08:35", launchtime: "1:00", exitTime: "19:20" },
    { day: 31, status: "present", entryTime: "08:35", launchtime: "1:00", exitTime: "19:20"  }
  ] 
};

fetch('http://localhost:3000/api/salaryandpersonels/rollcall', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(fakeData)
})
.then(response => response.json())
.then(data => console.log('Success:', data))
.catch(error => console.error('Error:', error));