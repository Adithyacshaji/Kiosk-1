export const KIOSK_CONFIG = {
  venueName: "Campus Compass",
  collegeName: "Christ College of Engineering (Autonomous)",
  locationTag: "Irinjalakuda, Thrissur",
  motto: "Find • Explore • Belong",
  kioskLocation: {
    id: "kiosk_main",
    name: "Main Block Kiosk #01 (Central Foyer)",
    floor: 1,
    lat: 10.3528,
    lng: 76.2144,
    description: "You are standing at the Central Foyer Information Kiosk."
  },
  floors: [
    { id: 0, name: "Ground Floor (Auditorium & Admin)", shortName: "GF" },
    { id: 1, name: "Level 1 (Computer Science & Labs)", shortName: "L1" },
    { id: 2, name: "Level 2 (Electronics & Mechanical)", shortName: "L2" },
    { id: 3, name: "Level 3 (Library & Seminar Halls)", shortName: "L3" }
  ],
  categories: [
    { id: "all", label: "All Campus", icon: "Compass", color: "#744F43" },
    { id: "classrooms", label: "Classrooms", icon: "Monitor", color: "#38221B" },
    { id: "faculty", label: "Faculty Rooms", icon: "User", color: "#744F43" },
    { id: "outdoor", label: "Outdoor & Canteen", icon: "Navigation", color: "#967C6E" }
  ],
  services: [
    {
      id: "classrooms",
      title: "Classroom",
      desc: "Find classrooms by 1st to 4th year batches and room numbers.",
      bgColor: "#EBE0D2",
      textColor: "#2E1B15",
      accentColor: "#2E1B15",
      badgeColor: "#D6C4B0",
      icon: "Classroom",
      floor: 1,
      targetCategory: "classrooms"
    },
    {
      id: "faculty",
      title: "Faculties",
      desc: "Locate faculty by department, cabin, or direct route.",
      bgColor: "#744F43",
      textColor: "#FFFFFF",
      accentColor: "#FFFFFF",
      badgeColor: "rgba(255, 255, 255, 0.2)",
      icon: "Faculties",
      floor: 1,
      targetCategory: "faculty"
    },
    {
      id: "outdoor",
      title: "Outdoor Navigation",
      desc: "Locate canteen, cafeteria, sports turf, etc..",
      bgColor: "#967C6E",
      textColor: "#FFFFFF",
      accentColor: "#FFFFFF",
      badgeColor: "rgba(255, 255, 255, 0.2)",
      icon: "Outdoor",
      floor: 0,
      targetCategory: "outdoor"
    }
  ],

  // Structured Classrooms Data for 1st to 4th Year Divisions
  classroomYears: [
    {
      id: "1st-year",
      yearLabel: "1st Year",
      subTitle: "Foundation & Applied Sciences (S1 / S2)",
      badge: "S1 & S2",
      classes: [
        {
          id: "poi-cls-101",
          roomNumber: "LH-101",
          className: "S1 CSE-A (Algorithms & C Programming)",
          department: "Computer Science",
          floor: 1,
          block: "Main Academic Block",
          type: "Smart Classroom",
          lat: 10.3529,
          lng: 76.2142
        },
        {
          id: "poi-cls-102",
          roomNumber: "LH-102",
          className: "S1 CSE-B (Computing Foundations)",
          department: "Computer Science",
          floor: 1,
          block: "Main Academic Block",
          type: "Interactive Lecture Hall",
          lat: 10.3530,
          lng: 76.2144
        },
        {
          id: "poi-cls-103",
          roomNumber: "LH-103",
          className: "S1 ECE (Engineering Physics & Circuits)",
          department: "Electronics & Communication",
          floor: 1,
          block: "South Wing",
          type: "Standard Classroom",
          lat: 10.3526,
          lng: 76.2146
        },
        {
          id: "poi-cls-104",
          roomNumber: "LH-104",
          className: "S2 MECH (Mechanics & Graphics Hall)",
          department: "Mechanical Engineering",
          floor: 0,
          block: "Workshop Complex",
          type: "Drawing & Lecture Hall",
          lat: 10.3523,
          lng: 76.2140
        },
        {
          id: "poi-cls-105",
          roomNumber: "LH-105",
          className: "S2 CIVIL (Environmental & Material Sciences)",
          department: "Civil Engineering",
          floor: 0,
          block: "Central Block",
          type: "Standard Classroom",
          lat: 10.3524,
          lng: 76.2148
        }
      ]
    },
    {
      id: "2nd-year",
      yearLabel: "2nd Year",
      subTitle: "Core Discipline Fundamentals (S3 / S4)",
      badge: "S3 & S4",
      classes: [
        {
          id: "poi-cls-201",
          roomNumber: "LH-201",
          className: "S3 CSE-A (Data Structures & OOP Hall)",
          department: "Computer Science",
          floor: 2,
          block: "North Wing",
          type: "Smart Classroom",
          lat: 10.3532,
          lng: 76.2143
        },
        {
          id: "poi-cls-202",
          roomNumber: "LH-202",
          className: "S3 CSE-B (Database Management Systems)",
          department: "Computer Science",
          floor: 2,
          block: "North Wing",
          type: "Digital Classroom",
          lat: 10.3534,
          lng: 76.2145
        },
        {
          id: "poi-cls-203",
          roomNumber: "LH-203",
          className: "S4 ECE (Analog Circuits & Signals)",
          department: "Electronics & Communication",
          floor: 2,
          block: "East Wing",
          type: "Multimedia Hall",
          lat: 10.3533,
          lng: 76.2147
        },
        {
          id: "poi-cls-204",
          roomNumber: "LH-204",
          className: "S4 MECH (Fluid Dynamics & Thermal Eng.)",
          department: "Mechanical Engineering",
          floor: 2,
          block: "Workshop Annex",
          type: "Lecture Theatre",
          lat: 10.3536,
          lng: 76.2149
        },
        {
          id: "poi-cls-205",
          roomNumber: "LH-205",
          className: "S4 CIVIL (Structural Analysis & Surveying)",
          department: "Civil Engineering",
          floor: 2,
          block: "Central Block",
          type: "Standard Classroom",
          lat: 10.3531,
          lng: 76.2150
        }
      ]
    },
    {
      id: "3rd-year",
      yearLabel: "3rd Year",
      subTitle: "Advanced Engineering & Design (S5 / S6)",
      badge: "S5 & S6",
      classes: [
        {
          id: "poi-cls-301",
          roomNumber: "LH-301",
          className: "S5 CSE-A (Operating Systems & Networks)",
          department: "Computer Science",
          floor: 3,
          block: "Main Academic Block",
          type: "Smart Classroom",
          lat: 10.3529,
          lng: 76.2141
        },
        {
          id: "poi-cls-302",
          roomNumber: "LH-302",
          className: "S5 CSE-B (Software Engineering Lab-Class)",
          department: "Computer Science",
          floor: 3,
          block: "Main Academic Block",
          type: "Interactive Hall",
          lat: 10.3530,
          lng: 76.2139
        },
        {
          id: "poi-cls-303",
          roomNumber: "LH-303",
          className: "S6 ECE (Microcontrollers & DSP Hall)",
          department: "Electronics & Communication",
          floor: 3,
          block: "East Wing",
          type: "Smart Hall",
          lat: 10.3535,
          lng: 76.2145
        },
        {
          id: "poi-cls-304",
          roomNumber: "LH-304",
          className: "S6 MECH (Machine Design & Robotics)",
          department: "Mechanical Engineering",
          floor: 3,
          block: "South Wing",
          type: "Design Studio",
          lat: 10.3537,
          lng: 76.2148
        }
      ]
    },
    {
      id: "4th-year",
      yearLabel: "4th Year",
      subTitle: "Specialization & Capstone Projects (S7 / S8)",
      badge: "S7 & S8",
      classes: [
        {
          id: "poi-cls-401",
          roomNumber: "LH-401",
          className: "S7 CSE-A (AI, Machine Learning & Cloud)",
          department: "Computer Science",
          floor: 3,
          block: "Research Tower",
          type: "High-Tech Classroom",
          lat: 10.3531,
          lng: 76.2140
        },
        {
          id: "poi-cls-402",
          roomNumber: "LH-402",
          className: "S7 CSE-B (Cybersecurity & Distributed Systems)",
          department: "Computer Science",
          floor: 3,
          block: "Research Tower",
          type: "High-Tech Classroom",
          lat: 10.3532,
          lng: 76.2142
        },
        {
          id: "poi-cls-403",
          roomNumber: "LH-403",
          className: "S8 ECE (VLSI & Embedded IoT Capstone)",
          department: "Electronics & Communication",
          floor: 3,
          block: "East Wing",
          type: "Capstone Project Room",
          lat: 10.3538,
          lng: 76.2146
        },
        {
          id: "poi-cls-404",
          roomNumber: "LH-404",
          className: "S8 MECH (Automobile & Manufacturing Systems)",
          department: "Mechanical Engineering",
          floor: 2,
          block: "South Wing",
          type: "Specialization Hall",
          lat: 10.3539,
          lng: 76.2150
        }
      ]
    }
  ],

  // Structured Departments & Faculty Data
  departments: [
    {
      id: "cse",
      name: "Computer Science & Engineering",
      code: "CSE",
      hod: "Dr. V. P. Paulose",
      floor: 1,
      cabinBlock: "North Wing, Level 1",
      icon: "Monitor",
      color: "#744F43",
      facultyMembers: [
        {
          id: "fac-cse-01",
          name: "Dr. V. P. Paulose",
          role: "Professor & Head of Department",
          cabin: "Cabin CS-HOD",
          floor: 1,
          email: "hod.cse@cce.edu.in",
          phone: "Ext. 201",
          specialization: "Artificial Intelligence, Data Science",
          lat: 10.3527,
          lng: 76.2141
        },
        {
          id: "fac-cse-02",
          name: "Prof. Anjali Menon",
          role: "Associate Professor",
          cabin: "Cabin CS-104",
          floor: 1,
          email: "anjali.menon@cce.edu.in",
          phone: "Ext. 204",
          specialization: "Computer Networks, Cloud Computing",
          lat: 10.3528,
          lng: 76.2143
        },
        {
          id: "fac-cse-03",
          name: "Prof. Rajesh Kumar",
          role: "Assistant Professor",
          cabin: "Cabin CS-108",
          floor: 1,
          email: "rajesh.k@cce.edu.in",
          phone: "Ext. 208",
          specialization: "Cybersecurity, Cryptography",
          lat: 10.3529,
          lng: 76.2145
        },
        {
          id: "fac-cse-04",
          name: "Prof. Deepa Varghese",
          role: "Assistant Professor",
          cabin: "Cabin CS-112",
          floor: 1,
          email: "deepa.v@cce.edu.in",
          phone: "Ext. 212",
          specialization: "Web Technologies, Full Stack",
          lat: 10.3526,
          lng: 76.2142
        }
      ]
    },
    {
      id: "ece",
      name: "Electronics & Communication Engineering",
      code: "ECE",
      hod: "Dr. Thomas George",
      floor: 2,
      cabinBlock: "East Wing, Level 2",
      icon: "Compass",
      color: "#967C6E",
      facultyMembers: [
        {
          id: "fac-ece-01",
          name: "Dr. Thomas George",
          role: "Professor & Head of Department",
          cabin: "Cabin EC-HOD",
          floor: 2,
          email: "hod.ece@cce.edu.in",
          phone: "Ext. 301",
          specialization: "VLSI Design, Embedded Systems",
          lat: 10.3533,
          lng: 76.2147
        },
        {
          id: "fac-ece-02",
          name: "Prof. Sneha Nair",
          role: "Associate Professor",
          cabin: "Cabin EC-206",
          floor: 2,
          email: "sneha.nair@cce.edu.in",
          phone: "Ext. 306",
          specialization: "Signal Processing, Wireless Comms",
          lat: 10.3534,
          lng: 76.2148
        },
        {
          id: "fac-ece-03",
          name: "Prof. Binu Mathew",
          role: "Assistant Professor",
          cabin: "Cabin EC-210",
          floor: 2,
          email: "binu.m@cce.edu.in",
          phone: "Ext. 310",
          specialization: "Robotics, IoT Architectures",
          lat: 10.3535,
          lng: 76.2146
        }
      ]
    },
    {
      id: "me",
      name: "Mechanical Engineering",
      code: "MECH",
      hod: "Dr. K. R. Suresh",
      floor: 2,
      cabinBlock: "South Wing & Workshop, Level 2",
      icon: "Building2",
      color: "#38221B",
      facultyMembers: [
        {
          id: "fac-me-01",
          name: "Dr. K. R. Suresh",
          role: "Professor & Head of Department",
          cabin: "Cabin ME-HOD",
          floor: 2,
          email: "hod.mech@cce.edu.in",
          phone: "Ext. 312",
          specialization: "Thermal Engineering, Fluid Flow",
          lat: 10.3535,
          lng: 76.2149
        },
        {
          id: "fac-me-02",
          name: "Prof. Arun Dev",
          role: "Assistant Professor",
          cabin: "Cabin ME-208",
          floor: 2,
          email: "arun.dev@cce.edu.in",
          phone: "Ext. 315",
          specialization: "CAD/CAM, Manufacturing Automation",
          lat: 10.3537,
          lng: 76.2151
        }
      ]
    },
    {
      id: "ce",
      name: "Civil Engineering",
      code: "CIVIL",
      hod: "Dr. Marykutty Abraham",
      floor: 1,
      cabinBlock: "Central Block, Level 1",
      icon: "Home",
      color: "#744F43",
      facultyMembers: [
        {
          id: "fac-ce-01",
          name: "Dr. Marykutty Abraham",
          role: "Professor & Head of Department",
          cabin: "Cabin CE-HOD",
          floor: 1,
          email: "hod.civil@cce.edu.in",
          phone: "Ext. 401",
          specialization: "Structural Analysis, Geotechnical",
          lat: 10.3525,
          lng: 76.2149
        },
        {
          id: "fac-ce-02",
          name: "Prof. Manoj V. K.",
          role: "Assistant Professor",
          cabin: "Cabin CE-106",
          floor: 1,
          email: "manoj.vk@cce.edu.in",
          phone: "Ext. 405",
          specialization: "Environmental Engineering, Surveying",
          lat: 10.3526,
          lng: 76.2150
        }
      ]
    },
    {
      id: "bsh",
      name: "Basic Science & Humanities",
      code: "BSH",
      hod: "Dr. Lissy Jose",
      floor: 0,
      cabinBlock: "Admin Ground Block",
      icon: "GraduationCap",
      color: "#967C6E",
      facultyMembers: [
        {
          id: "fac-bsh-01",
          name: "Dr. Lissy Jose",
          role: "Professor & Head (Mathematics)",
          cabin: "Cabin BSH-01",
          floor: 0,
          email: "hod.bsh@cce.edu.in",
          phone: "Ext. 105",
          specialization: "Applied Mathematics & Statistics",
          lat: 10.3523,
          lng: 76.2144
        },
        {
          id: "fac-bsh-02",
          name: "Prof. Saji Philip",
          role: "Assistant Professor (Physics)",
          cabin: "Cabin BSH-04",
          floor: 0,
          email: "saji.p@cce.edu.in",
          phone: "Ext. 108",
          specialization: "Optoelectronics & Physics Labs",
          lat: 10.3524,
          lng: 76.2146
        }
      ]
    }
  ],

  pois: [
    // --- CLASSROOMS ---
    {
      id: "poi-cls-101",
      name: "LH-101 (S1 CSE-A Lecture Hall)",
      category: "classrooms",
      floor: 1,
      lat: 10.3529,
      lng: 76.2142,
      hours: "08:30 AM - 04:30 PM",
      phone: "Ext. 201",
      description: "Smart classroom equipped with interactive digital board, audio system, and LAN ports.",
      tags: ["classroom", "cs", "computer", "lh101", "1st year", "s1"],
      estimatedWalkSeconds: 25,
      wheelchairAccessible: true
    },
    {
      id: "poi-cls-201",
      name: "LH-201 (S3 CSE-A Hall)",
      category: "classrooms",
      floor: 2,
      lat: 10.3532,
      lng: 76.2143,
      hours: "08:30 AM - 04:30 PM",
      phone: "Ext. 204",
      description: "Core computer science lecture hall with digital podium.",
      tags: ["classroom", "cs", "lh201", "2nd year", "s3"],
      estimatedWalkSeconds: 60,
      wheelchairAccessible: true
    },
    {
      id: "poi-cls-301",
      name: "LH-301 (S5 CSE-A Advanced Hall)",
      category: "classrooms",
      floor: 3,
      lat: 10.3529,
      lng: 76.2141,
      hours: "08:30 AM - 04:30 PM",
      phone: "Ext. 208",
      description: "Advanced computing lecture hall with high-speed wireless connectivity.",
      tags: ["classroom", "cs", "lh301", "3rd year", "s5"],
      estimatedWalkSeconds: 85,
      wheelchairAccessible: true
    },
    {
      id: "poi-cls-401",
      name: "LH-401 (S7 CSE-A AI Hall)",
      category: "classrooms",
      floor: 3,
      lat: 10.3531,
      lng: 76.2140,
      hours: "08:30 AM - 04:30 PM",
      phone: "Ext. 210",
      description: "Final year AI & Research classroom.",
      tags: ["classroom", "cs", "lh401", "4th year", "s7"],
      estimatedWalkSeconds: 90,
      wheelchairAccessible: true
    },

    // --- FACULTY CABINS ---
    {
      id: "fac-cse-01",
      name: "Dr. V. P. Paulose (HOD CSE Cabin)",
      category: "faculty",
      floor: 1,
      lat: 10.3527,
      lng: 76.2141,
      hours: "09:00 AM - 05:00 PM",
      phone: "+91 480 282 5384",
      description: "HOD Chamber & Research room for Computer Science & Engineering.",
      tags: ["faculty", "hod", "staff", "professors", "cse", "office", "paulose"],
      estimatedWalkSeconds: 30,
      wheelchairAccessible: true
    },
    {
      id: "fac-ece-01",
      name: "Dr. Thomas George (HOD ECE Cabin)",
      category: "faculty",
      floor: 2,
      lat: 10.3533,
      lng: 76.2147,
      hours: "09:00 AM - 05:00 PM",
      phone: "Ext. 301",
      description: "Department of Electronics & Communication Engineering HOD Cabin.",
      tags: ["faculty", "ece", "staff", "hod", "thomas"],
      estimatedWalkSeconds: 70,
      wheelchairAccessible: true
    },
    {
      id: "fac-me-01",
      name: "Dr. K. R. Suresh (HOD MECH Cabin)",
      category: "faculty",
      floor: 2,
      lat: 10.3535,
      lng: 76.2149,
      hours: "09:00 AM - 05:00 PM",
      phone: "Ext. 312",
      description: "Mechanical Engineering Department Staff & HOD office.",
      tags: ["faculty", "mech", "staff", "hod", "suresh"],
      estimatedWalkSeconds: 85,
      wheelchairAccessible: true
    },

    // --- OUTDOOR NAVIGATION ---
    {
      id: "poi-out-canteen",
      name: "Campus Cafeteria & Garden Canteen",
      category: "outdoor",
      floor: 0,
      lat: 10.3520,
      lng: 76.2152,
      hours: "07:30 AM - 06:00 PM",
      phone: "Ext. 110",
      description: "Fresh meals, Kerala breakfast, juices, snacks, bakery items, and open-air lawn seating.",
      tags: ["canteen", "cafe", "food", "tea", "coffee", "lunch", "snacks", "outdoor"],
      estimatedWalkSeconds: 50,
      wheelchairAccessible: true
    },
    {
      id: "poi-out-sports",
      name: "Sports Complex & Football Ground",
      category: "outdoor",
      floor: 0,
      lat: 10.3515,
      lng: 76.2138,
      hours: "06:00 AM - 06:30 PM",
      phone: "Ext. 115",
      description: "Full-size football turf, basketball court, badminton arena, and athletics track.",
      tags: ["sports", "ground", "football", "basketball", "games", "outdoor"],
      estimatedWalkSeconds: 95,
      wheelchairAccessible: true
    }
  ]
};
