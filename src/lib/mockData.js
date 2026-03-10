// FieldStack Mock Data — mirrors Airtable schema exactly
// When Airtable is connected, this is only used as fallback

export const MOCK_DATA = {
  Contacts: [
    { id: "rec001", Name: "Carlos Martinez", Email: "carlos@martinez.com", Phone: "(512) 555-0142", Company: "Martinez Family", Role: "Homeowner", Notes: "Referred by neighbor" },
    { id: "rec002", Name: "Linda Chen", Email: "lchen@oakwoodhoa.org", Phone: "(512) 555-0198", Company: "Oakwood HOA", Role: "Board President", Notes: "" },
    { id: "rec003", Name: "David Park", Email: "dpark@vertexprop.com", Phone: "(512) 555-0234", Company: "Vertex Properties", Role: "Project Manager", Notes: "Manages 3 properties" },
    { id: "rec004", Name: "Sarah Williams", Email: "swilliams@hillcrestmed.com", Phone: "(512) 555-0301", Company: "Hillcrest Medical", Role: "Facilities Director", Notes: "Prefers email" },
    { id: "rec005", Name: "James Rivera", Email: "jrivera@millbrook.gov", Phone: "(512) 555-0377", Company: "City of Millbrook", Role: "Parks Director", Notes: "Budget approved Q1" },
    { id: "rec006", Name: "Maria Torres", Email: "mtorres@beaconcondos.com", Phone: "(512) 555-0412", Company: "Beacon Condos", Role: "Property Manager", Notes: "" },
    { id: "rec007", Name: "Robert Kim", Email: "rkim@elmparkschool.edu", Phone: "(512) 555-0456", Company: "Elm Park School", Role: "IT Director", Notes: "Needs after-hours install" },
    { id: "rec008", Name: "Jennifer Apex", Email: "japex@apexdev.com", Phone: "(512) 555-0501", Company: "Apex Development", Role: "VP Development", Notes: "Long-term client" },
    { id: "rec009", Name: "Tom Bradley", Email: "tbradley@bradleyelectric.com", Phone: "(512) 555-0555", Company: "Bradley Electric", Role: "Owner", Notes: "Sub-contractor" },
    { id: "rec010", Name: "Amanda Foster", Email: "afoster@fosterdesign.com", Phone: "(512) 555-0601", Company: "Foster Design Group", Role: "Lead Architect", Notes: "Works with Apex" },
    { id: "rec011", Name: "Mike Hernandez", Email: "mike@hernandezplumbing.com", Phone: "(512) 555-0650", Company: "Hernandez Plumbing", Role: "Owner", Notes: "Sub-contractor, reliable" },
    { id: "rec012", Name: "Rachel Stone", Email: "rstone@apexdev.com", Phone: "(512) 555-0670", Company: "Apex Development", Role: "Site Superintendent", Notes: "On-site lead" },
    { id: "rec013", Name: "Kevin Walsh", Email: "kwalsh@walshconcrete.com", Phone: "(512) 555-0710", Company: "Walsh Concrete", Role: "Foreman", Notes: "Sub-contractor" },
    { id: "rec014", Name: "Diana Reyes", Email: "dreyes@millbrook.gov", Phone: "(512) 555-0740", Company: "City of Millbrook", Role: "Project Coordinator", Notes: "Day-to-day contact" },
  ],

  Companies: [
    { id: "comp001", Name: "Martinez Family", Industry: "Residential", Address: "2847 Elm St, Austin TX", Phone: "(512) 555-0142", Website: "" },
    { id: "comp002", Name: "Oakwood HOA", Industry: "HOA / Community", Address: "100 Oakwood Blvd, Austin TX", Phone: "(512) 555-0190", Website: "oakwoodhoa.org" },
    { id: "comp003", Name: "Vertex Properties", Industry: "Commercial Real Estate", Address: "500 Congress Ave, Austin TX", Phone: "(512) 555-0230", Website: "vertexprop.com" },
    { id: "comp004", Name: "Hillcrest Medical", Industry: "Healthcare", Address: "1200 Hillcrest Dr, Austin TX", Phone: "(512) 555-0300", Website: "hillcrestmed.com" },
    { id: "comp005", Name: "City of Millbrook", Industry: "Government / Municipal", Address: "1 City Hall Plaza, Millbrook TX", Phone: "(512) 555-0370", Website: "millbrook.gov" },
    { id: "comp006", Name: "Beacon Condos", Industry: "Residential HOA", Address: "88 Beacon St, Austin TX", Phone: "(512) 555-0410", Website: "" },
    { id: "comp007", Name: "Elm Park School", Industry: "Education", Address: "450 Elm Park Rd, Austin TX", Phone: "(512) 555-0450", Website: "elmparkschool.edu" },
    { id: "comp008", Name: "Apex Development", Industry: "Commercial Development", Address: "900 Sunset Ridge Dr, Austin TX", Phone: "(512) 555-0500", Website: "apexdev.com" },
  ],

  Opportunities: [
    // Lead
    { id: "opp001", Name: "Martinez Residence", Company: "Martinez Family", Contact: "Carlos Martinez", Value: 42000, Stage: "Lead", CreatedDate: "2026-03-06", ExpectedClose: "2026-04-15", Notes: "Kitchen + bathroom remodel", PropensityToClose: 35 },
    { id: "opp002", Name: "Oakwood Fence Install", Company: "Oakwood HOA", Contact: "Linda Chen", Value: 18500, Stage: "Lead", CreatedDate: "2026-03-02", ExpectedClose: "2026-05-01", Notes: "Community perimeter fence", PropensityToClose: 25 },
    { id: "opp003", Name: "Downtown Loft Remodel", Company: "Vertex Properties", Contact: "David Park", Value: 96000, Stage: "Lead", CreatedDate: "2026-03-08", ExpectedClose: "2026-06-01", Notes: "Full gut renovation, 2 units", PropensityToClose: 20 },
    { id: "opp004", Name: "Vertex Office Buildout", Company: "Vertex Properties", Contact: "David Park", Value: 45000, Stage: "Lead", CreatedDate: "2026-03-05", ExpectedClose: "2026-05-15", Notes: "New office suite", PropensityToClose: 40 },
    { id: "opp005", Name: "Martinez Guest House", Company: "Martinez Family", Contact: "Carlos Martinez", Value: 82000, Stage: "Lead", CreatedDate: "2026-03-07", ExpectedClose: "2026-07-01", Notes: "ADU construction", PropensityToClose: 15 },
    // Qualified
    { id: "opp006", Name: "Hillcrest HVAC Overhaul", Company: "Hillcrest Medical", Contact: "Sarah Williams", Value: 134000, Stage: "Qualified", CreatedDate: "2026-02-25", ExpectedClose: "2026-04-30", Notes: "Replace rooftop units, zones 1-4", PropensityToClose: 60 },
    { id: "opp007", Name: "River Walk Landscaping", Company: "City of Millbrook", Contact: "James Rivera", Value: 67000, Stage: "Qualified", CreatedDate: "2026-02-17", ExpectedClose: "2026-04-15", Notes: "Phase 2 of park renovation", PropensityToClose: 70 },
    { id: "opp008", Name: "Millbrook Splash Pad", Company: "City of Millbrook", Contact: "James Rivera", Value: 89000, Stage: "Qualified", CreatedDate: "2026-02-20", ExpectedClose: "2026-05-01", Notes: "New water feature", PropensityToClose: 55 },
    // Proposal Sent
    { id: "opp009", Name: "Beacon St. Security System", Company: "Beacon Condos", Contact: "Maria Torres", Value: 28000, Stage: "Proposal Sent", CreatedDate: "2026-03-05", ExpectedClose: "2026-03-30", Notes: "Cameras + access control", PropensityToClose: 80 },
    { id: "opp010", Name: "Elm Park AV Install", Company: "Elm Park School", Contact: "Robert Kim", Value: 156000, Stage: "Proposal Sent", CreatedDate: "2026-03-01", ExpectedClose: "2026-04-15", Notes: "Auditorium + 12 classrooms", PropensityToClose: 75 },
    // Negotiation
    { id: "opp013", Name: "Oakwood Pool Renovation", Company: "Oakwood HOA", Contact: "Linda Chen", Value: 72000, Stage: "Negotiation", CreatedDate: "2026-02-10", ExpectedClose: "2026-03-25", Notes: "Pool deck and equipment", PropensityToClose: 85 },
    // Won
    { id: "opp011", Name: "Sunset Ridge Build-Out", Company: "Apex Development", Contact: "Jennifer Apex", Value: 142000, Stage: "Won", CreatedDate: "2026-01-15", ExpectedClose: "2026-03-01", Notes: "Commercial build-out, tenant improvement", PropensityToClose: 100 },
    { id: "opp012", Name: "Apex Parking Garage", Company: "Apex Development", Contact: "Jennifer Apex", Value: 56000, Stage: "Won", CreatedDate: "2026-02-01", ExpectedClose: "2026-03-10", Notes: "Lighting + electrical", PropensityToClose: 100 },
    // Lost
    { id: "opp014", Name: "Vertex Roof Replacement", Company: "Vertex Properties", Contact: "David Park", Value: 38000, Stage: "Lost", CreatedDate: "2026-01-20", ExpectedClose: "2026-02-15", Notes: "Lost to competitor", PropensityToClose: 0 },
  ],

  Jobs: [
    {
      id: "job001", JobId: "JOB-2026-0038", Name: "Sunset Ridge Build-Out",
      Site: "1420 Sunset Ridge Dr", Crew: "Team Alpha", Phase: "Foundation",
      Progress: 35, Status: "On Track", Value: 142000,
      Company: "Apex Development", Contact: "Jennifer Apex",
      StartDate: "2026-02-15", EndDate: "2026-05-30",
      OpportunityId: "opp011",
      Lat: 30.3520, Lng: -97.7510,
    },
    {
      id: "job002", JobId: "JOB-2026-0035", Name: "Beacon St. Security",
      Site: "88 Beacon St, Unit 4", Crew: "Team Bravo", Phase: "Wiring",
      Progress: 72, Status: "On Track", Value: 28000,
      Company: "Beacon Condos", Contact: "Maria Torres",
      StartDate: "2026-02-01", EndDate: "2026-03-20",
      OpportunityId: "opp009",
      Lat: 30.2672, Lng: -97.7431,
    },
    {
      id: "job003", JobId: "JOB-2026-0031", Name: "River Walk Phase 2",
      Site: "River Walk Park, Sec B", Crew: "Team Charlie", Phase: "Grading",
      Progress: 15, Status: "Delayed", Value: 67000,
      Company: "City of Millbrook", Contact: "James Rivera",
      StartDate: "2026-02-10", EndDate: "2026-04-30",
      OpportunityId: "opp007",
      Lat: 30.2900, Lng: -97.7380,
    },
    {
      id: "job004", JobId: "JOB-2026-0029", Name: "Apex Parking Garage",
      Site: "900 Sunset Ridge Dr, Garage B", Crew: "Team Alpha", Phase: "Electrical Rough-In",
      Progress: 55, Status: "On Track", Value: 56000,
      Company: "Apex Development", Contact: "Jennifer Apex",
      StartDate: "2026-01-20", EndDate: "2026-03-30",
      OpportunityId: "opp012",
      Lat: 30.3510, Lng: -97.7500,
    },
    {
      id: "job005", JobId: "JOB-2026-0027", Name: "Hillcrest HVAC Phase 1",
      Site: "1200 Hillcrest Dr, Roof", Crew: "Team Delta", Phase: "Equipment Install",
      Progress: 88, Status: "On Track", Value: 134000,
      Company: "Hillcrest Medical", Contact: "Sarah Williams",
      StartDate: "2026-01-05", EndDate: "2026-03-15",
      OpportunityId: "opp006",
      Lat: 30.3100, Lng: -97.7650,
    },
  ],

  "Schedule Phases": [
    // Sunset Ridge Build-Out (job001)
    { id: "sp001", JobId: "job001", PhaseName: "Site Prep", StartDate: "2026-02-15", EndDate: "2026-02-28", Duration: 10, Order: 1, Status: "Completed", AssignedTo: "Rachel Stone" },
    { id: "sp002", JobId: "job001", PhaseName: "Foundation", StartDate: "2026-02-25", EndDate: "2026-03-21", Duration: 18, Order: 2, Status: "In Progress", AssignedTo: "Kevin Walsh" },
    { id: "sp003", JobId: "job001", PhaseName: "Framing", StartDate: "2026-03-17", EndDate: "2026-04-11", Duration: 20, Order: 3, Status: "Not Started", AssignedTo: "Jake Torres" },
    { id: "sp004", JobId: "job001", PhaseName: "Electrical", StartDate: "2026-03-28", EndDate: "2026-04-14", Duration: 12, Order: 4, Status: "Not Started", AssignedTo: "Tom Bradley" },
    { id: "sp005", JobId: "job001", PhaseName: "Plumbing", StartDate: "2026-04-01", EndDate: "2026-04-14", Duration: 10, Order: 5, Status: "Not Started", AssignedTo: "Mike Hernandez" },
    { id: "sp006", JobId: "job001", PhaseName: "Drywall", StartDate: "2026-04-14", EndDate: "2026-05-02", Duration: 14, Order: 6, Status: "Not Started", AssignedTo: null },
    { id: "sp007", JobId: "job001", PhaseName: "Finishes", StartDate: "2026-05-01", EndDate: "2026-05-22", Duration: 16, Order: 7, Status: "Not Started", AssignedTo: null },
    { id: "sp008", JobId: "job001", PhaseName: "Punch List", StartDate: "2026-05-20", EndDate: "2026-05-30", Duration: 8, Order: 8, Status: "Not Started", AssignedTo: "Rachel Stone" },

    // Beacon St. Security (job002)
    { id: "sp009", JobId: "job002", PhaseName: "Survey & Plan", StartDate: "2026-02-01", EndDate: "2026-02-07", Duration: 5, Order: 1, Status: "Completed", AssignedTo: "Luis Garza" },
    { id: "sp010", JobId: "job002", PhaseName: "Wiring", StartDate: "2026-02-08", EndDate: "2026-03-01", Duration: 15, Order: 2, Status: "In Progress", AssignedTo: "Luis Garza" },
    { id: "sp011", JobId: "job002", PhaseName: "Equipment Install", StartDate: "2026-03-01", EndDate: "2026-03-10", Duration: 7, Order: 3, Status: "Not Started", AssignedTo: "Nina Patel" },
    { id: "sp012", JobId: "job002", PhaseName: "Testing & Handoff", StartDate: "2026-03-10", EndDate: "2026-03-20", Duration: 8, Order: 4, Status: "Not Started", AssignedTo: "Nina Patel" },

    // River Walk Phase 2 (job003)
    { id: "sp013", JobId: "job003", PhaseName: "Mobilization", StartDate: "2026-02-10", EndDate: "2026-02-17", Duration: 5, Order: 1, Status: "Completed", AssignedTo: "Sam Ortega" },
    { id: "sp014", JobId: "job003", PhaseName: "Grading", StartDate: "2026-02-17", EndDate: "2026-03-14", Duration: 18, Order: 2, Status: "In Progress", AssignedTo: "Sam Ortega" },
    { id: "sp015", JobId: "job003", PhaseName: "Hardscape", StartDate: "2026-03-10", EndDate: "2026-03-31", Duration: 15, Order: 3, Status: "Not Started", AssignedTo: null },
    { id: "sp016", JobId: "job003", PhaseName: "Planting", StartDate: "2026-03-28", EndDate: "2026-04-18", Duration: 15, Order: 4, Status: "Not Started", AssignedTo: null },
    { id: "sp017", JobId: "job003", PhaseName: "Irrigation", StartDate: "2026-04-05", EndDate: "2026-04-20", Duration: 10, Order: 5, Status: "Not Started", AssignedTo: null },
    { id: "sp018", JobId: "job003", PhaseName: "Walkthrough", StartDate: "2026-04-20", EndDate: "2026-04-30", Duration: 8, Order: 6, Status: "Not Started", AssignedTo: "Diana Reyes" },
  ],

  // Team members per job
  "Team Members": [
    // Sunset Ridge Build-Out (job001) — Team Alpha
    { id: "tm001", JobId: "job001", Name: "Rachel Stone", Role: "Site Superintendent", Phone: "(512) 555-0670", Email: "rstone@apexdev.com", Type: "In-House" },
    { id: "tm002", JobId: "job001", Name: "Kevin Walsh", Role: "Concrete Foreman", Phone: "(512) 555-0710", Email: "kwalsh@walshconcrete.com", Type: "Sub-Contractor" },
    { id: "tm003", JobId: "job001", Name: "Tom Bradley", Role: "Electrical Lead", Phone: "(512) 555-0555", Email: "tbradley@bradleyelectric.com", Type: "Sub-Contractor" },
    { id: "tm004", JobId: "job001", Name: "Mike Hernandez", Role: "Plumbing Lead", Phone: "(512) 555-0650", Email: "mike@hernandezplumbing.com", Type: "Sub-Contractor" },
    { id: "tm005", JobId: "job001", Name: "Jake Torres", Role: "Framing Crew Lead", Phone: "(512) 555-0720", Email: "jtorres@fieldstack.app", Type: "In-House" },

    // Beacon St. Security (job002) — Team Bravo
    { id: "tm006", JobId: "job002", Name: "Luis Garza", Role: "Tech Lead", Phone: "(512) 555-0730", Email: "lgarza@fieldstack.app", Type: "In-House" },
    { id: "tm007", JobId: "job002", Name: "Nina Patel", Role: "Security Installer", Phone: "(512) 555-0735", Email: "npatel@fieldstack.app", Type: "In-House" },

    // River Walk Phase 2 (job003) — Team Charlie
    { id: "tm008", JobId: "job003", Name: "Sam Ortega", Role: "Landscape Foreman", Phone: "(512) 555-0750", Email: "sortega@fieldstack.app", Type: "In-House" },
    { id: "tm009", JobId: "job003", Name: "Diana Reyes", Role: "City Liaison", Phone: "(512) 555-0740", Email: "dreyes@millbrook.gov", Type: "Client Rep" },

    // Apex Parking Garage (job004) — Team Alpha
    { id: "tm010", JobId: "job004", Name: "Tom Bradley", Role: "Electrical Lead", Phone: "(512) 555-0555", Email: "tbradley@bradleyelectric.com", Type: "Sub-Contractor" },
    { id: "tm011", JobId: "job004", Name: "Rachel Stone", Role: "Site Superintendent", Phone: "(512) 555-0670", Email: "rstone@apexdev.com", Type: "In-House" },

    // Hillcrest HVAC (job005) — Team Delta
    { id: "tm012", JobId: "job005", Name: "Carlos Vega", Role: "HVAC Lead", Phone: "(512) 555-0780", Email: "cvega@fieldstack.app", Type: "In-House" },
    { id: "tm013", JobId: "job005", Name: "Ben Howell", Role: "Ductwork Specialist", Phone: "(512) 555-0790", Email: "bhowell@airflowpros.com", Type: "Sub-Contractor" },
  ],

  // Estimates / Job Bids
  Estimates: [
    { id: "est001", OpportunityId: "opp009", Name: "Beacon Security - Full Bid", Items: [
      { description: "Camera System (8 units)", cost: 9600, type: "Sub-Contractor", vendor: "SecureTech" },
      { description: "Access Control Panels", cost: 4200, type: "In-House", vendor: "" },
      { description: "Wiring & Conduit", cost: 6800, type: "In-House", vendor: "" },
      { description: "Installation Labor", cost: 5400, type: "In-House", vendor: "" },
      { description: "Testing & Commissioning", cost: 2000, type: "In-House", vendor: "" },
    ], Total: 28000, Status: "Approved", CreatedDate: "2026-02-28" },
    { id: "est002", OpportunityId: "opp010", Name: "Elm Park AV - Full Bid", Items: [
      { description: "Auditorium Sound System", cost: 45000, type: "Sub-Contractor", vendor: "AudioPro" },
      { description: "Projector + Screen (Auditorium)", cost: 18000, type: "Sub-Contractor", vendor: "VisualEdge" },
      { description: "Classroom AV Kits (x12)", cost: 48000, type: "Sub-Contractor", vendor: "VisualEdge" },
      { description: "Network Cabling", cost: 22000, type: "In-House", vendor: "" },
      { description: "Installation & Integration", cost: 18000, type: "In-House", vendor: "" },
      { description: "Testing & Training", cost: 5000, type: "In-House", vendor: "" },
    ], Total: 156000, Status: "Pending", CreatedDate: "2026-03-02" },
    { id: "est003", OpportunityId: "opp011", Name: "Sunset Ridge Build-Out - Bid", Items: [
      { description: "Concrete & Foundation", cost: 28000, type: "Sub-Contractor", vendor: "Walsh Concrete" },
      { description: "Framing & Structural", cost: 32000, type: "In-House", vendor: "" },
      { description: "Electrical", cost: 24000, type: "Sub-Contractor", vendor: "Bradley Electric" },
      { description: "Plumbing", cost: 18000, type: "Sub-Contractor", vendor: "Hernandez Plumbing" },
      { description: "Drywall & Finishes", cost: 26000, type: "In-House", vendor: "" },
      { description: "Project Management", cost: 14000, type: "In-House", vendor: "" },
    ], Total: 142000, Status: "Approved", CreatedDate: "2026-01-20" },
  ],

  // Sales targets — monthly targets for planned vs actual
  "Sales Targets": [
    { id: "st001", Month: "2026-01", Target: 180000, Actual: 198000 },
    { id: "st002", Month: "2026-02", Target: 200000, Actual: 156000 },
    { id: "st003", Month: "2026-03", Target: 220000, Actual: 96000 },
    { id: "st004", Month: "2026-04", Target: 200000, Actual: 0 },
    { id: "st005", Month: "2026-05", Target: 240000, Actual: 0 },
    { id: "st006", Month: "2026-06", Target: 260000, Actual: 0 },
  ],

  // Activity log / milestones per job
  Milestones: [
    { id: "ms001", JobId: "job001", Title: "Site cleared and graded", Date: "2026-02-20", Type: "milestone", Notes: "All vegetation removed, grade stakes set" },
    { id: "ms002", JobId: "job001", Title: "Foundation pour complete", Date: "2026-03-05", Type: "milestone", Notes: "10 yards of concrete, cured 3 days" },
    { id: "ms003", JobId: "job001", Title: "Weather delay - rain", Date: "2026-03-02", Type: "flag", Notes: "Lost 2 days to heavy rain" },
    { id: "ms004", JobId: "job002", Title: "All cameras mounted", Date: "2026-02-25", Type: "milestone", Notes: "8 cameras installed, wiring 60% done" },
    { id: "ms005", JobId: "job003", Title: "Permit delay from city", Date: "2026-02-20", Type: "flag", Notes: "Grading permit took extra week" },
    { id: "ms006", JobId: "job003", Title: "Mobilization complete", Date: "2026-02-17", Type: "milestone", Notes: "Equipment on site, crew briefed" },
    { id: "ms007", JobId: "job004", Title: "Panel rough-in started", Date: "2026-03-01", Type: "milestone", Notes: "Main panels being set" },
    { id: "ms008", JobId: "job005", Title: "RTU #1 and #2 installed", Date: "2026-03-08", Type: "milestone", Notes: "Two of four rooftop units in place" },
  ],
};
